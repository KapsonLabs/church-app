import type { ReactNode } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { Button } from './primitives'

export function Modal({ open, onClose, title, description, children }: { open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode }) {
  return <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-50 bg-black/55" /><Dialog.Content className="fixed inset-x-0 bottom-0 z-50 max-h-[92dvh] overflow-y-auto rounded-t-2xl border bg-background p-5 shadow-2xl sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-[calc(100%-2rem)] sm:max-w-xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:p-6"><header className="mb-5 flex items-start justify-between gap-3"><div><Dialog.Title className="text-xl font-semibold">{title}</Dialog.Title>{description && <Dialog.Description className="mt-1 text-sm text-muted-foreground">{description}</Dialog.Description>}</div><Dialog.Close asChild><Button variant="ghost" className="h-11 w-11 p-0" aria-label="Close dialog"><X /></Button></Dialog.Close></header>{children}</Dialog.Content></Dialog.Portal></Dialog.Root>
}
