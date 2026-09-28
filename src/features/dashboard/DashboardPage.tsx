import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { CalendarDays, ClipboardCheck, Plus, Users } from 'lucide-react'
import { useTenant } from '@/app/TenantContext'
import { churchApi, churchKeys } from '@/modules/church/api'
import { Button, Card, Spinner } from '@/shared/ui/primitives'
import { EmptyState, ErrorState, PageHeader, PageSection } from '@/shared/ui/Page'
import { PermissionGuard } from '@/shared/ui/PermissionGuard'
import { errorMessage, friendlyDate } from '@/shared/lib/format'

function MonthlyAttendanceChart({ year, months }: { year: number; months: Array<{ month: number; label: string; present: number; absent: number }> }) {
  const [activeBar, setActiveBar] = useState<{
    month: string
    category: string
    value: number
    x: number
    y: number
  } | null>(null)
  const ticks = [0, 25, 50, 75, 100]
  const plotTop = 24
  const plotBottom = 252
  const plotHeight = plotBottom - plotTop
  const y = (value: number) => plotBottom - (value / 100) * plotHeight
  const formatPercentage = (value: number) => `${Number.isInteger(value) ? value : value.toFixed(1)}%`

  return (
    <PageSection
      title={`Monthly attendance · ${year}`}
      description="Finalized Sunday attendance as a percentage. Present includes late arrivals; absent includes excused absences."
    >
      <div className="mb-4 flex flex-wrap gap-5 text-sm">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-primary" />
          <strong>Present</strong>
          <span className="text-muted-foreground">Present + Late</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-rose-500" />
          <strong>Absent</strong>
          <span className="text-muted-foreground">Absent + Excused</span>
        </span>
      </div>
      <div className="overflow-x-auto pb-1">
        <svg
          className="h-[22rem] min-w-[62rem] w-full text-foreground"
          viewBox="0 0 1000 330"
          role="img"
          aria-label={`Grouped monthly attendance percentage bar chart for ${year}`}
        >
          <text x="18" y="145" textAnchor="middle" className="fill-muted-foreground text-[11px] font-medium" transform="rotate(-90 18 145)">
            Attendance (%)
          </text>
          {ticks.map((tick) => {
            const tickY = y(tick)
            return (
              <g key={tick}>
                <line x1="58" x2="982" y1={tickY} y2={tickY} className="stroke-border" strokeDasharray={tick === 0 ? undefined : '4 4'} />
                <text x="49" y={tickY + 4} textAnchor="end" className="fill-muted-foreground text-[11px]">
                  {tick}%
                </text>
              </g>
            )
          })}
          {months.map((month, index) => {
            const groupX = 68 + index * 76
            const presentY = y(month.present)
            const absentY = y(month.absent)
            const bars = [
              { category: 'Present', value: month.present, x: groupX, y: presentY, className: 'fill-primary' },
              { category: 'Absent', value: month.absent, x: groupX + 35, y: absentY, className: 'fill-rose-500' },
            ]
            return (
              <g key={month.month}>
                {bars.map((bar) => (
                  <g key={bar.category}>
                    <rect
                      x={bar.x}
                      y={bar.y}
                      width="31"
                      height={Math.max(2, plotBottom - bar.y)}
                      rx="4"
                      tabIndex={0}
                      role="img"
                      aria-label={`${month.label} ${bar.category}: ${formatPercentage(bar.value)}`}
                      className={`${bar.className} cursor-help transition-opacity hover:opacity-80 focus:opacity-80 focus:outline-none focus:stroke-foreground focus:stroke-2`}
                      onMouseEnter={() => setActiveBar({ month: month.label, category: bar.category, value: bar.value, x: bar.x + 15.5, y: bar.y })}
                      onMouseLeave={() => setActiveBar(null)}
                      onFocus={() => setActiveBar({ month: month.label, category: bar.category, value: bar.value, x: bar.x + 15.5, y: bar.y })}
                      onBlur={() => setActiveBar(null)}
                    />
                    <text x={bar.x + 15.5} y={Math.max(plotTop + 10, bar.y - 7)} textAnchor="middle" className="pointer-events-none fill-foreground text-[10px] font-semibold">
                      {formatPercentage(bar.value)}
                    </text>
                  </g>
                ))}
                <text x={groupX + 33} y="277" textAnchor="middle" className="fill-foreground text-[12px] font-medium">
                  {month.label.slice(0, 3)}
                </text>
              </g>
            )
          })}
          <text x="520" y="311" textAnchor="middle" className="fill-muted-foreground text-[11px]">Month</text>
          {activeBar ? (
            <g pointerEvents="none" transform={`translate(${Math.min(862, Math.max(58, activeBar.x - 65))} ${Math.max(8, activeBar.y - 54)})`}>
              <rect width="130" height="43" rx="6" className="fill-foreground drop-shadow-md" />
              <text x="65" y="17" textAnchor="middle" className="fill-background text-[10px] font-medium">
                {activeBar.month} · {activeBar.category}
              </text>
              <text x="65" y="34" textAnchor="middle" className="fill-background text-[14px] font-bold">
                {formatPercentage(activeBar.value)}
              </text>
            </g>
          ) : null}
        </svg>
      </div>
    </PageSection>
  )
}

export function DashboardPage() {
  const { organization, branch, hasPermission } = useTenant()
  const scope = organization && branch ? { organizationId: organization.id, branchId: branch.id } : null
  const query = useQuery({ queryKey: scope ? churchKeys.resource(scope, 'dashboard') : ['church-dashboard-disabled'], queryFn: () => churchApi.dashboard(scope!), enabled: Boolean(scope && hasPermission('church-dashboard.read')) })
  if (!branch) return <div className="page-grid"><PageHeader title="Children's Church" description="Select a branch above to view church operations." /><EmptyState title="Select a branch" description="Church attendance, children, facilitators and events are branch-specific." /></div>
  if (!hasPermission('church-dashboard.read')) return <div className="page-grid"><PageHeader title={organization?.name || "Children's Church"} /><EmptyState title="Dashboard unavailable" description="Your role does not include access to church dashboard summaries." /></div>
  if (query.isLoading) return <div className="page-grid"><Spinner label="Loading church dashboard" /></div>
  if (query.error || !query.data) return <div className="page-grid"><ErrorState message={errorMessage(query.error)} onRetry={() => void query.refetch()} /></div>
  const data = query.data
  const stats = [{ label: 'Active children', value: data.active_children }, { label: 'Latest Sunday attended', value: data.recent_attendance.present + data.recent_attendance.late }, { label: 'Latest Sunday absent', value: data.recent_attendance.absent }, { label: 'Attendance', value: data.attendance_percentage == null ? '—' : `${data.attendance_percentage}%` }]
  return <div className="page-grid"><PageHeader title="Children's Church" description={`${branch.name} operations, attendance, and upcoming activities.`} actions={<PermissionGuard require="church-events.read"><Link to="/church/events"><Button><CalendarDays /> Events</Button></Link></PermissionGuard>} /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{stats.map((item) => <Card key={item.label} className="p-5"><p className="text-2xl font-bold">{item.value}</p><p className="text-sm text-muted-foreground">{item.label}</p></Card>)}</div><MonthlyAttendanceChart year={data.monthly_attendance.year} months={data.monthly_attendance.months} /><div className="grid gap-6 lg:grid-cols-2"><PageSection title="Upcoming events">{data.upcoming_events.length ? <div className="grid gap-2">{data.upcoming_events.map((event) => <Link key={event.id} to="/church/events/$eventId" params={{ eventId: event.id }} className="rounded-lg border p-3 hover:bg-accent"><strong>{event.name}</strong><span className="block text-sm text-muted-foreground">{friendlyDate(event.event_date)}</span></Link>)}</div> : <p className="text-sm text-muted-foreground">None scheduled.</p>}</PageSection><PageSection title="Quick actions"><div className="grid gap-2 sm:grid-cols-2"><PermissionGuard require="church-children.manage"><Link to="/church/children/new"><Button className="w-full"><Plus /> Register child</Button></Link></PermissionGuard><PermissionGuard require="church-events.manage"><Link to="/church/events"><Button variant="secondary" className="w-full"><CalendarDays /> Create event</Button></Link></PermissionGuard><PermissionGuard require="church-facilitators.read"><Link to="/church/facilitators"><Button variant="secondary" className="w-full"><Users /> Facilitators</Button></Link></PermissionGuard><PermissionGuard require="church-reports.read"><Link to="/church/reports/sundays"><Button variant="secondary" className="w-full"><ClipboardCheck /> Attendance summaries</Button></Link></PermissionGuard></div></PageSection></div></div>
}
