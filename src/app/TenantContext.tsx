/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '@/shared/api/client'
import { asList, type Branch, type Organization, type UUID } from '@/shared/api/contracts'
import { branchesApi } from '@/features/branches/api'

interface TenantContextValue {
  organization: Organization | null; branch: Branch | null; branches: Branch[]; permissions: Set<string>; loading: boolean
  selectOrganization: (organization: Organization) => Promise<void>; selectBranch: (branch: Branch | null) => void; clearTenant: () => void; hasPermission: (codename: string) => boolean
}
const TenantContext = createContext<TenantContextValue | null>(null)
export function TenantProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient(); const [organization, setOrganization] = useState<Organization | null>(null); const [branch, setBranch] = useState<Branch | null>(null); const [branches, setBranches] = useState<Branch[]>([]); const [permissions, setPermissions] = useState<Set<string>>(new Set()); const [loading, setLoading] = useState(false)
  const clearTenant = () => { setOrganization(null); setBranch(null); setBranches([]); setPermissions(new Set()); queryClient.removeQueries({ queryKey: ['tenant'] }) }
  const selectOrganization = async (next: Organization) => { setLoading(true); queryClient.removeQueries({ queryKey: ['tenant'] }); try { const [codes, branchResult] = await Promise.all([apiRequest<string[]>(`accounts/me/permissions/?organization_id=${next.id}`), branchesApi.list(next.id).catch(() => [])]); setOrganization(next); setBranch(null); setPermissions(new Set(codes)); setBranches(asList(branchResult)) } finally { setLoading(false) } }
  const value: TenantContextValue = { organization, branch, branches, permissions, loading, selectOrganization, selectBranch: setBranch, clearTenant, hasPermission: (codename: string) => permissions.has(codename) }
  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}
export function useTenant() { const value = useContext(TenantContext); if (!value) throw new Error('useTenant must be used inside TenantProvider'); return value }
export function tenantId(organization: Organization | null): UUID { if (!organization) throw new Error('An active organization is required.'); return organization.id }
