import { useState, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { apiService, type KPIApproval, type KPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ResponsiveTable, type ColumnDefinition } from '@/components/ui/responsive-table';
import { StatusBadgeCell } from '@/components/ui/table-cells';
import { ApprovalDetailsModal } from '@/components/modals/ApprovalDetailsModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export default function Approvals() {
  const navigate = useNavigate();
  const searchParams = useSearch({ strict: false }) as { status?: string; kpi_id?: string };
  const [approvals, setApprovals] = useState<KPIApproval[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedApproval, setSelectedApproval] = useState<KPIApproval | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'submitted' | 'approved' | 'rejected'>(
    (searchParams?.status as 'submitted' | 'approved' | 'rejected') || 'submitted'
  );
  const [kpiFilter, setKpiFilter] = useState<string>(searchParams?.kpi_id || '');
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchKPIs = async () => {
    if (!user?.branch?.organization_id || !user?.branch?.id) {
      return;
    }

    try {
      const response = await apiService.fetchKPIs(user.branch.organization_id, user.branch.id);
      setKpis(response.data);
    } catch (err) {
      console.error('Error fetching KPIs:', err);
    }
  };

  const fetchApprovals = async () => {
    if (!user?.branch?.organization_id) {
      setError('Organization information not available');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await apiService.fetchKPIApprovals(
        user.branch.organization_id, 
        statusFilter,
        kpiFilter || undefined
      );
      setApprovals(response.data);
    } catch (err) {
      console.error('Error fetching approvals:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch approvals');
      toast({
        title: "Error",
        description: "Failed to fetch approvals. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchApprovals();
  };

  const handleStatusChange = (value: string) => {
    const newStatus = value as 'submitted' | 'approved' | 'rejected';
    setStatusFilter(newStatus);
    navigate({
      to: '/approvals',
      search: { status: newStatus, kpi_id: kpiFilter || undefined } as any,
    });
  };

  const handleKpiChange = (value: string) => {
    const newKpiId = value === 'all' ? '' : value;
    setKpiFilter(newKpiId);
    navigate({
      to: '/approvals',
      search: { status: statusFilter, kpi_id: newKpiId || undefined } as any,
    });
  };

  useEffect(() => {
    fetchKPIs();
  }, [user?.branch?.organization_id, user?.branch?.id]);

  useEffect(() => {
    if (searchParams?.status) {
      setStatusFilter(searchParams.status as 'submitted' | 'approved' | 'rejected');
    }
    if (searchParams?.kpi_id) {
      setKpiFilter(searchParams.kpi_id);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchApprovals();
  }, [user?.branch?.organization_id, statusFilter, kpiFilter]);

  const handleRowClick = (approval: KPIApproval) => {
    setSelectedApproval(approval);
    setIsModalOpen(true);
  };

  const handleApprovalSuccess = () => {
    setIsModalOpen(false);
    setSelectedApproval(null);
    fetchApprovals();
  };

  const formatValue = (value: string, unit?: string) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Define columns
  const columns: ColumnDefinition<KPIApproval>[] = [
    {
      key: 'kpi',
      header: 'KPI',
      render: (approval) => (
        <div className="min-w-0 max-w-[200px]">
          <div className="font-medium text-sm truncate">{approval.kpi.name}</div>
        </div>
      ),
    },
    {
      key: 'reported_by',
      header: 'Reported By',
      render: (approval) => (
        <div className="text-sm">
          <div className="font-medium">
            {approval.reported_by.first_name} {approval.reported_by.last_name}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {approval.reported_by.email}
          </div>
        </div>
      ),
      hideOn: ['sm', 'md'],
    },
    {
      key: 'period',
      header: 'Period',
      render: (approval) => (
        <div className="text-sm">
          <div className="font-medium">
            {formatDate(approval.period_start)} - {formatDate(approval.period_end)}
          </div>
        </div>
      ),
      hideOn: ['sm'],
    },
    {
      key: 'reported_value',
      header: 'Value',
      render: (approval) => (
        <div className="text-sm font-semibold whitespace-nowrap">
          {formatValue(approval.reported_value)}
        </div>
      ),
    },
    {
      key: 'submitted_at',
      header: 'Submitted',
      render: (approval) => (
        <div className="text-sm">
          <div>{formatDate(approval.submitted_at)}</div>
          <div className="text-xs text-muted-foreground">
            {new Date(approval.submitted_at).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      ),
      hideOn: ['sm', 'md'],
    },
    {
      key: 'status',
      header: 'Status',
      render: (approval) => (
        <StatusBadgeCell
          status={approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
          variant={approval.status === 'approved' ? 'success' : approval.status === 'rejected' ? 'error' : 'warning'}
        />
      ),
    },
  ];

  if (loading) {
    return (
      <ProtectedRoute>
        <AuthenticatedLayout>
          <ResponsiveContainer>
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Loading approvals...</p>
              </div>
            </div>
          </ResponsiveContainer>
        </AuthenticatedLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <ResponsiveContainer>
          {/* Header */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight">Approvals</h1>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </Button>
              </div>
            </div>
            <p className="text-muted-foreground">
              Review and approve KPI reports submitted by team members.
            </p>

            {/* Filters */}
            <div className="flex items-end gap-4 pt-2">
              <div className="flex-1 max-w-xs">
                <Label htmlFor="status-filter" className="text-xs mb-2">Status</Label>
                <Select value={statusFilter} onValueChange={handleStatusChange}>
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 max-w-xs">
                <Label htmlFor="kpi-filter" className="text-xs mb-2">KPI</Label>
                <Select value={kpiFilter || 'all'} onValueChange={handleKpiChange}>
                  <SelectTrigger id="kpi-filter">
                    <SelectValue placeholder="All KPIs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All KPIs</SelectItem>
                    {kpis.map((kpi) => (
                      <SelectItem key={kpi.id} value={kpi.id}>
                        {kpi.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {error ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={fetchApprovals} variant="outline">
                Try Again
              </Button>
            </div>
          ) : (
            <ResponsiveTable
              data={approvals}
              columns={columns}
              loading={refreshing}
              emptyMessage="No pending approvals found."
              hoverable
              getRowKey={(approval) => approval.id}
              onRowClick={handleRowClick}
            />
          )}

          {isModalOpen && selectedApproval && (
            <ApprovalDetailsModal
              isOpen={isModalOpen}
              onClose={() => {
                setIsModalOpen(false);
                setSelectedApproval(null);
              }}
              approval={selectedApproval}
              onSuccess={handleApprovalSuccess}
            />
          )}
        </ResponsiveContainer>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}

