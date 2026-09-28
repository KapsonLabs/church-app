import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from '@tanstack/react-router'
import { useAuth } from './AuthContext'
import { useTenant } from './TenantContext'
import { Button, Spinner } from '@/shared/ui/primitives'
import { AppShell } from './Shell'

function FullScreenLoader() { return <main className="grid min-h-dvh place-items-center"><Spinner label="Restoring your session" /></main> }
export function PublicBoundary() {
  const { status } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  useEffect(() => {
    if (status === 'authenticated') {
      void navigate({ to: '/', replace: true })
    }
  }, [location.pathname, navigate, status])
  if (status !== 'guest') return <FullScreenLoader />
  return <Outlet />
}
export function AuthenticatedBoundary() {
  const { status } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  useEffect(() => {
    if (status === 'guest' && location.pathname !== '/signin') {
      void navigate({ to: '/signin', search: { next: location.pathname }, replace: true })
    }
  }, [location.pathname, navigate, status])
  if (status !== 'authenticated') return <FullScreenLoader />
  return <Outlet />
}
export function TenantBoundary() {
  const { organization, branch, initialized, loading, accessError, clearTenant } = useTenant()
  const { logout } = useAuth()
  const navigate = useNavigate()
  if (loading || !initialized) return <FullScreenLoader />
  if (!organization || !branch) return <main className="grid min-h-dvh place-items-center p-4"><section className="surface max-w-md p-7 text-center"><h1 className="text-xl font-semibold">No active branch assigned</h1><p className="mt-2 text-sm text-muted-foreground">{accessError || 'Ask an administrator to assign your account to an active organization and branch.'}</p><Button className="mt-5" onClick={() => { clearTenant(); void logout().finally(() => navigate({ to: '/signin', search: { next: undefined } })) }}>Sign out</Button></section></main>
  return <AppShell><Outlet /></AppShell>
}
export function PermissionBoundary({ permission }: { permission: string }) {
  const { hasPermission } = useTenant()
  const location = useLocation()
  const navigate = useNavigate()
  const allowed = hasPermission(permission)
  useEffect(() => {
    if (!allowed && location.pathname !== '/forbidden') {
      void navigate({ to: '/forbidden', replace: true })
    }
  }, [allowed, location.pathname, navigate])
  return allowed ? <Outlet /> : <FullScreenLoader />
}
export function AnyPermissionBoundary({ permissions }: { permissions: string[] }) {
  const { hasPermission } = useTenant(); const location = useLocation(); const navigate = useNavigate()
  const allowed = permissions.some(hasPermission)
  useEffect(() => { if (!allowed && location.pathname !== '/forbidden') void navigate({ to: '/forbidden', replace: true }) }, [allowed, location.pathname, navigate])
  return allowed ? <Outlet /> : <FullScreenLoader />
}
