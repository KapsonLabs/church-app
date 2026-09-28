import { describe, expect, it } from 'vitest'
import { asList } from './contracts'

describe('asList', () => {
  it('normalizes arrays and paginated responses', () => {
    const rows = [{ id: 'one' }, { id: 'two' }]

    expect(asList(rows)).toEqual(rows)
    expect(asList({ count: 2, next: null, previous: null, results: rows })).toEqual(rows)
  })

  it('returns an empty list for absent or incompatible cached data', () => {
    expect(asList(undefined)).toEqual([])
    expect(asList(null)).toEqual([])
    expect(asList({ pages: [], pageParams: [] } as never)).toEqual([])
  })
})
