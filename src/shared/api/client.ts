import type { ApiErrorResponse, ApiSuccess } from './contracts'

const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1/').replace(/\/?$/, '/')
const refreshKey = 'boilerplate.refresh-token'
let accessToken: string | null = null
let refreshPromise: Promise<string> | null = null

export class ApiError extends Error {
  status: number
  body: ApiErrorResponse
  constructor(status: number, body: ApiErrorResponse, message = 'Request failed') {
    super(message); this.name = 'ApiError'; this.status = status; this.body = body
  }
  get fieldErrors() { return typeof this.body.errors === 'object' ? this.body.errors : undefined }
}

export function setAccessToken(token: string | null) { accessToken = token }
export function getRefreshToken() { return localStorage.getItem(refreshKey) }
export function setRefreshToken(token: string | null) {
  if (token) localStorage.setItem(refreshKey, token); else localStorage.removeItem(refreshKey)
}
export function clearTokens() { accessToken = null; setRefreshToken(null) }

async function parse<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = body as ApiErrorResponse
    const message = typeof error.errors === 'string' ? error.errors : error.detail || `Request failed (${response.status})`
    throw new ApiError(response.status, error, message)
  }
  return (body as ApiSuccess<T>).data
}

async function rotateRefreshToken(): Promise<string> {
  const refresh = getRefreshToken()
  if (!refresh) throw new ApiError(401, {}, 'Your session has expired.')
  const response = await fetch(`${baseUrl}accounts/auth/refresh/`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh }),
  })
  const tokens = await parse<{ access: string; refresh?: string }>(response)
  setAccessToken(tokens.access)
  if (tokens.refresh) setRefreshToken(tokens.refresh)
  return tokens.access
}

export async function refreshSession(): Promise<string> {
  if (!refreshPromise) refreshPromise = rotateRefreshToken().finally(() => { refreshPromise = null })
  return refreshPromise
}

type RequestOptions = Omit<RequestInit, 'body'> & { body?: unknown; auth?: boolean; retry?: boolean }
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = true, retry = true, headers, ...init } = options
  const requestHeaders = new Headers(headers)
  requestHeaders.set('Accept', 'application/json')
  if (body !== undefined) requestHeaders.set('Content-Type', 'application/json')
  if (auth && accessToken) requestHeaders.set('Authorization', `Bearer ${accessToken}`)
  const response = await fetch(`${baseUrl}${path.replace(/^\//, '')}`, {
    ...init, headers: requestHeaders, body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (response.status === 401 && auth && retry && getRefreshToken()) {
    try { await refreshSession() } catch (error) { clearTokens(); throw error }
    return apiRequest<T>(path, { ...options, retry: false })
  }
  return parse<T>(response)
}

export const publicRequest = <T>(path: string, options: RequestOptions = {}) => apiRequest<T>(path, { ...options, auth: false })
