import { render, screen } from '@testing-library/react'
import { AgeGroupResults, EventResults, FacilitatorResults, ServiceResults } from './reports'
import { adaptAgeGroupReport, adaptFacilitatorReport } from './reportAdapters'
import type { AttendanceSummary, ChurchEvent, ServiceSession } from './types'

const uuid = '123e4567-e89b-42d3-a456-426614174000'
const summary: AttendanceSummary = { present: 10, late: 1, absent: 2, excused: 3 }

describe('report presentation', () => {
  it('adapts age-group and facilitator reports without identifiers', () => {
    const ageGroups = adaptAgeGroupReport([{ age_group_id: uuid, age_group__name: 'Age 10', attendance_status: 'present', total: 12 }])
    const facilitators = adaptFacilitatorReport([{ facilitator_id: uuid, facilitator__user__first_name: 'Facilitator', facilitator__user__last_name: 'One', facilitator__user__email: 'one@example.com', attendance_status: 'late', total: 2 }])
    expect(ageGroups).toEqual([{ ageGroup: 'Age 10', status: 'present', total: 12 }])
    expect(facilitators).toEqual([{ facilitator: 'Facilitator One', email: 'one@example.com', status: 'late', total: 2 }])
    expect(JSON.stringify({ ageGroups, facilitators })).not.toContain(uuid)
  })

  it('never renders UUID values for any report renderer', () => {
    const event = { id: uuid, name: 'Sunday Service', event_date: '2026-09-27' } as ChurchEvent
    const session = { id: uuid, event: uuid, event_name: 'Sunday Service', event_date: '2026-09-27', name: 'Morning Service', start_time: '08:00:00' } as ServiceSession
    const { rerender, container } = render(<EventResults rows={[{ event, summary }]} />)
    expect(container).not.toHaveTextContent(uuid)
    expect(screen.getByText('Sunday Service')).toBeInTheDocument()
    rerender(<ServiceResults rows={[{ session, summary }]} />)
    expect(container).not.toHaveTextContent(uuid)
    expect(screen.getByText(/Morning Service/)).toBeInTheDocument()
    rerender(<AgeGroupResults rows={[{ ageGroup: 'Age 10', status: 'present', total: 12 }]} />)
    expect(container).not.toHaveTextContent(uuid)
    rerender(<FacilitatorResults rows={[{ facilitator: 'Facilitator One', email: 'one@example.com', status: 'late', total: 2 }]} />)
    expect(container).not.toHaveTextContent(uuid)
  })

  it('suppresses a UUID even when an API mistakenly places it in a display field', () => {
    const rows = adaptAgeGroupReport([{ age_group_id: uuid, age_group__name: uuid, attendance_status: 'present', total: 1 }])
    render(<AgeGroupResults rows={rows} />)
    expect(screen.queryByText(uuid)).not.toBeInTheDocument()
    expect(screen.getByText('Unassigned age group')).toBeInTheDocument()
  })
})
