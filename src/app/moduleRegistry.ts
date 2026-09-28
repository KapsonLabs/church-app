import { BarChart3, BookOpen, ChartNoAxesColumn, ClipboardCheck, Gauge, MapPin, Settings, UserRoundCheck, Users, type LucideIcon } from 'lucide-react'

export interface NavigationItem { label: string; to: string; icon: LucideIcon; permission?: string; anyPermissions?: string[]; group?: string }
export interface AppModule { id: string; label: string; enabled: boolean; permission?: string; routes: readonly string[]; navigation: NavigationItem[] }

export const coreNavigation: NavigationItem[] = [
  { label: 'Dashboard', to: '/', icon: Gauge },
  { label: 'Branches', to: '/branches', icon: MapPin, permission: 'branches.read' },
  { label: 'Settings', to: '/settings', icon: Settings, anyPermissions: ['members.read', 'roles.read', 'church-age-groups.read'] },
]

export const moduleRegistry: AppModule[] = [
  { id: 'church', label: "Children's Church", enabled: true, permission: 'church-dashboard.read', routes: ['/church'], navigation: [
    { label: 'Children', to: '/church/children', icon: Users, permission: 'church-children.read', group: "Children's Church" },
    { label: 'Events', to: '/church/events', icon: ClipboardCheck, permission: 'church-events.read', group: "Children's Church" },
    { label: 'Facilitators', to: '/church/facilitators', icon: UserRoundCheck, permission: 'church-facilitators.read', group: "Children's Church" },
    { label: 'Reports', to: '/church/reports', icon: ChartNoAxesColumn, permission: 'church-reports.read', group: "Children's Church" },
    { label: 'Absenteeism', to: '/church/absenteeism', icon: ClipboardCheck, permission: 'church-reports.read', group: "Children's Church" },
  ] },
  { id: 'crm', label: 'CRM', enabled: false, permission: 'crm.read', routes: ['/crm'], navigation: [{ label: 'CRM', to: '/crm', icon: Users, permission: 'crm.read' }] },
  { id: 'info', label: 'Info center', enabled: false, permission: 'info.read', routes: ['/info'], navigation: [{ label: 'Info center', to: '/info', icon: BookOpen, permission: 'info.read' }] },
  { id: 'kpis', label: 'KPIs', enabled: false, permission: 'kpis.read', routes: ['/kpis'], navigation: [{ label: 'KPIs', to: '/kpis', icon: BarChart3, permission: 'kpis.read' }] },
]

export const enabledModuleNavigation = moduleRegistry.filter((module) => module.enabled).flatMap((module) => module.navigation)
export const isModuleEnabled = (id: string) => moduleRegistry.some((module) => module.id === id && module.enabled)
