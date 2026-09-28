import { apiRequest, clearTokens, getRefreshToken, publicRequest, refreshSession, setAccessToken, setRefreshToken } from '@/shared/api/client'
import type { SessionBranch, User } from '@/shared/api/contracts'

export interface LoginInput { email: string; password: string }
export interface AuthSession { user: User; branches: SessionBranch[] }
export interface LoginResult extends AuthSession { access: string; refresh: string }
export const authApi = {
  async login(input: LoginInput) { const result = await publicRequest<LoginResult>('accounts/auth/login/', { method: 'POST', body: input }); setAccessToken(result.access); setRefreshToken(result.refresh); return { user: result.user, branches: result.branches ?? [] } },
  async restore() { if (!getRefreshToken()) return null; try { await refreshSession(); const [user, context] = await Promise.all([apiRequest<User>('accounts/me/'), apiRequest<{ branches: SessionBranch[] }>('accounts/me/context/')]); return { user, branches: context.branches ?? [] } } catch (error) { clearTokens(); throw error } },
  me: () => apiRequest<User>('accounts/me/'),
  updateMe: (input: Partial<Pick<User, 'first_name' | 'last_name' | 'phone_number' | 'date_of_birth'>>) => apiRequest<User>('accounts/me/', { method: 'PATCH', body: input }),
  password: (input: { current_password: string; new_password: string }) => apiRequest<{ message: string }>('accounts/me/password/', { method: 'POST', body: input }),
  async logout() { const refresh = getRefreshToken(); try { if (refresh) await apiRequest<void>('accounts/auth/logout/', { method: 'POST', body: { refresh } }) } finally { clearTokens() } },
}
