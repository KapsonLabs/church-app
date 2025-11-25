import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Key, 
  Eye, 
  Edit, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  FileText,
  Download
} from 'lucide-react';
import type { UserPermissionModule } from '@/lib/api';

interface UserPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  roleName: string;
  permissions: UserPermissionModule[] | string[];
}

export function UserPermissionsModal({
  isOpen,
  onClose,
  userName,
  userEmail,
  roleName,
  permissions,
}: UserPermissionsModalProps) {
  
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
      case 'reject':
        return <X className="h-3 w-3" />;
      case 'export':
        return <Download className="h-3 w-3" />;
      default:
        return <Key className="h-3 w-3" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'read':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'create':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'update':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'delete':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'approve':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'reject':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'export':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  // Check if permissions is array of strings or modules
  const isStringArray = permissions.length > 0 && typeof permissions[0] === 'string';
  
  const totalPermissions = isStringArray
    ? permissions.length
    : Array.isArray(permissions) 
      ? permissions.reduce((sum, module) => sum + (typeof module === 'object' ? module.permissions_count : 0), 0)
      : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            User Permissions
          </DialogTitle>
          <DialogDescription className="space-y-1">
            <div className="flex items-center gap-2 text-base font-medium text-foreground mt-2">
              <span>{userName}</span>
              {userEmail && <Badge variant="secondary">{userEmail}</Badge>}
            </div>
            <div className="flex items-center gap-2 text-sm">
              {userEmail && (
                <>
                  <span className="text-muted-foreground">Role:</span>
                  <Badge variant="outline" className="font-medium">
                    {roleName}
                  </Badge>
                  <span className="text-muted-foreground">•</span>
                </>
              )}
              <span className="text-muted-foreground">
                {totalPermissions} permission{totalPermissions !== 1 ? 's' : ''}
                {!isStringArray && ` across ${Array.isArray(permissions) ? permissions.length : 0} module${(Array.isArray(permissions) ? permissions.length : 0) !== 1 ? 's' : ''}`}
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <ScrollArea className="max-h-[calc(85vh-180px)] pr-4">
          <div className="space-y-6">
            {!Array.isArray(permissions) || permissions.length === 0 ? (
              <div className="text-center py-8">
                <Key className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">No permissions assigned</p>
              </div>
            ) : isStringArray ? (
              // Render string array permissions
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(permissions as string[]).map((permission, index) => {
                  const parts = permission.split('_');
                  const action = parts[parts.length - 1] || 'read';
                  
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 rounded-md border border-border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <Badge
                        variant="secondary"
                        className={`${getActionColor(action)} flex items-center gap-1`}
                      >
                        {getActionIcon(action)}
                        {action.charAt(0).toUpperCase() + action.slice(1)}
                      </Badge>
                      <span className="text-sm flex-1 font-mono">{permission}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Render module-based permissions
              (permissions as UserPermissionModule[]).map((module) => (
                <div key={module.module_id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-base">{module.module_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {module.module_description}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {module.permissions_count} permission{module.permissions_count !== 1 ? 's' : ''}
                    </Badge>
                  </div>

                  <div className="ml-10 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {module.permissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-center gap-2 p-2 rounded-md border border-border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <Badge
                          variant="secondary"
                          className={`${getActionColor(permission.action)} flex items-center gap-1`}
                        >
                          {getActionIcon(permission.action)}
                          {permission.action_display}
                        </Badge>
                        <span className="text-sm flex-1">{permission.name}</span>
                      </div>
                    ))}
                  </div>

                  <Separator className="mt-4" />
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

