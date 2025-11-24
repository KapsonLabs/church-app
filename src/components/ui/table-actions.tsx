import React, { ReactNode } from 'react';
import { MoreVertical, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface TableAction {
  /** Unique key for the action */
  key: string;
  /** Action label */
  label: string;
  /** Icon component */
  icon?: LucideIcon;
  /** Click handler */
  onClick: () => void;
  /** Action variant - affects styling */
  variant?: 'default' | 'destructive' | 'warning';
  /** Whether action is disabled */
  disabled?: boolean;
  /** Whether to show separator after this action */
  separator?: boolean;
  /** Additional className */
  className?: string;
}

export interface TableActionGroup {
  /** Group label (optional) */
  label?: string;
  /** Actions in this group */
  actions: TableAction[];
}

export interface TableActionsProps {
  /** Single list of actions or grouped actions */
  actions?: TableAction[] | TableActionGroup[];
  /** Align dropdown menu */
  align?: 'start' | 'end' | 'center';
  /** Custom trigger button */
  trigger?: ReactNode;
  /** Size of the actions button */
  size?: 'sm' | 'lg';
  /** Additional className for trigger */
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getVariantClasses = (variant?: 'default' | 'destructive' | 'warning'): string => {
  switch (variant) {
    case 'destructive':
      return 'text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400';
    case 'warning':
      return 'text-orange-600 focus:text-orange-600 dark:text-orange-400 dark:focus:text-orange-400';
    default:
      return '';
  }
};

const isActionGroup = (item: TableAction | TableActionGroup): item is TableActionGroup => {
  return 'actions' in item && Array.isArray(item.actions);
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function TableActions({
  actions = [],
  align = 'end',
  trigger,
  size = 'sm',
  className,
}: TableActionsProps) {
  if (actions.length === 0) return null;

  // Determine if we have groups or flat actions
  const hasGroups = actions.some(isActionGroup);
  const actionGroups: TableActionGroup[] = hasGroups
    ? (actions as TableActionGroup[])
    : [{ actions: actions as TableAction[] }];

  // Button size mapping
  const sizeClasses = {
    sm: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size={size}
            className={cn(
              'p-0 opacity-60 hover:opacity-100 transition-opacity',
              'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
              sizeClasses[size],
              className
            )}
          >
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open actions menu</span>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-48">
        {actionGroups.map((group, groupIndex) => (
          <React.Fragment key={groupIndex}>
            {group.label && <DropdownMenuLabel>{group.label}</DropdownMenuLabel>}
            {group.actions.map((action, actionIndex) => {
              const Icon = action.icon;

              return (
                <React.Fragment key={action.key}>
                  <DropdownMenuItem
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className={cn(
                      getVariantClasses(action.variant),
                      action.className
                    )}
                  >
                    {Icon && (
                      <Icon className="h-4 w-4 mr-2" />
                    )}
                    {action.label}
                  </DropdownMenuItem>
                  {action.separator && actionIndex < group.actions.length - 1 && (
                    <DropdownMenuSeparator />
                  )}
                </React.Fragment>
              );
            })}
            {groupIndex < actionGroups.length - 1 && <DropdownMenuSeparator />}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ============================================================================
// QUICK ACTION BUTTON
// ============================================================================

interface QuickActionProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'warning' | 'success';
  size?: 'sm' | 'lg';
  disabled?: boolean;
  className?: string;
}

export function QuickAction({
  icon: Icon,
  label,
  onClick,
  variant = 'default',
  size = 'sm',
  disabled = false,
  className,
}: QuickActionProps) {
  const variantClasses = {
    default: 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100',
    destructive: 'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300',
    warning: 'text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300',
    success: 'text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300',
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'p-0 transition-colors',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      title={label}
    >
      <Icon className="h-4 w-4" />
      <span className="sr-only">{label}</span>
    </Button>
  );
}

// Export default
export default TableActions;

