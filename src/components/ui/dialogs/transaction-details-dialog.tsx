import React from 'react';
import { type MemberTransaction } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface TransactionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: MemberTransaction | null;
}

export function TransactionDetailsDialog({
  open,
  onOpenChange,
  transaction,
}: TransactionDetailsDialogProps) {
  if (!transaction) return null;

  const formatCurrency = (amount: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionTypeColor = (transactionType: string): string => {
    const type = transactionType.toLowerCase();
    if (type.includes('deposit') || type.includes('credit')) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    } else if (type.includes('withdrawal') || type.includes('debit')) {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    } else if (type.includes('transfer')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    } else if (type.includes('fee')) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    } else {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string): string => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('completed') || statusLower.includes('success')) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    } else if (statusLower.includes('pending') || statusLower.includes('processing')) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    } else if (statusLower.includes('failed') || statusLower.includes('error')) {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    } else {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('completed') || statusLower.includes('success')) {
      return <CheckCircle className="h-4 w-4" />;
    } else if (statusLower.includes('pending') || statusLower.includes('processing')) {
      return <Clock className="h-4 w-4" />;
    } else if (statusLower.includes('failed') || statusLower.includes('error')) {
      return <XCircle className="h-4 w-4" />;
    } else {
      return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Transaction Details - {transaction.transaction_number}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Transaction Number</p>
              <p className="text-lg font-mono">{transaction.transaction_number}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Number</p>
              <p className="text-lg font-mono">{transaction.account_number}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Product</p>
              <p className="text-lg">{transaction.product_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Transaction Type</p>
              <Badge className={cn('text-xs', getTransactionTypeColor(transaction.transaction_type_display))}>
                {transaction.transaction_type_display}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Method</p>
              <p className="text-lg">{transaction.transaction_method_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
              <Badge className={cn('text-xs flex items-center gap-1 w-fit', getStatusColor(transaction.status_display))}>
                {getStatusIcon(transaction.status_display)}
                {transaction.status_display}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount</p>
              <p
                className={cn(
                  'text-lg font-medium',
                  transaction.is_credit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                )}
              >
                {transaction.is_credit ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Fee</p>
              <p className="text-lg">{formatCurrency(transaction.fee_amount)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Amount</p>
              <p className="text-lg font-semibold">{formatCurrency(transaction.total_amount)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date & Time</p>
              <p className="text-lg">{formatDate(transaction.created_at)}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

