/* eslint-disable react-refresh/only-export-components */
import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '@/shared/api/client'
import { asList, type PaginatedResponse } from '@/shared/api/contracts'
import { useTenant, tenantId } from '@/app/TenantContext'
import { DataView, type DataColumn } from '@/shared/ui/DataView'
import { PageHeader, PageSection } from '@/shared/ui/Page'
import { errorMessage } from '@/shared/lib/format'

export const infoModule = { id: 'info', requiredPermission: 'info.read', route: '/info' } as const
interface FAQ { id: string; question?: string; title?: string; answer?: string }
const api = { list: (organizationId: string) => apiRequest<PaginatedResponse<FAQ> | FAQ[]>(`info/faqs/?organization_id=${organizationId}`) }
const columns: DataColumn<FAQ>[] = [{ key: 'question', header: 'Question', cell: (row) => row.question || row.title || 'Untitled', sortValue: (row) => row.question || row.title || '' }, { key: 'answer', header: 'Answer', cell: (row) => <span className="line-clamp-2">{row.answer || '—'}</span> }]
export function InfoModulePage() { const { organization } = useTenant(); const organizationId = tenantId(organization); const query = useQuery({ queryKey: ['tenant', organizationId, 'info', 'faqs'], queryFn: () => api.list(organizationId) }); const rows = query.data ? asList(query.data) : []; return <div className="page-grid"><PageHeader title="Info center example" description="An optional tenant-scoped knowledge module." /><PageSection><DataView rows={rows} columns={columns} getRowId={(row) => row.id} mobileSummary={(row) => <strong>{row.question || row.title || 'Untitled'}</strong>} mobileDetails={(row) => <span className="line-clamp-3">{row.answer || 'No answer'}</span>} searchableText={(row) => `${row.question} ${row.title} ${row.answer}`} loading={query.isLoading} error={query.error ? errorMessage(query.error) : undefined} /></PageSection></div> }
