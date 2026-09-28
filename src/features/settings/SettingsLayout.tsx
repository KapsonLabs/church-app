import { Link, Outlet, useNavigate, useParams } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useTenant } from '@/app/TenantContext'
import { TabbedPageContent } from '@/shared/ui/Page'

const settingsTabs = [
  { label: 'User Management', to: '/settings/users', permission: 'members.read' },
  { label: 'Permissions Management', to: '/settings/permissions', permission: 'roles.read' },
  { label: 'Age Groups', to: '/settings/age-groups', permission: 'church-age-groups.read' },
] as const

export function SettingsLayout() {
  const { hasPermission } = useTenant(); const tabs = settingsTabs.filter((tab) => hasPermission(tab.permission))
  return <div className="page-grid"><nav className="flex gap-2 overflow-x-auto border-b" aria-label="Settings">{tabs.map((tab) => <Link key={tab.to} to={tab.to} className="whitespace-nowrap border-b-2 border-transparent px-3 py-3 text-sm font-medium text-muted-foreground [&.active]:border-primary [&.active]:text-foreground">{tab.label}</Link>)}</nav><TabbedPageContent><Outlet /></TabbedPageContent></div>
}

export function SettingsIndex() {
  const { hasPermission } = useTenant(); const navigate = useNavigate(); const target = settingsTabs.find((tab) => hasPermission(tab.permission))?.to
  useEffect(() => { if (target) void navigate({ to: target, replace: true }) }, [navigate, target])
  return null
}

export function LegacyRedirect({ to }: { to: string }) {
  const navigate = useNavigate()
  useEffect(() => { void navigate({ to, replace: true }) }, [navigate, to])
  return null
}

export function LegacySundayRedirect() {
  const { eventId } = useParams({ strict: false }); const navigate = useNavigate()
  useEffect(() => { if (eventId) void navigate({ to: '/church/events/$eventId', params: { eventId }, replace: true }) }, [eventId, navigate])
  return null
}
