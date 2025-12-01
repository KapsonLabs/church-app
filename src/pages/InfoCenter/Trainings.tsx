import { useState, useEffect } from 'react';
import { Link, useRouter } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Search, GraduationCap, Clock, ArrowRight, Plus } from 'lucide-react';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { apiService, type Training } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function Trainings() {
  const router = useRouter();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [filteredTrainings, setFilteredTrainings] = useState<Training[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const fetchTrainings = async (forceRefresh: boolean = false) => {
    if (trainings.length > 0 && !forceRefresh) {
      return;
    }

    try {
      if (forceRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      
      const response = await apiService.fetchTrainings();
      setTrainings(response.data || []);
      setFilteredTrainings(response.data || []);
    } catch (error) {
      console.error('Error fetching Trainings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load Trainings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrainings(false);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTrainings(trainings);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = trainings.filter(training => 
      training.title.toLowerCase().includes(query) ||
      training.summary.toLowerCase().includes(query) ||
      training.content.toLowerCase().includes(query) ||
      training.category.name.toLowerCase().includes(query) ||
      training.tags.some(tag => tag.name.toLowerCase().includes(query)) ||
      training.difficulty_level_display.toLowerCase().includes(query)
    );
    setFilteredTrainings(filtered);
  }, [searchQuery, trainings]);

  const handleRefresh = async () => {
    await fetchTrainings(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200 dark:border-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-200 dark:border-gray-800';
    }
  };

  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <div className="p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-8 w-8 text-primary" />
                  <h1 className="text-2xl md:text-3xl font-bold">Trainings</h1>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => router.navigate({ to: '/info-center/trainings/create' })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Training
                  </Button>
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
                  placeholder="Search Trainings by title, summary, content, category, tags, or difficulty..."
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

            {/* Trainings Grid */}
            {!isLoading && (
              <>
                {filteredTrainings.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <p className="text-gray-500 dark:text-gray-400">
                        {searchQuery ? 'No Trainings found matching your search.' : 'No Trainings available.'}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTrainings.map((training) => (
                      <Link
                        key={training.id}
                        to="/info-center/trainings/$id"
                        params={{ id: training.id }}
                        className="block"
                      >
                        <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50 group h-full">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                                {training.title}
                              </CardTitle>
                              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                            </div>
                            {training.summary && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                                {training.summary}
                              </p>
                            )}
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge variant="secondary" className="text-xs">
                                {training.category.name}
                              </Badge>
                              <Badge 
                                className={`text-xs border ${getDifficultyColor(training.difficulty_level)}`}
                              >
                                {training.difficulty_level_display}
                              </Badge>
                              {training.estimated_read_time && (
                                <Badge variant="outline" className="text-xs flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {training.estimated_read_time} min
                                </Badge>
                              )}
                            </div>
                            {training.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {training.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag.id} variant="outline" className="text-xs">
                                    {tag.name}
                                  </Badge>
                                ))}
                                {training.tags.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{training.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
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
