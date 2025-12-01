import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Search, Shield, ChevronDown, ChevronUp, Eye, FileText } from 'lucide-react';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { apiService, type Policy } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function Policies() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [filteredPolicies, setFilteredPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPolicies, setExpandedPolicies] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const togglePolicy = (policyId: string) => {
    setExpandedPolicies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(policyId)) {
        newSet.delete(policyId);
      } else {
        newSet.add(policyId);
      }
      return newSet;
    });
  };

  const fetchPolicies = async (forceRefresh: boolean = false) => {
    if (policies.length > 0 && !forceRefresh) {
      return;
    }

    try {
      if (forceRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      const response = await apiService.fetchPolicies();
      setPolicies(response.data || []);
      setFilteredPolicies(response.data || []);
    } catch (error) {
      console.error('Error fetching Policies:', error);
      toast({
        title: 'Error',
        description: 'Failed to load Policies. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPolicies(false);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPolicies(policies);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = policies.filter(policy => 
      policy.title.toLowerCase().includes(query) ||
      policy.content.toLowerCase().includes(query) ||
      policy.category.name.toLowerCase().includes(query) ||
      policy.tags.some(tag => tag.name.toLowerCase().includes(query)) ||
      policy.policy_reference.toLowerCase().includes(query)
    );
    setFilteredPolicies(filtered);
  }, [searchQuery, policies]);

  const handleRefresh = async () => {
    await fetchPolicies(true);
  };

  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <div className="p-4 md:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-primary" />
                  <h1 className="text-2xl md:text-3xl font-bold">Policies</h1>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search Policies by title, content, category, tags, or reference..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            )}

            {/* Policies List */}
            {!isLoading && (
              <>
                {filteredPolicies.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-gray-500 dark:text-gray-400">
                        {searchQuery ? 'No Policies found matching your search.' : 'No Policies available.'}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredPolicies.map((policy) => {
                      const isExpanded = expandedPolicies.has(policy.id);
                      return (
                        <Card 
                          key={policy.id} 
                          className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-primary"
                        >
                          <CardHeader 
                            className="cursor-pointer pb-3"
                            onClick={() => togglePolicy(policy.id)}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <CardTitle className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                                  {policy.title}
                                </CardTitle>
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {policy.category.name}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                                    <FileText className="h-3 w-3" />
                                    {policy.policy_reference}
                                  </Badge>
                                  {policy.tags.map((tag) => (
                                    <Badge key={tag.id} variant="outline" className="text-xs">
                                      {tag.name}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                {isExpanded ? (
                                  <ChevronUp className="h-5 w-5 text-gray-400" />
                                ) : (
                                  <ChevronDown className="h-5 w-5 text-gray-400" />
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          {isExpanded && (
                            <CardContent className="pt-0 pb-4">
                              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed mb-4">
                                  {policy.content}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-800">
                                  <div className="flex items-center gap-1">
                                    <Eye className="h-4 w-4" />
                                    <span>{policy.view_count} views</span>
                                  </div>
                                  {policy.published_at && (
                                    <span>
                                      Published {new Date(policy.published_at).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}
