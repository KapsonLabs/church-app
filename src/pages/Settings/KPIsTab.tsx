import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, RefreshCw, TrendingUp } from 'lucide-react';
import { apiService, type KPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ResponsiveTable, type ColumnDefinition } from '@/components/ui/responsive-table';
import { StatusBadgeCell } from '@/components/ui/table-cells';
import { Badge } from '@/components/ui/badge';
import { CreateKPIModal } from '@/components/modals/CreateKPIModal';

export function KPIsTab() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchKPIs = async () => {
    if (!user?.branch?.organization_id || !user?.branch?.id) {
      setError('Organization or branch information not available');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await apiService.fetchKPIs(user.branch.organization_id, user.branch.id);
      setKpis(response.data);
    } catch (err) {
      console.error('Error fetching KPIs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch KPIs');
      toast({
        title: "Error",
        description: "Failed to fetch KPIs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchKPIs();
  };

  useEffect(() => {
    fetchKPIs();
  }, [user?.branch?.organization_id, user?.branch?.id]);

  const handleKPICreated = () => {
    fetchKPIs();
  };

  const getSourceTypeBadge = (sourceType: string) => {
    const config = sourceType === 'manual' 
      ? { label: 'Manual', className: 'bg-blue-100 text-blue-800' }
      : { label: 'Aggregate', className: 'bg-purple-100 text-purple-800' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPeriodBadge = (period: string) => {
    const periodMap: Record<string, { label: string; className: string }> = {
      daily: { label: 'Daily', className: 'bg-green-100 text-green-800' },
      weekly: { label: 'Weekly', className: 'bg-yellow-100 text-yellow-800' },
      monthly: { label: 'Monthly', className: 'bg-blue-100 text-blue-800' },
      quarterly: { label: 'Quarterly', className: 'bg-orange-100 text-orange-800' },
      yearly: { label: 'Yearly', className: 'bg-red-100 text-red-800' },
    };
    const config = periodMap[period] || { label: period, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatValue = (value: string, unit: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return value;
    
    if (unit === 'percentage') {
      return `${numValue.toFixed(2)}%`;
    } else if (unit === 'UGX' || unit === 'USD') {
      return `${unit} ${numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (unit === 'hours') {
      return `${numValue.toFixed(2)} hrs`;
    } else {
      return numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  };

  // Define columns
  const columns: ColumnDefinition<KPI>[] = [
    {
      key: 'name',
      header: 'KPI Name',
      render: (kpi) => (
        <div className="min-w-0">
          <div className="font-medium text-sm">{kpi.name}</div>
          <div className="text-xs text-muted-foreground truncate max-w-[300px]">
            {kpi.description}
          </div>
        </div>
      ),
      width: 'min-w-[250px]',
    },
    {
      key: 'source_type',
      header: 'Source',
      render: (kpi) => getSourceTypeBadge(kpi.source_type),
      hideOn: ['sm'],
    },
    {
      key: 'period',
      header: 'Period',
      render: (kpi) => getPeriodBadge(kpi.period),
      hideOn: ['sm', 'md'],
    },
    {
      key: 'target',
      header: 'Target',
      render: (kpi) => (
        <div className="text-sm font-medium">
          {formatValue(kpi.target_value, kpi.unit)}
        </div>
      ),
    },
    {
      key: 'range',
      header: 'Range',
      render: (kpi) => (
        <div className="text-xs text-muted-foreground">
          {formatValue(kpi.minimum_value, kpi.unit)} - {formatValue(kpi.maximum_value, kpi.unit)}
        </div>
      ),
      hideOn: ['sm', 'md'],
    },
    {
      key: 'entries',
      header: 'Entries',
      render: (kpi) => (
        <div className="text-sm">
          {kpi.entries_count}
        </div>
      ),
      hideOn: ['sm'],
    },
    {
      key: 'status',
      header: 'Status',
      render: (kpi) => (
        <StatusBadgeCell
          status={kpi.is_active ? 'Active' : 'Inactive'}
          variant={kpi.is_active ? 'success' : 'warning'}
        />
      ),
    },
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading KPIs...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchKPIs} variant="outline">
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
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <CardTitle>Key Performance Indicators</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create KPI</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveTable
            data={kpis}
            columns={columns}
            loading={refreshing}
            emptyMessage="No KPIs found. Create your first KPI to start tracking performance."
            hoverable
            getRowKey={(kpi) => kpi.id}
            minWidth="900px"
          />
        </CardContent>
      </Card>

      {isCreateModalOpen && (
        <CreateKPIModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleKPICreated}
        />
      )}
    </>
  );
}

