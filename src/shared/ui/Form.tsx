import type { ReactNode } from 'react'

export function FormField({ label, htmlFor, error, help, children }: { label: string; htmlFor: string; error?: string; help?: string; children: ReactNode }) {
  return <div><label className="field-label" htmlFor={htmlFor}>{label}</label>{children}{help && <p className="field-help">{help}</p>}{error && <p className="field-error" role="alert">{error}</p>}</div>
}
export function FormActions({ children }: { children: ReactNode }) { return <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">{children}</div> }
