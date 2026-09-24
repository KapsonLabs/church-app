import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { TenantProvider, useTenant } from './TenantContext'
import { apiRequest } from '@/shared/api/client'
import { branchesApi } from '@/features/branches/api'
import type { Organization } from '@/shared/api/contracts'

vi.mock('@/shared/api/client', () => ({ apiRequest: vi.fn() }))
vi.mock('@/features/branches/api', () => ({ branchesApi: { list: vi.fn() } }))

const organization: Organization = { id: 'org-1', name: 'Example Org', slug: 'example', description: '', email: '', phone_number: '', website: '', physical_address: '', is_active: true, branch_count: 0, created_at: '', updated_at: '' }

describe('TenantProvider', () => {
  it('starts without a remembered tenant and clears old tenant cache on selection', async () => {
    const queryClient = new QueryClient(); queryClient.setQueryData(['tenant', 'old-org', 'members'], ['stale'])
    vi.mocked(apiRequest).mockResolvedValue(['branches.read'])
    vi.mocked(branchesApi.list).mockResolvedValue([])
    const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={queryClient}><TenantProvider>{children}</TenantProvider></QueryClientProvider>
    const { result } = renderHook(() => useTenant(), { wrapper })
    expect(result.current.organization).toBeNull()
    await act(() => result.current.selectOrganization(organization))
    await waitFor(() => expect(result.current.organization?.id).toBe('org-1'))
    expect(result.current.hasPermission('branches.read')).toBe(true)
    expect(queryClient.getQueryData(['tenant', 'old-org', 'members'])).toBeUndefined()
    expect(localStorage.getItem('active-organization')).toBeNull()
  })
})
