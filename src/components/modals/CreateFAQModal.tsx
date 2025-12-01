import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { apiService, type CreateFAQRequest, type FAQ, type FAQCategory, type FAQTag } from '@/lib/api';
import { Plus, Loader2 } from 'lucide-react';

interface CreateFAQModalProps {
  onFAQCreated: () => void;
  trigger?: React.ReactNode;
  existingFAQs?: FAQ[];
}

export const CreateFAQModal: React.FC<CreateFAQModalProps> = ({
  onFAQCreated,
  trigger,
  existingFAQs = []
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category_id: '',
    tag_ids: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Extract unique categories and tags from existing FAQs
  const categories: FAQCategory[] = React.useMemo(() => {
    const categoryMap = new Map<string, FAQCategory>();
    existingFAQs.forEach(faq => {
      if (faq.category && !categoryMap.has(faq.category.id)) {
        categoryMap.set(faq.category.id, faq.category);
      }
    });
    return Array.from(categoryMap.values());
  }, [existingFAQs]);

  const tags: FAQTag[] = React.useMemo(() => {
    const tagMap = new Map<string, FAQTag>();
    existingFAQs.forEach(faq => {
      faq.tags.forEach(tag => {
        if (!tagMap.has(tag.id)) {
          tagMap.set(tag.id, tag);
        }
      });
    });
    return Array.from(tagMap.values());
  }, [existingFAQs]);

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

    if (!formData.question.trim()) {
      newErrors.question = 'Question is required';
    }
    if (!formData.answer.trim()) {
      newErrors.answer = 'Answer is required';
    }
    if (!formData.category_id) {
      newErrors.category_id = 'Category is required';
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

      const faqData: CreateFAQRequest = {
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        category_id: formData.category_id,
        tag_ids: formData.tag_ids,
      };

      const response = await apiService.createFAQ(faqData);

      if (response.status === 201) {
        toast({
          title: 'Success',
          description: 'FAQ created successfully.',
        });
        
        // Reset form
        setFormData({
          question: '',
          answer: '',
          category_id: '',
          tag_ids: [],
        });
        setErrors({});
        setOpen(false);
        
        // Refresh FAQs list
        onFAQCreated();
      }
    } catch (error: any) {
      console.error('Error creating FAQ:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create FAQ. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        question: '',
        answer: '',
        category_id: '',
        tag_ids: [],
      });
      setErrors({});
      setOpen(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!loading) {
      setOpen(isOpen);
      if (!isOpen) {
        // Reset form when closing
        setFormData({
          question: '',
          answer: '',
          category_id: '',
          tag_ids: [],
        });
        setErrors({});
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create FAQ
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New FAQ</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new frequently asked question.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Question */}
          <div className="space-y-2">
            <Label htmlFor="question">Question *</Label>
            <Input
              id="question"
              value={formData.question}
              onChange={(e) => handleInputChange('question', e.target.value)}
              placeholder="Enter the question"
              className={errors.question ? 'border-red-500' : ''}
            />
            {errors.question && (
              <p className="text-sm text-red-500">{errors.question}</p>
            )}
          </div>

          {/* Answer */}
          <div className="space-y-2">
            <Label htmlFor="answer">Answer *</Label>
            <Textarea
              id="answer"
              value={formData.answer}
              onChange={(e) => handleInputChange('answer', e.target.value)}
              placeholder="Enter the answer"
              rows={6}
              className={errors.answer ? 'border-red-500' : ''}
            />
            {errors.answer && (
              <p className="text-sm text-red-500">{errors.answer}</p>
            )}
          </div>

          {/* Category */}
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

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-[60px]">
              {tags.length === 0 ? (
                <p className="text-sm text-gray-500">No tags available. Create an FAQ first to see tags.</p>
              ) : (
                tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center gap-1"
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
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create FAQ
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

