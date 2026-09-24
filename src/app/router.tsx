import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router'
import { AuthenticatedBoundary, PermissionBoundary, PublicBoundary, TenantBoundary } from './RouteBoundaries'
import { SignInPage } from '@/features/auth/SignInPage'
import { SelectOrganizationPage } from '@/features/organizations/SelectOrganizationPage'
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

const root = createRootRoute({ component: Outlet, notFoundComponent: NotFoundPage })
const publicLayout = createRoute({ getParentRoute: () => root, id: 'public', component: PublicBoundary })
const signIn = createRoute({ getParentRoute: () => publicLayout, path: '/signin', component: SignInPage, validateSearch: (search: Record<string, unknown>) => ({ next: typeof search.next === 'string' ? search.next : undefined }) })
const authenticated = createRoute({ getParentRoute: () => root, id: 'authenticated', component: AuthenticatedBoundary })
const selectOrganization = createRoute({ getParentRoute: () => authenticated, path: '/select-organization', component: SelectOrganizationPage })
const tenant = createRoute({ getParentRoute: () => authenticated, id: 'tenant', component: TenantBoundary })
const index = createRoute({ getParentRoute: () => tenant, path: '/', component: DashboardPage })
const profile = createRoute({ getParentRoute: () => tenant, path: '/profile', component: ProfilePage })
const forbidden = createRoute({ getParentRoute: () => tenant, path: '/forbidden', component: ForbiddenPage })
function permissionRoute(id: string, permission: string) { return createRoute({ getParentRoute: () => tenant, id, component: () => <PermissionBoundary permission={permission} /> }) }
const organizationsGuard = permissionRoute('organizations-guard', 'organizations.read'); const organizations = createRoute({ getParentRoute: () => organizationsGuard, path: '/organizations', component: OrganizationsPage })
const branchesGuard = permissionRoute('branches-guard', 'branches.read'); const branches = createRoute({ getParentRoute: () => branchesGuard, path: '/branches', component: BranchesPage })
const membersGuard = permissionRoute('members-guard', 'members.read'); const members = createRoute({ getParentRoute: () => membersGuard, path: '/members', component: MembersPage })
const rolesGuard = permissionRoute('roles-guard', 'roles.read'); const roles = createRoute({ getParentRoute: () => rolesGuard, path: '/roles', component: RolesPage }); const permissions = createRoute({ getParentRoute: () => rolesGuard, path: '/permissions', component: PermissionsPage })
const crmGuard = permissionRoute('crm-guard', crmModule.requiredPermission); const crm = createRoute({ getParentRoute: () => crmGuard, path: '/crm', component: CrmModulePage })
const infoGuard = permissionRoute('info-guard', infoModule.requiredPermission); const info = createRoute({ getParentRoute: () => infoGuard, path: '/info', component: InfoModulePage })
const kpiGuard = permissionRoute('kpis-guard', kpiModule.requiredPermission); const kpis = createRoute({ getParentRoute: () => kpiGuard, path: '/kpis', component: KpiModulePage })

const optionalRoutes = [isModuleEnabled('crm') ? crmGuard.addChildren([crm]) : null, isModuleEnabled('info') ? infoGuard.addChildren([info]) : null, isModuleEnabled('kpis') ? kpiGuard.addChildren([kpis]) : null].filter((route) => route !== null)
const routeTree = root.addChildren([publicLayout.addChildren([signIn]), authenticated.addChildren([selectOrganization, tenant.addChildren([index, profile, forbidden, organizationsGuard.addChildren([organizations]), branchesGuard.addChildren([branches]), membersGuard.addChildren([members]), rolesGuard.addChildren([roles, permissions]), ...optionalRoutes])])])
export const router = createRouter({ routeTree })
declare module '@tanstack/react-router' { interface Register { router: typeof router } }
