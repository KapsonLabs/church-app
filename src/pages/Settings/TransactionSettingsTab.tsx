import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Settings, Currency, Plus } from 'lucide-react';
// Note: TransactionSetting API has been removed
// Stub type for build compatibility
type TransactionSetting = any;
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ResponsiveTable, type ColumnDefinition } from '@/components/ui/responsive-table';
import { TableActions, type TableAction } from '@/components/ui/table-actions';
import { 
  StatusBadgeCell, 
  DateCell,
  TextWithIconCell,
} from '@/components/ui/table-cells';
import { formatCurrency } from '@/lib/utils';
import { EditTransactionSettingsModal } from '@/components/modals/EditTransactionSettingsModal';
import { PermissionGuard, usePermission } from '@/components/auth/PermissionGuard';
import { PERMISSIONS } from '@/lib/permissions';

export function TransactionSettingsTab() {
  const [settings] = useState<TransactionSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<TransactionSetting | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const canCreateTransactionSettings = usePermission([PERMISSIONS.TRANSACTIONS.CREATE_TRANSACTION_SETTINGS], 'any');

  const fetchSettings = async () => {
    if (!user?.branch?.id) {
      setError('Branch information not available');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      // Note: fetchTransactionSettings API has been removed
      // const response = await apiService.fetchTransactionSettings(user.branch.id);
      throw new Error('Transaction settings management has been removed');
    } catch (err) {
      console.error('Error fetching transaction settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction settings');
      toast({
        title: "Error",
        description: "Failed to fetch transaction settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSettings();
  };

  const handleAddSetting = () => {
    setSelectedSetting(null);
    setIsModalOpen(true);
  };

  const handleEditSetting = (setting: TransactionSetting) => {
    setSelectedSetting(setting);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedSetting(null);
  };

  const handleModalSuccess = () => {
    fetchSettings();
  };

  useEffect(() => {
    fetchSettings();
  }, [user?.branch?.id]);

  // Define columns
  const columns: ColumnDefinition<TransactionSetting>[] = [
    {
      key: 'transaction_type',
      header: 'Transaction Type',
      render: (setting) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {setting.transaction_type_display}
        </div>
      ),
      width: 'min-w-[180px]',
    },
    {
      key: 'requires_approval',
      header: 'Approval Required',
      render: (setting) => (
        <StatusBadgeCell
          status={setting.requires_approval ? 'Yes' : 'No'}
          variant={setting.requires_approval ? 'warning' : 'success'}
        />
      ),
    },
    {
      key: 'approval_limit',
      header: 'Approval Limit',
      render: (setting) => {
        if (!setting.requires_approval) {
          return <span className="text-sm text-gray-500 dark:text-gray-400">—</span>;
        }
        const amount = parseFloat(setting.approval_limit_amount);
        return (
          <TextWithIconCell
            icon={Currency}
            text={`${setting.currency_code} ${formatCurrency(amount)}`}
            iconColor="text-green-500"
          />
        );
      },
      hideOn: ['sm'],
    },
    {
      key: 'created_by',
      header: 'Created By',
      render: (setting) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {setting.created_by_username}
        </span>
      ),
      hideOn: ['sm', 'md'],
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (setting) => (
        <DateCell
          date={setting.created_at}
          format="short"
          showIcon={true}
        />
      ),
      hideOn: ['sm', 'md'],
    },
  ];

  // Define actions for each row
  const getRowActions = (setting: TransactionSetting): TableAction[] => {
    const actions: TableAction[] = [];
    
    if (canCreateTransactionSettings) {
      actions.push({
        key: 'edit',
        label: 'Edit Settings',
        icon: Settings,
        onClick: () => handleEditSetting(setting),
      });
    }
    
    return actions;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Transaction Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading transaction settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Transaction Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button variant="outline" onClick={fetchSettings}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Transaction Settings
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
              <PermissionGuard permissions={PERMISSIONS.TRANSACTIONS.CREATE_TRANSACTION_SETTINGS}>
                <Button size="sm" onClick={handleAddSetting}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Setting
                </Button>
              </PermissionGuard>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {settings.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No transaction settings found</h3>
              <p className="text-muted-foreground mb-4">
                No transaction settings have been configured for this branch yet.
              </p>
              <PermissionGuard permissions={PERMISSIONS.TRANSACTIONS.CREATE_TRANSACTION_SETTINGS}>
                <Button onClick={handleAddSetting}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Setting
                </Button>
              </PermissionGuard>
            </div>
          ) : (
            <ResponsiveTable
              data={settings}
              columns={columns}
              actions={(setting) => (
                <TableActions actions={getRowActions(setting)} />
              )}
              loading={false}
              emptyMessage="No transaction settings found."
              hoverable
              getRowKey={(setting) => String(setting.id)}
              minWidth="800px"
            />
          )}
        </CardContent>
      </Card>

      {/* Edit Transaction Settings Modal */}
      {user?.branch?.id && (
        <EditTransactionSettingsModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
          branchId={parseInt(user.branch.id, 10)}
          transactionSetting={selectedSetting || undefined}
        />
      )}
    </>
  );
}
