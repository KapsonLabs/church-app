import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, RefreshCw, Users } from 'lucide-react';
import { apiService, OrganizationUser } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UserPermissionsModal } from '@/components/modals/UserPermissionsModal';
import { CreateUserModal } from '@/components/modals/CreateUserModal';
import { ChangePasswordModal } from '@/components/modals/ChangePasswordModal';
import { UserAccountsTableV2 } from '@/components/table/user-accounts-table-v2';

export function UserAccountsTab() {
  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<OrganizationUser | null>(null);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [passwordChangeUser, setPasswordChangeUser] = useState<OrganizationUser | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchUsers = async () => {
    if (!user?.branch?.organization_id) {
      setError('Organization information not available');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await apiService.fetchBranchUsers(user.branch.organization_id);
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
      toast({
        title: "Error",
        description: "Failed to fetch user accounts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, [user?.branch?.organization_id]);

  const handleAddUser = () => {
    setIsCreateModalOpen(true);
  };

  const handleUserCreated = () => {
    fetchUsers();
  };

  const handleViewPermissions = (userData: BranchUser) => {
    setSelectedUser(userData);
    setIsPermissionsModalOpen(true);
  };

  const handleEditUser = (userId: number) => {
    // TODO: Implement edit user functionality
    toast({
      title: "Edit User",
      description: `Edit user functionality will be implemented for ID: ${userId}`,
    });
  };

  const handleDeactivateUser = (userId: number) => {
    // TODO: Implement deactivate user functionality
    toast({
      title: "Deactivate User",
      description: `Deactivate user functionality will be implemented for ID: ${userId}`,
      variant: "destructive",
    });
  };

  const handleRemoveUser = (userId: number) => {
    // TODO: Implement remove user functionality
    toast({
      title: "Remove User",
      description: `Remove user functionality will be implemented for ID: ${userId}`,
      variant: "destructive",
    });
  };


  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading user accounts...</span>
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
            <Users className="h-5 w-5" />
            User Accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button variant="outline" onClick={fetchUsers}>
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
              <Users className="h-5 w-5" />
              User Accounts
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
              <Button size="sm" onClick={handleAddUser}>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No users found</h3>
              <p className="text-muted-foreground mb-4">
                No user accounts have been configured for this branch yet.
              </p>
              <Button onClick={handleAddUser}>
                <Plus className="h-4 w-4 mr-2" />
                Add First User
              </Button>
            </div>
          ) : (
            <UserAccountsTableV2
              users={users}
              loading={false}
              onViewPermissions={handleViewPermissions}
              onChangePassword={(user) => {
                setPasswordChangeUser(user);
                setIsChangePasswordModalOpen(true);
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleUserCreated}
      />

      {/* Change Password Modal */}
      {passwordChangeUser && (
        <ChangePasswordModal
          isOpen={isChangePasswordModalOpen}
          onClose={() => {
            setIsChangePasswordModalOpen(false);
            setPasswordChangeUser(null);
          }}
          userId={passwordChangeUser.user}
          userEmail={passwordChangeUser.user_email}
          userName={passwordChangeUser.user_name}
        />
      )}

      {/* User Permissions Modal */}
      {selectedUser && (
        <UserPermissionsModal
          isOpen={isPermissionsModalOpen}
          onClose={() => {
            setIsPermissionsModalOpen(false);
            setSelectedUser(null);
          }}
          userName={selectedUser.user_name}
          userEmail={selectedUser.user_email}
          roleName={selectedUser.role_name}
          permissions={selectedUser.permissions}
        />
      )}
    </>
  );
}
