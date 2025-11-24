import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, RefreshCw, Shield } from 'lucide-react';
import { apiService, UserRole, UserPermissionModule } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UserPermissionsModal } from '@/components/modals/UserPermissionsModal';
import { UserRolesTableV2 } from '@/components/table/user-roles-table-v2';

export function UserRolesTab() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<{ id: string; name: string } | null>(null);
  const [rolePermissions, setRolePermissions] = useState<UserPermissionModule[]>([]);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchRoles = async () => {
    if (!user?.branch?.organization_id) {
      setError('Organization information not available');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await apiService.fetchBranchRoles(user.branch.organization_id);
      setRoles(response.data);
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch roles');
      toast({
        title: "Error",
        description: "Failed to fetch user roles. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRoles();
  };

  useEffect(() => {
    fetchRoles();
  }, [user?.branch?.organization_id]);

  const handleAddRole = () => {
    navigate({ to: '/settings/roles/create' });
  };

  const handleViewPermissions = async (roleId: string, roleName: string) => {
    if (!user?.branch?.id) {
      toast({
        title: "Error",
        description: "Branch information not available",
        variant: "destructive",
      });
      return;
    }

    setSelectedRole({ id: roleId, name: roleName });
    setLoadingPermissions(true);
    setIsPermissionsModalOpen(true);

    try {
      const response = await apiService.fetchRolePermissions(user.branch.id, roleId);
      setRolePermissions(response.data.permissions_by_module);
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch role permissions. Please try again.",
        variant: "destructive",
      });
      setIsPermissionsModalOpen(false);
      setSelectedRole(null);
    } finally {
      setLoadingPermissions(false);
    }
  };

  const handleEditRole = (roleId: string, roleType: string) => {
    if (roleType === 'system') {
      toast({
        title: "System Role",
        description: "System roles can only have their permissions modified, not their details.",
      });
    }
    navigate({ to: `/settings/roles/${roleId}/edit` });
  };

  const handleDeleteRole = (roleId: string) => {
    // TODO: Implement delete role functionality
    toast({
      title: "Delete Role",
      description: `Delete role functionality will be implemented for ID: ${roleId}`,
      variant: "destructive",
    });
  };


  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            User Roles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading user roles...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            User Roles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button variant="outline" onClick={fetchRoles}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            User Roles
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <Button size="sm" onClick={handleAddRole}>
              <Plus className="h-4 w-4 mr-2" />
              Add Role
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {roles.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No roles found</h3>
            <p className="text-muted-foreground mb-4">
              No user roles have been configured for this branch yet.
            </p>
            <Button onClick={handleAddRole}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Role
            </Button>
          </div>
        ) : (
          <UserRolesTableV2
            roles={roles}
            loading={false}
            onViewPermissions={(roleId: string) => {
              const role = roles.find(r => r.id === roleId);
              if (role) {
                handleViewPermissions(roleId, role.name);
              }
            }}
            onEditRole={handleEditRole}
          />
        )}
      </CardContent>
    </Card>

    {/* Role Permissions Modal */}
    {selectedRole && (
      <UserPermissionsModal
        isOpen={isPermissionsModalOpen}
        onClose={() => {
          setIsPermissionsModalOpen(false);
          setSelectedRole(null);
          setRolePermissions([]);
        }}
        userName={selectedRole.name}
        userEmail="" // Role doesn't have email
        roleName={selectedRole.name}
        permissions={loadingPermissions ? [] : rolePermissions}
      />
    )}
  </>
  );
}
