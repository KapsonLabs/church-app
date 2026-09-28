import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Spinner } from '@/shared/ui/primitives'

/** Compatibility component for old bookmarks. Tenant selection is automatic. */
export function SelectOrganizationPage() {
  const navigate = useNavigate()
  useEffect(() => { void navigate({ to: '/', replace: true }) }, [navigate])
  return <main className="grid min-h-dvh place-items-center"><Spinner label="Opening KingdomKids" /></main>
}
