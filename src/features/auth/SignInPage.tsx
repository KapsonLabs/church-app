import { useState, type FormEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, CheckCircle2, Crown, HeartHandshake, ShieldCheck, UsersRound } from 'lucide-react'
import { useAuth } from '@/app/AuthContext'
import { Button, Input } from '@/shared/ui/primitives'
import { FormField } from '@/shared/ui/Form'
import { errorMessage } from '@/shared/lib/format'

function KingdomKidsMark({ compact = false }: { compact?: boolean }) {
  return <div className="flex items-center gap-3"><span className={`${compact ? 'h-11 w-11' : 'h-12 w-12'} grid shrink-0 place-items-center rounded-lg border border-white/40 bg-white text-sky-700 shadow-md shadow-sky-950/10`}><Crown className="h-6 w-6" aria-hidden="true" /></span><span><span className={`${compact ? 'text-xl' : 'text-2xl'} block font-black tracking-tight`}>KingdomKids</span><span className="block text-[0.66rem] font-semibold uppercase tracking-[0.22em] opacity-75">Children belong here</span></span></div>
}

function MinistryPreview() {
  return <div className="mt-10 w-full max-w-lg border-y border-white/30 py-6" aria-hidden="true"><div className="flex items-end justify-between gap-6"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-100">Sunday overview</p><p className="mt-1 text-lg font-bold">Every child accounted for</p></div><p className="text-right text-xs leading-5 text-sky-100/75">Live ministry<br />readiness</p></div><div className="mt-6 grid grid-cols-3 divide-x divide-white/25"><div className="pr-5"><p className="text-3xl font-black tracking-tight">148</p><p className="mt-1 text-xs text-sky-100/75">Checked in</p></div><div className="px-5"><p className="text-3xl font-black tracking-tight">4</p><p className="mt-1 text-xs text-sky-100/75">Services</p></div><div className="pl-5"><p className="text-3xl font-black tracking-tight">12</p><p className="mt-1 text-xs text-sky-100/75">Facilitators</p></div></div><div className="mt-6 grid grid-cols-2 gap-6 border-t border-white/20 pt-5"><div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" /><div><p className="text-sm font-semibold">Attendance ready</p><p className="mt-0.5 text-xs text-sky-100/70">Four service rosters prepared</p></div></div><div className="flex items-start gap-3"><HeartHandshake className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" /><div><p className="text-sm font-semibold">8 follow-ups</p><p className="mt-0.5 text-xs text-sky-100/70">Children needing connection</p></div></div></div></div>
}

export function SignInPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login({ email, password })
      await navigate({ to: '/' })
    } catch (reason) {
      setError(errorMessage(reason))
    } finally {
      setBusy(false)
    }
  }

  return <main className="min-h-dvh bg-slate-50 p-3 text-slate-950 dark:bg-slate-950 dark:text-slate-50 sm:p-5 lg:grid lg:place-items-center"><section className="mx-auto grid min-h-[calc(100dvh-1.5rem)] w-full max-w-6xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-300/30 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30 sm:min-h-[calc(100dvh-2.5rem)] lg:min-h-0 lg:grid-cols-[1.08fr_0.92fr]">
    <aside className="hidden bg-gradient-to-br from-sky-500 via-sky-600 to-indigo-700 p-10 text-white lg:flex lg:min-h-[43rem] lg:flex-col xl:p-12"><div><KingdomKidsMark /><div className="mt-12 max-w-lg"><div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.15em] text-sky-100"><span className="h-px w-8 bg-amber-300" /><UsersRound className="h-4 w-4" /> Built for children's church</div><h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight xl:text-5xl">Every child known.<br /><span className="text-amber-300">Every Sunday counted.</span></h1><p className="mt-5 max-w-md text-base leading-7 text-sky-50/85">A thoughtful home for attendance, service teams and the everyday care that helps children flourish.</p></div><MinistryPreview /></div><div className="mt-auto flex items-center gap-2 pt-8 text-xs font-medium text-sky-100/80"><ShieldCheck className="h-4 w-4" /> Secure access for trusted ministry teams</div></aside>
    <div className="flex min-h-0 flex-col justify-center px-5 py-8 sm:px-10 sm:py-12 lg:px-12 xl:px-16"><div className="mb-9 text-sky-700 dark:text-sky-300 lg:hidden"><KingdomKidsMark compact /></div><div className="w-full max-w-md self-center"><div className="mb-8"><p className="border-l-2 border-sky-500 pl-3 text-xs font-bold uppercase tracking-[0.14em] text-sky-700 dark:text-sky-300">Welcome to KingdomKids</p><h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Welcome back</h2><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Sign in to care for your children, teams and Sunday services.</p></div><form className="grid gap-5" onSubmit={submit}><FormField label="Email address" htmlFor="email"><Input className="min-h-12 border-slate-300 bg-white px-4 dark:border-slate-700 dark:bg-slate-950" id="email" autoComplete="email" type="email" placeholder="you@example.com" required value={email} onChange={(event) => setEmail(event.target.value)} /></FormField><FormField label="Password" htmlFor="password"><Input className="min-h-12 border-slate-300 bg-white px-4 dark:border-slate-700 dark:bg-slate-950" id="password" autoComplete="current-password" type="password" placeholder="Enter your password" required value={password} onChange={(event) => setPassword(event.target.value)} /></FormField>{error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-200">{error}</p>}<Button className="mt-1 min-h-12 w-full bg-sky-500 text-slate-950 shadow-md shadow-sky-500/15 hover:bg-sky-400 hover:opacity-100" disabled={busy}>{busy ? 'Signing in…' : <><span>Sign in to KingdomKids</span><ArrowRight className="h-4 w-4" /></>}</Button></form><div className="mt-8 flex items-center justify-center gap-2 border-t border-slate-200 pt-6 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400"><HeartHandshake className="h-4 w-4 text-sky-500" /><span>Supporting every child, one service at a time.</span></div></div></div>
  </section></main>
}
