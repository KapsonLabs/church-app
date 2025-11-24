import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { apiService, BulkCreateTransactionSettingRequest, BranchCurrency } from '@/lib/api';
import { Loader2, Save, X } from 'lucide-react';

interface EditTransactionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  branchId: number;
  transactionSetting?: {
    id: number;
    transaction_type: string;
    transaction_type_display: string;
    approval_limit_amount: string;
    approval_limit_currency: number;
    currency_code: string;
  } | null;
}

const transactionTypes = [
  { value: 'savings_deposit', label: 'Savings Deposit' },
  { value: 'savings_withdrawal', label: 'Savings Withdrawal' },
  { value: 'loan_disbursement', label: 'Loan Disbursement' },
  { value: 'loan_repayment', label: 'Loan Repayment' },
  { value: 'fee_payment', label: 'Fee Payment' },
  { value: 'interest_payment', label: 'Interest Payment' },
  { value: 'transfer', label: 'Transfer' },
];

export const EditTransactionSettingsModal: React.FC<EditTransactionSettingsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  branchId,
  transactionSetting = null,
}) => {
  const [formData, setFormData] = useState({
    transaction_type: '',
    approval_limit_currency: 0,
    approval_limit_amount: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [currencies, setCurrencies] = useState<BranchCurrency[]>([]);
  const { toast } = useToast();

  // Fetch currencies when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCurrencies();
      if (transactionSetting) {
        // Edit mode - only allow editing the amount
        setFormData({
          transaction_type: transactionSetting.transaction_type,
          approval_limit_currency: transactionSetting.approval_limit_currency,
          approval_limit_amount: parseFloat(transactionSetting.approval_limit_amount).toString(),
        });
      } else {
        // Create mode
        setFormData({
          transaction_type: '',
          approval_limit_currency: 0,
          approval_limit_amount: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, transactionSetting]);

  const fetchCurrencies = async () => {
    try {
      const response = await apiService.fetchBranchCurrencies(branchId);
      setCurrencies(response);
    } catch (error) {
      console.error('Error fetching currencies:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch currencies',
        variant: 'destructive',
      });
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.transaction_type && !transactionSetting) {
      newErrors.transaction_type = 'Transaction type is required';
    }

    if (!formData.approval_limit_currency || formData.approval_limit_currency === 0) {
      newErrors.approval_limit_currency = 'Currency is required';
    }

    if (!formData.approval_limit_amount || parseFloat(formData.approval_limit_amount) <= 0) {
      newErrors.approval_limit_amount = 'Approval limit amount must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const payload: BulkCreateTransactionSettingRequest[] = [
        {
          branch_id: branchId,
          transaction_type: formData.transaction_type,
          approval_limit_currency: formData.approval_limit_currency,
          approval_limit_amount: parseFloat(formData.approval_limit_amount),
        },
      ];

      const response = await apiService.bulkCreateTransactionSettings(payload);

      if (response.status === 200) {
        toast({
          title: 'Success',
          description: response.message || 'Transaction setting saved successfully',
        });
        onSuccess();
        onClose();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to save transaction setting',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error saving transaction setting:', error);
      
      let errorMessage = 'Failed to save transaction setting. Please try again.';
      
      if (error.violations && Array.isArray(error.violations)) {
        errorMessage = error.violations.join(', ');
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isEditMode = !!transactionSetting;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Transaction Setting' : 'Create Transaction Setting'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type */}
          <div className="space-y-2">
            <Label htmlFor="transaction_type">
              Transaction Type {!isEditMode && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={formData.transaction_type}
              onValueChange={(value) => handleChange('transaction_type', value)}
              disabled={isEditMode || isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select transaction type" />
              </SelectTrigger>
              <SelectContent>
                {transactionTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.transaction_type && (
              <p className="text-sm text-red-500">{errors.transaction_type}</p>
            )}
            {isEditMode && (
              <p className="text-sm text-muted-foreground">
                Current: {transactionSetting.transaction_type_display}
              </p>
            )}
          </div>

          {/* Approval Limit Currency */}
          <div className="space-y-2">
            <Label htmlFor="approval_limit_currency">
              Currency {!isEditMode && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={formData.approval_limit_currency.toString()}
              onValueChange={(value) => handleChange('approval_limit_currency', parseInt(value))}
              disabled={isEditMode || isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.id} value={currency.id.toString()}>
                    {currency.currency_code} - {currency.currency_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.approval_limit_currency && (
              <p className="text-sm text-red-500">{errors.approval_limit_currency}</p>
            )}
            {isEditMode && (
              <p className="text-sm text-muted-foreground">
                Current: {transactionSetting.currency_code}
              </p>
            )}
          </div>

          {/* Approval Limit Amount */}
          <div className="space-y-2">
            <Label htmlFor="approval_limit_amount">
              Approval Limit Amount <span className="text-red-500">*</span>
            </Label>
            <Input
              id="approval_limit_amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.approval_limit_amount}
              onChange={(e) => handleChange('approval_limit_amount', e.target.value)}
              disabled={isLoading}
              placeholder="Enter approval limit amount"
            />
            {errors.approval_limit_amount && (
              <p className="text-sm text-red-500">{errors.approval_limit_amount}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
