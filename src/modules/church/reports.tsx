import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, Outlet } from '@tanstack/react-router'
import { useTenant, tenantId } from '@/app/TenantContext'
import { errorMessage, friendlyDate, friendlyTime } from '@/shared/lib/format'
import { FormField } from '@/shared/ui/Form'
import { EmptyState, ErrorState, PageSection } from '@/shared/ui/Page'
import { Badge, Card, Input, Spinner } from '@/shared/ui/primitives'
import { churchApi, churchKeys, type ChurchScope } from './api'
import type { AttendanceSummary, ChurchEvent, ServiceSession } from './types'
import { adaptAgeGroupReport, adaptFacilitatorReport, safeReportText, type AgeGroupReportRow, type FacilitatorReportRow } from './reportAdapters'

export type ReportKind = 'sunday-attendance' | 'event-attendance' | 'service-attendance' | 'age-groups' | 'facilitator-attendance'
export interface EventReportRow { event: ChurchEvent; summary: AttendanceSummary }
export interface ServiceReportRow { session: ServiceSession; summary: AttendanceSummary }
const tabs = [
  { label: 'Sunday attendance', to: '/church/reports/sundays' },
  { label: 'Event attendance', to: '/church/reports/events' },
  { label: 'Service attendance', to: '/church/reports/services' },
  { label: 'Age groups', to: '/church/reports/age-groups' },
  { label: 'Facilitators', to: '/church/reports/facilitators' },
] as const

export function ReportsLayout() {
  return <div className="page-grid"><nav className="flex gap-2 overflow-x-auto border-b" aria-label="Reports">{tabs.map((tab) => <Link key={tab.to} to={tab.to} className="whitespace-nowrap border-b-2 border-transparent px-3 py-3 text-sm font-medium text-muted-foreground [&.active]:border-primary [&.active]:text-foreground">{tab.label}</Link>)}</nav><Outlet /></div>
}

function useScope(): ChurchScope | null {
  const { organization, branch } = useTenant()
  return organization && branch ? { organizationId: tenantId(organization), branchId: branch.id } : null
}

function Summary({ summary }: { summary: AttendanceSummary }) {
  return <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{(['present', 'late', 'absent', 'excused'] as const).map((label) => <div className="rounded-lg bg-muted p-3" key={label}><strong>{summary[label] || 0}</strong><p className="text-xs capitalize text-muted-foreground">{label}</p></div>)}</div>
}

export function EventResults({ rows }: { rows: EventReportRow[] }) {
  if (!rows.length) return <EmptyState title="No report data for this period" />
  return <div className="mt-6 grid gap-3">{rows.map((row) => <Card className="p-4" key={row.event.id}><h3 className="font-semibold">{safeReportText(row.event.name) || 'Unnamed event'}</h3><p className="text-sm text-muted-foreground">{friendlyDate(row.event.event_date)}</p><Summary summary={row.summary} /></Card>)}</div>
}

export function ServiceResults({ rows }: { rows: ServiceReportRow[] }) {
  if (!rows.length) return <EmptyState title="No report data for this period" />
  return <div className="mt-6 grid gap-3">{rows.map((row) => <Card className="p-4" key={row.session.id}><h3 className="font-semibold">{safeReportText(row.session.event_name) || 'Sunday service'} · {safeReportText(row.session.name) || 'Service'}</h3><p className="text-sm text-muted-foreground">{friendlyDate(row.session.event_date)} · {friendlyTime(row.session.start_time)}</p><Summary summary={row.summary} /></Card>)}</div>
}

export function AgeGroupResults({ rows }: { rows: AgeGroupReportRow[] }) {
  if (!rows.length) return <EmptyState title="No report data for this period" />
  return <div className="mt-6 grid gap-3 sm:grid-cols-2">{rows.map((row, index) => <Card className="flex items-center justify-between gap-3 p-4" key={`${row.ageGroup}-${row.status}-${index}`}><div><h3 className="font-semibold">{row.ageGroup}</h3><Badge className="mt-2" tone={row.status === 'absent' ? 'danger' : row.status === 'present' || row.status === 'late' ? 'success' : 'info'}>{row.status}</Badge></div><strong className="text-2xl">{row.total}</strong></Card>)}</div>
}

export function FacilitatorResults({ rows }: { rows: FacilitatorReportRow[] }) {
  if (!rows.length) return <EmptyState title="No report data for this period" />
  return <div className="mt-6 grid gap-3 sm:grid-cols-2">{rows.map((row, index) => <Card className="flex items-center justify-between gap-3 p-4" key={`${row.facilitator}-${row.status}-${index}`}><div><h3 className="font-semibold">{row.facilitator}</h3>{row.email && <p className="text-sm text-muted-foreground">{row.email}</p>}<Badge className="mt-2" tone={row.status === 'absent' ? 'danger' : row.status === 'present' || row.status === 'late' ? 'success' : 'info'}>{row.status}</Badge></div><strong className="text-2xl">{row.total}</strong></Card>)}</div>
}

export function ReportTabPage({ kind }: { kind: ReportKind }) {
  const scope = useScope(); const [from, setFrom] = useState(''); const [to, setTo] = useState('')
  const query = useQuery({ queryKey: scope ? churchKeys.resource(scope, 'report', { kind, from, to }) : ['church-report-disabled', kind], queryFn: () => churchApi.report(scope!, kind, { date_from: from, date_to: to }), enabled: Boolean(scope) })
  if (!scope) return <PageSection><EmptyState title="Select a branch" description="Reports are generated separately for each branch." /></PageSection>
  const raw = query.data || []
  return <PageSection><div className="grid max-w-xl gap-3 sm:grid-cols-2"><FormField label="From" htmlFor={`${kind}-from`}><Input id={`${kind}-from`} type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></FormField><FormField label="To" htmlFor={`${kind}-to`}><Input id={`${kind}-to`} type="date" value={to} onChange={(event) => setTo(event.target.value)} /></FormField></div>{query.isLoading ? <div className="mt-6"><Spinner /></div> : query.error ? <ErrorState message={errorMessage(query.error)} /> : kind === 'age-groups' ? <AgeGroupResults rows={adaptAgeGroupReport(raw)} /> : kind === 'facilitator-attendance' ? <FacilitatorResults rows={adaptFacilitatorReport(raw)} /> : kind === 'service-attendance' ? <ServiceResults rows={raw as ServiceReportRow[]} /> : <EventResults rows={raw as EventReportRow[]} />}</PageSection>
}
