import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sun,
  Moon,
  User,
  LogOut,
  Menu
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Breadcrumb } from './Breadcrumb';
import { useNavigate } from '@tanstack/react-router';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';
import { NotificationsDropdown } from '@/components/notifications/NotificationsDropdown';

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate({ to: '/signin' });
  };

  return (
    <nav className="h-12 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 md:px-6 lg:px-8">
      {/* Left side */}
      <div className="flex items-center space-x-2 md:space-x-4 lg:space-x-6">
        {/* Mobile Menu Button - visible on mobile only */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="h-full">
                <Sidebar />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Navigation arrows - hidden on mobile, visible on md+ */}
        <div className="hidden md:flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Breadcrumb - hidden on mobile, visible on lg+ */}
        <div className="hidden lg:block">
          <Breadcrumb />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-2 md:space-x-4 lg:space-x-6">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="h-8 w-8 p-0"
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>

        {/* Notifications */}
        <NotificationsDropdown />

        {/* User profile */}
        <div className="flex items-center space-x-1 md:space-x-2 lg:space-x-3">
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </div>
          {/* User info - hidden on mobile, visible on md+ */}
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {user?.full_name || user?.username || user?.email}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {user?.role?.name ?? 'CRM User'}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="h-8 w-8 p-0"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>

      </div>
    </nav>
  );
}
