import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface ColumnDefinition<T = any> {
  /** Unique key for the column */
  key: string;
  /** Column header text */
  header: string | ReactNode;
  /** Function to render cell content */
  render: (item: T, index: number) => ReactNode;
  /** Column alignment */
  align?: 'left' | 'center' | 'right';
  /** Responsive visibility - hide on certain screens */
  hideOn?: ('sm' | 'md' | 'lg' | 'xl')[];
  /** Additional header class names */
  headerClassName?: string;
  /** Additional cell class names */
  cellClassName?: string;
  /** Column width class */
  width?: string;
  /** Whether column content should wrap */
  noWrap?: boolean;
}

export interface ResponsiveTableProps<T = any> {
  /** Table data */
  data: T[];
  /** Column definitions */
  columns: ColumnDefinition<T>[];
  /** Optional actions column */
  actions?: (item: T, index: number) => ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Empty state icon */
  emptyIcon?: ReactNode;
  /** Row hover effect */
  hoverable?: boolean;
  /** On row click handler */
  onRowClick?: (item: T, index: number) => void;
  /** Row key extractor */
  getRowKey?: (item: T, index: number) => string | number;
  /** Custom row className */
  rowClassName?: string | ((item: T, index: number) => string);
  /** Minimum table width (prevents table from being too narrow) */
  minWidth?: string;
  /** Container className */
  className?: string;
  /** Compact mode - reduces padding */
  compact?: boolean;
  /** Striped rows */
  striped?: boolean;
}

// ============================================================================
// MAIN TABLE COMPONENT
// ============================================================================

export function ResponsiveTable<T = any>({
  data,
  columns,
  actions,
  loading = false,
  emptyMessage = 'No data available',
  emptyIcon,
  hoverable = true,
  onRowClick,
  getRowKey,
  rowClassName,
  minWidth = '640px',
  className,
  compact = false,
  striped = false,
}: ResponsiveTableProps<T>) {
  // Generate row key
  const getKey = (item: T, index: number): string | number => {
    if (getRowKey) return getRowKey(item, index);
    if (typeof item === 'object' && item !== null && 'id' in item) {
      return (item as any).id;
    }
    return index;
  };

  // Generate responsive hide classes (unused but kept for potential future use)
  // const _getHideClasses = (hideOn?: ('sm' | 'md' | 'lg' | 'xl')[]): string => {
  //   if (!hideOn || hideOn.length === 0) return '';
  //   return hideOn.map(bp => `${bp}:hidden`).join(' ');
  // };

  // Generate responsive show classes (inverse of hide)
  const getShowClasses = (hideOn?: ('sm' | 'md' | 'lg' | 'xl')[]): string => {
    if (!hideOn || hideOn.length === 0) return '';
    
    const breakpoints = ['sm', 'md', 'lg', 'xl'];
    const showAt = breakpoints.filter(bp => !hideOn.includes(bp as any));
    
    if (showAt.length === 0) return 'hidden';
    
    // Start hidden, then show at appropriate breakpoint
    const firstShow = showAt[0];
    return `hidden ${firstShow}:table-cell`;
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className={cn(
        "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden",
        className
      )}>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className={cn(
        "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden",
        className
      )}>
        <div className="flex flex-col items-center justify-center py-12 px-4">
          {emptyIcon && <div className="mb-4">{emptyIcon}</div>}
          <p className="text-sm text-muted-foreground text-center">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden",
      className
    )}>
      <div className="overflow-x-auto">
        <table className="w-full" style={{ minWidth }}>
          {/* Table Header */}
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'font-semibold text-gray-700 dark:text-gray-300',
                    compact ? 'py-2 px-3 text-xs' : 'py-3 px-4 sm:py-4 sm:px-6 text-xs sm:text-sm',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.align === 'left' && 'text-left',
                    !column.align && 'text-left',
                    column.width,
                    getShowClasses(column.hideOn),
                    column.headerClassName
                  )}
                >
                  {column.header}
                </th>
              ))}
              {actions && (
                <th className={cn(
                  'text-left font-semibold text-gray-700 dark:text-gray-300',
                  compact ? 'py-2 px-3 text-xs' : 'py-3 px-4 sm:py-4 sm:px-6 text-xs sm:text-sm'
                )}>
                  Actions
                </th>
              )}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {data.map((item, index) => {
              const key = getKey(item, index);
              const isClickable = !!onRowClick;
              const customRowClass = typeof rowClassName === 'function' 
                ? rowClassName(item, index) 
                : rowClassName;

              return (
                <tr
                  key={key}
                  onClick={isClickable ? () => onRowClick(item, index) : undefined}
                  className={cn(
                    'border-b border-gray-100 dark:border-gray-600 transition-colors',
                    hoverable && 'hover:bg-gray-50 dark:hover:bg-gray-700/50',
                    isClickable && 'cursor-pointer',
                    striped && index % 2 === 0 && 'bg-gray-25 dark:bg-gray-800/50',
                    customRowClass
                  )}
                >
                  {columns.map((column) => (
                    <td
                      key={`${key}-${column.key}`}
                      className={cn(
                        'text-gray-900 dark:text-white',
                        compact ? 'py-2 px-3 text-xs' : 'py-3 px-4 sm:py-4 sm:px-6 text-xs sm:text-sm',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right',
                        column.align === 'left' && 'text-left',
                        !column.align && 'text-left',
                        column.noWrap && 'whitespace-nowrap',
                        getShowClasses(column.hideOn),
                        column.cellClassName
                      )}
                    >
                      {column.render(item, index)}
                    </td>
                  ))}
                  {actions && (
                    <td className={cn(
                      compact ? 'py-2 px-3' : 'py-3 px-4 sm:py-4 sm:px-6'
                    )}>
                      {actions(item, index)}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Export default
export default ResponsiveTable;

