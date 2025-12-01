import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Search, HelpCircle, ChevronDown, ChevronUp, Eye, ThumbsUp, Plus } from 'lucide-react';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { apiService, type FAQ } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { CreateFAQModal } from '@/components/modals/CreateFAQModal';

export default function FAQs() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaqs, setExpandedFaqs] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const toggleFaq = (faqId: string) => {
    setExpandedFaqs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(faqId)) {
        newSet.delete(faqId);
      } else {
        newSet.add(faqId);
      }
      return newSet;
    });
  };

  const fetchFAQs = async (forceRefresh: boolean = false) => {
    if (faqs.length > 0 && !forceRefresh) {
      return;
    }

    try {
      if (forceRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      const response = await apiService.fetchFAQs();
      setFaqs(response.data || []);
      setFilteredFaqs(response.data || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load FAQs. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFAQs(false);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredFaqs(faqs);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = faqs.filter(faq => 
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query) ||
      faq.category.name.toLowerCase().includes(query) ||
      faq.tags.some(tag => tag.name.toLowerCase().includes(query))
    );
    setFilteredFaqs(filtered);
  }, [searchQuery, faqs]);

  const handleRefresh = async () => {
    await fetchFAQs(true);
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
                  <HelpCircle className="h-8 w-8 text-primary" />
                  <h1 className="text-2xl md:text-3xl font-bold">FAQs</h1>
                </div>
                <div className="flex items-center gap-2">
                  <CreateFAQModal
                    onFAQCreated={handleRefresh}
                    existingFAQs={faqs}
                    trigger={
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create FAQ
                      </Button>
                    }
                  />
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search FAQs by question, answer, category, or tags..."
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

            {/* FAQs List */}
            {!isLoading && (
              <>
                {filteredFaqs.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-gray-500 dark:text-gray-400">
                        {searchQuery ? 'No FAQs found matching your search.' : 'No FAQs available.'}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredFaqs.map((faq) => {
                      const isExpanded = expandedFaqs.has(faq.id);
                      return (
                        <Card 
                          key={faq.id} 
                          className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-primary"
                        >
                          <CardHeader 
                            className="cursor-pointer pb-3"
                            onClick={() => toggleFaq(faq.id)}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <CardTitle className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                                  {faq.question}
                                </CardTitle>
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {faq.category.name}
                                  </Badge>
                                  {faq.tags.map((tag) => (
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
                                  {faq.answer}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-800">
                                  <div className="flex items-center gap-1">
                                    <Eye className="h-4 w-4" />
                                    <span>{faq.view_count} views</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <ThumbsUp className="h-4 w-4" />
                                    <span>{faq.helpful_count} helpful</span>
                                  </div>
                                  {faq.published_at && (
                                    <span>
                                      Published {new Date(faq.published_at).toLocaleDateString()}
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

