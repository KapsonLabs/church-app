import type { ReactNode } from 'react'
import { useTenant } from '@/app/TenantContext'

export function PermissionGuard({ require, children, fallback = null }: { require: string | string[]; children: ReactNode; fallback?: ReactNode }) {
  const { hasPermission } = useTenant()
  const required = Array.isArray(require) ? require : [require]
  return required.every(hasPermission) ? children : fallback
}
