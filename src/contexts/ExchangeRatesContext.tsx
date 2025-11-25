import { createContext, useContext, useState, useEffect, type ReactNode, useCallback, useRef } from 'react';
import { apiService, type DailyExchangeRate } from '@/lib/api';
import { useAuth } from './AuthContext';

interface ExchangeRatesContextType {
  exchangeRatesAvailable: boolean;
  exchangeRates: DailyExchangeRate[];
  getExchangeRate: (currencyCode: string) => DailyExchangeRate | null;
  refreshExchangeRatesStatus: (date?: string) => Promise<void>;
  loading: boolean;
}

const ExchangeRatesContext = createContext<ExchangeRatesContextType | undefined>(undefined);

interface ExchangeRatesProviderProps {
  children: ReactNode;
}

export const ExchangeRatesProvider: React.FC<ExchangeRatesProviderProps> = ({ children }) => {
  const [exchangeRatesAvailable, setExchangeRatesAvailable] = useState(false);
  const [exchangeRates, setExchangeRates] = useState<DailyExchangeRate[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const pollingIntervalRef = useRef<number | null>(null);

  const refreshExchangeRatesStatus = useCallback(async (date?: string) => {
    if (!user?.branch?.id) {
      setExchangeRatesAvailable(false);
      setExchangeRates([]);
      return;
    }

    try {
      setLoading(true);
      const currentDate = date || new Date().toISOString().split('T')[0];
      
      // Check status first
      const statusResponse = await apiService.fetchExchangeRatesStatus(parseInt(user.branch.id, 10), currentDate);
      const available = statusResponse.status === 1;
      setExchangeRatesAvailable(available);
      
      // If rates are available, fetch them
      if (available) {
        const ratesResponse = await apiService.fetchDailyExchangeRates(parseInt(user.branch.id, 10), currentDate);
        setExchangeRates(ratesResponse.rates || []);
      } else {
        setExchangeRates([]);
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      setExchangeRatesAvailable(false);
      setExchangeRates([]);
    } finally {
      setLoading(false);
    }
  }, [user?.branch?.id]);

  const getExchangeRate = (currencyCode: string): DailyExchangeRate | null => {
    return exchangeRates.find(rate => rate.currency_code === currencyCode) || null;
  };

  useEffect(() => {
    if (!user?.branch?.id) {
      setExchangeRatesAvailable(false);
      setExchangeRates([]);
      if (pollingIntervalRef.current) {
        window.clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    const runRefresh = async () => {
      await refreshExchangeRatesStatus();
    };

    runRefresh();

    if (pollingIntervalRef.current) {
      window.clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = window.setInterval(() => {
      refreshExchangeRatesStatus();
    }, 15000);

    return () => {
      if (pollingIntervalRef.current) {
        window.clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [user?.branch?.id, refreshExchangeRatesStatus]);

  return (
    <ExchangeRatesContext.Provider value={{
      exchangeRatesAvailable,
      exchangeRates,
      getExchangeRate,
      refreshExchangeRatesStatus,
      loading
    }}>
      {children}
    </ExchangeRatesContext.Provider>
  );
};

export const useExchangeRates = () => {
  const context = useContext(ExchangeRatesContext);
  if (context === undefined) {
    throw new Error('useExchangeRates must be used within an ExchangeRatesProvider');
  }
  return context;
};
