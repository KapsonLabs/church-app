import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Lock, AlertCircle, Check } from 'lucide-react';
import { apiService, type ChangePasswordRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
  userName: string;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  userId,
  userEmail,
  userName,
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ChangePasswordRequest>({
    new_password: '',
    confirm_password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password validation rules
  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('At least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('One uppercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('One number');
    }
    
    return errors;
  };

  const getPasswordStrength = (password: string): { level: string; color: string; percentage: number } => {
    if (!password) return { level: '', color: '', percentage: 0 };
    
    const errors = validatePassword(password);
    
    if (errors.length === 0) {
      return { level: 'Strong', color: 'text-green-600', percentage: 100 };
    } else if (errors.length === 1) {
      return { level: 'Medium', color: 'text-yellow-600', percentage: 66 };
    } else {
      return { level: 'Weak', color: 'text-red-600', percentage: 33 };
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate new password
    if (!formData.new_password) {
      newErrors.new_password = 'Password is required';
    } else {
      const passwordErrors = validatePassword(formData.new_password);
      if (passwordErrors.length > 0) {
        newErrors.new_password = `Password must include: ${passwordErrors.join(', ')}`;
      }
    }

    // Validate confirm password
    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your password';
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiService.changeUserPassword(userId, formData);

      toast({
        title: 'Success',
        description: response.message || `Password changed successfully for ${userEmail}`,
      });

      // Reset form and close modal
      setFormData({ new_password: '', confirm_password: '' });
      setErrors({});
      onClose();
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to change password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ new_password: '', confirm_password: '' });
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  const passwordStrength = getPasswordStrength(formData.new_password);
  const passwordValidationErrors = validatePassword(formData.new_password);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </DialogTitle>
          <DialogDescription>
            Set a new password for <span className="font-medium">{userName}</span> ({userEmail})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Password Requirements Info */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Password must be at least 8 characters and include an uppercase letter and a number.
            </AlertDescription>
          </Alert>

          {/* New Password Field */}
          <div className="space-y-2">
            <Label htmlFor="new_password">New Password</Label>
            <div className="relative">
              <Input
                id="new_password"
                name="new_password"
                type={showPassword ? 'text' : 'password'}
                value={formData.new_password}
                onChange={handleInputChange}
                className={errors.new_password ? 'border-red-500' : ''}
                placeholder="Enter new password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            
            {/* Password Strength Indicator */}
            {formData.new_password && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Password strength:</span>
                  <span className={`font-medium ${passwordStrength.color}`}>
                    {passwordStrength.level}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      passwordStrength.level === 'Strong' ? 'bg-green-500' :
                      passwordStrength.level === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${passwordStrength.percentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Validation Checklist */}
            {formData.new_password && (
              <div className="space-y-1 text-xs">
                <div className={`flex items-center gap-1 ${formData.new_password.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
                  <Check className="h-3 w-3" />
                  <span>At least 8 characters</span>
                </div>
                <div className={`flex items-center gap-1 ${/[A-Z]/.test(formData.new_password) ? 'text-green-600' : 'text-gray-500'}`}>
                  <Check className="h-3 w-3" />
                  <span>One uppercase letter</span>
                </div>
                <div className={`flex items-center gap-1 ${/[0-9]/.test(formData.new_password) ? 'text-green-600' : 'text-gray-500'}`}>
                  <Check className="h-3 w-3" />
                  <span>One number</span>
                </div>
              </div>
            )}

            {errors.new_password && (
              <p className="text-sm text-red-500">{errors.new_password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirm_password"
                name="confirm_password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirm_password}
                onChange={handleInputChange}
                className={errors.confirm_password ? 'border-red-500' : ''}
                placeholder="Re-enter password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.confirm_password && (
              <p className="text-sm text-red-500">{errors.confirm_password}</p>
            )}
            {formData.confirm_password && formData.new_password === formData.confirm_password && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <Check className="h-3 w-3" />
                Passwords match
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Changing Password...' : 'Change Password'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

