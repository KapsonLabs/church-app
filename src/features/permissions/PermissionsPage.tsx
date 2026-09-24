import { useQuery } from '@tanstack/react-query'
import { rolesApi } from '@/features/roles/api'
import { asList, type Permission } from '@/shared/api/contracts'
import { queryKeys } from '@/shared/api/queryKeys'
import { DataView, type DataColumn } from '@/shared/ui/DataView'
import { Badge } from '@/shared/ui/primitives'
import { PageHeader, PageSection } from '@/shared/ui/Page'
import { errorMessage } from '@/shared/lib/format'

const columns: DataColumn<Permission>[] = [{ key: 'resource', header: 'Resource', cell: (row) => row.resource.name, sortValue: (row) => row.resource.name }, { key: 'action', header: 'Action', cell: (row) => <Badge tone="info">{row.action}</Badge>, sortValue: (row) => row.action }, { key: 'codename', header: 'Codename', cell: (row) => <code className="text-xs">{row.codename}</code> }, { key: 'description', header: 'Description', cell: (row) => row.description || '—' }]
export function PermissionsPage() { const query = useQuery({ queryKey: queryKeys.permissions, queryFn: rolesApi.permissions }); const rows = query.data ? asList(query.data) : []; return <div className="page-grid"><PageHeader title="Permission catalog" description="Read-only resource/action permissions available for tenant roles." /><PageSection><DataView rows={rows} columns={columns} getRowId={(row) => row.id} mobileSummary={(row) => <><h3 className="font-semibold">{row.resource.name}</h3><code className="text-xs text-muted-foreground">{row.codename}</code></>} mobileDetails={(row) => <><Badge tone="info">{row.action}</Badge><span>{row.description || 'No description'}</span></>} searchableText={(row) => `${row.resource.name} ${row.action} ${row.codename}`} loading={query.isLoading} error={query.error ? errorMessage(query.error) : undefined} onRetry={() => void query.refetch()} /></PageSection></div> }
