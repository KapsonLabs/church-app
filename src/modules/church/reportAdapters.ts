export interface AgeGroupReportRow { ageGroup: string; status: string; total: number }
export interface FacilitatorReportRow { facilitator: string; email: string; status: string; total: number }

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export const safeReportText = (value: unknown) => typeof value === 'string' && !UUID_PATTERN.test(value) ? value : ''
const numberValue = (value: unknown) => typeof value === 'number' ? value : Number(value) || 0

export function adaptAgeGroupReport(rows: unknown[]): AgeGroupReportRow[] {
  return rows.map((raw) => {
    const row = raw as Record<string, unknown>
    return { ageGroup: safeReportText(row.age_group__name) || 'Unassigned age group', status: safeReportText(row.attendance_status) || 'unrecorded', total: numberValue(row.total) }
  })
}

export function adaptFacilitatorReport(rows: unknown[]): FacilitatorReportRow[] {
  return rows.map((raw) => {
    const row = raw as Record<string, unknown>
    const firstName = safeReportText(row.facilitator__user__first_name)
    const lastName = safeReportText(row.facilitator__user__last_name)
    return { facilitator: `${firstName} ${lastName}`.trim() || 'Unnamed facilitator', email: safeReportText(row.facilitator__user__email), status: safeReportText(row.attendance_status) || 'unrecorded', total: numberValue(row.total) }
  })
}
