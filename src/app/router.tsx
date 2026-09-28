import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router'
import { AnyPermissionBoundary, AuthenticatedBoundary, PermissionBoundary, PublicBoundary, TenantBoundary } from './RouteBoundaries'
import { SignInPage } from '@/features/auth/SignInPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { OrganizationsPage } from '@/features/organizations/OrganizationsPage'
import { BranchesPage } from '@/features/branches/BranchesPage'
import { MembersPage } from '@/features/members/MembersPage'
import { RolesPage } from '@/features/roles/RolesPage'
import { PermissionsPage } from '@/features/permissions/PermissionsPage'
import { ProfilePage } from '@/features/profile/ProfilePage'
import { ForbiddenPage, NotFoundPage } from '@/features/auth/StatusPages'
import { isModuleEnabled } from './moduleRegistry'
import { CrmModulePage, crmModule } from '@/modules/crm'
import { InfoModulePage, infoModule } from '@/modules/info'
import { KpiModulePage, kpiModule } from '@/modules/kpis'
import { AbsenteeismPage, AgeGroupsPage, AttendancePage, ChildFormPage, ChildrenPage, EventAttendancePage, EventFormPage, EventsPage, FacilitatorDetailPage, FacilitatorsPage, SessionFacilitatorsPage } from '@/modules/church/pages'
import { ReportsLayout, ReportTabPage } from '@/modules/church/reports'
import { LegacyRedirect, LegacySundayRedirect, SettingsIndex, SettingsLayout } from '@/features/settings/SettingsLayout'

const root = createRootRoute({ component: Outlet, notFoundComponent: NotFoundPage })
const publicLayout = createRoute({ getParentRoute: () => root, id: 'public', component: PublicBoundary })
const signIn = createRoute({ getParentRoute: () => publicLayout, path: '/signin', component: SignInPage, validateSearch: (search: Record<string, unknown>) => ({ next: typeof search.next === 'string' ? search.next : undefined }) })
const authenticated = createRoute({ getParentRoute: () => root, id: 'authenticated', component: AuthenticatedBoundary })
const selectOrganization = createRoute({ getParentRoute: () => authenticated, path: '/select-organization', component: () => <LegacyRedirect to="/" /> })
const tenant = createRoute({ getParentRoute: () => authenticated, id: 'tenant', component: TenantBoundary })
const index = createRoute({ getParentRoute: () => tenant, path: '/', component: DashboardPage })
const profile = createRoute({ getParentRoute: () => tenant, path: '/profile', component: ProfilePage })
const forbidden = createRoute({ getParentRoute: () => tenant, path: '/forbidden', component: ForbiddenPage })
function permissionRoute(id: string, permission: string) { return createRoute({ getParentRoute: () => tenant, id, component: () => <PermissionBoundary permission={permission} /> }) }
const organizationsGuard = permissionRoute('organizations-guard', 'organizations.read'); const organizations = createRoute({ getParentRoute: () => organizationsGuard, path: '/organizations', component: OrganizationsPage })
const branchesGuard = permissionRoute('branches-guard', 'branches.read'); const branches = createRoute({ getParentRoute: () => branchesGuard, path: '/branches', component: BranchesPage })
const settingsPermissions = ['members.read', 'roles.read', 'church-age-groups.read']
const settingsGuard = createRoute({ getParentRoute: () => tenant, id: 'settings-guard', component: () => <AnyPermissionBoundary permissions={settingsPermissions} /> })
const settings = createRoute({ getParentRoute: () => settingsGuard, path: '/settings', component: SettingsLayout })
const settingsIndex = createRoute({ getParentRoute: () => settings, path: '/', component: SettingsIndex })
const settingsUsers = createRoute({ getParentRoute: () => settings, path: '/users', component: MembersPage })
const settingsPermissionsPage = createRoute({ getParentRoute: () => settings, path: '/permissions', component: () => <><RolesPage /><PermissionsPage /></> })
const settingsAgeGroups = createRoute({ getParentRoute: () => settings, path: '/age-groups', component: AgeGroupsPage })
const settingsReports = createRoute({ getParentRoute: () => tenant, path: '/settings/reports', component: () => <LegacyRedirect to="/church/reports" /> })
const members = createRoute({ getParentRoute: () => tenant, path: '/members', component: () => <LegacyRedirect to="/settings/users" /> })
const roles = createRoute({ getParentRoute: () => tenant, path: '/roles', component: () => <LegacyRedirect to="/settings/permissions" /> })
const permissions = createRoute({ getParentRoute: () => tenant, path: '/permissions', component: () => <LegacyRedirect to="/settings/permissions" /> })
const crmGuard = permissionRoute('crm-guard', crmModule.requiredPermission); const crm = createRoute({ getParentRoute: () => crmGuard, path: '/crm', component: CrmModulePage })
const infoGuard = permissionRoute('info-guard', infoModule.requiredPermission); const info = createRoute({ getParentRoute: () => infoGuard, path: '/info', component: InfoModulePage })
const kpiGuard = permissionRoute('kpis-guard', kpiModule.requiredPermission); const kpis = createRoute({ getParentRoute: () => kpiGuard, path: '/kpis', component: KpiModulePage })
const churchDashboard = createRoute({ getParentRoute: () => tenant, path: '/church', component: () => <LegacyRedirect to="/" /> })
const churchChildrenGuard = permissionRoute('church-children-guard', 'church-children.read'); const churchChildren = createRoute({ getParentRoute: () => churchChildrenGuard, path: '/church/children', component: ChildrenPage }); const churchChildNew = createRoute({ getParentRoute: () => churchChildrenGuard, path: '/church/children/new', component: ChildFormPage }); const churchChildDetail = createRoute({ getParentRoute: () => churchChildrenGuard, path: '/church/children/$childId', component: ChildFormPage })
const churchGroups = createRoute({ getParentRoute: () => tenant, path: '/church/age-groups', component: () => <LegacyRedirect to="/settings/age-groups" /> })
const churchEventsGuard = permissionRoute('church-events-guard', 'church-events.read'); const churchEvents = createRoute({ getParentRoute: () => churchEventsGuard, path: '/church/events', component: EventsPage }); const churchEventNew = createRoute({ getParentRoute: () => churchEventsGuard, path: '/church/events/new', component: EventFormPage }); const churchEventDetail = createRoute({ getParentRoute: () => churchEventsGuard, path: '/church/events/$eventId', component: EventFormPage }); const churchSundays = createRoute({ getParentRoute: () => churchEventsGuard, path: '/church/sundays', component: () => <LegacyRedirect to="/church/events" /> }); const churchSundayDetail = createRoute({ getParentRoute: () => churchEventsGuard, path: '/church/sundays/$eventId', component: LegacySundayRedirect })
const churchAttendanceGuard = permissionRoute('church-attendance-guard', 'church-attendance.read'); const churchAttendance = createRoute({ getParentRoute: () => churchAttendanceGuard, path: '/church/sessions/$sessionId/attendance', component: AttendancePage }); const churchEventAttendance = createRoute({ getParentRoute: () => churchAttendanceGuard, path: '/church/events/$eventId/attendance', component: EventAttendancePage })
const churchFacilitatorsGuard = permissionRoute('church-facilitators-guard', 'church-facilitators.read'); const churchFacilitators = createRoute({ getParentRoute: () => churchFacilitatorsGuard, path: '/church/facilitators', component: FacilitatorsPage }); const churchFacilitatorDetail = createRoute({ getParentRoute: () => churchFacilitatorsGuard, path: '/church/facilitators/$facilitatorId', component: FacilitatorDetailPage }); const churchSessionFacilitators = createRoute({ getParentRoute: () => churchFacilitatorsGuard, path: '/church/sessions/$sessionId/facilitators', component: SessionFacilitatorsPage })
const churchReportsGuard = permissionRoute('church-reports-guard', 'church-reports.read')
const churchReports = createRoute({ getParentRoute: () => churchReportsGuard, path: '/church/reports', component: ReportsLayout })
const churchReportsIndex = createRoute({ getParentRoute: () => churchReports, path: '/', component: () => <LegacyRedirect to="/church/reports/sundays" /> })
const churchSundayReport = createRoute({ getParentRoute: () => churchReports, path: '/sundays', component: () => <ReportTabPage kind="sunday-attendance" /> })
const churchEventReport = createRoute({ getParentRoute: () => churchReports, path: '/events', component: () => <ReportTabPage kind="event-attendance" /> })
const churchServiceReport = createRoute({ getParentRoute: () => churchReports, path: '/services', component: () => <ReportTabPage kind="service-attendance" /> })
const churchAgeGroupReport = createRoute({ getParentRoute: () => churchReports, path: '/age-groups', component: () => <ReportTabPage kind="age-groups" /> })
const churchFacilitatorReport = createRoute({ getParentRoute: () => churchReports, path: '/facilitators', component: () => <ReportTabPage kind="facilitator-attendance" /> })
const churchAbsenteeism = createRoute({ getParentRoute: () => churchReportsGuard, path: '/church/absenteeism', component: AbsenteeismPage })

const optionalRoutes = [isModuleEnabled('crm') ? crmGuard.addChildren([crm]) : null, isModuleEnabled('info') ? infoGuard.addChildren([info]) : null, isModuleEnabled('kpis') ? kpiGuard.addChildren([kpis]) : null].filter((route) => route !== null)
const routeTree = root.addChildren([publicLayout.addChildren([signIn]), authenticated.addChildren([selectOrganization, tenant.addChildren([index, profile, forbidden, organizationsGuard.addChildren([organizations]), branchesGuard.addChildren([branches]), settingsGuard.addChildren([settings.addChildren([settingsIndex, settingsUsers, settingsPermissionsPage, settingsAgeGroups])]), settingsReports, members, roles, permissions, churchDashboard, churchChildrenGuard.addChildren([churchChildren, churchChildNew, churchChildDetail]), churchGroups, churchEventsGuard.addChildren([churchEvents, churchEventNew, churchEventDetail, churchSundays, churchSundayDetail]), churchAttendanceGuard.addChildren([churchAttendance, churchEventAttendance]), churchFacilitatorsGuard.addChildren([churchFacilitators, churchFacilitatorDetail, churchSessionFacilitators]), churchReportsGuard.addChildren([churchReports.addChildren([churchReportsIndex, churchSundayReport, churchEventReport, churchServiceReport, churchAgeGroupReport, churchFacilitatorReport]), churchAbsenteeism]), ...optionalRoutes])])])
export const router = createRouter({ routeTree })
declare module '@tanstack/react-router' { interface Register { router: typeof router } }
