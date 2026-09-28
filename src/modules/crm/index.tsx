/* eslint-disable react-refresh/only-export-components */
import { apiRequest } from '@/shared/api/client'
import type { PaginatedResponse } from '@/shared/api/contracts'
import { usePaginatedQuery } from '@/shared/api/usePaginatedQuery'
import { useTenant, tenantId } from '@/app/TenantContext'
import { DataView, type DataColumn } from '@/shared/ui/DataView'
import { PageHeader, PageSection } from '@/shared/ui/Page'
import { errorMessage } from '@/shared/lib/format'

export const crmModule = { id: 'crm', requiredPermission: 'crm.read', route: '/crm' } as const
interface Ticket { id: string | number; title?: string; subject?: string; status?: string }
const api = { list: (organizationId: string, page = 1) => apiRequest<PaginatedResponse<Ticket> | Ticket[]>(`crm/tickets/?organization_id=${organizationId}&page=${page}`) }
const columns: DataColumn<Ticket>[] = [{ key: 'ticket', header: 'Ticket', cell: (row) => row.title || row.subject || `Ticket ${row.id}`, sortValue: (row) => row.title || row.subject || row.id }, { key: 'status', header: 'Status', cell: (row) => row.status || '—' }]
export function CrmModulePage() { const { organization } = useTenant(); const organizationId = tenantId(organization); const query = usePaginatedQuery({ queryKey: ['tenant', organizationId, 'crm', 'tickets'], queryFn: (page) => api.list(organizationId, page) }); return <div className="page-grid"><PageHeader title="CRM example" description="An optional tenant-scoped ticket module." /><PageSection><DataView rows={query.rows} columns={columns} getRowId={(row) => String(row.id)} mobileSummary={(row) => <strong>{row.title || row.subject || `Ticket ${row.id}`}</strong>} mobileDetails={(row) => row.status || 'No status'} searchableText={(row) => `${row.title} ${row.subject} ${row.status}`} loading={query.isLoading} error={query.error ? errorMessage(query.error) : undefined} /></PageSection></div> }
