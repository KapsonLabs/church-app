import { useState, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { UserAccountsTab } from '@/pages/Settings/UserAccountsTab';
import { UserRolesTab } from '@/pages/Settings/UserRolesTab';
import { usePermission } from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/permissions';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Settings() {
  const navigate = useNavigate();
  const searchParams = useSearch({ strict: false }) as { tab?: string };
  const [activeTab, setActiveTab] = useState(searchParams?.tab || 'user-accounts');
  const { user } = useAuth();

  // Check if user has supervisor or manager role
  const canAccessSettings = user?.role?.slug === 'manager' || user?.role?.slug === 'supervisor' || 
                            user?.role?.name?.toLowerCase() === 'supervisor' || 
                            user?.role?.name?.toLowerCase() === 'manager';

  // Check permissions for each tab
  const canManageUsers = usePermission([PERMISSIONS.ACCOUNTS.READ, PERMISSIONS.ACCOUNTS.UPDATE], 'any');
  const canManageRoles = usePermission([PERMISSIONS.ACCOUNTS.READ, PERMISSIONS.ACCOUNTS.UPDATE], 'any');

  useEffect(() => {
    if (searchParams?.tab) {
      setActiveTab(searchParams.tab);
    }
  }, [searchParams?.tab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate({ 
      to: '/settings',
      search: { tab: value } as any
    });
  };

  // Redirect if user doesn't have access
  useEffect(() => {
    if (!canAccessSettings) {
      navigate({ to: '/crm' });
    }
  }, [canAccessSettings, navigate]);

  // Show access denied message if user doesn't have the right role
  if (!canAccessSettings) {
    return (
      <ProtectedRoute>
        <AuthenticatedLayout>
          <ResponsiveContainer>
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
                <p className="text-muted-foreground mb-6 text-center">
                  Only supervisors and managers can access the Settings page.
                </p>
                <Button onClick={() => navigate({ to: '/crm' })}>
                  Go to Tickets
                </Button>
              </CardContent>
            </Card>
          </ResponsiveContainer>
        </AuthenticatedLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <ResponsiveContainer>
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage system settings, user accounts, and roles.
            </p>
          </div>

          {/* Settings Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
            <TabsList className={`grid w-full ${[canManageUsers, canManageRoles].filter(Boolean).length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {canManageUsers && <TabsTrigger value="user-accounts">User Accounts</TabsTrigger>}
              {canManageRoles && <TabsTrigger value="user-roles">User Roles</TabsTrigger>}
            </TabsList>

            {/* User Accounts Tab */}
            {canManageUsers && (
              <TabsContent value="user-accounts" className="space-y-4">
                <UserAccountsTab />
              </TabsContent>
            )}

            {/* User Roles Tab */}
            {canManageRoles && (
              <TabsContent value="user-roles" className="space-y-4">
                <UserRolesTab />
              </TabsContent>
            )}
          </Tabs>
        </ResponsiveContainer>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}


