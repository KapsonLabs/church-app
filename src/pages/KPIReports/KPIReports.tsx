import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Plus, ArrowLeft } from 'lucide-react';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { apiService, type KPIReport, type MyKPIPortfolioItem } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ResponsiveTable, type ColumnDefinition } from '@/components/ui/responsive-table';
import { StatusBadgeCell } from '@/components/ui/table-cells';
import { CreateKPIReportModal } from '@/components/modals/CreateKPIReportModal';
import { KPIReportDetailsModal } from '@/components/modals/KPIReportDetailsModal';

export default function KPIReports() {
  const { id: kpiId } = useParams({ strict: false });
  const navigate = useNavigate();
  const [reports, setReports] = useState<KPIReport[]>([]);
  const [kpiInfo, setKpiInfo] = useState<MyKPIPortfolioItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<KPIReport | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchKPIInfo = async () => {
    try {
      const response = await apiService.fetchMyKPIs();
      const kpi = response.data.kpis.find(item => item.kpi.id === kpiId);
      if (kpi) {
        setKpiInfo(kpi);
      }
    } catch (err) {
      console.error('Error fetching KPI info:', err);
    }
  };

  const fetchReports = async () => {
    try {
      setError(null);
      const response = await apiService.fetchKPIReports();
      // Filter reports by KPI ID if provided
      const filteredReports = kpiId 
        ? response.data.filter(report => report.kpi.id === kpiId)
        : response.data;
      setReports(filteredReports);
    } catch (err) {
      console.error('Error fetching KPI reports:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch KPI reports');
      toast({
        title: "Error",
        description: "Failed to fetch KPI reports. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
  };

  useEffect(() => {
    if (kpiId) {
      fetchKPIInfo();
    }
    fetchReports();
  }, [kpiId]);

  const handleReportCreated = () => {
    fetchReports();
    if (kpiId) {
      fetchKPIInfo();
    }
  };

  const handleRowClick = (report: KPIReport) => {
    setSelectedReport(report);
    setIsDetailsModalOpen(true);
  };

  const handleReportUpdated = () => {
    fetchReports();
    if (kpiId) {
      fetchKPIInfo();
    }
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };


  // Define columns
  const columns: ColumnDefinition<KPIReport>[] = [
    {
      key: 'period',
      header: 'Period',
      render: (report) => (
        <div className="text-sm">
          <div className="font-medium">
            {formatDate(report.period_start)} - {formatDate(report.period_end)}
          </div>
        </div>
      ),
    },
    {
      key: 'reported_value',
      header: 'Reported Value',
      render: (report) => (
        <div className="text-sm font-semibold whitespace-nowrap">
          {formatValue(report.reported_value, kpiInfo?.kpi.unit)}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (report) => (
        <StatusBadgeCell
          status={report.status.charAt(0).toUpperCase() + report.status.slice(1)}
          variant={
            report.status === 'approved' ? 'success' : 
            report.status === 'rejected' ? 'error' : 
            report.status === 'submitted' ? 'warning' : 
            'default'
          }
        />
      ),
    },
    {
      key: 'submitted_at',
      header: 'Submitted',
      render: (report) => (
        <div className="text-sm">
          <div>{formatDate(report.submitted_at)}</div>
          {report.submitted_at && (
            <div className="text-xs text-muted-foreground">
              {new Date(report.submitted_at).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          )}
        </div>
      ),
      hideOn: ['sm', 'md'],
    },
    {
      key: 'reviewed_at',
      header: 'Reviewed',
      render: (report) => (
        <div className="text-sm">
          <div>{formatDate(report.reviewed_at)}</div>
          {report.reviewed_at && (
            <div className="text-xs text-muted-foreground">
              {new Date(report.reviewed_at).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          )}
        </div>
      ),
      hideOn: ['sm', 'md'],
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
                <p className="text-muted-foreground">Loading KPI reports...</p>
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
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate({ to: '/kpi-portfolio' })}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Portfolio
                </Button>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    {kpiInfo ? kpiInfo.kpi.name : 'KPI Reports'}
                  </h1>
                  {kpiInfo && (
                    <p className="text-muted-foreground mt-1">
                      {kpiInfo.kpi.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {kpiInfo && (
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Report</span>
                  </Button>
                )}
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
          </div>

          {error ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={fetchReports} variant="outline">
                Try Again
              </Button>
            </div>
          ) : (
            <ResponsiveTable
              data={reports}
              columns={columns}
              loading={refreshing}
              emptyMessage="No reports found. Create your first report to get started."
              hoverable
              getRowKey={(report) => report.id}
              onRowClick={handleRowClick}
            />
          )}

          {isCreateModalOpen && kpiInfo && (
            <CreateKPIReportModal
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              kpiInfo={kpiInfo}
              onSuccess={handleReportCreated}
            />
          )}

          {isDetailsModalOpen && selectedReport && (
            <KPIReportDetailsModal
              isOpen={isDetailsModalOpen}
              onClose={() => {
                setIsDetailsModalOpen(false);
                setSelectedReport(null);
              }}
              report={selectedReport}
              onSuccess={handleReportUpdated}
            />
          )}
        </ResponsiveContainer>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}

