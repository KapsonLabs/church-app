import { apiRequest, clearTokens, getRefreshToken, publicRequest, refreshSession, setAccessToken, setRefreshToken } from '@/shared/api/client'
import type { User } from '@/shared/api/contracts'

export interface LoginInput { email: string; password: string }
export interface LoginResult { access: string; refresh: string; user: User }
export const authApi = {
  async login(input: LoginInput) { const result = await publicRequest<LoginResult>('accounts/auth/login/', { method: 'POST', body: input }); setAccessToken(result.access); setRefreshToken(result.refresh); return result.user },
  async restore() { if (!getRefreshToken()) return null; try { await refreshSession(); return await apiRequest<User>('accounts/me/') } catch (error) { clearTokens(); throw error } },
  me: () => apiRequest<User>('accounts/me/'),
  updateMe: (input: Partial<Pick<User, 'first_name' | 'last_name' | 'phone_number' | 'date_of_birth'>>) => apiRequest<User>('accounts/me/', { method: 'PATCH', body: input }),
  password: (input: { current_password: string; new_password: string }) => apiRequest<{ message: string }>('accounts/me/password/', { method: 'POST', body: input }),
  async logout() { const refresh = getRefreshToken(); try { if (refresh) await apiRequest<void>('accounts/auth/logout/', { method: 'POST', body: { refresh } }) } finally { clearTokens() } },
}
