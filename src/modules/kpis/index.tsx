/* eslint-disable react-refresh/only-export-components */
import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '@/shared/api/client'
import { asList, type PaginatedResponse } from '@/shared/api/contracts'
import { useTenant, tenantId } from '@/app/TenantContext'
import { DataView, type DataColumn } from '@/shared/ui/DataView'
import { PageHeader, PageSection } from '@/shared/ui/Page'
import { errorMessage } from '@/shared/lib/format'

export const kpiModule = { id: 'kpis', requiredPermission: 'kpis.read', route: '/kpis' } as const
interface KPI { id: string; name?: string; title?: string; status?: string; frequency?: string }
const api = { list: (organizationId: string) => apiRequest<PaginatedResponse<KPI> | KPI[]>(`kpis/?organization_id=${organizationId}`) }
const columns: DataColumn<KPI>[] = [{ key: 'name', header: 'KPI', cell: (row) => row.name || row.title || 'Untitled', sortValue: (row) => row.name || row.title || '' }, { key: 'frequency', header: 'Frequency', cell: (row) => row.frequency || '—' }, { key: 'status', header: 'Status', cell: (row) => row.status || '—' }]
export function KpiModulePage() { const { organization } = useTenant(); const organizationId = tenantId(organization); const query = useQuery({ queryKey: ['tenant', organizationId, 'kpis'], queryFn: () => api.list(organizationId) }); const rows = query.data ? asList(query.data) : []; return <div className="page-grid"><PageHeader title="KPI example" description="An optional tenant-scoped performance module." /><PageSection><DataView rows={rows} columns={columns} getRowId={(row) => row.id} mobileSummary={(row) => <strong>{row.name || row.title || 'Untitled'}</strong>} mobileDetails={(row) => `${row.frequency || 'No frequency'} · ${row.status || 'No status'}`} searchableText={(row) => `${row.name} ${row.title} ${row.status}`} loading={query.isLoading} error={query.error ? errorMessage(query.error) : undefined} /></PageSection></div> }
