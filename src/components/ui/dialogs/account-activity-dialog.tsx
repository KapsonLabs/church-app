import React from 'react';
import { type MemberAccountDetails } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AccountActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: MemberAccountDetails | null;
}

export function AccountActivityDialog({
  open,
  onOpenChange,
  account,
}: AccountActivityDialogProps) {
  if (!account) return null;

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Account Activity - {account.account_number}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Number</p>
              <p className="text-lg font-mono">{account.account_number}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Product</p>
              <p className="text-lg">{account.product_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Group</p>
              <p className="text-lg">{account.group_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Product Type</p>
              <p className="text-lg">{account.product_type_display}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Balance</p>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                {account.balance.currency} {parseFloat(account.balance.current_balance).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Available Balance</p>
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {account.balance.currency} {parseFloat(account.balance.available_balance).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
              <Badge
                className={cn(
                  'text-xs',
                  account.is_active && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                  !account.is_active && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                )}
              >
                {account.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</p>
              <p className="text-lg">{formatDate(account.created_at)}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

