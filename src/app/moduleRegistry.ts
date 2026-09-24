import { BarChart3, BookOpen, Building2, Gauge, MapPin, ShieldCheck, Users, type LucideIcon } from 'lucide-react'

export interface NavigationItem { label: string; to: string; icon: LucideIcon; permission?: string }
export interface AppModule { id: string; label: string; enabled: boolean; permission?: string; routes: readonly string[]; navigation: NavigationItem[] }

export const coreNavigation: NavigationItem[] = [
  { label: 'Dashboard', to: '/', icon: Gauge },
  { label: 'Organizations', to: '/organizations', icon: Building2, permission: 'organizations.read' },
  { label: 'Branches', to: '/branches', icon: MapPin, permission: 'branches.read' },
  { label: 'Members', to: '/members', icon: Users, permission: 'members.read' },
  { label: 'Roles', to: '/roles', icon: ShieldCheck, permission: 'roles.read' },
  { label: 'Permissions', to: '/permissions', icon: BookOpen, permission: 'roles.read' },
]

export const moduleRegistry: AppModule[] = [
  { id: 'crm', label: 'CRM', enabled: false, permission: 'crm.read', routes: ['/crm'], navigation: [{ label: 'CRM', to: '/crm', icon: Users, permission: 'crm.read' }] },
  { id: 'info', label: 'Info center', enabled: false, permission: 'info.read', routes: ['/info'], navigation: [{ label: 'Info center', to: '/info', icon: BookOpen, permission: 'info.read' }] },
  { id: 'kpis', label: 'KPIs', enabled: false, permission: 'kpis.read', routes: ['/kpis'], navigation: [{ label: 'KPIs', to: '/kpis', icon: BarChart3, permission: 'kpis.read' }] },
]

export const enabledModuleNavigation = moduleRegistry.filter((module) => module.enabled).flatMap((module) => module.navigation)
export const isModuleEnabled = (id: string) => moduleRegistry.some((module) => module.id === id && module.enabled)
