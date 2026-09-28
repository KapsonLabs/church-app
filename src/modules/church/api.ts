import { apiRequest } from '@/shared/api/client'
import type { PaginatedResponse, UUID } from '@/shared/api/contracts'
import type { AgeGroup, AttendanceSummary, Child, ChurchEvent, DashboardSummary, EventRosterResponse, Facilitator, FacilitatorAttendance, RepeatedAbsentee, RosterResponse, ServiceFacilitator, ServiceSession } from './types'

export interface ChurchScope { organizationId: UUID; branchId: UUID }
const params = (scope: ChurchScope, extra: Record<string, string | number | boolean | undefined> = {}) => {
  const search = new URLSearchParams({ organization_id: scope.organizationId, branch_id: scope.branchId })
  Object.entries(extra).forEach(([key, value]) => { if (value !== undefined && value !== '') search.set(key, String(value)) })
  return search.toString()
}
const scopedBody = (scope: ChurchScope, body: unknown) => ({ organization_id: scope.organizationId, branch_id: scope.branchId, ...(body as object) })

export const churchApi = {
  dashboard: (scope: ChurchScope) => apiRequest<DashboardSummary>(`church/dashboard/summary/?${params(scope)}`),
  ageGroups: (scope: ChurchScope, active?: boolean, page = 1) => apiRequest<PaginatedResponse<AgeGroup> | AgeGroup[]>(`church/age-groups/?${params(scope, { is_active: active, page })}`),
  createAgeGroup: (scope: ChurchScope, input: Partial<AgeGroup>) => apiRequest<AgeGroup>('church/age-groups/', { method: 'POST', body: scopedBody(scope, input) }),
  updateAgeGroup: (scope: ChurchScope, id: UUID, input: Partial<AgeGroup>) => apiRequest<AgeGroup>(`church/age-groups/${id}/`, { method: 'PATCH', body: scopedBody(scope, input) }),
  children: (scope: ChurchScope, filters: Record<string, string> = {}, page = 1) => apiRequest<PaginatedResponse<Child> | Child[]>(`church/children/?${params(scope, { ...filters, page })}`),
  child: (scope: ChurchScope, id: UUID) => apiRequest<Child>(`church/children/${id}/?${params(scope)}`),
  createChild: (scope: ChurchScope, input: Partial<Child>) => apiRequest<Child>('church/children/', { method: 'POST', body: scopedBody(scope, input) }),
  updateChild: (scope: ChurchScope, id: UUID, input: Partial<Child>) => apiRequest<Child>(`church/children/${id}/`, { method: 'PATCH', body: scopedBody(scope, input) }),
  events: (scope: ChurchScope, filters: Record<string, string> = {}, page = 1) => apiRequest<PaginatedResponse<ChurchEvent> | ChurchEvent[]>(`church/events/?${params(scope, { ...filters, page })}`),
  event: (scope: ChurchScope, id: UUID) => apiRequest<ChurchEvent>(`church/events/${id}/?${params(scope)}`),
  createEvent: (scope: ChurchScope, input: Partial<ChurchEvent>) => apiRequest<ChurchEvent>('church/events/', { method: 'POST', body: scopedBody(scope, input) }),
  updateEvent: (scope: ChurchScope, id: UUID, input: Partial<ChurchEvent>) => apiRequest<ChurchEvent>(`church/events/${id}/`, { method: 'PATCH', body: scopedBody(scope, input) }),
  eventRoster: (scope: ChurchScope, eventId: UUID, filters: Record<string, string> = {}) => apiRequest<EventRosterResponse>(`church/events/${eventId}/roster/?${params(scope, filters)}`),
  saveEventAttendance: (scope: ChurchScope, eventId: UUID, rows: Array<{ child_id: UUID; attendance_status: string }>) => apiRequest<{ summary: AttendanceSummary }>(`church/events/${eventId}/attendance/bulk/`, { method: 'POST', body: scopedBody(scope, { rows }) }),
  createSunday: (scope: ChurchScope, input: { sunday_date: string; name?: string; location?: string; sessions: Array<{ name: string; service_order: number; start_time: string; end_time?: string | null }> }) => apiRequest<ChurchEvent>('church/sunday-services/create/', { method: 'POST', body: scopedBody(scope, input) }),
  upcomingSunday: (scope: ChurchScope) => apiRequest<ChurchEvent | null>(`church/sunday-services/upcoming/?${params(scope)}`),
  session: (scope: ChurchScope, sessionId: UUID) => apiRequest<ServiceSession>(`church/service-sessions/${sessionId}/?${params(scope)}`),
  roster: (scope: ChurchScope, sessionId: UUID, filters: Record<string, string | boolean> = {}) => apiRequest<RosterResponse>(`church/service-sessions/${sessionId}/roster/?${params(scope, filters)}`),
  saveAttendance: (scope: ChurchScope, sessionId: UUID, rows: Array<{ child_id: UUID; attendance_status: string; notes?: string }>) => apiRequest<{ summary: AttendanceSummary }>(`church/service-sessions/${sessionId}/attendance/bulk/`, { method: 'POST', body: scopedBody(scope, { rows }) }),
  finalizeSunday: (scope: ChurchScope, eventId: UUID) => apiRequest<{ event: ChurchEvent; summary: AttendanceSummary }>(`church/events/${eventId}/attendance/finalize/`, { method: 'POST', body: scopedBody(scope, {}) }),
  facilitators: (scope: ChurchScope, page = 1) => apiRequest<PaginatedResponse<Facilitator> | Facilitator[]>(`church/facilitators/?${params(scope, { page })}`),
  facilitator: (scope: ChurchScope, id: UUID) => apiRequest<Facilitator>(`church/facilitators/${id}/?${params(scope)}`),
  createFacilitator: (scope: ChurchScope, input: { user: UUID; first_name?: string; last_name?: string; email?: string; phone_number?: string; default_age_group?: UUID | null; notes?: string }) => apiRequest<Facilitator>('church/facilitators/', { method: 'POST', body: scopedBody(scope, input) }),
  updateFacilitator: (scope: ChurchScope, id: UUID, input: Partial<Facilitator>) => apiRequest<Facilitator>(`church/facilitators/${id}/`, { method: 'PATCH', body: scopedBody(scope, input) }),
  facilitatorAssignments: (scope: ChurchScope, facilitatorId: UUID) => apiRequest<PaginatedResponse<ServiceFacilitator> | ServiceFacilitator[]>(`church/service-facilitators/?${params(scope, { facilitator: facilitatorId })}`),
  assignments: (scope: ChurchScope, sessionId: UUID) => apiRequest<PaginatedResponse<ServiceFacilitator> | ServiceFacilitator[]>(`church/service-facilitators/?${params(scope, { service: sessionId })}`),
  assignFacilitators: (scope: ChurchScope, sessionId: UUID, assignments: Array<{ facilitator_id: UUID; role: string }>) => apiRequest<ServiceFacilitator[]>(`church/service-sessions/${sessionId}/facilitators/bulk-assign/`, { method: 'POST', body: scopedBody(scope, { assignments }) }),
  facilitatorAttendance: (scope: ChurchScope, sessionId: UUID) => apiRequest<PaginatedResponse<FacilitatorAttendance> | FacilitatorAttendance[]>(`church/facilitator-attendance/?${params(scope, { service: sessionId })}`),
  saveFacilitatorAttendance: (scope: ChurchScope, sessionId: UUID, rows: Array<{ facilitator_id: UUID; attendance_status: string }>) => apiRequest<FacilitatorAttendance[]>(`church/service-sessions/${sessionId}/facilitator-attendance/bulk/`, { method: 'POST', body: scopedBody(scope, { rows }) }),
  repeatedAbsentees: (scope: ChurchScope, dateFrom?: string, dateTo?: string) => apiRequest<RepeatedAbsentee[]>(`church/reports/repeated-absentees/?${params(scope, { date_from: dateFrom, date_to: dateTo })}`),
  absentees: (scope: ChurchScope, dateFrom?: string, dateTo?: string) => apiRequest<unknown[]>(`church/reports/absentees/?${params(scope, { date_from: dateFrom, date_to: dateTo })}`),
  report: (scope: ChurchScope, kind: string, filters: Record<string, string> = {}) => apiRequest<unknown[]>(`church/reports/${kind}/?${params(scope, filters)}`),
}

export const churchKeys = {
  root: (scope: ChurchScope) => ['tenant', scope.organizationId, 'branch', scope.branchId, 'church'] as const,
  resource: (scope: ChurchScope, resource: string, filters?: unknown) => [...churchKeys.root(scope), resource, filters] as const,
}
