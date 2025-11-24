import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiService, type CreateKPIRequest } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface CreateKPIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateKPIModal: React.FC<CreateKPIModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState<CreateKPIRequest>({
    name: '',
    description: '',
    organization_id: user?.branch?.organization_id || '',
    branch_id: user?.branch?.id || '',
    source_type: 'manual',
    period: 'monthly',
    aggregate_query: '',
    unit: 'count',
    target_value: 0,
    minimum_value: 0,
    maximum_value: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const sourceTypeOptions = [
    { value: 'manual', label: 'Manual' },
    { value: 'aggregate', label: 'Aggregate' },
  ];

  const periodOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  const unitOptions = [
    { value: 'count', label: 'Count' },
    { value: 'percentage', label: 'Percentage' },
    { value: 'average', label: 'Average' },
    { value: 'hours', label: 'Hours' },
    { value: 'UGX', label: 'UGX' },
    { value: 'USD', label: 'USD' },
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.source_type === 'aggregate' && !formData.aggregate_query.trim()) {
      newErrors.aggregate_query = 'Aggregate query is required for aggregate source type';
    }

    if (formData.target_value < formData.minimum_value) {
      newErrors.target_value = 'Target value cannot be lower than minimum value';
    }

    if (formData.target_value > formData.maximum_value) {
      newErrors.target_value = 'Target value cannot be higher than maximum value';
    }

    if (formData.minimum_value >= formData.maximum_value) {
      newErrors.minimum_value = 'Minimum value must be less than maximum value';
      newErrors.maximum_value = 'Maximum value must be greater than minimum value';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CreateKPIRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    if (!user?.branch?.organization_id || !user?.branch?.id) {
      toast({
        title: "Error",
        description: "Organization or branch information not available",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const kpiData: CreateKPIRequest = {
        ...formData,
        organization_id: user.branch.organization_id,
        branch_id: user.branch.id,
      };

      const response = await apiService.createKPI(kpiData);

      if (response.data) {
        toast({
          title: "Success",
          description: `KPI "${response.data.name}" created successfully!`,
        });

        // Reset form
        setFormData({
          name: '',
          description: '',
          organization_id: user.branch.organization_id,
          branch_id: user.branch.id,
          source_type: 'manual',
          period: 'monthly',
          aggregate_query: '',
          unit: 'count',
          target_value: 0,
          minimum_value: 0,
          maximum_value: 0,
        });
        setErrors({});

        onClose();
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating KPI:', error);
      toast({
        title: "Error",
        description: "Failed to create KPI. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New KPI</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter KPI name"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter KPI description"
              rows={3}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          {/* Source Type */}
          <div className="space-y-2">
            <Label htmlFor="source_type">Source Type *</Label>
            <Select
              value={formData.source_type}
              onValueChange={(value) => handleInputChange('source_type', value)}
            >
              <SelectTrigger id="source_type">
                <SelectValue placeholder="Select source type" />
              </SelectTrigger>
              <SelectContent>
                {sourceTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Aggregate Query - Only show if source_type is aggregate */}
          {formData.source_type === 'aggregate' && (
            <div className="space-y-2">
              <Label htmlFor="aggregate_query">Aggregate Query *</Label>
              <Input
                id="aggregate_query"
                value={formData.aggregate_query}
                onChange={(e) => handleInputChange('aggregate_query', e.target.value)}
                placeholder="e.g., tickets.resolved.count()"
                className={errors.aggregate_query ? 'border-destructive' : ''}
              />
              {errors.aggregate_query && (
                <p className="text-sm text-destructive">{errors.aggregate_query}</p>
              )}
            </div>
          )}

          {/* Period */}
          <div className="space-y-2">
            <Label htmlFor="period">Period *</Label>
            <Select
              value={formData.period}
              onValueChange={(value) => handleInputChange('period', value)}
            >
              <SelectTrigger id="period">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Unit */}
          <div className="space-y-2">
            <Label htmlFor="unit">Unit *</Label>
            <Select
              value={formData.unit}
              onValueChange={(value) => handleInputChange('unit', value)}
            >
              <SelectTrigger id="unit">
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {unitOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Values Row */}
          <div className="grid grid-cols-3 gap-4">
            {/* Minimum Value */}
            <div className="space-y-2">
              <Label htmlFor="minimum_value">Minimum Value *</Label>
              <Input
                id="minimum_value"
                type="number"
                step="0.01"
                value={formData.minimum_value}
                onChange={(e) => handleInputChange('minimum_value', parseFloat(e.target.value) || 0)}
                placeholder="0"
                className={errors.minimum_value ? 'border-destructive' : ''}
              />
              {errors.minimum_value && (
                <p className="text-sm text-destructive">{errors.minimum_value}</p>
              )}
            </div>

            {/* Target Value */}
            <div className="space-y-2">
              <Label htmlFor="target_value">Target Value *</Label>
              <Input
                id="target_value"
                type="number"
                step="0.01"
                value={formData.target_value}
                onChange={(e) => handleInputChange('target_value', parseFloat(e.target.value) || 0)}
                placeholder="0"
                className={errors.target_value ? 'border-destructive' : ''}
              />
              {errors.target_value && (
                <p className="text-sm text-destructive">{errors.target_value}</p>
              )}
            </div>

            {/* Maximum Value */}
            <div className="space-y-2">
              <Label htmlFor="maximum_value">Maximum Value *</Label>
              <Input
                id="maximum_value"
                type="number"
                step="0.01"
                value={formData.maximum_value}
                onChange={(e) => handleInputChange('maximum_value', parseFloat(e.target.value) || 0)}
                placeholder="0"
                className={errors.maximum_value ? 'border-destructive' : ''}
              />
              {errors.maximum_value && (
                <p className="text-sm text-destructive">{errors.maximum_value}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create KPI
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

