import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft, 
  Shield, 
  Save, 
  Loader2, 
  X,
  Key,
  FileText,
  Eye,
  Edit,
  Plus,
  Trash2,
  Check,
  Download
} from 'lucide-react';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { apiService, type PermissionModule, type Permission, type CreateRoleRequest } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function CreateRole() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    role_type: 'custom' as 'custom' | 'system',
    is_active: true,
  });

  const [permissionModules, setPermissionModules] = useState<PermissionModule[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
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

  const togglePermission = (permissionId: number) => {
    setSelectedPermissions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
  };

  const removePermission = (permissionId: number) => {
    setSelectedPermissions((prev) => {
      const newSet = new Set(prev);
      newSet.delete(permissionId);
      return newSet;
    });
  };

  const getSelectedPermissionsList = (): Permission[] => {
    const permissions: Permission[] = [];
    permissionModules.forEach((module) => {
      module.permissions.forEach((permission) => {
        if (selectedPermissions.has(permission.id)) {
          permissions.push(permission);
        }
      });
    });
    return permissions;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Role name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (selectedPermissions.size === 0) {
      newErrors.permissions = 'At least one permission is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        variant: 'destructive',
      });
      return;
    }

    if (!user?.branch?.organization_id) {
      toast({
        title: 'Error',
        description: 'No organization information available',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      const roleData: CreateRoleRequest = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        role_type: formData.role_type,
        permission_ids: Array.from(selectedPermissions),
        is_active: formData.is_active,
        organization_id: user.branch.organization_id,
      };

      await apiService.createRole(roleData);

      toast({
        title: 'Success',
        description: 'Role created successfully',
      });

      navigate({ 
        to: '/settings',
        search: { tab: 'user-roles' } as any
      });
    } catch (error: any) {
      console.error('Error creating role:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create role',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
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

  const selectedPermissionsList = getSelectedPermissionsList();

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
                <h3 className="text-xl font-bold">Create New Role</h3>
                <p className="text-sm text-muted-foreground">
                  Define a custom role with specific permissions
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 py-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="name" className="text-xs">
                      Role Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Customer Service"
                      className={cn('h-8 text-sm', errors.name && 'border-red-500')}
                      disabled={submitting}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="description" className="text-xs">
                      Description <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe the role's purpose"
                      className={cn('h-8 text-sm', errors.description && 'border-red-500')}
                      disabled={submitting}
                    />
                    {errors.description && (
                      <p className="text-xs text-red-500">{errors.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="space-y-1 flex-1">
                      <Label htmlFor="role_type" className="text-xs">Role Type</Label>
                      <Select
                        value={formData.role_type}
                        onValueChange={(value: 'custom' | 'system') =>
                          handleInputChange('role_type', value)
                        }
                        disabled={submitting}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">Custom</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2 mt-5">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                        disabled={submitting}
                      />
                      <Label htmlFor="is_active" className="text-xs">Active</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selected Permissions Display */}
            {selectedPermissionsList.length > 0 && (
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm font-medium">
                    Selected Permissions ({selectedPermissionsList.length})
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
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  {errors.permissions && (
                    <p className="text-xs text-red-500 mt-2">{errors.permissions}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Permissions Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Select Permissions{' '}
                  {selectedPermissionsList.length === 0 && (
                    <span className="text-red-500">*</span>
                  )}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Click on a permission to add it to the role
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
                        const isSelected = selectedPermissions.has(permission.id);
                        return (
                          <Badge
                            key={permission.id}
                            variant="secondary"
                            className={cn(
                              'cursor-pointer transition-all hover:scale-105',
                              getActionColor(permission.action, isSelected),
                              isSelected && 'ring-2 ring-offset-2 ring-primary'
                            )}
                            onClick={() => togglePermission(permission.id)}
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

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ 
                  to: '/settings',
                  search: { tab: 'user-roles' } as any
                })}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Role
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}

