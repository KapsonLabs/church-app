/**
 * Permission System Utilities
 * 
 * This file contains utilities for managing and checking user permissions
 * throughout the application.
 */

// Permission codenames organized by module for easy reference
export const PERMISSIONS = {
  // Accounts Module
  ACCOUNTS: {
    CREATE: 'accounts_create',
    READ: 'accounts_read',
    UPDATE: 'accounts_update',
    DELETE: 'accounts_delete',
  },
  
  // Products Module (Savings, Loans, Insurance)
  PRODUCTS: {
    CREATE: 'products_create',
    READ: 'products_read',
    UPDATE: 'products_update',
    DELETE: 'products_delete',
    APPROVE: 'products_approve',
  },
  
  // Members Module
  MEMBERS: {
    CREATE: 'members_create',
    READ: 'members_read',
    UPDATE: 'members_update',
    DELETE: 'members_delete',
    APPROVE: 'members_approve',
    DEACTIVATE: 'members_deactivate',
    EXPORT: 'members_export',
  },
  
  // Groups Module
  GROUPS: {
    CREATE: 'groups_create',
    READ: 'groups_read',
    UPDATE: 'groups_update',
    DELETE: 'groups_delete',
  },
  
  // Currencies Module
  CURRENCIES: {
    CREATE: 'currencies_create',
    READ: 'currencies_read',
    UPDATE: 'currencies_update',
    DELETE: 'currencies_delete',
  },
  
  // Transactions Module
  TRANSACTIONS: {
    CREATE: 'transactions_create',
    READ: 'transactions_read',
    UPDATE: 'transactions_update',
    DELETE: 'transactions_delete',
    APPROVE: 'transactions_approve',
    REJECT: 'transactions_reject',
    REVERSE: 'transactions_reverse',
    VIEW: 'transactions_view_reconciliation',
    VIEW_TRANSACTION_SETTINGS: 'transactions_view_transaction_settings',
    CREATE_TRANSACTION_SETTINGS: 'transactions_create_transaction_settings',
    OPEN: 'transactions_open',
    CLOSE: 'transactions_close',
    RECONCILE: 'transactions_reconcile',
  },
  
  // Ledgers Module
  LEDGERS: {
    CREATE: 'ledgers_create',
    READ: 'ledgers_read',
    UPDATE: 'ledgers_update',
    DELETE: 'ledgers_delete',
    EXPORT: 'ledgers_export',
  },
  
  // Reports Module
  REPORTS: {
    CREATE: 'reports_create',
    READ: 'reports_read',
    EXPORT: 'reports_export',
  },
  
  // Logs Module
  LOGS: {
    READ: 'logs_read',
    EXPORT: 'logs_export',
  },
  
  // Expenses Module
  EXPENSES: {
    CREATE: 'expenses_create',
    READ: 'expenses_read',
    UPDATE: 'expenses_update',
    DELETE: 'expenses_delete',
    APPROVE: 'expenses_approve',
    EXPORT: 'expenses_export',
  },
} as const;

/**
 * Permission requirements for different routes/sections
 * Maps route paths to required permissions
 */
export const ROUTE_PERMISSIONS = {
  // Dashboard - everyone can access
  '/': [],
  '/dashboard': [],
  
  // Members
  '/members': [PERMISSIONS.MEMBERS.READ],
  '/members/create': [PERMISSIONS.MEMBERS.CREATE],
  '/members/:id': [PERMISSIONS.MEMBERS.READ],
  
  // Savings/Products
  '/savings': [PERMISSIONS.PRODUCTS.READ],
  '/savings/create': [PERMISSIONS.PRODUCTS.CREATE],
  '/savings/:id': [PERMISSIONS.PRODUCTS.READ],
  
  // Loans
  '/loans': [PERMISSIONS.PRODUCTS.READ],
  '/loans/:id': [PERMISSIONS.PRODUCTS.READ],
  
  // Insurance
  '/insurance': [PERMISSIONS.PRODUCTS.READ],
  
  // Groups
  '/groups': [PERMISSIONS.GROUPS.READ],
  
  // Transactions
  '/transactions': [PERMISSIONS.TRANSACTIONS.READ],
  
  // Accounts (Reports)
  '/accounts': [PERMISSIONS.LEDGERS.READ],
  '/accounts/balance-sheet': [PERMISSIONS.REPORTS.READ],
  '/accounts/income-statement': [PERMISSIONS.REPORTS.READ],
  '/accounts/monthly-report': [PERMISSIONS.REPORTS.READ],
  
  // Settings - Basic access for everyone, specific tabs need specific permissions
  '/settings': [],
  
  // Profile - everyone can access their own profile
  '/profile': [],
  
  // Reconciliations
  '/reconciliations': [PERMISSIONS.TRANSACTIONS.VIEW],
  '/reconciliations/teller/:tellerId': [PERMISSIONS.TRANSACTIONS.VIEW],
  
  // Expenses
  '/expenses': [PERMISSIONS.EXPENSES.READ],
  '/expenses/create': [PERMISSIONS.EXPENSES.CREATE],
  '/expenses/:id': [PERMISSIONS.EXPENSES.READ],
} as const;

/**
 * UI Action Permissions
 * Defines what permissions are needed for specific UI actions
 */
export const ACTION_PERMISSIONS = {
  // Member Actions
  CREATE_MEMBER: [PERMISSIONS.MEMBERS.CREATE],
  EDIT_MEMBER: [PERMISSIONS.MEMBERS.UPDATE],
  DELETE_MEMBER: [PERMISSIONS.MEMBERS.DELETE],
  APPROVE_MEMBER: [PERMISSIONS.MEMBERS.APPROVE],
  DEACTIVATE_MEMBER: [PERMISSIONS.MEMBERS.DEACTIVATE],
  EXPORT_MEMBERS: [PERMISSIONS.MEMBERS.EXPORT],
  
  // Product Actions
  CREATE_PRODUCT: [PERMISSIONS.PRODUCTS.CREATE],
  EDIT_PRODUCT: [PERMISSIONS.PRODUCTS.UPDATE],
  DELETE_PRODUCT: [PERMISSIONS.PRODUCTS.DELETE],
  APPROVE_PRODUCT: [PERMISSIONS.PRODUCTS.APPROVE],
  
  // Transaction Actions
  CREATE_TRANSACTION: [PERMISSIONS.TRANSACTIONS.CREATE],
  EDIT_TRANSACTION: [PERMISSIONS.TRANSACTIONS.UPDATE],
  APPROVE_TRANSACTION: [PERMISSIONS.TRANSACTIONS.APPROVE],
  REJECT_TRANSACTION: [PERMISSIONS.TRANSACTIONS.REJECT],
  
  // Group Actions
  CREATE_GROUP: [PERMISSIONS.GROUPS.CREATE],
  EDIT_GROUP: [PERMISSIONS.GROUPS.UPDATE],
  DELETE_GROUP: [PERMISSIONS.GROUPS.DELETE],
  
  // Currency Actions
  UPDATE_CURRENCY: [PERMISSIONS.CURRENCIES.UPDATE],
  CREATE_CURRENCY: [PERMISSIONS.CURRENCIES.CREATE],
  
  // Report Actions
  EXPORT_REPORT: [PERMISSIONS.REPORTS.EXPORT],
  CREATE_REPORT: [PERMISSIONS.REPORTS.CREATE],
  
  // Log Actions
  VIEW_LOGS: [PERMISSIONS.LOGS.READ],
  EXPORT_LOGS: [PERMISSIONS.LOGS.EXPORT],

  // Teller Reconciliations Actions
  VIEW_RECONCILIATIONS: [PERMISSIONS.TRANSACTIONS.VIEW],
  ADD_OPENING_BALANCE: [PERMISSIONS.TRANSACTIONS.OPEN],
  CLOSE_DAY: [PERMISSIONS.TRANSACTIONS.CLOSE],
  RECONCILE_DAY: [PERMISSIONS.TRANSACTIONS.RECONCILE],
  
  // Expense Actions
  CREATE_EXPENSE: [PERMISSIONS.EXPENSES.CREATE],
  EDIT_EXPENSE: [PERMISSIONS.EXPENSES.UPDATE],
  DELETE_EXPENSE: [PERMISSIONS.EXPENSES.DELETE],
  APPROVE_EXPENSE: [PERMISSIONS.EXPENSES.APPROVE],
  EXPORT_EXPENSES: [PERMISSIONS.EXPENSES.EXPORT],
} as const;

/**
 * Sidebar navigation items with their required permissions
 */
export const SIDEBAR_PERMISSIONS = {
  dashboard: [],
  members: [PERMISSIONS.MEMBERS.READ],
  savings: [PERMISSIONS.PRODUCTS.READ],
  loans: [PERMISSIONS.PRODUCTS.READ],
  insurance: [PERMISSIONS.PRODUCTS.READ],
  groups: [PERMISSIONS.GROUPS.READ],
  transactions: [PERMISSIONS.TRANSACTIONS.READ],
  accounts: [PERMISSIONS.LEDGERS.READ, PERMISSIONS.REPORTS.READ], // Need either ledgers or reports
  logs: [PERMISSIONS.LOGS.READ],
  reconciliations: [PERMISSIONS.TRANSACTIONS.VIEW],
  expenses: [PERMISSIONS.EXPENSES.READ],
  reversals: [PERMISSIONS.TRANSACTIONS.REVERSE],
  profile: [],
  settings: [],
} as const;

/**
 * Helper function to check if a user should see a navigation item
 * Uses "any" logic - user needs at least one of the required permissions
 */
export const canAccessNavItem = (
  navItem: keyof typeof SIDEBAR_PERMISSIONS,
  hasAnyPermission: (codenames: string[]) => boolean
): boolean => {
  const requiredPermissions = SIDEBAR_PERMISSIONS[navItem];
  
  // If no permissions required, allow access
  if (requiredPermissions.length === 0) {
    return true;
  }
  
  // Check if user has any of the required permissions
  return hasAnyPermission([...requiredPermissions]);
};

/**
 * Helper function to check if a user can perform a specific action
 * Uses "all" logic - user needs all the required permissions
 */
export const canPerformAction = (
  action: keyof typeof ACTION_PERMISSIONS,
  hasAllPermissions: (codenames: string[]) => boolean
): boolean => {
  const requiredPermissions = ACTION_PERMISSIONS[action];
  
  // Check if user has all required permissions
  return hasAllPermissions([...requiredPermissions]);
};

