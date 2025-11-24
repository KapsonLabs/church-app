import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import SignIn from './pages/SignIn';
import NotFound from './pages/NotFound';
import CRM from './pages/CRM/CRM';
import TicketDetails from './pages/CRM/TicketDetails';
import Settings from './pages/Settings/Settings';
import Profile from './pages/Profile/Profile';
import CreateRole from './pages/Settings/CreateRole';
import EditRole from './pages/Settings/EditRole';
import KPIs from './pages/KPIs/KPIs';
import KPIDetails from './pages/KPIs/KPIDetails';
import Approvals from './pages/Approvals/Approvals';
import KPIPortfolio from './pages/KPIPortfolio/KPIPortfolio';
import KPIReports from './pages/KPIReports/KPIReports';

// Root route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// SignIn route
const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signin',
  component: SignIn,
});

// CRM route
const crmRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/crm',
  component: CRM,
});

// Ticket Details route
const ticketDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/crm/tickets/$id',
  component: TicketDetails,
});

// Settings route
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: Settings,
  validateSearch: (search: Record<string, unknown>): { tab?: string } => {
    return {
      tab: search.tab as string | undefined,
    };
  },
});

// Profile route
const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: Profile,
});

// KPIs route
const kpisRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/kpis',
  component: KPIs,
});

// KPI Details route
const kpiDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/kpis/$id',
  component: KPIDetails,
});

// Approvals route
const approvalsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/approvals',
  component: Approvals,
  validateSearch: (search: Record<string, unknown>): { status?: string; kpi_id?: string } => {
    return {
      status: search.status as string | undefined,
      kpi_id: search.kpi_id as string | undefined,
    };
  },
});

// KPI Portfolio route
const kpiPortfolioRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/kpi-portfolio',
  component: KPIPortfolio,
});

// KPI Reports route
const kpiReportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/kpi-reports/$id',
  component: KPIReports,
});

// Create Role route
const createRoleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/roles/create',
  component: CreateRole,
});

// Edit Role route
const editRoleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings/roles/$id/edit',
  component: EditRole,
});

// Redirect root to CRM - handled in component
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: CRM,
});

// Catch-all route for 404
const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: NotFound,
});

// Create the route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  signInRoute,
  crmRoute,
  ticketDetailsRoute,
  settingsRoute,
  profileRoute,
  kpisRoute,
  kpiDetailsRoute,
  approvalsRoute,
  kpiPortfolioRoute,
  kpiReportsRoute,
  createRoleRoute,
  editRoleRoute,
  notFoundRoute,
]);

// Create the router
export const router = createRouter({ routeTree } as any);

