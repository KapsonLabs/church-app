import { queryKeys } from '@/shared/api/queryKeys'
import { rolesApi } from './api'

describe('roles API', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('normalizes missing role permissions to an empty array', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ data: { count: 1, next: null, previous: null, results: [{ id: 'role-1', name: 'Administrator' }] } }), { status: 200 })))
    const response = await rolesApi.list('organization-1')
    expect(Array.isArray(response) ? response[0].permissions : response.results[0].permissions).toEqual([])
  })

  it('uses distinct cache keys for management pages and selector options', () => {
    expect(queryKeys.roles('organization-1')).not.toEqual(queryKeys.roleOptions('organization-1'))
    expect(queryKeys.permissions).not.toEqual(queryKeys.permissionOptions)
  })
})
