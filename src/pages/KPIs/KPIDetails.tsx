import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Loader2, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Target,
  BarChart3
} from 'lucide-react';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { apiService, type KPI, type KPITrendsResponse } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

export default function KPIDetails() {
  const { id } = useParams({ strict: false });
  const navigate = useNavigate();
  const { toast } = useToast();
  const [kpi, setKpi] = useState<KPI | null>(null);
  const [trendsData, setTrendsData] = useState<KPITrendsResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKPIDetails = async () => {
    if (!id) return;

    try {
      setError(null);
      const [detailsResponse, trendsResponse] = await Promise.all([
        apiService.fetchKPIDetails(id),
        apiService.fetchKPITrends(id),
      ]);
      
      setKpi(detailsResponse.data);
      setTrendsData(trendsResponse.data);
    } catch (err) {
      console.error('Error fetching KPI details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch KPI details');
      toast({
        title: "Error",
        description: "Failed to load KPI details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchKPIDetails();
  };

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchKPIDetails();
    }
  }, [id]);

  const formatValue = (value: number | string | null | undefined, unit: string) => {
    // Early return for null/undefined
    if (value === null || value === undefined) {
      return 'N/A';
    }
    
    // Convert to number
    let numValue: number;
    if (typeof value === 'string') {
      numValue = parseFloat(value);
    } else {
      numValue = value;
    }
    
    // Check if numValue is null, undefined, or not a valid number
    if (numValue === null || numValue === undefined || typeof numValue !== 'number' || isNaN(numValue)) {
      return 'N/A';
    }
    
    // Now safe to call number methods
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

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AuthenticatedLayout>
          <ResponsiveContainer>
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Loading KPI details...</p>
              </div>
            </div>
          </ResponsiveContainer>
        </AuthenticatedLayout>
      </ProtectedRoute>
    );
  }

  if (error || !kpi || !trendsData) {
    return (
      <ProtectedRoute>
        <AuthenticatedLayout>
          <ResponsiveContainer>
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <p className="text-destructive mb-4">{error || 'KPI not found'}</p>
                <Button onClick={fetchKPIDetails} variant="outline">
                  Try Again
                </Button>
              </div>
            </div>
          </ResponsiveContainer>
        </AuthenticatedLayout>
      </ProtectedRoute>
    );
  }

  const stats = trendsData?.statistics;
  const trends = trendsData?.trends || [];
  
  // Safety check - if stats is not available, show error
  if (!stats) {
    return (
      <ProtectedRoute>
        <AuthenticatedLayout>
          <ResponsiveContainer>
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <p className="text-destructive mb-4">Statistics data not available</p>
                <Button onClick={fetchKPIDetails} variant="outline">
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: '/kpis' })}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to KPIs
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{kpi.name}</h1>
                <p className="text-muted-foreground">{kpi.description}</p>
              </div>
            </div>
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
          </div>

          <div className="space-y-6">
            {/* Top Row - KPI Information and Statistics side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* KPI Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    KPI Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Source Type</span>
                      <Badge variant={kpi.source_type === 'manual' ? 'default' : 'secondary'}>
                        {kpi.source_type}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Period</span>
                      <Badge variant="outline">{kpi.period}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Unit</span>
                      <Badge variant="outline">{kpi.unit}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge variant={kpi.is_active ? 'default' : 'secondary'}>
                        {kpi.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Target Value</span>
                      <span className="text-sm font-semibold">{formatValue(kpi.target_value, kpi.unit)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Minimum</span>
                      <span className="text-sm">{formatValue(kpi.minimum_value, kpi.unit)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Maximum</span>
                      <span className="text-sm">{formatValue(kpi.maximum_value, kpi.unit)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Created By</span>
                      <span className="text-sm">{kpi.created_by.first_name} {kpi.created_by.last_name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Created</span>
                      <span className="text-sm">{formatDate(kpi.created_at)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Current Value</span>
                      <span className="text-lg font-bold">{formatValue(stats.current_value, kpi.unit)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Average</span>
                      <span className="text-sm font-semibold">{formatValue(stats.average_value, kpi.unit)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Min</span>
                      <span className="text-sm">{formatValue(stats.min_value, kpi.unit)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Max</span>
                      <span className="text-sm">{formatValue(stats.max_value, kpi.unit)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Periods</span>
                      <span className="text-sm font-semibold">{stats.total_periods}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Overall Change</span>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(stats.trend_direction)}
                        {stats.overall_change_percentage !== null && stats.overall_change_percentage !== undefined ? (
                          <span className={`text-sm font-semibold ${
                            stats.overall_change_percentage > 0 ? 'text-green-600' : 
                            stats.overall_change_percentage < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {stats.overall_change_percentage > 0 ? '+' : ''}
                            {stats.overall_change_percentage.toFixed(2)}%
                          </span>
                        ) : (
                          <span className="text-sm font-semibold text-gray-600">N/A</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bottom Row - Trends (full width) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trends.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No trend data available</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {trends.map((trend, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            <div className="min-w-[100px] text-right flex-shrink-0">
                              <p className="text-sm font-semibold whitespace-nowrap">{formatValue(trend.value, kpi.unit)}</p>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{trend.period_label}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {formatDate(trend.period_start)} - {formatDate(trend.period_end)}
                              </p>
                            </div>
                          </div>
                          {trend.percentage_change !== null && trend.percentage_change !== undefined && (
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {trend.is_increase ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                              )}
                              <span className={`text-sm font-medium whitespace-nowrap ${
                                trend.is_increase ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {trend.is_increase ? '+' : ''}
                                {typeof trend.percentage_change === 'number' ? trend.percentage_change.toFixed(2) : 'N/A'}%
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </ResponsiveContainer>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}

