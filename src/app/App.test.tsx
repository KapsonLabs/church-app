import { render, screen } from '@testing-library/react'
import { App } from './App'

describe('App', () => {
  it('loads the sign-in screen for a signed-out user', async () => {
    localStorage.clear()
    window.history.replaceState({}, '', '/')
    window.scrollTo = vi.fn()

    render(<App />)

    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/signin')
    expect(new URLSearchParams(window.location.search).get('next')).toBe('/')
  })
})
