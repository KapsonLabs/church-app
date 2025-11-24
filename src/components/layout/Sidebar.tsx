import { Link, useRouter } from '@tanstack/react-router';
import { 
  HelpCircle, 
  Settings, 
  UserCircle,
  LogOut,
  TrendingUp,
  CheckCircle2,
  Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export function Sidebar() {
  const router = useRouter();
  const { logout, user } = useAuth();

  // Check if user has supervisor or manager role
  const canViewKPIs = user?.role?.slug === 'manager' || user?.role?.slug === 'supervisor' || 
                      user?.role?.name?.toLowerCase() === 'supervisor' || 
                      user?.role?.name?.toLowerCase() === 'manager';

  const mainItems = [
    {
      name: 'CRM',
      href: '/crm',
      icon: HelpCircle,
    },
    {
      name: 'KPI Portfolio',
      href: '/kpi-portfolio',
      icon: Briefcase,
    },
    ...(canViewKPIs ? [{
      name: 'KPIs',
      href: '/kpis',
      icon: TrendingUp,
    }] : []),
    ...(canViewKPIs ? [{
      name: 'Approvals',
      href: '/approvals',
      icon: CheckCircle2,
    }] : []),
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ];

  const bottomItems = [
    {
      name: 'Profile',
      href: '/profile',
      icon: UserCircle,
    },
    {
      name: 'Log out',
      href: '/logout',
      icon: LogOut,
    }
  ];

  // Handle logout
  const handleLogout = async () => {
    await logout();
    router.navigate({ to: '/signin' });
  };

  // Create a reusable navigation item component
  const NavItem = ({ item }: { item: any }) => {
    const Icon = item.icon;
    const isActive = router.state.location.pathname === item.href || 
                     (item.href === '/crm' && router.state.location.pathname.startsWith('/crm')) ||
                     (item.href === '/kpis' && router.state.location.pathname.startsWith('/kpis')) ||
                     (item.href === '/approvals' && router.state.location.pathname.startsWith('/approvals')) ||
                     (item.href === '/kpi-portfolio' && router.state.location.pathname.startsWith('/kpi-portfolio'));
    
    // Special handling for logout
    if (item.name === 'Log out') {
      return (
        <button
          onClick={handleLogout}
          className={cn(
            'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors w-full text-left',
            'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          )}
        >
          <Icon className="mr-3 h-5 w-5" />
          {item.name}
        </button>
      );
    }
    
    return (
      <Link
        to={item.href}
        className={cn(
          'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
          isActive
            ? 'bg-sidebar-primary text-sidebar-primary-foreground'
            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
        )}
      >
        <Icon className="mr-3 h-5 w-5" />
        {item.name}
      </Link>
    );
  };

  return (
    <div className="w-full h-full bg-sidebar text-sidebar-foreground flex flex-col overflow-hidden">
      {/* Main Navigation - Scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* General */}
        <div className="p-3 md:p-4 pt-4 md:pt-6">
          <div className="mb-4 md:mb-6">
            <span className="text-lg md:text-xl font-bold text-sidebar-foreground">Resolver 1ne</span>
          </div>
          <h3 className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider mb-2 md:mb-3">
            MENU
          </h3>
          <nav className="space-y-0.5 md:space-y-1">
            {mainItems.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </nav>
        </div>
      </div>

      {/* Bottom Navigation - Pinned */}
      <div className="border-t border-sidebar-border pt-2 pb-3 md:pb-4">
        <nav className="space-y-0.5 md:space-y-1 px-3 md:px-4">
          {bottomItems.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>
      </div>
    </div>
  );
}
