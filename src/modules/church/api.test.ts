import { churchApi } from './api'

const scope = { organizationId: 'org-1', branchId: 'branch-1' }

describe('churchApi', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('scopes roster requests to organization and branch', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ data: { session: {}, children: [], summary: {} } }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    await churchApi.roster(scope, 'session-1', { search: 'Amina', age_group: 'group-1' })
    const url = String(fetchMock.mock.calls[0]?.[0])
    expect(url).toContain('church/service-sessions/session-1/roster/')
    expect(url).toContain('organization_id=org-1')
    expect(url).toContain('branch_id=branch-1')
    expect(url).toContain('search=Amina')
  })

  it('sends only changed attendance rows', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ data: { summary: { present: 1, late: 0, absent: 0, excused: 0 } } }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    await churchApi.saveAttendance(scope, 'session-1', [{ child_id: 'child-1', attendance_status: 'present' }])
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({ organization_id: 'org-1', branch_id: 'branch-1', rows: [{ child_id: 'child-1', attendance_status: 'present' }] })
  })

  it('loads tenant-scoped service details for facilitator workflows', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ data: { id: 'session-1' } }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    await churchApi.session(scope, 'session-1')
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('church/service-sessions/session-1/?organization_id=org-1&branch_id=branch-1')
  })
})
