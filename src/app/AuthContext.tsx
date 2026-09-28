/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authApi, type AuthSession, type LoginInput } from '@/features/auth/api'
import type { SessionBranch, User } from '@/shared/api/contracts'

type AuthStatus = 'restoring' | 'authenticated' | 'guest'
interface AuthContextValue { status: AuthStatus; user: User | null; sessionBranches: SessionBranch[]; login: (input: LoginInput) => Promise<AuthSession>; logout: () => Promise<void>; setUser: (user: User) => void }
const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('restoring'); const [user, setUserState] = useState<User | null>(null); const [sessionBranches, setSessionBranches] = useState<SessionBranch[]>([])
  useEffect(() => { let alive = true; authApi.restore().then((restored) => { if (alive) { setUserState(restored?.user ?? null); setSessionBranches(restored?.branches ?? []); setStatus(restored ? 'authenticated' : 'guest') } }).catch(() => { if (alive) { setUserState(null); setSessionBranches([]); setStatus('guest') } }); return () => { alive = false } }, [])
  const value = useMemo<AuthContextValue>(() => ({ status, user, sessionBranches, login: async (input) => { const next = await authApi.login(input); setUserState(next.user); setSessionBranches(next.branches); setStatus('authenticated'); return next }, logout: async () => { try { await authApi.logout() } finally { setUserState(null); setSessionBranches([]); setStatus('guest') } }, setUser: setUserState }), [sessionBranches, status, user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('useAuth must be used inside AuthProvider'); return value }
