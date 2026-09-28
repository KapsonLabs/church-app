import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { TenantProvider, useTenant } from './TenantContext'
import { apiRequest } from '@/shared/api/client'
import { branchesApi } from '@/features/branches/api'
import { useAuth } from './AuthContext'
import type { Branch, Organization, SessionBranch } from '@/shared/api/contracts'

vi.mock('@/shared/api/client', () => ({ apiRequest: vi.fn() }))
vi.mock('@/features/branches/api', () => ({ branchesApi: { list: vi.fn() } }))
vi.mock('./AuthContext', () => ({ useAuth: vi.fn() }))

const organization: Organization = { id: 'org-1', name: 'Example Org', slug: 'example', description: '', email: '', phone_number: '', website: '', physical_address: '', is_active: true, branch_count: 1, created_at: '', updated_at: '' }
const branch = (id: string): Branch => ({ id, organization_id: organization.id, name: `Branch ${id}`, code: id, email: '', phone_number: '', address: '', city: '', country: '', is_active: true, created_at: '', updated_at: '' })
const sessionBranch = (id: string): SessionBranch => ({ ...branch(id), organization })

function setup(seedCache = false) {
  const queryClient = new QueryClient()
  if (seedCache) queryClient.setQueryData(['tenant', 'old-org'], ['stale'])
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={queryClient}><TenantProvider>{children}</TenantProvider></QueryClientProvider>
  return { queryClient, ...renderHook(() => useTenant(), { wrapper }) }
}

describe('TenantProvider', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(useAuth).mockReturnValue({ status: 'authenticated', user: null, sessionBranches: [sessionBranch('downtown')], login: vi.fn(), logout: vi.fn(), setUser: vi.fn() })
  })

  it('automatically selects the first login branch and loads permissions', async () => {
    vi.mocked(apiRequest).mockResolvedValue(['church-dashboard.read'])
    vi.mocked(branchesApi.list).mockResolvedValue([branch('downtown'), branch('north')])
    const { result, queryClient } = setup(true)
    await waitFor(() => expect(result.current.initialized).toBe(true))
    expect(result.current.organization?.id).toBe('org-1')
    expect(result.current.branch?.id).toBe('downtown')
    expect(result.current.branches).toHaveLength(2)
    expect(result.current.hasPermission('church-dashboard.read')).toBe(true)
    expect(queryClient.getQueryData(['tenant', 'old-org'])).toBeUndefined()
  })

  it('exposes a no-branch state without requesting tenant data', async () => {
    vi.mocked(useAuth).mockReturnValue({ status: 'authenticated', user: null, sessionBranches: [], login: vi.fn(), logout: vi.fn(), setUser: vi.fn() })
    const { result } = setup()
    await waitFor(() => expect(result.current.initialized).toBe(true))
    expect(result.current.branch).toBeNull()
    expect(apiRequest).not.toHaveBeenCalled()
  })

  it('does not enter the application when branch discovery fails', async () => {
    vi.mocked(apiRequest).mockResolvedValue(['church-dashboard.read'])
    vi.mocked(branchesApi.list).mockRejectedValue(new Error('Branch service unavailable'))
    const { result } = setup()
    await waitFor(() => expect(result.current.initialized).toBe(true))
    expect(result.current.organization).toBeNull()
    expect(result.current.accessError).toBe('Branch service unavailable')
  })
})
