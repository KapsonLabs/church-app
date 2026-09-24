import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, LogOut, Menu, Moon, Sun, User, X } from 'lucide-react'
import { coreNavigation, enabledModuleNavigation } from './moduleRegistry'
import { useTenant } from './TenantContext'
import { useAuth } from './AuthContext'
import { Button, Select } from '@/shared/ui/primitives'
import { initials } from '@/shared/lib/format'

const appName = import.meta.env.VITE_APP_NAME || 'Tenant Console'
export function AppShell({ children }: { children: ReactNode }) {
  const { organization, branch, branches, selectBranch, clearTenant, hasPermission } = useTenant(); const { user, logout } = useAuth(); const navigate = useNavigate(); const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false); const [collapsed, setCollapsed] = useState(false); const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); localStorage.setItem('theme', dark ? 'dark' : 'light') }, [dark])
  useEffect(() => setMobileOpen(false), [location.pathname])
  const navigation = [...coreNavigation, ...enabledModuleNavigation].filter((item) => !item.permission || hasPermission(item.permission))
  const doLogout = async () => { clearTenant(); await logout(); await navigate({ to: '/signin', search: { next: undefined } }) }
  const sidebar = <><div className="flex h-16 items-center justify-between border-b px-4"><span className={collapsed ? 'sr-only' : 'font-bold'}>{appName}</span><span className="grid h-9 w-9 place-items-center rounded-lg bg-primary font-bold text-primary-foreground">T</span></div><nav className="grid gap-1 p-3" aria-label="Main navigation">{navigation.map((item) => { const Icon = item.icon; return <Link key={item.to} to={item.to} activeOptions={{ exact: item.to === '/' }} className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground [&.active]:bg-accent [&.active]:text-accent-foreground"><Icon className="h-5 w-5 shrink-0" /><span className={collapsed ? 'sr-only' : ''}>{item.label}</span></Link> })}</nav></>
  return <div className="min-h-dvh bg-background">
    <aside className={`fixed inset-y-0 left-0 z-40 hidden border-r bg-card transition-[width] lg:block ${collapsed ? 'w-20' : 'w-64'}`}>{sidebar}<Button variant="secondary" className="absolute -right-4 top-20 h-8 w-8 rounded-full p-0" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={() => setCollapsed((value) => !value)}>{collapsed ? <ChevronRight /> : <ChevronLeft />}</Button></aside>
    {mobileOpen && <div className="fixed inset-0 z-50 lg:hidden"><button aria-label="Close menu" className="absolute inset-0 bg-black/55" onClick={() => setMobileOpen(false)} /><aside className="absolute inset-y-0 left-0 w-[min(85vw,20rem)] border-r bg-card shadow-xl">{sidebar}<Button variant="ghost" className="absolute right-2 top-2 h-11 w-11 p-0" aria-label="Close menu" onClick={() => setMobileOpen(false)}><X /></Button></aside></div>}
    <div className={collapsed ? 'lg:pl-20' : 'lg:pl-64'}><header className="sticky top-0 z-30 flex min-h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur sm:px-6"><Button variant="ghost" className="h-11 w-11 p-0 lg:hidden" aria-label="Open menu" onClick={() => setMobileOpen(true)}><Menu /></Button><button onClick={() => { clearTenant(); void navigate({ to: '/select-organization' }) }} className="min-w-0 rounded-lg text-left"><span className="block truncate text-sm font-semibold">{organization?.name}</span><span className="block text-xs text-muted-foreground">Change organization</span></button><div className="ml-auto flex items-center gap-2">{branches.length > 0 && <Select aria-label="Active branch" className="hidden w-44 sm:block" value={branch?.id || ''} onChange={(event) => selectBranch(branches.find((item) => item.id === event.target.value) || null)}><option value="">All branches</option>{branches.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</Select>}<Button variant="ghost" className="h-11 w-11 p-0" aria-label={dark ? 'Use light theme' : 'Use dark theme'} onClick={() => setDark((value) => !value)}>{dark ? <Sun /> : <Moon />}</Button><Link to="/profile" aria-label="Profile" className="grid h-11 w-11 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{user ? initials(user.first_name, user.last_name, user.email) : <User />}</Link><Button variant="ghost" className="h-11 w-11 p-0" aria-label="Log out" onClick={() => void doLogout()}><LogOut /></Button></div></header><main>{children}</main></div>
  </div>
}
