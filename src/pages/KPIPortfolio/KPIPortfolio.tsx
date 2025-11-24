import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Target, AlertCircle } from 'lucide-react';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { apiService, type MyKPIPortfolioItem } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

export default function KPIPortfolio() {
  const [portfolioData, setPortfolioData] = useState<MyKPIPortfolioItem[]>([]);
  const [averagePerformance, setAveragePerformance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchMyKPIs = async () => {
    try {
      setError(null);
      const response = await apiService.fetchMyKPIs();
      setPortfolioData(response.data.kpis);
      setAveragePerformance(response.data.average_performance);
    } catch (err) {
      console.error('Error fetching my KPIs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch KPI portfolio');
      toast({
        title: "Error",
        description: "Failed to fetch KPI portfolio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMyKPIs();
  };

  useEffect(() => {
    fetchMyKPIs();
  }, []);

  const formatValue = (value: number | null | undefined, unit: string) => {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    
    if (unit === 'percentage') {
      return `${value.toFixed(2)}%`;
    } else if (unit === 'UGX' || unit === 'USD') {
      return `${unit} ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (unit === 'hours') {
      return `${value.toFixed(2)} hrs`;
    } else {
      return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AuthenticatedLayout>
          <ResponsiveContainer>
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Loading KPI portfolio...</p>
              </div>
            </div>
          </ResponsiveContainer>
        </AuthenticatedLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <AuthenticatedLayout>
          <ResponsiveContainer>
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={fetchMyKPIs} variant="outline">
                  Try Again
                </Button>
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
              <div>
                <h1 className="text-2xl font-bold tracking-tight">KPI Portfolio</h1>
                <p className="text-muted-foreground mt-1">
                  View and track your assigned KPIs
                </p>
              </div>
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

            {/* Average Performance Card */}
            {portfolioData.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Average Performance</p>
                      <p className={`text-3xl font-bold mt-1 ${getPerformanceColor(averagePerformance)}`}>
                        {averagePerformance.toFixed(2)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total KPIs</p>
                      <p className="text-2xl font-semibold mt-1">{portfolioData.length}</p>
                    </div>
                  </div>
                  <Progress value={averagePerformance} className="mt-4" />
                </CardContent>
              </Card>
            )}
          </div>

          {/* KPI Cards */}
          {portfolioData.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No KPIs Assigned</h3>
                  <p className="text-muted-foreground">
                    You don't have any KPIs assigned to you yet.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {portfolioData.map((item) => (
                <Card
                  key={item.kpi.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate({ to: `/kpi-reports/${item.kpi.id}` })}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{item.kpi.name}</CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.kpi.description}
                        </p>
                      </div>
                      <Badge variant={item.is_on_track ? 'default' : 'secondary'}>
                        {item.is_on_track ? 'On Track' : 'Off Track'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Achievement</p>
                        <p className={`text-lg font-bold mt-1 ${getPerformanceColor(item.achievement_percentage)}`}>
                          {item.achievement_percentage.toFixed(1)}%
                        </p>
                        <Progress 
                          value={item.achievement_percentage} 
                          className="mt-2 h-2"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Current Value</p>
                        <p className="text-lg font-semibold mt-1">
                          {formatValue(item.current_period_value ?? item.latest_value, item.kpi.unit)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Target: {formatValue(item.target_value, item.kpi.unit)}
                        </p>
                      </div>
                    </div>

                    {/* Additional Stats */}
                    <div className="grid grid-cols-3 gap-3 pt-2 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">Average</p>
                        <p className="text-sm font-medium mt-0.5">
                          {formatValue(item.average_value, item.kpi.unit)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Entries</p>
                        <p className="text-sm font-medium mt-0.5">{item.total_entries}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Pending</p>
                        <p className="text-sm font-medium mt-0.5">
                          {item.pending_reports_count > 0 ? (
                            <span className="text-orange-600 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {item.pending_reports_count}
                            </span>
                          ) : (
                            <span className="text-green-600">0</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Period Info */}
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-1">Current Period</p>
                      <p className="text-xs">
                        {formatDate(item.current_period_start)} - {formatDate(item.current_period_end)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ResponsiveContainer>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}

