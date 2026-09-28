import type { UUID } from '@/shared/api/contracts'
import type { AttendanceStatus, RosterChild } from './types'

export function markVisiblePresent(current: Record<UUID, AttendanceStatus>, visible: RosterChild[]) {
  return { ...current, ...Object.fromEntries(visible.map((child) => [child.child_id, 'present' as const])) }
}

