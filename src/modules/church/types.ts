import type { UUID } from '@/shared/api/contracts'

export type AttendanceStatus = 'present' | 'absent' | 'excused' | 'late'
export interface AgeGroup { id: UUID; name: string; minimum_age: number; maximum_age: number; is_active: boolean }
export interface Child {
  id: UUID; first_name: string; last_name: string; other_names: string; date_of_birth: string | null; age: number | null
  age_group: UUID; age_group_name: string; guardian_name: string; guardian_contact: string; location: string; registration_date: string; is_active: boolean
  recent_attendance?: ChildAttendance[]; statistics?: { attended: number; absent: number; attendance_percentage: number | null }
}
export interface ServiceSession { id: UUID; event: UUID; event_name: string; event_date: string; service_order: number; name: string; start_time: string; end_time: string | null; location: string; notes: string; status: string; attendance_summary: AttendanceSummary; facilitators_assigned: number; facilitators_present: number }
export interface ChurchEvent { id: UUID; name: string; event_type: string; description: string; event_date: string; start_time: string | null; end_time: string | null; location: string; status: string; attendance_finalized_at: string | null; sessions: ServiceSession[] }
export interface ChildAttendance { id: UUID; child: UUID; child_name: string; event: UUID; service_session: UUID | null; service_name: string | null; age_group: UUID; age_group_name: string; attendance_status: AttendanceStatus; checked_in_at: string | null; recorded_by_name: string | null; notes: string; created_at: string }
export interface Facilitator { id: UUID; user: UUID; name: string; first_name: string; last_name: string; email: string; phone_number: string; default_age_group: UUID | null; default_age_group_name: string | null; is_active: boolean; notes: string }
export interface ServiceFacilitator { id: UUID; service_session: UUID; service_name: string; service_date: string; facilitator: UUID; facilitator_name: string; facilitator_user: UUID; role: string; created_at: string }
export interface FacilitatorAttendance { id: UUID; service_session: UUID; facilitator: UUID; facilitator_name: string; attendance_status: AttendanceStatus; checked_in_at: string | null; notes: string }
export interface AttendanceSummary { present: number; late: number; absent: number; excused: number }
export interface MonthlyAttendance { year: number; months: Array<{ month: number; label: string; present: number; absent: number }> }
export interface DashboardSummary { total_registered_children: number; active_children: number; upcoming_event: ChurchEvent | null; recent_sunday: ChurchEvent | null; recent_attendance: AttendanceSummary; attendance_percentage: number | null; upcoming_events: ChurchEvent[]; recent_events: ChurchEvent[]; monthly_attendance: MonthlyAttendance }
export interface RosterChild { child_id: UUID; name: string; age: number | null; age_group_id: UUID; age_group_name: string; guardian_contact: string; attendance_status: AttendanceStatus | null; notes: string }
export interface RosterResponse { session: ServiceSession; children: RosterChild[]; summary: AttendanceSummary }
export interface EventRosterResponse { event: ChurchEvent; children: RosterChild[]; summary: AttendanceSummary }
export interface RepeatedAbsentee { child_id: UUID; child_name: string; age_group: string; attended: number; missed: number; excused: number; attendance_percentage: number | null }
