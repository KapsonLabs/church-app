/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authApi, type LoginInput } from '@/features/auth/api'
import type { User } from '@/shared/api/contracts'

type AuthStatus = 'restoring' | 'authenticated' | 'guest'
interface AuthContextValue { status: AuthStatus; user: User | null; login: (input: LoginInput) => Promise<void>; logout: () => Promise<void>; setUser: (user: User) => void }
const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('restoring'); const [user, setUserState] = useState<User | null>(null)
  useEffect(() => { let alive = true; authApi.restore().then((restored) => { if (alive) { setUserState(restored); setStatus(restored ? 'authenticated' : 'guest') } }).catch(() => { if (alive) { setUserState(null); setStatus('guest') } }); return () => { alive = false } }, [])
  const value = useMemo<AuthContextValue>(() => ({ status, user, login: async (input) => { const next = await authApi.login(input); setUserState(next); setStatus('authenticated') }, logout: async () => { try { await authApi.logout() } finally { setUserState(null); setStatus('guest') } }, setUser: setUserState }), [status, user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('useAuth must be used inside AuthProvider'); return value }
