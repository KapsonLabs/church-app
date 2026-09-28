import { apiRequest } from '@/shared/api/client'
import type { BranchMembership, Membership, PaginatedResponse, TenantUser, User, UUID } from '@/shared/api/contracts'
export interface UserInput { email: string; password: string; first_name: string; last_name: string; phone_number: string }
export interface MembershipInput { user_id: UUID; role_id?: UUID | null; is_active: boolean }
export interface TenantUserInput {
  email: string; password?: string; first_name: string; last_name: string; phone_number: string
  role_id: UUID | null; membership_is_active: boolean; branch_ids: UUID[]
}
export const membersApi = {
  tenantUsers: (organizationId: UUID, page = 1) => apiRequest<PaginatedResponse<TenantUser>>(`organizations/${organizationId}/users/?page=${page}`),
  createTenantUser: (organizationId: UUID, input: TenantUserInput) => apiRequest<TenantUser>(`organizations/${organizationId}/users/`, { method: 'POST', body: input }),
  updateTenantUser: (organizationId: UUID, userId: UUID, input: Partial<TenantUserInput>) => apiRequest<TenantUser>(`organizations/${organizationId}/users/${userId}/`, { method: 'PATCH', body: input }),
  users: (organizationId: UUID, page = 1) => apiRequest<PaginatedResponse<User> | User[]>(`accounts/users/?organization_id=${organizationId}&page=${page}`),
  createUser: (input: UserInput) => apiRequest<User>('accounts/users/', { method: 'POST', body: input }),
  memberships: (organizationId: UUID, page = 1) => apiRequest<PaginatedResponse<Membership> | Membership[]>(`organizations/${organizationId}/memberships/?page=${page}`),
  createMembership: (organizationId: UUID, input: MembershipInput) => apiRequest<Membership>(`organizations/${organizationId}/memberships/`, { method: 'POST', body: input }),
  updateMembership: (organizationId: UUID, id: UUID, input: Partial<MembershipInput>) => apiRequest<Membership>(`organizations/${organizationId}/memberships/${id}/`, { method: 'PATCH', body: input }),
  removeMembership: (organizationId: UUID, id: UUID) => apiRequest<void>(`organizations/${organizationId}/memberships/${id}/`, { method: 'DELETE' }),
  branchMemberships: (organizationId: UUID, branchId: UUID, page = 1) => apiRequest<PaginatedResponse<BranchMembership> | BranchMembership[]>(`organizations/${organizationId}/branches/${branchId}/memberships/?page=${page}`),
  createBranchMembership: (organizationId: UUID, branchId: UUID, userId: UUID) => apiRequest<BranchMembership>(`organizations/${organizationId}/branches/${branchId}/memberships/`, { method: 'POST', body: { user_id: userId, is_active: true } }),
  updateBranchMembership: (organizationId: UUID, id: UUID, isActive: boolean) => apiRequest<BranchMembership>(`organizations/${organizationId}/branch-memberships/${id}/`, { method: 'PATCH', body: { is_active: isActive } }),
}
