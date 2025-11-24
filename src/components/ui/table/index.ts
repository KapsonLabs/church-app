/**
 * Responsive Table System - Central Exports
 * 
 * This module provides a complete table system with:
 * - Responsive table component
 * - Reusable action menus
 * - Pre-built cell renderers
 * - TypeScript support
 * 
 * @see RESPONSIVE_TABLE_GUIDE.md for usage documentation
 */

// Main table component
export { ResponsiveTable } from '../responsive-table';
export type { 
  ColumnDefinition, 
  ResponsiveTableProps 
} from '../responsive-table';

// Actions component
export { TableActions, QuickAction } from '../table-actions';
export type { 
  TableAction, 
  TableActionGroup, 
  TableActionsProps,
} from '../table-actions';

// Cell components
export {
  AvatarCell,
  StatusBadgeCell,
  CurrencyCell,
  DateCell,
  TextWithIconCell,
  MultiLineCell,
  TagListCell,
  ProgressCell,
} from '../table-cells';

// Re-export for convenience
export { default as TableCells } from '../table-cells';

