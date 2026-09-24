import { coreNavigation, moduleRegistry } from './moduleRegistry'

describe('module registry', () => {
  it('keeps optional product modules disabled by default', () => {
    expect(moduleRegistry.map((module) => [module.id, module.enabled])).toEqual([['crm', false], ['info', false], ['kpis', false]])
  })
  it('declares backend-aligned permission codenames for protected core navigation', () => {
    expect(coreNavigation.filter((item) => item.permission).every((item) => item.permission?.includes('.'))).toBe(true)
  })
})
