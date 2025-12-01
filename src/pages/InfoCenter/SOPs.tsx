import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Search, BookOpen, ChevronDown, ChevronUp, Eye, CheckCircle2 } from 'lucide-react';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { apiService, type SOP } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function SOPs() {
  const [sops, setSops] = useState<SOP[]>([]);
  const [filteredSops, setFilteredSops] = useState<SOP[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSOPs, setExpandedSOPs] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const toggleSOP = (sopId: string) => {
    setExpandedSOPs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sopId)) {
        newSet.delete(sopId);
      } else {
        newSet.add(sopId);
      }
      return newSet;
    });
  };

  const fetchSOPs = async (forceRefresh: boolean = false) => {
    if (sops.length > 0 && !forceRefresh) {
      return;
    }

    try {
      if (forceRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      const response = await apiService.fetchSOPs();
      setSops(response.data || []);
      setFilteredSops(response.data || []);
    } catch (error) {
      console.error('Error fetching SOPs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load SOPs. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSOPs(false);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSops(sops);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = sops.filter(sop => 
      sop.title.toLowerCase().includes(query) ||
      sop.content.toLowerCase().includes(query) ||
      sop.category.name.toLowerCase().includes(query) ||
      sop.tags.some(tag => tag.name.toLowerCase().includes(query)) ||
      sop.version.toLowerCase().includes(query)
    );
    setFilteredSops(filtered);
  }, [searchQuery, sops]);

  const handleRefresh = async () => {
    await fetchSOPs(true);
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
                  <BookOpen className="h-8 w-8 text-primary" />
                  <h1 className="text-2xl md:text-3xl font-bold">SOPs</h1>
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
                  placeholder="Search SOPs by title, content, category, tags, or version..."
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

            {/* SOPs List */}
            {!isLoading && (
              <>
                {filteredSops.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-gray-500 dark:text-gray-400">
                        {searchQuery ? 'No SOPs found matching your search.' : 'No SOPs available.'}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredSops.map((sop) => {
                      const isExpanded = expandedSOPs.has(sop.id);
                      return (
                        <Card 
                          key={sop.id} 
                          className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-primary"
                        >
                          <CardHeader 
                            className="cursor-pointer pb-3"
                            onClick={() => toggleSOP(sop.id)}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <CardTitle className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                                  {sop.title}
                                </CardTitle>
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {sop.category.name}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    Version {sop.version}
                                  </Badge>
                                  <Badge 
                                    variant={sop.status === 'approved' ? 'default' : 'secondary'} 
                                    className="text-xs"
                                  >
                                    {sop.status_display}
                                  </Badge>
                                  {sop.tags.map((tag) => (
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
                                <div className="prose prose-sm max-w-none dark:prose-invert">
                                  <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                                    {sop.content}
                                  </pre>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-800">
                                  <div className="flex items-center gap-1">
                                    <Eye className="h-4 w-4" />
                                    <span>{sop.view_count} views</span>
                                  </div>
                                  {sop.published_at && (
                                    <span>
                                      Published {new Date(sop.published_at).toLocaleDateString()}
                                    </span>
                                  )}
                                  {sop.approved_at && (
                                    <div className="flex items-center gap-1">
                                      <CheckCircle2 className="h-4 w-4" />
                                      <span>Approved {new Date(sop.approved_at).toLocaleDateString()}</span>
                                    </div>
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
