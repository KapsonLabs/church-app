import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Send, RotateCcw } from 'lucide-react';
import { apiService, type KPIReport } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface KPIReportDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: KPIReport;
  onSuccess: () => void;
}

export function KPIReportDetailsModal({
  isOpen,
  onClose,
  report,
  onSuccess,
}: KPIReportDetailsModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReverting, setIsReverting] = useState(false);
  const { toast } = useToast();

  const formatValue = (value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return value;
    return numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      await apiService.submitKPIReport(report.id);
      toast({
        title: 'Success',
        description: 'KPI report submitted successfully.',
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting KPI report:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit KPI report.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevert = async () => {
    setIsReverting(true);
    try {
      // TODO: Implement revert functionality when endpoint is available
      toast({
        title: 'Coming Soon',
        description: 'Revert functionality will be available soon.',
      });
    } finally {
      setIsReverting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>KPI Report Details</span>
            <Badge variant={report.status === 'submitted' ? 'default' : report.status === 'approved' ? 'default' : report.status === 'rejected' ? 'destructive' : 'secondary'}>
              {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* KPI Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">KPI Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">KPI Name</Label>
                <p className="text-sm font-medium mt-1">{report.kpi.name}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Reported Value</Label>
                <p className="text-sm font-semibold mt-1">{formatValue(report.reported_value)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Period Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Period</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Start Date</Label>
                <p className="text-sm mt-1">{formatDate(report.period_start)}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">End Date</Label>
                <p className="text-sm mt-1">{formatDate(report.period_end)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Reported By */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Reported By</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Name</Label>
                <p className="text-sm mt-1">
                  {report.reported_by.first_name} {report.reported_by.last_name}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                <p className="text-sm mt-1">{report.reported_by.email}</p>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Created At</Label>
              <p className="text-sm mt-1">{formatDateTime(report.created_at)}</p>
            </div>
            {report.submitted_at && (
              <div>
                <Label className="text-xs text-muted-foreground">Submitted At</Label>
                <p className="text-sm mt-1">{formatDateTime(report.submitted_at)}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Notes */}
          {report.notes && (
            <>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Notes</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.notes}</p>
              </div>
              <Separator />
            </>
          )}

          {/* Approval Information */}
          {report.status !== 'draft' && report.approved_by && (
            <>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  {report.status === 'approved' ? 'Approved By' : 'Rejected By'}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Name</Label>
                    <p className="text-sm mt-1">
                      {report.approved_by.first_name} {report.approved_by.last_name}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Email</Label>
                    <p className="text-sm mt-1">{report.approved_by.email}</p>
                  </div>
                </div>
                {report.approval_notes && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Approval Notes</Label>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{report.approval_notes}</p>
                  </div>
                )}
                {report.reviewed_at && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Reviewed At</Label>
                    <p className="text-sm mt-1">{formatDateTime(report.reviewed_at)}</p>
                  </div>
                )}
              </div>
              <Separator />
            </>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting || isReverting}
            >
              Close
            </Button>
            {report.status === 'draft' && (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || isReverting}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit
                  </>
                )}
              </Button>
            )}
            {report.status === 'submitted' && (
              <Button
                variant="outline"
                onClick={handleRevert}
                disabled={isSubmitting || isReverting}
                className="flex items-center gap-2"
              >
                {isReverting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Reverting...
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4" />
                    Revert
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

