import { apiRequest } from '@/shared/api/client'
import type { PaginatedResponse, Permission, Role, UUID } from '@/shared/api/contracts'
export interface RoleInput { organization_id: UUID; name: string; slug: string; description: string; permission_ids: UUID[]; is_active: boolean }
const normalizeRole = (role: Role): Role => ({ ...role, permissions: Array.isArray(role.permissions) ? role.permissions : [] })
const normalizeRoles = (value: PaginatedResponse<Role> | Role[]): PaginatedResponse<Role> | Role[] => Array.isArray(value) ? value.map(normalizeRole) : { ...value, results: value.results.map(normalizeRole) }
export const rolesApi = {
  list: (organizationId: UUID, page = 1) => apiRequest<PaginatedResponse<Role> | Role[]>(`accounts/roles/?organization_id=${organizationId}&page=${page}`).then(normalizeRoles),
  permissions: (page = 1) => apiRequest<PaginatedResponse<Permission> | Permission[]>(`accounts/permissions/?page=${page}`),
  create: (input: RoleInput) => apiRequest<Role>('accounts/roles/', { method: 'POST', body: input }).then(normalizeRole),
  update: (organizationId: UUID, id: UUID, input: Partial<RoleInput>) => apiRequest<Role>(`accounts/organizations/${organizationId}/roles/${id}/`, { method: 'PATCH', body: input }).then(normalizeRole),
  remove: (organizationId: UUID, id: UUID) => apiRequest<void>(`accounts/organizations/${organizationId}/roles/${id}/`, { method: 'DELETE' }),
}
