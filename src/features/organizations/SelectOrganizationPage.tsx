import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, Building2, LogOut } from 'lucide-react'
import { organizationsApi } from './api'
import { asList } from '@/shared/api/contracts'
import { queryKeys } from '@/shared/api/queryKeys'
import { useTenant } from '@/app/TenantContext'
import { useAuth } from '@/app/AuthContext'
import { Button, Spinner } from '@/shared/ui/primitives'
import { EmptyState, ErrorState } from '@/shared/ui/Page'
import { errorMessage } from '@/shared/lib/format'

export function SelectOrganizationPage() {
  const query = useQuery({ queryKey: queryKeys.organizations, queryFn: organizationsApi.list }); const { selectOrganization, loading, clearTenant } = useTenant(); const { logout } = useAuth(); const navigate = useNavigate(); const organizations = query.data ? asList(query.data) : []
  const choose = async (organization: (typeof organizations)[number]) => { await selectOrganization(organization); await navigate({ to: '/' }) }
  const signOut = async () => { clearTenant(); await logout(); await navigate({ to: '/signin', search: { next: undefined } }) }
  return <main className="min-h-dvh p-4 sm:p-8"><div className="mx-auto max-w-4xl"><header className="mb-8 flex items-start justify-between gap-4"><div><div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground"><Building2 /></div><h1 className="text-2xl font-bold sm:text-3xl">Choose an organization</h1><p className="mt-1 text-sm text-muted-foreground">Your selection lasts for this session only.</p></div><Button variant="ghost" onClick={() => void signOut()}><LogOut /> <span className="hidden sm:inline">Sign out</span></Button></header>{query.isLoading ? <div className="grid min-h-64 place-items-center"><Spinner /></div> : query.error ? <ErrorState message={errorMessage(query.error)} onRetry={() => void query.refetch()} /> : !organizations.length ? <EmptyState title="No organizations available" description="Ask an administrator to add you to an active organization." /> : <div className="grid gap-4 sm:grid-cols-2">{organizations.map((organization) => <button disabled={loading} key={organization.id} onClick={() => void choose(organization)} className="surface group min-h-36 p-5 text-left transition hover:border-primary hover:shadow-md disabled:opacity-50"><div className="flex items-start justify-between gap-4"><div><h2 className="font-semibold">{organization.name}</h2><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{organization.description || 'No description provided.'}</p></div><ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" /></div><p className="mt-5 text-xs font-medium text-muted-foreground">{organization.branch_count} {organization.branch_count === 1 ? 'branch' : 'branches'}</p></button>)}</div>}</div></main>
}
