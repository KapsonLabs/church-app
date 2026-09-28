/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '@/shared/api/client'
import { asList, type Branch, type Organization, type UUID } from '@/shared/api/contracts'
import { branchesApi } from '@/features/branches/api'
import { useAuth } from './AuthContext'

interface TenantContextValue {
  organization: Organization | null; branch: Branch | null; branches: Branch[]; permissions: Set<string>
  loading: boolean; initialized: boolean; accessError: string | null
  clearTenant: () => void; hasPermission: (codename: string) => boolean
}
const TenantContext = createContext<TenantContextValue | null>(null)

export function TenantProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient(); const { status, sessionBranches } = useAuth()
  const [organization, setOrganization] = useState<Organization | null>(null); const [branch, setBranch] = useState<Branch | null>(null)
  const [branches, setBranches] = useState<Branch[]>([]); const [permissions, setPermissions] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false); const [initialized, setInitialized] = useState(false); const [accessError, setAccessError] = useState<string | null>(null)
  const clearTenant = useCallback(() => { setOrganization(null); setBranch(null); setBranches([]); setPermissions(new Set()); setAccessError(null); setInitialized(false); queryClient.removeQueries({ queryKey: ['tenant'] }) }, [queryClient])

  useEffect(() => {
    let alive = true
    if (status !== 'authenticated') { if (status === 'guest') clearTenant(); return () => { alive = false } }
    queryClient.removeQueries({ queryKey: ['tenant'] }); setAccessError(null)
    if (!sessionBranches.length) { setOrganization(null); setBranch(null); setBranches([]); setPermissions(new Set()); setInitialized(true); return () => { alive = false } }
    const selected = sessionBranches[0]
    setLoading(true); setInitialized(false)
    Promise.all([apiRequest<string[]>(`accounts/me/permissions/?organization_id=${selected.organization.id}`), branchesApi.list(selected.organization.id)])
      .then(([codes, branchResult]) => {
        if (!alive) return
        setOrganization(selected.organization); setBranch(selected); setBranches(asList(branchResult).filter((item) => item.is_active)); setPermissions(new Set(codes))
      })
      .catch((reason: unknown) => { if (alive) { setOrganization(null); setBranch(null); setBranches([]); setPermissions(new Set()); setAccessError(reason instanceof Error ? reason.message : 'We could not load your branch access.') } })
      .finally(() => { if (alive) { setLoading(false); setInitialized(true) } })
    return () => { alive = false }
  }, [clearTenant, queryClient, sessionBranches, status])

  const value = useMemo<TenantContextValue>(() => ({ organization, branch, branches, permissions, loading, initialized, accessError, clearTenant, hasPermission: (codename) => permissions.has(codename) }), [accessError, branch, branches, clearTenant, initialized, loading, organization, permissions])
  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}
export function useTenant() { const value = useContext(TenantContext); if (!value) throw new Error('useTenant must be used inside TenantProvider'); return value }
export function tenantId(organization: Organization | null): UUID { if (!organization) throw new Error('An active organization is required.'); return organization.id }
