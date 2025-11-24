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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { apiService, type KPIApproval } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ApprovalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  approval: KPIApproval;
  onSuccess: () => void;
}

export function ApprovalDetailsModal({
  isOpen,
  onClose,
  approval,
  onSuccess,
}: ApprovalDetailsModalProps) {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const { toast } = useToast();

  const formatValue = (value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return value;
    return numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleApprove = async () => {
    if (!notes.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please provide approval notes.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    setActionType('approve');

    try {
      await apiService.approveKPIReport(approval.id, 'approve', notes);
      toast({
        title: 'Success',
        description: 'KPI report approved successfully.',
      });
      onSuccess();
    } catch (error) {
      console.error('Error approving KPI report:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to approve KPI report.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setActionType(null);
    }
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please provide rejection notes.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    setActionType('reject');

    try {
      await apiService.approveKPIReport(approval.id, 'reject', notes);
      toast({
        title: 'Success',
        description: 'KPI report rejected successfully.',
      });
      onSuccess();
    } catch (error) {
      console.error('Error rejecting KPI report:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reject KPI report.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setActionType(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>KPI Report Approval</span>
            <Badge variant={approval.status === 'submitted' ? 'default' : 'secondary'}>
              {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Review the KPI report details before approving or rejecting.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* KPI Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">KPI Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">KPI Name</Label>
                <p className="text-sm font-medium mt-1">{approval.kpi.name}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Reported Value</Label>
                <p className="text-sm font-semibold mt-1">{formatValue(approval.reported_value)}</p>
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
                <p className="text-sm mt-1">{formatDate(approval.period_start)}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">End Date</Label>
                <p className="text-sm mt-1">{formatDate(approval.period_end)}</p>
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
                  {approval.reported_by.first_name} {approval.reported_by.last_name}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                <p className="text-sm mt-1">{approval.reported_by.email}</p>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Submitted At</Label>
              <p className="text-sm mt-1">{formatDateTime(approval.submitted_at)}</p>
            </div>
          </div>

          <Separator />

          {/* Notes */}
          {approval.notes && (
            <>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Notes</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{approval.notes}</p>
              </div>
              <Separator />
            </>
          )}

          {/* Approval Notes Input */}
          <div className="space-y-3">
            <Label htmlFor="approval-notes">
              {approval.status === 'submitted' ? 'Approval Notes' : 'Notes'}
            </Label>
            <Textarea
              id="approval-notes"
              placeholder={
                approval.status === 'submitted'
                  ? 'Enter your approval or rejection notes...'
                  : 'Enter notes...'
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              disabled={approval.status !== 'submitted' || isSubmitting}
            />
          </div>

          {/* Action Buttons */}
          {approval.status === 'submitted' && (
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting && actionType === 'reject' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                Reject
              </Button>
              <Button
                onClick={handleApprove}
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting && actionType === 'approve' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Approve
              </Button>
            </div>
          )}

          {/* Show approval info if already reviewed */}
          {approval.status !== 'submitted' && approval.approved_by && (
            <div className="space-y-3 pt-4 border-t">
              <h3 className="text-sm font-semibold text-foreground">
                {approval.status === 'approved' ? 'Approved By' : 'Rejected By'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <p className="text-sm mt-1">
                    {approval.approved_by.first_name} {approval.approved_by.last_name}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="text-sm mt-1">{approval.approved_by.email}</p>
                </div>
              </div>
              {approval.approval_notes && (
                <div>
                  <Label className="text-xs text-muted-foreground">Notes</Label>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{approval.approval_notes}</p>
                </div>
              )}
              {approval.reviewed_at && (
                <div>
                  <Label className="text-xs text-muted-foreground">Reviewed At</Label>
                  <p className="text-sm mt-1">{formatDateTime(approval.reviewed_at)}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

