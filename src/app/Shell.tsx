import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, LogOut, Menu, Moon, Sun, User, X } from 'lucide-react'
import { coreNavigation, enabledModuleNavigation } from './moduleRegistry'
import { useTenant } from './TenantContext'
import { useAuth } from './AuthContext'
import { getNavigationTrail } from './navigationTrail'
import { Button } from '@/shared/ui/primitives'
import { initials } from '@/shared/lib/format'

const appName = import.meta.env.VITE_APP_NAME || 'KingdomKids'

export function AppShell({ children }: { children: ReactNode }) {
  const { organization, branch, clearTenant, hasPermission } = useTenant(); const { user, logout } = useAuth(); const navigate = useNavigate(); const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false); const [collapsed, setCollapsed] = useState(false); const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); localStorage.setItem('theme', dark ? 'dark' : 'light') }, [dark])
  useEffect(() => setMobileOpen(false), [location.pathname])
  const navigation = [...coreNavigation, ...enabledModuleNavigation].filter((item) => (!item.permission || hasPermission(item.permission)) && (!item.anyPermissions || item.anyPermissions.some(hasPermission)))
  const currentTrail = getNavigationTrail(location.pathname)
  const doLogout = async () => { clearTenant(); await logout(); await navigate({ to: '/signin', search: { next: undefined } }) }
  const goBack = () => {
    const state = window.history.state as { idx?: number; __TSR_index?: number } | null
    const historyIndex = state?.idx ?? state?.__TSR_index ?? 0
    if (historyIndex > 0) window.history.back()
    else void navigate({ to: currentTrail.parent as never })
  }
  const sidebar = <><div className="flex h-16 items-center justify-between border-b px-4"><span className={collapsed ? 'sr-only' : 'font-bold'}>{appName}</span><span className="grid h-9 w-9 place-items-center rounded-lg bg-primary font-bold text-primary-foreground">K</span></div><nav className="grid gap-1 p-3" aria-label="Main navigation">{navigation.map((item, index) => { const Icon = item.icon; const showGroup = item.group && item.group !== navigation[index - 1]?.group; return <div key={item.to}>{showGroup && <p className={collapsed ? 'sr-only' : 'mb-1 mt-4 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground'}>{item.group}</p>}<Link to={item.to} activeOptions={{ exact: item.to === '/' }} className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground [&.active]:bg-accent [&.active]:text-accent-foreground"><Icon className="h-5 w-5 shrink-0" /><span className={collapsed ? 'sr-only' : ''}>{item.label}</span></Link></div> })}</nav></>
  return <div className="min-h-dvh bg-background">
    <aside className={`fixed inset-y-0 left-0 z-40 hidden border-r bg-card transition-[width] lg:block ${collapsed ? 'w-20' : 'w-64'}`}>{sidebar}<Button variant="secondary" className="absolute -right-4 top-20 h-8 w-8 rounded-full p-0" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={() => setCollapsed((value) => !value)}>{collapsed ? <ChevronRight /> : <ChevronLeft />}</Button></aside>
    {mobileOpen && <div className="fixed inset-0 z-50 lg:hidden"><button aria-label="Close menu" className="absolute inset-0 bg-black/55" onClick={() => setMobileOpen(false)} /><aside className="absolute inset-y-0 left-0 w-[min(85vw,20rem)] border-r bg-card shadow-xl">{sidebar}<Button variant="ghost" className="absolute right-2 top-2 h-11 w-11 p-0" aria-label="Close menu" onClick={() => setMobileOpen(false)}><X /></Button></aside></div>}
    <div className={collapsed ? 'lg:pl-20' : 'lg:pl-64'}><header className="sticky top-0 z-30 flex min-h-16 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur sm:gap-3 sm:px-6">
      <Button variant="ghost" className="h-11 w-11 shrink-0 p-0 lg:hidden" aria-label="Open menu" onClick={() => setMobileOpen(true)}><Menu /></Button>
      {location.pathname !== '/' && <Button variant="secondary" className="h-12 w-12 shrink-0 rounded-full p-0 shadow-sm" aria-label="Go back" onClick={goBack}><ChevronLeft className="h-7 w-7" /></Button>}
      <nav aria-label="Breadcrumb" className="min-w-0 flex-1 overflow-x-auto"><ol className="flex min-w-max items-center gap-1 text-sm">{currentTrail.crumbs.map((crumb, index) => <li key={`${crumb.label}-${index}`} className="flex items-center gap-1">{index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}{crumb.to && index < currentTrail.crumbs.length - 1 ? <Link to={crumb.to as never} className="text-muted-foreground hover:text-foreground">{crumb.label}</Link> : <span className="max-w-40 truncate font-medium" aria-current={index === currentTrail.crumbs.length - 1 ? 'page' : undefined}>{crumb.label}</span>}</li>)}</ol></nav>
      <span className="max-w-16 truncate text-xs font-medium text-muted-foreground sm:hidden" title={`${organization?.name || ''} — ${branch?.name || ''}`}>{branch?.name}</span>
      <div className="hidden min-w-0 text-right sm:block"><span className="block max-w-44 truncate text-sm font-semibold">{organization?.name}</span><span className="block max-w-44 truncate text-xs text-muted-foreground">{branch?.name}</span></div>
      <Button variant="ghost" className="hidden h-11 w-11 shrink-0 p-0 sm:inline-flex" aria-label={dark ? 'Use light theme' : 'Use dark theme'} onClick={() => setDark((value) => !value)}>{dark ? <Sun /> : <Moon />}</Button><Link to="/profile" aria-label="Profile" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{user ? initials(user.first_name, user.last_name, user.email) : <User />}</Link><Button variant="ghost" className="h-11 w-11 shrink-0 p-0" aria-label="Log out" onClick={() => void doLogout()}><LogOut /></Button>
    </header><main>{children}</main></div>
  </div>
}
