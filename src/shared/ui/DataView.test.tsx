import { render, screen } from '@testing-library/react'
import { DataView, type DataColumn } from './DataView'

interface Row { id: string; name: string; status: string }
const rows: Row[] = [{ id: '1', name: 'Main branch', status: 'Active' }]
const columns: DataColumn<Row>[] = [{ key: 'name', header: 'Name', cell: (row) => row.name }, { key: 'status', header: 'Status', cell: (row) => row.status }]

describe('DataView', () => {
  it('renders semantic desktop columns and a mobile card from one definition', () => {
    render(<DataView rows={rows} columns={columns} getRowId={(row) => row.id} mobileSummary={(row) => <h3>{row.name}</h3>} mobileDetails={(row) => <span>{row.status}</span>} />)
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument()
    expect(screen.getByLabelText('Records')).toBeInTheDocument()
    expect(screen.getAllByText('Main branch')).toHaveLength(2)
  })

  it('shows an accessible empty state', () => {
    render(<DataView rows={[]} columns={columns} getRowId={(row) => row.id} mobileSummary={(row) => row.name} emptyTitle="No branches" />)
    expect(screen.getByText('No branches')).toBeInTheDocument()
  })
})
