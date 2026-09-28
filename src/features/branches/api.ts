import { apiRequest } from '@/shared/api/client'
import type { Branch, PaginatedResponse, UUID } from '@/shared/api/contracts'
export type BranchInput = Pick<Branch, 'organization_id' | 'name' | 'code' | 'email' | 'phone_number' | 'address' | 'city' | 'country' | 'is_active'>
export interface BranchSettings { branch_id: UUID; timezone: string; currency: string; language: string; date_format: string; created_at: string; updated_at: string }
export const branchesApi = {
  list: (organizationId: UUID, page = 1) => apiRequest<PaginatedResponse<Branch> | Branch[]>(`organizations/branches/?organization_id=${organizationId}&page=${page}`),
  create: (input: BranchInput) => apiRequest<Branch>('organizations/branches/', { method: 'POST', body: input }),
  update: (organizationId: UUID, id: UUID, input: Partial<BranchInput>) => apiRequest<Branch>(`organizations/${organizationId}/branches/${id}/`, { method: 'PATCH', body: input }),
  remove: (organizationId: UUID, id: UUID) => apiRequest<void>(`organizations/${organizationId}/branches/${id}/`, { method: 'DELETE' }),
  settings: (organizationId: UUID, id: UUID) => apiRequest<BranchSettings>(`organizations/${organizationId}/branches/${id}/settings/`),
  updateSettings: (organizationId: UUID, id: UUID, input: Pick<BranchSettings, 'timezone' | 'currency' | 'language' | 'date_format'>) => apiRequest<BranchSettings>(`organizations/${organizationId}/branches/${id}/settings/`, { method: 'PATCH', body: input }),
}
