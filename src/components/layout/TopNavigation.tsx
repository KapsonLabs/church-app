import { cn } from "@/lib/utils";
import { Link, useParams, useRouter } from "@tanstack/react-router";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current: boolean;
}

interface TopNavigationProps {
  navigationItems: NavigationItem[];
  routePattern: string; // e.g., '/members/$id' or '/saving-products/$id'
}

export function TopNavigation({ navigationItems, routePattern }: TopNavigationProps) {
    const router = useRouter();
    
    // Get the id parameter from the specified route pattern
    let id: string | undefined;
    try {
        id = useParams({ from: routePattern as any }).id;
    } catch {
        id = undefined;
    }

    return (
        <nav className="flex space-x-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1 mb-2 shadow-sm">
            {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = router.state.location.pathname === item.href.replace(':id', id || '');
            
            return (
                <Link
                key={item.name}
                to={item.href.replace(':id', id || '')}
                className={cn(
                    'flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200',
                    isActive
                    ? 'bg-green-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
                >
                <Icon className="h-4 w-4 mr-2" />
                {item.name}
                </Link>
            );
            })}
        </nav>
    );
}