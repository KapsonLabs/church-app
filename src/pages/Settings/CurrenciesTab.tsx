import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, RefreshCw, DollarSign, Globe } from 'lucide-react';
// Note: BranchCurrency API has been removed
// Stub type for build compatibility
type BranchCurrency = any;
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CurrenciesTableV2 } from '@/components/table/currencies-table-v2';

export function CurrenciesTab() {
  const [currencies] = useState<BranchCurrency[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCurrencies = async () => {
    if (!user?.branch?.id) {
      setError('Branch information not available');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      // Note: fetchBranchCurrencies API has been removed
      // const response = await apiService.fetchBranchCurrencies(user.branch.id);
      throw new Error('Currency management has been removed');
    } catch (err) {
      console.error('Error fetching currencies:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch currencies');
      toast({
        title: "Error",
        description: "Failed to fetch currencies. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCurrencies();
  };

  useEffect(() => {
    fetchCurrencies();
  }, [user?.branch?.id]);

  const handleAddCurrency = () => {
    // TODO: Implement add currency functionality
    toast({
      title: "Add Currency",
      description: "Add currency functionality will be implemented soon.",
    });
  };

  const handleEditCurrency = (currencyId: number) => {
    // TODO: Implement edit currency functionality
    toast({
      title: "Edit Currency",
      description: `Edit currency functionality will be implemented for ID: ${currencyId}`,
    });
  };

  const handleDeleteCurrency = (currencyId: number) => {
    // TODO: Implement delete currency functionality
    toast({
      title: "Delete Currency",
      description: `Delete currency functionality will be implemented for ID: ${currencyId}`,
      variant: "destructive",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Currencies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading currencies...</span>
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
            <DollarSign className="h-5 w-5" />
            Currencies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button variant="outline" onClick={fetchCurrencies}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Currencies
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
            <Button size="sm" onClick={handleAddCurrency}>
              <Plus className="h-4 w-4 mr-2" />
              Add Currency
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {currencies.length === 0 ? (
          <div className="text-center py-8">
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No currencies found</h3>
            <p className="text-muted-foreground mb-4">
              No currencies have been configured for this branch yet.
            </p>
            <Button onClick={handleAddCurrency}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Currency
            </Button>
          </div>
        ) : (
          <CurrenciesTableV2
            currencies={currencies}
            loading={false}
            onEdit={handleEditCurrency}
            onDelete={handleDeleteCurrency}
          />
        )}
      </CardContent>
    </Card>
  );
}
