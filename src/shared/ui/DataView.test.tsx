import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { DataView, type DataColumn } from './DataView'

interface Row { id: string; name: string; status: string }
const rows: Row[] = [{ id: '1', name: 'Main branch', status: 'Active' }]
const columns: DataColumn<Row>[] = [{ key: 'name', header: 'Name', cell: (row) => row.name }, { key: 'status', header: 'Status', cell: (row) => row.status }]

describe('DataView', () => {
  it('renders semantic desktop columns and a mobile card from one definition', () => {
    render(<DataView rows={rows} columns={columns} getRowId={(row) => row.id} mobileSummary={(row) => <h3>{row.name}</h3>} mobileDetails={(row) => <span>{row.status}</span>} />)
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByRole('table')).toHaveClass('text-slate-950')
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument()
    expect(screen.getByLabelText('Records')).toBeInTheDocument()
    expect(screen.getAllByText('Main branch')).toHaveLength(2)
  })

  it('shows an accessible empty state', () => {
    render(<DataView rows={[]} columns={columns} getRowId={(row) => row.id} mobileSummary={(row) => row.name} emptyTitle="No branches" />)
    expect(screen.getByText('No branches')).toBeInTheDocument()
  })

  it('loads another server page from the shared button', async () => {
    const loadMore = vi.fn()
    render(<DataView rows={rows} columns={columns} getRowId={(row) => row.id} mobileSummary={(row) => row.name} hasMore onLoadMore={loadMore} />)
    await userEvent.click(screen.getByRole('button', { name: 'Load more' }))
    expect(loadMore).toHaveBeenCalledOnce()
  })

  it('disables the load-more button while the next page is loading', () => {
    render(<DataView rows={rows} columns={columns} getRowId={(row) => row.id} mobileSummary={(row) => row.name} hasMore loadingMore onLoadMore={() => undefined} />)
    expect(screen.getByRole('button', { name: 'Loading…' })).toBeDisabled()
  })

  it('uses externally controlled search without rendering a duplicate input', () => {
    render(<DataView rows={[...rows, { id: '2', name: 'Other branch', status: 'Inactive' }]} columns={columns} getRowId={(row) => row.id} mobileSummary={(row) => row.name} searchableText={(row) => row.name} searchValue="Main" showSearchInput={false} />)
    expect(screen.queryByRole('textbox', { name: 'Search records' })).not.toBeInTheDocument()
    expect(screen.getAllByText('Main branch')).toHaveLength(2)
    expect(screen.queryByText('Other branch')).not.toBeInTheDocument()
  })
})
