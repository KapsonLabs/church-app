import { apiRequest } from '@/shared/api/client'
import type { Organization, PaginatedResponse, UUID } from '@/shared/api/contracts'

export type OrganizationInput = Pick<Organization, 'name' | 'slug' | 'description' | 'email' | 'phone_number' | 'website' | 'physical_address' | 'is_active'>
export const organizationsApi = {
  list: (page = 1) => apiRequest<PaginatedResponse<Organization> | Organization[]>(`organizations/?page=${page}`),
  create: (input: OrganizationInput) => apiRequest<Organization>('organizations/', { method: 'POST', body: input }),
  update: (id: UUID, input: Partial<OrganizationInput>) => apiRequest<Organization>(`organizations/${id}/`, { method: 'PATCH', body: input }),
}
