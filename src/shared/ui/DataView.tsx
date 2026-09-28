import { useMemo, useState, type ReactNode } from 'react'
import { Search } from 'lucide-react'
import { Button, Input, Spinner } from './primitives'
import { EmptyState, ErrorState } from './Page'
import { paginationMeta, type PaginatedRows } from '@/shared/api/usePaginatedQuery'

export interface DataColumn<T> { key: string; header: string; cell: (row: T) => ReactNode; sortValue?: (row: T) => string | number }
export interface DataViewProps<T> {
  rows: T[]; columns: DataColumn<T>[]; getRowId: (row: T) => string; mobileSummary: (row: T) => ReactNode
  mobileDetails?: (row: T) => ReactNode; actions?: (row: T) => ReactNode; searchableText?: (row: T) => string
  loading?: boolean; error?: string; onRetry?: () => void; emptyTitle?: string
  hasMore?: boolean; loadingMore?: boolean; onLoadMore?: () => void
  searchValue?: string; onSearchValueChange?: (value: string) => void; showSearchInput?: boolean
}
export function DataView<T>({ rows, columns, getRowId, mobileSummary, mobileDetails, actions, searchableText, loading, error, onRetry, emptyTitle, hasMore, loadingMore, onLoadMore, searchValue, onSearchValueChange, showSearchInput = true }: DataViewProps<T>) {
  const rowPagination = (rows as PaginatedRows<T>)[paginationMeta]
  hasMore ??= rowPagination?.hasMore
  loadingMore ??= rowPagination?.loadingMore
  onLoadMore ??= rowPagination?.loadMore
  const [internalQuery, setInternalQuery] = useState(''); const [sort, setSort] = useState<{ key: string; descending: boolean } | null>(null)
  const query = searchValue ?? internalQuery
  const setQuery = onSearchValueChange ?? setInternalQuery
  const filtered = useMemo(() => {
    const values = searchableText && query ? rows.filter((row) => searchableText(row).toLowerCase().includes(query.toLowerCase())) : [...rows]
    if (sort) { const column = columns.find((item) => item.key === sort.key); if (column?.sortValue) values.sort((a, b) => String(column.sortValue?.(a)).localeCompare(String(column.sortValue?.(b)), undefined, { numeric: true }) * (sort.descending ? -1 : 1)) }
    return values
  }, [rows, query, sort, columns, searchableText])
  if (loading) return <div className="grid min-h-48 place-items-center"><Spinner label="Loading records" /></div>
  if (error) return <ErrorState message={error} onRetry={onRetry} />
  const loadMore = hasMore && onLoadMore ? <div className="mt-5 flex justify-center"><Button variant="secondary" disabled={loadingMore} onClick={onLoadMore}>{loadingMore ? 'Loading…' : 'Load more'}</Button></div> : null
  return <div className="min-w-0">
    {searchableText && showSearchInput && <div className="relative mb-4 max-w-sm"><Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" /><Input aria-label="Search records" className="pl-9" placeholder="Search…" value={query} onChange={(event) => setQuery(event.target.value)} /></div>}
    {!filtered.length ? <><EmptyState title={emptyTitle} />{loadMore}</> : <>
      <div className="hidden overflow-hidden rounded-lg border md:block"><table className="w-full text-left text-sm text-slate-950 dark:text-slate-50 [&_a]:!text-slate-950 [&_a:hover]:!text-sky-700 dark:[&_a]:!text-slate-50 dark:[&_a:hover]:!text-sky-300"><thead className="bg-muted/70"><tr>{columns.map((column) => <th key={column.key} scope="col" className="px-4 py-3 font-semibold">{column.sortValue ? <button className="rounded" onClick={() => setSort((current) => ({ key: column.key, descending: current?.key === column.key ? !current.descending : false }))}>{column.header}</button> : column.header}</th>)}{actions && <th className="px-4 py-3 text-right">Actions</th>}</tr></thead><tbody>{filtered.map((row) => <tr key={getRowId(row)} className="border-t hover:bg-muted/35">{columns.map((column) => <td key={column.key} className="px-4 py-3 align-middle">{column.cell(row)}</td>)}{actions && <td className="px-4 py-2 text-right">{actions(row)}</td>}</tr>)}</tbody></table></div>
      <div className="grid gap-3 md:hidden" aria-label="Records">{filtered.map((row) => <article className="surface p-4" key={getRowId(row)}><div className="flex items-start justify-between gap-3"><div className="min-w-0 flex-1">{mobileSummary(row)}</div>{actions && <div className="shrink-0">{actions(row)}</div>}</div>{mobileDetails && <div className="mt-3 grid gap-2 border-t pt-3 text-sm">{mobileDetails(row)}</div>}</article>)}</div>
      {loadMore}
    </>}
  </div>
}
