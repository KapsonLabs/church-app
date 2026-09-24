import { render, screen } from '@testing-library/react'
import { PermissionGuard } from './PermissionGuard'
import { useTenant } from '@/app/TenantContext'

vi.mock('@/app/TenantContext', () => ({ useTenant: vi.fn() }))

describe('PermissionGuard', () => {
  it('shows actions only when all requested codenames are granted', () => {
    vi.mocked(useTenant).mockReturnValue({ hasPermission: (code: string) => code === 'branches.manage' } as ReturnType<typeof useTenant>)
    const { rerender } = render(<PermissionGuard require="branches.manage"><button>Add branch</button></PermissionGuard>)
    expect(screen.getByRole('button', { name: 'Add branch' })).toBeInTheDocument()
    rerender(<PermissionGuard require={['branches.manage', 'members.manage']} fallback={<span>Unavailable</span>}><button>Combined action</button></PermissionGuard>)
    expect(screen.queryByRole('button', { name: 'Combined action' })).not.toBeInTheDocument()
    expect(screen.getByText('Unavailable')).toBeInTheDocument()
  })
})
