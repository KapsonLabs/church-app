import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiService, type CreateTrainingRequest, type Training, type TrainingCategory, type TrainingTag } from '@/lib/api';
import { ArrowLeft, Loader2, Eye, Edit } from 'lucide-react';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function CreateTraining() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [trainings, setTrainings] = useState<Training[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category_id: '',
    tag_ids: [] as string[],
    difficulty_level: '' as 'beginner' | 'intermediate' | 'advanced' | '',
    estimated_read_time: '',
    is_published: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  // Fetch trainings to extract categories and tags
  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        const response = await apiService.fetchTrainings();
        setTrainings(response.data || []);
      } catch (error) {
        console.error('Error fetching trainings:', error);
      }
    };
    fetchTrainings();
  }, []);

  // Extract unique categories and tags from existing trainings
  const categories: TrainingCategory[] = React.useMemo(() => {
    const categoryMap = new Map<string, TrainingCategory>();
    trainings.forEach(training => {
      if (training.category && !categoryMap.has(training.category.id)) {
        categoryMap.set(training.category.id, training.category);
      }
    });
    return Array.from(categoryMap.values());
  }, [trainings]);

  const tags: TrainingTag[] = React.useMemo(() => {
    const tagMap = new Map<string, TrainingTag>();
    trainings.forEach(training => {
      training.tags.forEach(tag => {
        if (!tagMap.has(tag.id)) {
          tagMap.set(tag.id, tag);
        }
      });
    });
    return Array.from(tagMap.values());
  }, [trainings]);

  const difficultyOptions = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleTagToggle = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      tag_ids: prev.tag_ids.includes(tagId)
        ? prev.tag_ids.filter(id => id !== tagId)
        : [...prev.tag_ids, tagId]
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.summary.trim()) {
      newErrors.summary = 'Summary is required';
    }
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }
    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
    }
    if (!formData.difficulty_level) {
      newErrors.difficulty_level = 'Difficulty level is required';
    }
    if (!formData.estimated_read_time || parseInt(formData.estimated_read_time) <= 0) {
      newErrors.estimated_read_time = 'Estimated read time must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const trainingData: CreateTrainingRequest = {
        title: formData.title.trim(),
        summary: formData.summary.trim(),
        content: formData.content.trim(),
        category_id: formData.category_id,
        tag_ids: formData.tag_ids,
        difficulty_level: formData.difficulty_level as 'beginner' | 'intermediate' | 'advanced',
        estimated_read_time: parseInt(formData.estimated_read_time),
        is_published: formData.is_published,
      };

      const response = await apiService.createTraining(trainingData);

      if (response.status === 201) {
        toast({
          title: 'Success',
          description: 'Training article created successfully.',
        });
        
        // Navigate to the new training
        if (response.data?.id) {
          router.navigate({ to: '/info-center/trainings/$id', params: { id: response.data.id } });
        } else {
          router.navigate({ to: '/info-center/trainings' });
        }
      }
    } catch (error: any) {
      console.error('Error creating training:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create training article. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Simple markdown to HTML converter
  const markdownToHtml = (markdown: string): string => {
    if (!markdown.trim()) return '';
    
    let html = markdown;
    
    // Code blocks (process first to avoid interfering with other patterns)
    html = html.replace(/```([\s\S]*?)```/gim, '<pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto"><code>$1</code></pre>');
    
    // Inline code
    html = html.replace(/`([^`]+)`/gim, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">$1</code>');
    
    // Headers
    html = html.replace(/^#### (.*$)/gim, '<h4 class="text-xl font-semibold mt-6 mb-3">$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-2xl font-semibold mt-6 mb-3">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-3xl font-semibold mt-6 mb-3">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold mt-6 mb-4">$1</h1>');
    
    // Bold and italic (bold first, then italic)
    html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    html = html.replace(/_(.*?)_/gim, '<em>$1</em>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline">$1</a>');
    
    // Ordered lists
    html = html.replace(/^(\d+)\. (.*$)/gim, '<li class="ml-4">$2</li>');
    const orderedListRegex = /(<li class="ml-4">.*<\/li>)/s;
    if (orderedListRegex.test(html)) {
      html = html.replace(/(<li class="ml-4">.*?<\/li>)/gs, '<ol class="list-decimal list-inside my-4 space-y-2">$1</ol>');
    }
    
    // Unordered lists
    html = html.replace(/^[\*\-\+] (.*$)/gim, '<li class="ml-4">$1</li>');
    const unorderedListRegex = /(<li class="ml-4">.*<\/li>)/s;
    if (unorderedListRegex.test(html)) {
      html = html.replace(/(<li class="ml-4">.*?<\/li>)/gs, '<ul class="list-disc list-inside my-4 space-y-2">$1</ul>');
    }
    
    // Horizontal rules
    html = html.replace(/^---$/gim, '<hr class="my-6 border-gray-300 dark:border-gray-700">');
    html = html.replace(/^\*\*\*$/gim, '<hr class="my-6 border-gray-300 dark:border-gray-700">');
    
    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 dark:border-gray-700 pl-4 italic my-4">$1</blockquote>');
    
    // Split by double newlines for paragraphs
    const paragraphs = html.split(/\n\n+/);
    html = paragraphs
      .map(p => p.trim())
      .filter(p => p && !p.match(/^<[hou]|^<pre|^<blockquote/))
      .map(p => `<p class="mb-4 leading-relaxed">${p}</p>`)
      .join('');
    
    // Add back block elements that were filtered
    paragraphs.forEach(p => {
      if (p.match(/^<[hou]|^<pre|^<blockquote/)) {
        html += p;
      }
    });
    
    // Clean up empty paragraphs and fix nested lists
    html = html.replace(/<p class="mb-4 leading-relaxed"><\/p>/gim, '');
    html = html.replace(/<p class="mb-4 leading-relaxed">(<[ou]l)/gim, '$1');
    html = html.replace(/(<\/[ou]l>)<\/p>/gim, '$1');
    
    return html;
  };

  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <div className="min-h-full bg-white dark:bg-white">
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <Link
                to="/info-center/trainings"
                className="inline-flex items-center text-sm text-gray-600 dark:text-gray-600 hover:text-gray-900 dark:hover:text-gray-900 transition-colors mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Trainings
              </Link>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-900">
                Create New Training Article
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter training title"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              {/* Summary */}
              <div className="space-y-2">
                <Label htmlFor="summary">Summary *</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => handleInputChange('summary', e.target.value)}
                  placeholder="Enter a brief summary of the training"
                  rows={3}
                  className={errors.summary ? 'border-red-500' : ''}
                />
                {errors.summary && (
                  <p className="text-sm text-red-500">{errors.summary}</p>
                )}
              </div>

              {/* Category, Difficulty, Read Time, and Publish - Single row on medium+ screens */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => handleInputChange('category_id', value)}
                  >
                    <SelectTrigger className={errors.category_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.length === 0 ? (
                        <SelectItem value="none" disabled>No categories available</SelectItem>
                      ) : (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.category_id && (
                    <p className="text-sm text-red-500">{errors.category_id}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level *</Label>
                  <Select
                    value={formData.difficulty_level}
                    onValueChange={(value) => handleInputChange('difficulty_level', value)}
                  >
                    <SelectTrigger className={errors.difficulty_level ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.difficulty_level && (
                    <p className="text-sm text-red-500">{errors.difficulty_level}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="read_time">Read Time (min) *</Label>
                  <Input
                    id="read_time"
                    type="number"
                    min="1"
                    value={formData.estimated_read_time}
                    onChange={(e) => handleInputChange('estimated_read_time', e.target.value)}
                    placeholder="e.g., 15"
                    className={errors.estimated_read_time ? 'border-red-500' : ''}
                  />
                  {errors.estimated_read_time && (
                    <p className="text-sm text-red-500">{errors.estimated_read_time}</p>
                  )}
                </div>

                <div className="space-y-2 flex flex-col justify-end">
                  <div className="flex items-center space-x-2 h-10">
                    <Checkbox
                      id="is_published"
                      checked={formData.is_published}
                      onCheckedChange={(checked) => handleInputChange('is_published', checked)}
                    />
                    <Label htmlFor="is_published" className="cursor-pointer">
                      Publish immediately
                    </Label>
                  </div>
                </div>
              </div>

              {/* Content with Markdown Support */}
              <div className="space-y-2">
                <Label htmlFor="content">Content * (Markdown supported)</Label>
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'edit' | 'preview')} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="edit" className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Edit
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Preview
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="edit" className="mt-4">
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      placeholder="Enter the full training content (Markdown supported)"
                      rows={20}
                      className={`font-mono text-sm ${errors.content ? 'border-red-500' : ''}`}
                    />
                    {errors.content && (
                      <p className="text-sm text-red-500 mt-2">{errors.content}</p>
                    )}
                  </TabsContent>
                  <TabsContent value="preview" className="mt-4">
                    <Card>
                      <CardContent className="p-6 min-h-[400px] max-h-[600px] overflow-y-auto">
                        <div 
                          className="prose prose-lg max-w-none dark:prose-invert"
                          dangerouslySetInnerHTML={{ 
                            __html: formData.content ? markdownToHtml(formData.content) : '<p class="text-gray-400">Start typing to see preview...</p>' 
                          }}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 p-4 border rounded-md min-h-[80px]">
                  {tags.length === 0 ? (
                    <p className="text-sm text-gray-500">No tags available. Create a training first to see tags.</p>
                  ) : (
                    tags.map((tag) => (
                      <div
                        key={tag.id}
                        className="flex items-center gap-2"
                      >
                        <Checkbox
                          id={`tag-${tag.id}`}
                          checked={formData.tag_ids.includes(tag.id)}
                          onCheckedChange={() => handleTagToggle(tag.id)}
                        />
                        <Label
                          htmlFor={`tag-${tag.id}`}
                          className="cursor-pointer text-sm"
                        >
                          {tag.name}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
                {formData.tag_ids.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tag_ids.map((tagId) => {
                      const tag = tags.find(t => t.id === tagId);
                      return tag ? (
                        <Badge key={tagId} variant="secondary" className="text-xs">
                          {tag.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.navigate({ to: '/info-center/trainings' })}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Training
                </Button>
              </div>
            </form>
          </div>
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}

