import { markVisiblePresent } from './attendance'
import type { RosterChild } from './types'

const child = (id: string): RosterChild => ({ child_id: id, name: id, age: 10, age_group_id: 'group', age_group_name: 'Age 10', guardian_contact: '', attendance_status: null, notes: '' })

describe('attendance workflow', () => {
  it('marks only visible children present and preserves prior overrides outside the filter', () => {
    expect(markVisiblePresent({ hidden: 'absent', visible: 'late' }, [child('visible'), child('second')])).toEqual({ hidden: 'absent', visible: 'present', second: 'present' })
  })
})

