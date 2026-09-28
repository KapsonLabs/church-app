import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { useEffect } from 'react'
import { AuthProvider } from './AuthContext'
import { TenantProvider } from './TenantContext'
import { router } from './router'

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: (count, error) => !(error instanceof Error && 'status' in error && (error as { status: number }).status < 500) && count < 2 }, mutations: { retry: false } } })
export function App() {
  useEffect(() => { document.title = import.meta.env.VITE_APP_NAME || 'KingdomKids' }, [])
  return <QueryClientProvider client={queryClient}><AuthProvider><TenantProvider><RouterProvider router={router} /></TenantProvider></AuthProvider></QueryClientProvider>
}
