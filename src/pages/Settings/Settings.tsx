import React, { useState, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { UserAccountsTab } from '@/pages/Settings/UserAccountsTab';
import { UserRolesTab } from '@/pages/Settings/UserRolesTab';
import { usePermission } from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/permissions';

export default function Settings() {
  const navigate = useNavigate();
  const searchParams = useSearch({ strict: false }) as { tab?: string };
  const [activeTab, setActiveTab] = useState(searchParams?.tab || 'user-accounts');

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


