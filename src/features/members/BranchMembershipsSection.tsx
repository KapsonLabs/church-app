import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { membersApi } from './api'
import type { Branch, BranchMembership, UUID } from '@/shared/api/contracts'
import { usePaginatedQuery } from '@/shared/api/usePaginatedQuery'
import { DataView, type DataColumn } from '@/shared/ui/DataView'
import { Badge, Button, Select } from '@/shared/ui/primitives'
import { PageSection } from '@/shared/ui/Page'
import { PermissionGuard } from '@/shared/ui/PermissionGuard'
import { errorMessage } from '@/shared/lib/format'

const columns: DataColumn<BranchMembership>[] = [{ key: 'email', header: 'Member', cell: (row) => row.user_email, sortValue: (row) => row.user_email }, { key: 'status', header: 'Status', cell: (row) => <Badge tone={row.is_active ? 'success' : 'danger'}>{row.is_active ? 'Active' : 'Inactive'}</Badge> }]
export function BranchMembershipsSection({ organizationId, branches }: { organizationId: UUID; branches: Branch[] }) {
  const [branchId, setBranchId] = useState(''); const queryClient = useQueryClient(); const key = ['tenant', organizationId, 'branch-memberships', branchId] as const
  const query = usePaginatedQuery({ queryKey: key, queryFn: (page) => membersApi.branchMemberships(organizationId, branchId, page), enabled: !!branchId })
  const toggle = useMutation({ mutationFn: (row: BranchMembership) => membersApi.updateBranchMembership(organizationId, row.id, !row.is_active), onSuccess: () => void queryClient.invalidateQueries({ queryKey: key }) })
  const rows = query.rows
  return <PageSection title="Branch memberships" description="Inspect and activate or deactivate access for a specific branch."><Select className="mb-4 max-w-sm" aria-label="Branch membership filter" value={branchId} onChange={(event) => setBranchId(event.target.value)}><option value="">Choose a branch</option>{branches.map((branch) => <option value={branch.id} key={branch.id}>{branch.name}</option>)}</Select>{branchId ? <DataView rows={rows} columns={columns} getRowId={(row) => row.id} mobileSummary={(row) => <h3 className="truncate font-semibold">{row.user_email}</h3>} mobileDetails={(row) => <Badge tone={row.is_active ? 'success' : 'danger'}>{row.is_active ? 'Active' : 'Inactive'}</Badge>} searchableText={(row) => row.user_email} loading={query.isLoading} error={query.error ? errorMessage(query.error) : undefined} onRetry={() => void query.refetch()} emptyTitle="No memberships for this branch" actions={(row) => <PermissionGuard require="members.manage"><Button variant="secondary" onClick={() => toggle.mutate(row)}>{row.is_active ? 'Deactivate' : 'Activate'}</Button></PermissionGuard>} /> : <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">Choose a branch to view its memberships.</p>}</PageSection>
}
