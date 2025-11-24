import React from 'react';
import { Eye, Edit, Shield, Calendar } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useToast } from '@/hooks/use-toast';
import { type UserRole } from '@/lib/api';
import { ResponsiveTable, type ColumnDefinition } from '@/components/ui/responsive-table';
import { TableActions, type TableAction } from '@/components/ui/table-actions';
import { 
  StatusBadgeCell, 
  DateCell,
  MultiLineCell,
  TextWithIconCell,
} from '@/components/ui/table-cells';

interface UserRolesTableV2Props {
  roles: UserRole[];
  onViewPermissions: (roleId: string) => void;
  onEditRole: (roleId: string, roleType: string) => void;
  loading?: boolean;
}

export const UserRolesTableV2: React.FC<UserRolesTableV2Props> = ({ 
  roles, 
  onViewPermissions,
  onEditRole,
  loading = false,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Define columns
  const columns: ColumnDefinition<UserRole>[] = [
    {
      key: 'name',
      header: 'Role Name',
      render: (role) => (
        <MultiLineCell
          primary={role.name}
          secondary={role.description}
          primaryClassName="font-semibold"
        />
      ),
      width: 'min-w-[200px]',
    },
    {
      key: 'type',
      header: 'Type',
      render: (role) => (
        <div className="flex items-center gap-1">
          <Shield className={`h-4 w-4 ${
            role.role_type === 'system' 
              ? 'text-blue-500' 
              : 'text-purple-500'
          }`} />
          <span className="text-sm capitalize">{role.role_type}</span>
        </div>
      ),
      hideOn: ['sm'],
    },
    {
      key: 'permissions_count',
      header: 'Permissions',
      render: (role) => (
        <TextWithIconCell
          icon={Shield}
          text={`${role.permissions_count} permissions`}
          iconColor="text-orange-500"
        />
      ),
      hideOn: ['sm', 'md'],
    },
    {
      key: 'status',
      header: 'Status',
      render: (role) => (
        <StatusBadgeCell
          status={role.is_active ? 'Active' : 'Inactive'}
          variant={role.is_active ? 'success' : 'warning'}
        />
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (role) => (
        <DateCell
          date={role.created_at}
          format="short"
          icon={Calendar}
          showIcon={true}
        />
      ),
      hideOn: ['sm', 'md'],
    },
  ];

  // Define actions for each row
  const getRowActions = (role: UserRole): TableAction[] => [
    {
      key: 'view',
      label: 'View Permissions',
      icon: Eye,
      onClick: () => onViewPermissions(role.id),
    },
    {
      key: 'edit',
      label: 'Edit Role',
      icon: Edit,
      onClick: () => onEditRole(role.id, role.role_type),
    },
  ];

  return (
    <ResponsiveTable
      data={roles}
      columns={columns}
      actions={(role) => (
        <TableActions actions={getRowActions(role)} />
      )}
      loading={loading}
      emptyMessage="No roles found. Create your first role to get started."
      hoverable
      getRowKey={(role) => String(role.id)}
      minWidth="700px"
    />
  );
};

