import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface PermissionGuardProps {
  /**
   * Permission codename(s) required to view the children
   * Can be a single permission string or an array of permissions
   */
  permissions: string | string[];
  
  /**
   * Logic to use when multiple permissions are provided
   * - 'any': User needs at least one of the permissions (OR logic)
   * - 'all': User needs all of the permissions (AND logic)
   * @default 'any'
   */
  requirementType?: 'any' | 'all';
  
  /**
   * Content to render when user doesn't have permission
   * If not provided, nothing will be rendered
   */
  fallback?: React.ReactNode;
  
  /**
   * Children to render when user has permission
   */
  children: React.ReactNode;
}

/**
 * PermissionGuard Component
 * 
 * Conditionally renders children based on user permissions.
 * 
 * @example
 * // Single permission
 * <PermissionGuard permissions="members_create">
 *   <Button>Create Member</Button>
 * </PermissionGuard>
 * 
 * @example
 * // Multiple permissions with "any" logic
 * <PermissionGuard permissions={["products_read", "products_update"]} requirementType="any">
 *   <ProductList />
 * </PermissionGuard>
 * 
 * @example
 * // Multiple permissions with "all" logic
 * <PermissionGuard permissions={["transactions_create", "transactions_approve"]} requirementType="all">
 *   <ApproveTransactionButton />
 * </PermissionGuard>
 * 
 * @example
 * // With fallback
 * <PermissionGuard 
 *   permissions="members_delete"
 *   fallback={<span className="text-muted-foreground">No permission</span>}
 * >
 *   <DeleteButton />
 * </PermissionGuard>
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permissions,
  requirementType = 'any',
  fallback = null,
  children,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

  // Convert single permission to array for consistent handling
  const permissionArray = Array.isArray(permissions) ? permissions : [permissions];

  // Determine if user has required permissions
  let hasRequiredPermissions = false;

  if (permissionArray.length === 0) {
    // No permissions required, always show
    hasRequiredPermissions = true;
  } else if (permissionArray.length === 1) {
    // Single permission
    hasRequiredPermissions = hasPermission(permissionArray[0]);
  } else {
    // Multiple permissions
    if (requirementType === 'all') {
      hasRequiredPermissions = hasAllPermissions(permissionArray);
    } else {
      hasRequiredPermissions = hasAnyPermission(permissionArray);
    }
  }

  // Render based on permission check
  if (hasRequiredPermissions) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

/**
 * Hook for checking permissions in component logic
 * 
 * @example
 * const canEdit = usePermission('members_update');
 * const canDoEither = usePermission(['members_create', 'members_update'], 'any');
 * const canDoBoth = usePermission(['transactions_create', 'transactions_approve'], 'all');
 */
export const usePermission = (
  permissions: string | string[],
  requirementType: 'any' | 'all' = 'any'
): boolean => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

  const permissionArray = Array.isArray(permissions) ? permissions : [permissions];

  if (permissionArray.length === 0) {
    return true;
  }

  if (permissionArray.length === 1) {
    return hasPermission(permissionArray[0]);
  }

  if (requirementType === 'all') {
    return hasAllPermissions(permissionArray);
  }

  return hasAnyPermission(permissionArray);
};

