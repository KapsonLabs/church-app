import React from 'react';
import { useRouter, useNavigate } from '@tanstack/react-router';
import { Home } from 'lucide-react';
import {
  Breadcrumb as BreadcrumbPrimitive,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';

export interface BreadcrumbItemData {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

/**
 * Route label mapping for better breadcrumb labels
 */
const ROUTE_LABEL_MAP: Record<string, string> = {
  'crm': 'CRM',
  'tickets': 'Tickets',
  'settings': 'Settings',
  'profile': 'Profile',
  'roles': 'Roles',
  'create': 'Create',
  'edit': 'Edit',
  'signin': 'Sign In',
  'transactions': 'Transactions',
  'accounts': 'Chart of Accounts',
  'members': 'Members',
  'savings': 'Savings',
  'loans': 'Loans',
  'insurance': 'Insurance',
  'products': 'Products Portfolio',
  'help': 'Help Desk',
};

/**
 * Auto-generates breadcrumb items from the current pathname
 */
const generateBreadcrumbItems = (pathname: string): BreadcrumbItemData[] => {
  const items: BreadcrumbItemData[] = [
    {
      label: '1ne',
      href: '/',
      icon: Home,
    },
  ];

  // Split the pathname and build breadcrumb items
  const pathSegments = pathname.split('/').filter(Boolean);

  if (pathSegments.length === 0) {
    return items;
  }

  let currentPath = '';

  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === pathSegments.length - 1;

    // Handle dynamic routes (UUIDs or numeric IDs)
    const isId = segment.match(/^[0-9a-f-]{36}$/i) || /^\d+$/.test(segment);
    
    if (isId) {
      // This is likely a UUID or numeric ID
      const parentSegment = pathSegments[index - 1];
      
      // Special handling for specific routes
      if (parentSegment === 'tickets') {
        // Add the ticket ID item with a friendly label
        items.push({
          label: `Ticket #${segment}`,
          href: isLast ? undefined : currentPath,
        });
      } else if (parentSegment === 'roles') {
        // Add the role ID item
        items.push({
          label: `Role ${segment.length > 36 ? segment.slice(0, 8) + '...' : segment}`,
          href: isLast ? undefined : currentPath,
        });
      } else {
        // Generic ID handling - show truncated ID
        items.push({
          label: segment.length > 36 ? `${segment.slice(0, 8)}...` : segment,
          href: isLast ? undefined : currentPath,
        });
      }
    } else {
      // Regular route segment
      let label = ROUTE_LABEL_MAP[segment] || segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      items.push({
        label,
        href: isLast ? undefined : currentPath,
      });
    }
  });

  return items;
};

interface BreadcrumbProps {
  /**
   * Custom breadcrumb items. If provided, auto-generation from route is disabled.
   */
  items?: BreadcrumbItemData[];
  /**
   * Custom className for the breadcrumb container
   */
  className?: string;
  /**
   * Whether to show the home icon with "1ne" label
   * @default true
   */
  showHome?: boolean;
}

/**
 * Reusable Breadcrumb component
 * 
 * @example
 * // Auto-generate from current route
 * <Breadcrumb />
 * 
 * @example
 * // Custom breadcrumb items
 * <Breadcrumb items={[
 *   { label: '1ne', href: '/', icon: Home },
 *   { label: 'Settings', href: '/settings' },
 *   { label: 'Users' }
 * ]} />
 */
export function Breadcrumb({ 
  items: customItems, 
  className,
  showHome = true,
}: BreadcrumbProps) {
  const router = useRouter();
  const navigate = useNavigate();
  const pathname = router.state.location.pathname;

  // Use custom items if provided, otherwise auto-generate from route
  const breadcrumbItems = customItems || generateBreadcrumbItems(pathname);

  // Filter out home if showHome is false
  const displayItems = showHome 
    ? breadcrumbItems 
    : breadcrumbItems.filter((_, index) => index !== 0);

  const handleNavigation = (href?: string) => {
    if (href) {
      navigate({ to: href as any });
    }
  };

  return (
    <BreadcrumbPrimitive className={cn(className)}>
      <BreadcrumbList>
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const Icon = item.icon;

          return (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="flex items-center gap-1.5">
                    {Icon && <Icon className="h-4 w-4" />}
                    <span>{item.label}</span>
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    onClick={() => handleNavigation(item.href)}
                    className="flex items-center gap-1.5 cursor-pointer"
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    <span>{item.label}</span>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </BreadcrumbPrimitive>
  );
}
