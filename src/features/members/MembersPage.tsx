import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus } from 'lucide-react'
import { membersApi, type TenantUserInput } from './api'
import { rolesApi } from '@/features/roles/api'
import { asList, type TenantUser } from '@/shared/api/contracts'
import { queryKeys } from '@/shared/api/queryKeys'
import { useTenant, tenantId } from '@/app/TenantContext'
import { DataView, type DataColumn } from '@/shared/ui/DataView'
import { Badge, Button, Input, Select } from '@/shared/ui/primitives'
import { PageHeader, PageSection } from '@/shared/ui/Page'
import { Modal } from '@/shared/ui/Modal'
import { FormActions, FormField } from '@/shared/ui/Form'
import { PermissionGuard } from '@/shared/ui/PermissionGuard'
import { errorMessage } from '@/shared/lib/format'
import { usePaginatedQuery } from '@/shared/api/usePaginatedQuery'

const emptyForm: TenantUserInput = { email: '', password: '', first_name: '', last_name: '', phone_number: '', role_id: null, membership_is_active: true, branch_ids: [] }
const columns: DataColumn<TenantUser>[] = [
  { key: 'user', header: 'User', cell: (row) => <div><p className="font-medium">{row.first_name} {row.last_name}</p><p className="text-xs text-muted-foreground">{row.email}</p></div>, sortValue: (row) => `${row.first_name} ${row.last_name} ${row.email}` },
  { key: 'role', header: 'Role', cell: (row) => row.role_name || 'No role' },
  { key: 'branches', header: 'Branches', cell: (row) => row.branch_ids.length },
  { key: 'status', header: 'Status', cell: (row) => <Badge tone={row.membership_is_active ? 'success' : 'danger'}>{row.membership_is_active ? 'Active' : 'Inactive'}</Badge> },
]

export function MembersPage() {
  const { organization, branches } = useTenant(); const organizationId = tenantId(organization); const queryClient = useQueryClient()
  const [editing, setEditing] = useState<TenantUser | null>(null); const [open, setOpen] = useState(false); const [form, setForm] = useState<TenantUserInput>(emptyForm)
  const users = usePaginatedQuery({ queryKey: queryKeys.members(organizationId), queryFn: (page) => membersApi.tenantUsers(organizationId, page) })
  const roles = useQuery({ queryKey: queryKeys.roleOptions(organizationId), queryFn: () => rolesApi.list(organizationId) }); const roleRows = roles.data ? asList(roles.data) : []
  const save = useMutation({ mutationFn: () => editing ? membersApi.updateTenantUser(organizationId, editing.id, form) : membersApi.createTenantUser(organizationId, form), onSuccess: () => { void queryClient.invalidateQueries({ queryKey: queryKeys.members(organizationId) }); setOpen(false) } })
  const showCreate = () => { save.reset(); setEditing(null); setForm(emptyForm); setOpen(true) }
  const showEdit = (row: TenantUser) => { save.reset(); setEditing(row); setForm({ email: row.email, first_name: row.first_name, last_name: row.last_name, phone_number: row.phone_number, role_id: row.role_id, membership_is_active: row.membership_is_active, branch_ids: row.branch_ids }); setOpen(true) }
  const submit = (event: FormEvent) => { event.preventDefault(); save.mutate() }
  const setBranch = (id: string, checked: boolean) => setForm((value) => ({ ...value, branch_ids: checked ? [...value.branch_ids, id] : value.branch_ids.filter((item) => item !== id) }))
  return <div className="page-grid"><PageHeader title="User Management" description="Create tenant accounts and manage roles, organization access, and branch access in one transaction." actions={<PermissionGuard require="members.manage"><Button onClick={showCreate}><Plus /> Add user</Button></PermissionGuard>} /><PageSection><DataView rows={users.rows} columns={columns} getRowId={(row) => row.id} mobileSummary={(row) => <><h3 className="font-semibold">{row.first_name} {row.last_name}</h3><p className="text-sm text-muted-foreground">{row.email}</p></>} mobileDetails={(row) => <Badge tone={row.membership_is_active ? 'success' : 'danger'}>{row.membership_is_active ? 'Active' : 'Inactive'}</Badge>} searchableText={(row) => `${row.first_name} ${row.last_name} ${row.email} ${row.role_name}`} loading={users.isLoading} error={users.error ? errorMessage(users.error) : undefined} onRetry={() => void users.refetch()} emptyTitle="No users yet" hasMore={users.hasMore} loadingMore={users.isFetchingNextPage} onLoadMore={() => void users.fetchNextPage()} actions={(row) => <PermissionGuard require="members.manage"><Button variant="secondary" onClick={() => showEdit(row)}><Pencil /> Edit</Button></PermissionGuard>} /></PageSection>
  <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit user' : 'Add user'} description="Identity is shared across organizations; access and activation apply only to this organization."><form className="grid gap-4" onSubmit={submit}><div className="grid gap-4 sm:grid-cols-2"><FormField label="First name" htmlFor="user-first"><Input id="user-first" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required /></FormField><FormField label="Last name" htmlFor="user-last"><Input id="user-last" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} required /></FormField></div><FormField label="Email" htmlFor="user-email"><Input id="user-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></FormField><FormField label="Phone" htmlFor="user-phone"><Input id="user-phone" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} /></FormField>{!editing && <FormField label="Temporary password" htmlFor="user-password"><Input id="user-password" type="password" minLength={8} value={form.password || ''} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></FormField>}<FormField label="Role" htmlFor="user-role"><Select id="user-role" value={form.role_id || ''} onChange={(e) => setForm({ ...form, role_id: e.target.value || null })}><option value="">No role</option>{roleRows.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}</Select></FormField><fieldset className="grid gap-2"><legend className="text-sm font-medium">Branch access</legend>{branches.map((branch) => <label key={branch.id} className="flex min-h-11 items-center gap-3 rounded-lg border px-3"><input type="checkbox" checked={form.branch_ids.includes(branch.id)} onChange={(e) => setBranch(branch.id, e.target.checked)} /> {branch.name}</label>)}</fieldset><label className="flex items-center gap-3"><input type="checkbox" checked={form.membership_is_active} onChange={(e) => setForm({ ...form, membership_is_active: e.target.checked })} /> Active organization membership</label>{save.error && <p role="alert" className="field-error">{errorMessage(save.error)}</p>}<FormActions><Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button disabled={save.isPending}>{save.isPending ? 'Saving…' : 'Save user'}</Button></FormActions></form></Modal></div>
}
