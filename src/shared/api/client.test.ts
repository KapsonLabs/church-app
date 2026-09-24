import { apiRequest, clearTokens, refreshSession, setRefreshToken } from './client'

describe('API authentication', () => {
  beforeEach(() => { clearTokens(); vi.restoreAllMocks() })
  it('serializes concurrent refresh attempts and rotates the refresh token', async () => {
    setRefreshToken('old-refresh')
    let refreshCalls = 0
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('auth/refresh')) { refreshCalls += 1; return new Response(JSON.stringify({ data: { access: 'access', refresh: 'new-refresh' } }), { status: 200 }) }
      return new Response(JSON.stringify({ data: { ok: true } }), { status: 200 })
    }))
    await Promise.all([refreshSession(), refreshSession()])
    expect(refreshCalls).toBe(1)
    expect(localStorage.getItem('boilerplate.refresh-token')).toBe('new-refresh')
  })
  it('refreshes once and retries concurrent unauthorized requests', async () => {
    setRefreshToken('refresh')
    let refreshCalls = 0; let resourceCalls = 0
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
      if (String(input).includes('auth/refresh')) { refreshCalls += 1; return new Response(JSON.stringify({ data: { access: 'access-2', refresh: 'refresh-2' } }), { status: 200 }) }
      resourceCalls += 1
      return resourceCalls <= 2 ? new Response(JSON.stringify({ errors: 'expired' }), { status: 401 }) : new Response(JSON.stringify({ data: { ok: true } }), { status: 200 })
    }))
    const results = await Promise.all([apiRequest<{ ok: boolean }>('one/'), apiRequest<{ ok: boolean }>('two/')])
    expect(refreshCalls).toBe(1); expect(results.every((item) => item.ok)).toBe(true)
  })
})
