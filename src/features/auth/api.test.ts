import { authApi } from './api'
import { clearTokens, getRefreshToken, setRefreshToken } from '@/shared/api/client'

const user = { id: 'user-1', email: 'person@example.com', first_name: 'Example', last_name: 'User', phone_number: '', is_active: true, created_at: '', updated_at: '' }
describe('authApi', () => {
  beforeEach(() => { clearTokens(); vi.restoreAllMocks() })
  it('logs in with email and persists only the refresh token', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ data: { access: 'access', refresh: 'refresh', user, branches: [] } }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    await expect(authApi.login({ email: user.email, password: 'secret' })).resolves.toEqual({ user, branches: [] })
    expect(getRefreshToken()).toBe('refresh')
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({ email: user.email, password: 'secret' })
  })
  it('clears the refresh token when browser restoration fails', async () => {
    setRefreshToken('expired')
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ errors: 'expired' }), { status: 401 })))
    await expect(authApi.restore()).rejects.toThrow()
    expect(getRefreshToken()).toBeNull()
  })
})
