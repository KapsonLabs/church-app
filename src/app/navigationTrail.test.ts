import { getNavigationTrail } from './navigationTrail'

describe('navigation trails', () => {
  it('uses readable labels for dynamic church routes without exposing identifiers', () => {
    const identifier = 'b4f1992e-bb38-4f96-89c3-d5a55b04b351'
    const child = getNavigationTrail(`/church/children/${identifier}`)
    const attendance = getNavigationTrail(`/church/sessions/${identifier}/attendance`)
    expect(child.crumbs.map((item) => item.label)).toEqual(['Dashboard', 'Children', 'Child details'])
    expect(attendance.crumbs.map((item) => item.label)).toEqual(['Dashboard', 'Events', 'Attendance'])
    expect(JSON.stringify([child.crumbs, attendance.crumbs])).not.toContain(identifier)
  })

  it('provides logical parents for direct navigation', () => {
    expect(getNavigationTrail('/settings/users').parent).toBe('/settings')
    expect(getNavigationTrail('/church/events/example').parent).toBe('/church/events')
  })
})
