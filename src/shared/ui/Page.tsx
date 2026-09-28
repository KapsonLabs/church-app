import { createContext, useContext, type ReactNode } from 'react'
import { AlertCircle, Inbox } from 'lucide-react'
import { Button } from './primitives'

const TabbedPageContext = createContext(false)

export function TabbedPageContent({ children }: { children: ReactNode }) {
  return <TabbedPageContext.Provider value><div className="[&>.page-grid]:gap-3 [&>.page-grid]:px-0 [&>.page-grid]:pb-0 [&>.page-grid]:pt-2">{children}</div></TabbedPageContext.Provider>
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  const tabbed = useContext(TabbedPageContext)
  if (tabbed) return <div className="flex min-h-10 items-center justify-between gap-3"><h1 className="text-base font-semibold sm:text-lg">{title}</h1>{actions && <div className="flex flex-wrap justify-end gap-2">{actions}</div>}</div>
  return <header className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0"><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>{description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>}</div>
    {actions && <div className="flex w-full flex-wrap gap-2 sm:w-auto">{actions}</div>}
  </header>
}
export function PageSection({ title, description, children }: { title?: string; description?: string; children: ReactNode }) {
  return <section className="surface min-w-0 p-4 sm:p-6">{title && <h2 className="text-lg font-semibold">{title}</h2>}{description && <p className="mb-4 mt-1 text-sm text-muted-foreground">{description}</p>}{children}</section>
}
export function EmptyState({ title = 'Nothing here yet', description, action }: { title?: string; description?: string; action?: ReactNode }) {
  return <div className="grid min-h-48 place-items-center p-6 text-center"><div><Inbox className="mx-auto mb-3 h-8 w-8 text-muted-foreground" /><h3 className="font-semibold">{title}</h3>{description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}{action && <div className="mt-4">{action}</div>}</div></div>
}
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div role="alert" className="grid min-h-48 place-items-center p-6 text-center"><div><AlertCircle className="mx-auto mb-3 h-8 w-8 text-destructive" /><h3 className="font-semibold">Unable to load this page</h3><p className="mt-1 text-sm text-muted-foreground">{message}</p>{onRetry && <Button variant="secondary" className="mt-4" onClick={onRetry}>Try again</Button>}</div></div>
}
