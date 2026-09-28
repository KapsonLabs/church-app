import { coreNavigation, moduleRegistry } from './moduleRegistry'

describe('module registry', () => {
  it('keeps optional product modules disabled by default', () => {
    expect(moduleRegistry.find((module) => module.id === 'church')?.enabled).toBe(true)
    expect(moduleRegistry.filter((module) => module.id !== 'church').every((module) => !module.enabled)).toBe(true)
  })
  it('declares backend-aligned permission codenames for protected core navigation', () => {
    expect(coreNavigation.filter((item) => item.permission).every((item) => item.permission?.includes('.'))).toBe(true)
  })
  it('keeps reports and absenteeism in church navigation rather than settings', () => {
    const church = moduleRegistry.find((module) => module.id === 'church')
    expect(church?.navigation.map((item) => item.to)).toEqual(expect.arrayContaining(['/church/reports', '/church/absenteeism']))
    expect(coreNavigation.find((item) => item.to === '/settings')?.anyPermissions).not.toContain('church-reports.read')
  })
  it('does not expose organizations in sidebar navigation', () => {
    expect(coreNavigation.some((item) => item.to === '/organizations')).toBe(false)
  })
})
