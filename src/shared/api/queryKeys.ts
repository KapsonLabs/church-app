import type { UUID } from './contracts'

export const queryKeys = {
  organizations: ['organizations'] as const,
  permissions: ['permission-catalog'] as const,
  branches: (organizationId: UUID) => ['tenant', organizationId, 'branches'] as const,
  members: (organizationId: UUID) => ['tenant', organizationId, 'members'] as const,
  users: (organizationId: UUID) => ['tenant', organizationId, 'users'] as const,
  roles: (organizationId: UUID) => ['tenant', organizationId, 'roles'] as const,
  tenantPermissions: (organizationId: UUID) => ['tenant', organizationId, 'permissions'] as const,
}
