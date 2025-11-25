import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Shield, 
  Loader2, 
  X,
  Key,
  FileText,
  Eye,
  Edit,
  Plus,
  Trash2,
  Check,
  Download,
  AlertCircle
} from 'lucide-react';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { apiService, type PermissionModule, type Permission, type AddPermissionsRequest, type RemovePermissionsRequest } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function EditRole() {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { id: string };
  const { user } = useAuth();
  const { toast } = useToast();

  const [roleInfo, setRoleInfo] = useState<any>(null);
  const [permissionModules, setPermissionModules] = useState<PermissionModule[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (params.id) {
      Promise.all([
        fetchRolePermissions(),
        fetchAllPermissions()
      ]);
    }
  }, [params.id]);

  const fetchRolePermissions = async () => {
    if (!user?.branch?.id || !params.id) return;

    try {
      const response = await apiService.fetchRolePermissions(parseInt(user.branch.id, 10), params.id);
      setRoleInfo(response.data.role_info);
      
      // Extract all permission IDs from the role
      const permissionIds = new Set<number>();
      response.data.permissions_by_module.forEach((module) => {
        module.permissions.forEach((permission) => {
          permissionIds.add(permission.id);
        });
      });
      setRolePermissions(permissionIds);
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load role permissions',
        variant: 'destructive',
      });
    }
  };

  const fetchAllPermissions = async () => {
    try {
      const response = await apiService.fetchAllPermissions();
      setPermissionModules(response.data);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load permissions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'read':
        return <Eye className="h-3 w-3" />;
      case 'create':
        return <Plus className="h-3 w-3" />;
      case 'update':
        return <Edit className="h-3 w-3" />;
      case 'delete':
        return <Trash2 className="h-3 w-3" />;
      case 'approve':
        return <Check className="h-3 w-3" />;
      case 'export':
        return <Download className="h-3 w-3" />;
      default:
        return <Key className="h-3 w-3" />;
    }
  };

  const getActionColor = (action: string, isSelected: boolean) => {
    const baseColors = {
      read: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      create: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      update: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      delete: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      approve: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
      export: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    };

    const selectedColors = {
      read: 'bg-blue-600 text-white',
      create: 'bg-green-600 text-white',
      update: 'bg-yellow-600 text-white',
      delete: 'bg-red-600 text-white',
      approve: 'bg-emerald-600 text-white',
      export: 'bg-purple-600 text-white',
    };

    if (isSelected) {
      return selectedColors[action.toLowerCase() as keyof typeof selectedColors] || 'bg-primary text-white';
    }

    return baseColors[action.toLowerCase() as keyof typeof baseColors] || 'bg-gray-100 text-gray-800';
  };

  const findPermissionModule = (permissionId: number): number | null => {
    for (const module of permissionModules) {
      const permission = module.permissions.find(p => p.id === permissionId);
      if (permission) {
        return module.module_id;
      }
    }
    return null;
  };

  const addPermission = async (permissionId: number) => {
    if (!user?.branch?.id || !params.id) return;

    const moduleId = findPermissionModule(permissionId);
    if (!moduleId) return;

    setUpdating(true);

    try {
      const requestData: AddPermissionsRequest = {
        modules: [
          {
            module_id: moduleId,
            permissions: [permissionId]
          }
        ]
      };

      await apiService.addRolePermissions(parseInt(user.branch.id, 10), params.id, requestData);

      // Update local state
      setRolePermissions((prev) => new Set([...prev, permissionId]));

      toast({
        title: 'Success',
        description: 'Permission added successfully',
      });
    } catch (error: any) {
      console.error('Error adding permission:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to add permission',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const removePermission = async (permissionId: number) => {
    if (!user?.branch?.id || !params.id) return;

    setUpdating(true);

    try {
      const requestData: RemovePermissionsRequest = {
        permission_ids: [permissionId]
      };

      await apiService.removeRolePermissions(parseInt(user.branch.id, 10), params.id, requestData);

      // Update local state
      setRolePermissions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(permissionId);
        return newSet;
      });

      toast({
        title: 'Success',
        description: 'Permission removed successfully',
      });
    } catch (error: any) {
      console.error('Error removing permission:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to remove permission',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const togglePermission = (permissionId: number) => {
    const isSelected = rolePermissions.has(permissionId);
    if (isSelected) {
      removePermission(permissionId);
    } else {
      addPermission(permissionId);
    }
  };

  const getSelectedPermissionsList = (): Permission[] => {
    const permissions: Permission[] = [];
    permissionModules.forEach((module) => {
      module.permissions.forEach((permission) => {
        if (rolePermissions.has(permission.id)) {
          permissions.push(permission);
        }
      });
    });
    return permissions;
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AuthenticatedLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        </AuthenticatedLayout>
      </ProtectedRoute>
    );
  }

  if (!roleInfo) {
    return (
      <ProtectedRoute>
        <AuthenticatedLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-destructive">Role not found</p>
          </div>
        </AuthenticatedLayout>
      </ProtectedRoute>
    );
  }

  const selectedPermissionsList = getSelectedPermissionsList();
  const isSystemRole = roleInfo.role_type === 'system';

  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <div className="space-y-2 p-2 md:p-4">
          {/* Header */}
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate({ 
                to: '/settings',
                search: { tab: 'user-roles' } as any
              })}
              className="mb-3"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Settings
            </Button>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Edit Role - {roleInfo.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {roleInfo.description}
                </p>
              </div>
            </div>
          </div>

          {/* System Role Warning */}
          {isSystemRole && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This is a system role. Only permissions can be modified. Role name and description cannot be changed.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            {/* Role Information (Read-only) */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium">Role Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 py-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Role Name</Label>
                    <p className="text-sm font-medium">{roleInfo.name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Role Type</Label>
                    <Badge variant={isSystemRole ? "default" : "secondary"}>
                      {roleInfo.role_type}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <Badge variant={roleInfo.is_active ? "default" : "secondary"}>
                      {roleInfo.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selected Permissions Display */}
            {selectedPermissionsList.length > 0 && (
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm font-medium">
                    Assigned Permissions ({selectedPermissionsList.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPermissionsList.map((permission) => (
                      <Badge
                        key={permission.id}
                        className={cn(
                          'pr-1 cursor-pointer transition-colors text-xs',
                          getActionColor(permission.action, true)
                        )}
                      >
                        <span className="flex items-center gap-1">
                          {getActionIcon(permission.action)}
                          {permission.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removePermission(permission.id)}
                          className="ml-1 rounded-full p-0.5 hover:bg-white/20"
                          disabled={updating}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Permissions Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Available Permissions
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Click on a permission to add/remove it from the role
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {permissionModules.map((module) => (
                  <div key={module.module_id}>
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="h-4 w-4 text-primary" />
                      <div>
                        <h3 className="font-semibold text-sm">{module.module_name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {module.module_description}
                        </p>
                      </div>
                    </div>

                    <div className="ml-6 flex flex-wrap gap-2 mb-4">
                      {module.permissions.map((permission) => {
                        const isSelected = rolePermissions.has(permission.id);
                        return (
                          <Badge
                            key={permission.id}
                            variant="secondary"
                            className={cn(
                              'cursor-pointer transition-all hover:scale-105',
                              getActionColor(permission.action, isSelected),
                              isSelected && 'ring-2 ring-offset-2 ring-primary',
                              updating && 'opacity-50 cursor-not-allowed'
                            )}
                            onClick={() => !updating && togglePermission(permission.id)}
                          >
                            <span className="flex items-center gap-1">
                              {getActionIcon(permission.action)}
                              {permission.action_display}
                            </span>
                          </Badge>
                        );
                      })}
                    </div>
                    <Separator />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ 
                  to: '/settings',
                  search: { tab: 'user-roles' } as any
                })}
                disabled={updating}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}

// Helper component for Label
const Label = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={className}>{children}</div>
);

