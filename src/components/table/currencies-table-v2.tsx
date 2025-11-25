import React from 'react';
import { Edit, Trash2, DollarSign, Building } from 'lucide-react';
// Note: BranchCurrency API has been removed
// Stub type for build compatibility
type BranchCurrency = any;
import { ResponsiveTable, type ColumnDefinition } from '@/components/ui/responsive-table';
import { TableActions, type TableAction } from '@/components/ui/table-actions';
import { 
  StatusBadgeCell, 
  MultiLineCell,
  TextWithIconCell,
} from '@/components/ui/table-cells';

interface CurrenciesTableV2Props {
  currencies: BranchCurrency[];
  onEdit: (currencyId: number) => void;
  onDelete: (currencyId: number) => void;
  loading?: boolean;
}

export const CurrenciesTableV2: React.FC<CurrenciesTableV2Props> = ({ 
  currencies, 
  onEdit,
  onDelete,
  loading = false,
}) => {

  // Define columns
  const columns: ColumnDefinition<BranchCurrency>[] = [
    {
      key: 'id',
      header: 'ID',
      render: (currency) => (
        <span className="font-medium text-sm">{currency.id}</span>
      ),
      width: 'w-[80px]',
      hideOn: ['sm'],
    },
    {
      key: 'currency_code',
      header: 'Currency',
      render: (currency) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <DollarSign className="h-4 w-4 text-primary" />
          </div>
          <MultiLineCell
            primary={currency.currency_code}
            secondary={currency.currency_name}
            primaryClassName="font-bold text-base"
          />
        </div>
      ),
      width: 'min-w-[150px]',
    },
    {
      key: 'branch',
      header: 'Branch',
      render: (currency) => (
        <TextWithIconCell
          icon={Building}
          text={currency.branch_name}
          subtitle={`ID: ${currency.branch}`}
          iconColor="text-blue-500"
        />
      ),
      hideOn: ['sm', 'md'],
    },
    {
      key: 'status',
      header: 'Status',
      render: (currency) => (
        <StatusBadgeCell
          status="Active"
          variant="success"
        />
      ),
    },
  ];

  // Define actions for each row
  const getRowActions = (currency: BranchCurrency): TableAction[] => [
    {
      key: 'edit',
      label: 'Edit Currency',
      icon: Edit,
      onClick: () => onEdit(currency.id),
    },
    {
      key: 'delete',
      label: 'Delete Currency',
      icon: Trash2,
      onClick: () => onDelete(currency.id),
      variant: 'destructive',
    },
  ];

  return (
    <ResponsiveTable
      data={currencies}
      columns={columns}
      actions={(currency) => (
        <TableActions actions={getRowActions(currency)} />
      )}
      loading={loading}
      emptyMessage="No currencies found. Add your first currency to get started."
      hoverable
      getRowKey={(currency) => String(currency.id)}
      minWidth="500px"
      compact={true}
    />
  );
};

