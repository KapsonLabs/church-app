import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/utils'

export function Button({ className, variant = 'primary', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' }) {
  const variants = { primary: 'bg-primary text-primary-foreground hover:opacity-90', secondary: 'border bg-card hover:bg-accent', ghost: 'hover:bg-accent', danger: 'bg-destructive text-destructive-foreground hover:opacity-90' }
  return <button className={cn('inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50', variants[variant], className)} {...props} />
}
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('min-h-11 w-full rounded-lg border bg-background px-3 text-base placeholder:text-muted-foreground md:text-sm', className)} {...props} />
}
export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn('min-h-11 w-full rounded-lg border bg-background px-3 text-base md:text-sm', className)} {...props}>{children}</select>
}
export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn('min-h-24 w-full rounded-lg border bg-background px-3 py-2 text-base md:text-sm', className)} {...props} />
}
export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'success' | 'danger' | 'info' }) {
  const tones = { neutral: 'bg-muted text-muted-foreground', success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200', danger: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200', info: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200' }
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', tones[tone])}>{children}</span>
}
export function Spinner({ label = 'Loading' }: { label?: string }) {
  return <span role="status" className="inline-flex items-center gap-2 text-sm text-muted-foreground"><span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" /><span>{label}</span></span>
}
export function Card({ children, className }: { children: ReactNode; className?: string }) { return <section className={cn('surface', className)}>{children}</section> }
