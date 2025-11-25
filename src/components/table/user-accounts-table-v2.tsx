import React from 'react';
import { Eye, Key, Shield, Mail } from 'lucide-react';
import { type OrganizationUser } from '@/lib/api';
import { ResponsiveTable, type ColumnDefinition } from '@/components/ui/responsive-table';
import { TableActions, type TableAction } from '@/components/ui/table-actions';
import { 
  AvatarCell,
  StatusBadgeCell, 
  MultiLineCell,
} from '@/components/ui/table-cells';

interface UserAccountsTableV2Props {
  users: OrganizationUser[];
  onViewPermissions: (user: OrganizationUser) => void;
  onChangePassword: (user: OrganizationUser) => void;
  loading?: boolean;
}

export const UserAccountsTableV2: React.FC<UserAccountsTableV2Props> = ({ 
  users, 
  onViewPermissions,
  onChangePassword,
  loading = false,
}) => {

  // Define columns
  const columns: ColumnDefinition<OrganizationUser>[] = [
    {
      key: 'name',
      header: 'User',
      render: (user) => (
        <div className="min-w-0">
          <AvatarCell 
            name={`${user.first_name} ${user.last_name}`}
            subtitle={user.email}
            icon={Mail}
          />
        </div>
      ),
      width: 'min-w-[200px]',
    },
    {
      key: 'role',
      header: 'Role',
      render: (user) => (
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-purple-500 flex-shrink-0" />
          <MultiLineCell
            primary={user.role?.name || 'N/A'}
            secondary={user.role?.slug || ''}
            primaryClassName="text-sm"
            secondaryClassName="text-xs"
          />
        </div>
      ),
      hideOn: ['sm'],
    },
    {
      key: 'permissions_count',
      header: 'Permissions',
      render: (user) => {
        const totalPermissions = user.permissions?.length || 0;
        return (
          <div className="flex items-center gap-1">
            <Shield className="h-4 w-4 text-orange-500" />
            <span className="text-sm">{totalPermissions}</span>
          </div>
        );
      },
      hideOn: ['sm', 'md'],
    },
    {
      key: 'status',
      header: 'Status',
      render: (user) => (
        <StatusBadgeCell
          status={user.is_active ? 'Active' : 'Inactive'}
          variant={user.is_active ? 'success' : 'warning'}
        />
      ),
    },
  ];

  // Define actions for each row
  const getRowActions = (user: OrganizationUser): TableAction[] => [
    {
      key: 'view',
      label: 'View Permissions',
      icon: Eye,
      onClick: () => onViewPermissions(user),
    },
    {
      key: 'password',
      label: 'Change Password',
      icon: Key,
      onClick: () => onChangePassword(user),
    },
  ];

  return (
    <ResponsiveTable
      data={users}
      columns={columns}
      actions={(user) => (
        <TableActions actions={getRowActions(user)} />
      )}
      loading={loading}
      emptyMessage="No users found. Add your first user to get started."
      hoverable
      getRowKey={(user) => String(user.id)}
      minWidth="700px"
    />
  );
};

