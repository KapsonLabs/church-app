export interface NavigationCrumb { label: string; to?: string }
export interface NavigationTrail { crumbs: NavigationCrumb[]; parent: string }

const dashboard: NavigationCrumb = { label: 'Dashboard', to: '/' }
const settings: NavigationCrumb = { label: 'Settings', to: '/settings' }
const children: NavigationCrumb = { label: 'Children', to: '/church/children' }
const events: NavigationCrumb = { label: 'Events', to: '/church/events' }
const facilitators: NavigationCrumb = { label: 'Facilitators', to: '/church/facilitators' }
const reports: NavigationCrumb = { label: 'Reports', to: '/church/reports/sundays' }

function trail(crumbs: NavigationCrumb[], parent = '/'): NavigationTrail { return { crumbs: [dashboard, ...crumbs], parent } }

export function getNavigationTrail(pathname: string): NavigationTrail {
  if (pathname === '/') return { crumbs: [{ label: 'Dashboard' }], parent: '/' }
  if (pathname === '/profile') return trail([{ label: 'Profile' }])
  if (pathname === '/organizations') return trail([{ label: 'Organizations' }])
  if (pathname === '/branches') return trail([{ label: 'Branches' }])
  if (pathname === '/settings') return trail([{ label: 'Settings' }])
  if (pathname === '/settings/users') return trail([settings, { label: 'User management' }], '/settings')
  if (pathname === '/settings/permissions') return trail([settings, { label: 'Permissions management' }], '/settings')
  if (pathname === '/settings/age-groups') return trail([settings, { label: 'Age groups' }], '/settings')
  if (pathname === '/church/children') return trail([{ label: 'Children' }])
  if (pathname === '/church/children/new') return trail([children, { label: 'Register child' }], '/church/children')
  if (/^\/church\/children\/[^/]+$/.test(pathname)) return trail([children, { label: 'Child details' }], '/church/children')
  if (pathname === '/church/events') return trail([{ label: 'Events' }])
  if (pathname === '/church/events/new') return trail([events, { label: 'Create event' }], '/church/events')
  if (/^\/church\/events\/[^/]+\/attendance$/.test(pathname)) return trail([events, { label: 'Event details', to: pathname.replace(/\/attendance$/, '') }, { label: 'Attendance' }], pathname.replace(/\/attendance$/, ''))
  if (/^\/church\/events\/[^/]+$/.test(pathname)) return trail([events, { label: 'Event details' }], '/church/events')
  if (/^\/church\/sessions\/[^/]+\/attendance$/.test(pathname)) return trail([events, { label: 'Attendance' }], '/church/events')
  if (/^\/church\/sessions\/[^/]+\/facilitators$/.test(pathname)) return trail([events, { label: 'Session facilitators' }], '/church/events')
  if (pathname === '/church/facilitators') return trail([{ label: 'Facilitators' }])
  if (/^\/church\/facilitators\/[^/]+$/.test(pathname)) return trail([facilitators, { label: 'Facilitator details' }], '/church/facilitators')
  if (pathname === '/church/absenteeism') return trail([{ label: 'Absenteeism' }])
  const reportLabels: Record<string, string> = { sundays: 'Sunday attendance', events: 'Event attendance', services: 'Service attendance', 'age-groups': 'Age-group attendance', facilitators: 'Facilitator attendance' }
  const reportMatch = pathname.match(/^\/church\/reports\/([^/]+)$/)
  if (reportMatch) return trail([reports, { label: reportLabels[reportMatch[1]] || 'Attendance summary' }], '/church/reports/sundays')
  if (pathname.startsWith('/church/reports')) return trail([{ label: 'Reports' }])
  if (pathname === '/crm') return trail([{ label: 'CRM' }])
  if (pathname === '/kpis') return trail([{ label: 'KPIs' }])
  if (pathname === '/info') return trail([{ label: 'Information' }])
  if (pathname === '/forbidden') return trail([{ label: 'Access denied' }])
  return trail([{ label: 'Page' }])
}
