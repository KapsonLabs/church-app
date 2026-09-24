import { apiRequest } from '@/shared/api/client'
import type { PaginatedResponse, Permission, Role, UUID } from '@/shared/api/contracts'
export interface RoleInput { organization_id: UUID; name: string; slug: string; description: string; permission_ids: UUID[]; is_active: boolean }
export const rolesApi = {
  list: (organizationId: UUID) => apiRequest<PaginatedResponse<Role> | Role[]>(`accounts/roles/?organization_id=${organizationId}`),
  permissions: () => apiRequest<PaginatedResponse<Permission> | Permission[]>('accounts/permissions/'),
  create: (input: RoleInput) => apiRequest<Role>('accounts/roles/', { method: 'POST', body: input }),
  update: (organizationId: UUID, id: UUID, input: Partial<RoleInput>) => apiRequest<Role>(`accounts/organizations/${organizationId}/roles/${id}/`, { method: 'PATCH', body: input }),
  remove: (organizationId: UUID, id: UUID) => apiRequest<void>(`accounts/organizations/${organizationId}/roles/${id}/`, { method: 'DELETE' }),
}
