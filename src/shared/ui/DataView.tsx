import { useMemo, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { Button, Input, Spinner } from './primitives'
import { EmptyState, ErrorState } from './Page'

export interface DataColumn<T> { key: string; header: string; cell: (row: T) => ReactNode; sortValue?: (row: T) => string | number }
export interface DataViewProps<T> {
  rows: T[]; columns: DataColumn<T>[]; getRowId: (row: T) => string; mobileSummary: (row: T) => ReactNode
  mobileDetails?: (row: T) => ReactNode; actions?: (row: T) => ReactNode; searchableText?: (row: T) => string
  loading?: boolean; error?: string; onRetry?: () => void; emptyTitle?: string; pageSize?: number
}
export function DataView<T>({ rows, columns, getRowId, mobileSummary, mobileDetails, actions, searchableText, loading, error, onRetry, emptyTitle, pageSize = 10 }: DataViewProps<T>) {
  const [query, setQuery] = useState(''); const [page, setPage] = useState(1); const [sort, setSort] = useState<{ key: string; descending: boolean } | null>(null)
  const filtered = useMemo(() => {
    const values = searchableText && query ? rows.filter((row) => searchableText(row).toLowerCase().includes(query.toLowerCase())) : [...rows]
    if (sort) { const column = columns.find((item) => item.key === sort.key); if (column?.sortValue) values.sort((a, b) => String(column.sortValue?.(a)).localeCompare(String(column.sortValue?.(b)), undefined, { numeric: true }) * (sort.descending ? -1 : 1)) }
    return values
  }, [rows, query, sort, columns, searchableText])
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize)); const safePage = Math.min(page, pages); const visible = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)
  if (loading) return <div className="grid min-h-48 place-items-center"><Spinner label="Loading records" /></div>
  if (error) return <ErrorState message={error} onRetry={onRetry} />
  return <div className="min-w-0">
    {searchableText && <div className="relative mb-4 max-w-sm"><Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" /><Input aria-label="Search records" className="pl-9" placeholder="Search…" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} /></div>}
    {!visible.length ? <EmptyState title={emptyTitle} /> : <>
      <div className="hidden overflow-hidden rounded-lg border md:block"><table className="w-full text-left text-sm"><thead className="bg-muted/70"><tr>{columns.map((column) => <th key={column.key} scope="col" className="px-4 py-3 font-semibold">{column.sortValue ? <button className="rounded" onClick={() => setSort((current) => ({ key: column.key, descending: current?.key === column.key ? !current.descending : false }))}>{column.header}</button> : column.header}</th>)}{actions && <th className="px-4 py-3 text-right">Actions</th>}</tr></thead><tbody>{visible.map((row) => <tr key={getRowId(row)} className="border-t hover:bg-muted/35">{columns.map((column) => <td key={column.key} className="px-4 py-3 align-middle">{column.cell(row)}</td>)}{actions && <td className="px-4 py-2 text-right">{actions(row)}</td>}</tr>)}</tbody></table></div>
      <div className="grid gap-3 md:hidden" aria-label="Records">{visible.map((row) => <article className="surface p-4" key={getRowId(row)}><div className="flex items-start justify-between gap-3"><div className="min-w-0 flex-1">{mobileSummary(row)}</div>{actions && <div className="shrink-0">{actions(row)}</div>}</div>{mobileDetails && <div className="mt-3 grid gap-2 border-t pt-3 text-sm">{mobileDetails(row)}</div>}</article>)}</div>
      {pages > 1 && <nav aria-label="Pagination" className="mt-4 flex items-center justify-between gap-3"><p className="text-sm text-muted-foreground">Page {safePage} of {pages}</p><div className="flex gap-2"><Button variant="secondary" className="h-11 w-11 p-0" aria-label="Previous page" disabled={safePage === 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft /></Button><Button variant="secondary" className="h-11 w-11 p-0" aria-label="Next page" disabled={safePage === pages} onClick={() => setPage((value) => value + 1)}><ChevronRight /></Button></div></nav>}
    </>}
  </div>
}
