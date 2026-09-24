import { apiRequest } from '@/shared/api/client'
import type { BranchMembership, Membership, PaginatedResponse, User, UUID } from '@/shared/api/contracts'
export interface UserInput { email: string; password: string; first_name: string; last_name: string; phone_number: string }
export interface MembershipInput { user_id: UUID; role_id?: UUID | null; is_active: boolean }
export const membersApi = {
  users: (organizationId: UUID) => apiRequest<PaginatedResponse<User> | User[]>(`accounts/users/?organization_id=${organizationId}`),
  createUser: (input: UserInput) => apiRequest<User>('accounts/users/', { method: 'POST', body: input }),
  memberships: (organizationId: UUID) => apiRequest<PaginatedResponse<Membership> | Membership[]>(`organizations/${organizationId}/memberships/`),
  createMembership: (organizationId: UUID, input: MembershipInput) => apiRequest<Membership>(`organizations/${organizationId}/memberships/`, { method: 'POST', body: input }),
  updateMembership: (organizationId: UUID, id: UUID, input: Partial<MembershipInput>) => apiRequest<Membership>(`organizations/${organizationId}/memberships/${id}/`, { method: 'PATCH', body: input }),
  removeMembership: (organizationId: UUID, id: UUID) => apiRequest<void>(`organizations/${organizationId}/memberships/${id}/`, { method: 'DELETE' }),
  branchMemberships: (organizationId: UUID, branchId: UUID) => apiRequest<PaginatedResponse<BranchMembership> | BranchMembership[]>(`organizations/${organizationId}/branches/${branchId}/memberships/`),
  createBranchMembership: (organizationId: UUID, branchId: UUID, userId: UUID) => apiRequest<BranchMembership>(`organizations/${organizationId}/branches/${branchId}/memberships/`, { method: 'POST', body: { user_id: userId, is_active: true } }),
  updateBranchMembership: (organizationId: UUID, id: UUID, isActive: boolean) => apiRequest<BranchMembership>(`organizations/${organizationId}/branch-memberships/${id}/`, { method: 'PATCH', body: { is_active: isActive } }),
}
