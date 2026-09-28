import { render, screen } from '@testing-library/react'
import { PageHeader, TabbedPageContent } from './Page'

describe('tabbed page presentation', () => {
  it('renders a compact title and action without the large description', () => {
    render(<TabbedPageContent><PageHeader title="Large heading" description="Large description" actions={<button>Add record</button>} /></TabbedPageContent>)
    expect(screen.getByRole('heading', { name: 'Large heading', level: 1 })).toHaveClass('text-base')
    expect(screen.queryByText('Large description')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add record' })).toBeInTheDocument()
  })
})
