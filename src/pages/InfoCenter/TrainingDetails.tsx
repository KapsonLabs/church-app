import { useState, useEffect } from 'react';
import { useParams, useRouter, Link } from '@tanstack/react-router';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, GraduationCap, RefreshCw } from 'lucide-react';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { apiService, type Training } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export default function TrainingDetails() {
  const router = useRouter();
  const { id } = useParams({ strict: false });
  const [training, setTraining] = useState<Training | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchTraining = async (forceRefresh: boolean = false) => {
    if (!id) return;

    try {
      if (forceRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      // Fetch all trainings and find the one with matching ID
      const response = await apiService.fetchTrainings();
      const foundTraining = response.data.find(t => t.id === id);
      
      if (foundTraining) {
        setTraining(foundTraining);
      } else {
        toast({
          title: 'Error',
          description: 'Training not found.',
          variant: 'destructive',
        });
        router.navigate({ to: '/info-center/trainings' });
      }
    } catch (error) {
      console.error('Error fetching Training:', error);
      toast({
        title: 'Error',
        description: 'Failed to load Training. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTraining(false);
  }, [id]);

  const handleRefresh = async () => {
    await fetchTraining(true);
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

  if (isLoading) {
    return (
      <ProtectedRoute>
        <AuthenticatedLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        </AuthenticatedLayout>
      </ProtectedRoute>
    );
  }

  if (!training) {
    return (
      <ProtectedRoute>
        <AuthenticatedLayout>
          <div className="p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <Link
                to="/info-center/trainings"
                className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Trainings
              </Link>
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Training not found.</p>
              </div>
            </div>
          </div>
        </AuthenticatedLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <div className="p-4 md:p-6 lg:p-8 bg-white dark:bg-white">
          <div className="max-w-7xl mx-auto">
            {/* Back Button */}
            <div className="mb-6">
              <Link
                to="/info-center/trainings"
                className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Trainings
              </Link>
            </div>

            {/* Article Content */}
            <article className="bg-white dark:bg-white">
              {/* Header Section */}
              <header className="mb-8">
                <div className="flex items-center gap-2 mb-4">
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
                      {training.estimated_read_time} min read
                    </Badge>
                  )}
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-900 mb-4 leading-tight">
                  {training.title}
                </h1>
                
                {training.summary && (
                  <p className="text-lg text-gray-600 dark:text-gray-700 mb-6 leading-relaxed">
                    {training.summary}
                  </p>
                )}

                {/* Meta Information */}
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-600 pt-4 border-t border-gray-200 dark:border-gray-300">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    <span>Training Article</span>
                  </div>
                  {training.published_at && (
                    <span>
                      Published {new Date(training.published_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  )}
                  <span>Views: {training.view_count}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="ml-auto"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </header>

              {/* Tags */}
              {training.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-gray-200 dark:border-gray-300">
                  {training.tags.map((tag) => (
                    <Badge key={tag.id} variant="outline" className="text-xs">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Article Body */}
              <div className="prose prose-lg max-w-none">
                <div className="text-gray-700 dark:text-gray-800 leading-relaxed text-lg">
                  <div className="whitespace-pre-wrap font-sans">
                    {training.content}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-300">
                <div className="flex items-center justify-between">
                  <Link
                    to="/info-center/trainings"
                    className="inline-flex items-center text-sm text-gray-600 dark:text-gray-600 hover:text-gray-900 dark:hover:text-gray-900 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Trainings
                  </Link>
                  <div className="text-sm text-gray-500 dark:text-gray-600">
                    {training.view_count} {training.view_count === 1 ? 'view' : 'views'}
                  </div>
                </div>
              </footer>
            </article>
          </div>
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}

