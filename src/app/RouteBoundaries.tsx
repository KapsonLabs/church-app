import { Navigate, Outlet, useLocation } from '@tanstack/react-router'
import { useAuth } from './AuthContext'
import { useTenant } from './TenantContext'
import { Spinner } from '@/shared/ui/primitives'
import { AppShell } from './Shell'

function FullScreenLoader() { return <main className="grid min-h-dvh place-items-center"><Spinner label="Restoring your session" /></main> }
export function PublicBoundary() { const { status } = useAuth(); if (status === 'restoring') return <FullScreenLoader />; if (status === 'authenticated') return <Navigate to="/select-organization" />; return <Outlet /> }
export function AuthenticatedBoundary() { const { status } = useAuth(); const location = useLocation(); if (status === 'restoring') return <FullScreenLoader />; if (status !== 'authenticated') return <Navigate to="/signin" search={{ next: location.pathname }} />; return <Outlet /> }
export function TenantBoundary() { const { organization } = useTenant(); if (!organization) return <Navigate to="/select-organization" />; return <AppShell><Outlet /></AppShell> }
export function PermissionBoundary({ permission }: { permission: string }) { const { hasPermission } = useTenant(); return hasPermission(permission) ? <Outlet /> : <Navigate to="/forbidden" /> }
