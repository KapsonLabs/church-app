import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { apiService, type MyKPIPortfolioItem, type CreateKPIReportRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface CreateKPIReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  kpiInfo: MyKPIPortfolioItem;
  onSuccess: () => void;
}

export function CreateKPIReportModal({
  isOpen,
  onClose,
  kpiInfo,
  onSuccess,
}: CreateKPIReportModalProps) {
  const [formData, setFormData] = useState({
    period_start: '',
    period_end: '',
    reported_value: '',
    notes: '',
    supporting_documentation: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.period_start || !formData.period_end || !formData.reported_value) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    const reportedValue = parseFloat(formData.reported_value);
    if (isNaN(reportedValue)) {
      toast({
        title: 'Validation Error',
        description: 'Reported value must be a valid number.',
        variant: 'destructive',
      });
      return;
    }

    // Validate period dates
    const startDate = new Date(formData.period_start);
    const endDate = new Date(formData.period_end);
    if (endDate < startDate) {
      toast({
        title: 'Validation Error',
        description: 'End date must be after start date.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const reportData: CreateKPIReportRequest = {
        assignment_id: kpiInfo.assignment.id,
        period_start: formData.period_start,
        period_end: formData.period_end,
        reported_value: reportedValue,
        notes: formData.notes,
        supporting_documentation: formData.supporting_documentation || '',
      };

      await apiService.createKPIReport(reportData);
      
      toast({
        title: 'Success',
        description: 'KPI report created successfully.',
      });

      // Reset form
      setFormData({
        period_start: '',
        period_end: '',
        reported_value: '',
        notes: '',
        supporting_documentation: '',
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating KPI report:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create KPI report.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create KPI Report</DialogTitle>
          <DialogDescription>
            Create a new report for {kpiInfo.kpi.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="period_start">Period Start *</Label>
              <Input
                id="period_start"
                type="date"
                value={formData.period_start}
                onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period_end">Period End *</Label>
              <Input
                id="period_end"
                type="date"
                value={formData.period_end}
                onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reported_value">
              Reported Value ({kpiInfo.kpi.unit}) *
            </Label>
            <Input
              id="reported_value"
              type="number"
              step="0.01"
              value={formData.reported_value}
              onChange={(e) => setFormData({ ...formData, reported_value: e.target.value })}
              placeholder="Enter reported value"
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Target: {parseFloat(kpiInfo.kpi.target_value).toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })} {kpiInfo.kpi.unit}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Enter any additional notes or documentation"
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supporting_documentation">Supporting Documentation</Label>
            <Textarea
              id="supporting_documentation"
              value={formData.supporting_documentation}
              onChange={(e) => setFormData({ ...formData, supporting_documentation: e.target.value })}
              placeholder="Enter supporting documentation (JSON format)"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Report'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

