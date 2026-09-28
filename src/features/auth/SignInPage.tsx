import { useState, type FormEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Building2 } from 'lucide-react'
import { useAuth } from '@/app/AuthContext'
import { Button, Input } from '@/shared/ui/primitives'
import { FormField } from '@/shared/ui/Form'
import { errorMessage } from '@/shared/lib/format'

export function SignInPage() {
  const { login } = useAuth(); const navigate = useNavigate(); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  const submit = async (event: FormEvent) => { event.preventDefault(); setBusy(true); setError(''); try { await login({ email, password }); await navigate({ to: '/' }) } catch (reason) { setError(errorMessage(reason)) } finally { setBusy(false) } }
  return <main className="grid min-h-dvh place-items-center bg-gradient-to-br from-background via-background to-accent/70 p-4"><section className="surface w-full max-w-md p-6 sm:p-8"><div className="mb-7"><div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground"><Building2 /></div><h1 className="text-2xl font-bold">Welcome back</h1><p className="mt-1 text-sm text-muted-foreground">Sign in with your account email to continue.</p></div><form className="grid gap-4" onSubmit={submit}><FormField label="Email address" htmlFor="email"><Input id="email" autoComplete="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></FormField><FormField label="Password" htmlFor="password"><Input id="password" autoComplete="current-password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} /></FormField>{error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}<Button className="w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</Button></form></section></main>
}
