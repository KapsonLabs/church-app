export type UUID = string

export interface ApiSuccess<T> { data: T }
export interface ApiErrorResponse { errors?: Record<string, string[] | string> | string; detail?: string }
export interface PaginatedResponse<T> { count: number; next: string | null; previous: string | null; results: T[] }

export interface User {
  id: UUID; email: string; first_name: string; last_name: string; phone_number: string
  date_of_birth?: string | null; is_active: boolean; created_at: string; updated_at: string
}
export interface TenantUser {
  id: UUID; email: string; first_name: string; last_name: string; phone_number: string
  role_id: UUID | null; role_name: string | null; membership_is_active: boolean
  branch_ids: UUID[]; created_at: string; updated_at: string
}
export interface Organization {
  id: UUID; name: string; slug: string; description: string; email: string; phone_number: string
  website: string; physical_address: string; logo?: string | null; is_active: boolean; branch_count: number
  created_at: string; updated_at: string
}
export interface Branch {
  id: UUID; organization_id: UUID; name: string; code: string; email: string; phone_number: string
  address: string; city: string; country: string; is_active: boolean; created_at: string; updated_at: string
}
export interface SessionBranch extends Branch { organization: Organization }
export interface Resource { id: UUID; name: string; code: string; description: string; is_active: boolean }
export interface Permission { id: UUID; resource: Resource; action: string; codename: string; description: string; is_active: boolean }
export interface Role {
  id: UUID; organization_id: UUID; name: string; slug: string; description: string
  permissions: Permission[]; is_active: boolean; created_at: string; updated_at: string
}
export interface Membership {
  id: UUID; organization_id: UUID; user_id: UUID; user_email: string; role_id: UUID | null
  role_name: string | null; is_active: boolean; joined_at: string
}
export interface BranchMembership {
  id: UUID; branch_id: UUID; user_id: UUID; user_email: string; is_active: boolean; joined_at: string
}

export function asList<T>(value: PaginatedResponse<T> | T[]): T[] {
  return Array.isArray(value) ? value : value.results
}
