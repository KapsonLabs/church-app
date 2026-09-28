import { render, screen, waitFor } from '@testing-library/react'
import { SelectOrganizationPage } from './SelectOrganizationPage'

const navigate = vi.fn()
vi.mock('@tanstack/react-router', async (importOriginal) => ({
  ...await importOriginal<typeof import('@tanstack/react-router')>(),
  useNavigate: () => navigate,
}))

describe('SelectOrganizationPage', () => {
  beforeEach(() => vi.resetAllMocks())

  it('redirects old organization-selection bookmarks to the dashboard', async () => {
    render(<SelectOrganizationPage />)
    expect(screen.getByText('Opening KingdomKids')).toBeInTheDocument()
    await waitFor(() => expect(navigate).toHaveBeenCalledWith({ to: '/', replace: true }))
  })
})
