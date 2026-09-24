import { apiRequest } from '@/shared/api/client'
import type { Organization, PaginatedResponse, UUID } from '@/shared/api/contracts'

export type OrganizationInput = Pick<Organization, 'name' | 'slug' | 'description' | 'email' | 'phone_number' | 'website' | 'physical_address' | 'is_active'>
export const organizationsApi = {
  list: () => apiRequest<PaginatedResponse<Organization> | Organization[]>('organizations/'),
  create: (input: OrganizationInput) => apiRequest<Organization>('organizations/', { method: 'POST', body: input }),
  update: (id: UUID, input: Partial<OrganizationInput>) => apiRequest<Organization>(`organizations/${id}/`, { method: 'PATCH', body: input }),
}
