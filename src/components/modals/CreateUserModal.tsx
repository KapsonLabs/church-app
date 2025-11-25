import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiService, type CreateUserRequest, type UserRole } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Eye, EyeOff, UserPlus, Shield, Mail, Phone, User, Lock, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    role: '',
    is_primary_branch: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Password validation helper
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

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
    }
  }, [isOpen]);

  const fetchRoles = async () => {
    if (!user?.branch?.organization_id) return;

    try {
      setLoadingRoles(true);
      const response = await apiService.fetchBranchRoles(user.branch.organization_id);
      setRoles(response.data.filter(role => role.is_active));
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch roles. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoadingRoles(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordErrors = validatePassword(formData.password);
      if (passwordErrors.length > 0) {
        newErrors.password = `Password must include: ${passwordErrors.join(', ')}`;
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // First name validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    // Last name validation
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    // Phone number validation
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!/^\+?[1-9]\d{9,14}$/.test(formData.phone_number.replace(/\s/g, ''))) {
      newErrors.phone_number = 'Invalid phone number format (e.g., +256700000000)';
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        variant: 'destructive',
      });
      return;
    }

    if (!user?.branch?.id) {
      toast({
        title: 'Error',
        description: 'No branch information available',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const userData: CreateUserRequest = {
        email: formData.email.trim(),
        username: formData.username.trim(),
        password: formData.password,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone_number: formData.phone_number.trim(),
        role: formData.role,
        is_primary_branch: formData.is_primary_branch,
      };

      await apiService.createBranchUser(parseInt(user.branch.id, 10), userData);

      toast({
        title: 'Success',
        description: 'User created successfully',
      });

      // Reset form
      setFormData({
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        role: '',
        is_primary_branch: true,
      });
      setErrors({});
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create user. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        role: '',
        is_primary_branch: true,
      });
      setErrors({});
      setShowPassword(false);
      setShowConfirmPassword(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Create New User
          </DialogTitle>
          <DialogDescription>
            Add a new user account to your branch. All fields are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="first_name">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="John"
                  className={cn(errors.first_name && 'border-red-500')}
                  disabled={isLoading}
                />
                {errors.first_name && (
                  <p className="text-xs text-red-500">{errors.first_name}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="last_name">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="Doe"
                  className={cn(errors.last_name && 'border-red-500')}
                  disabled={isLoading}
                />
                {errors.last_name && (
                  <p className="text-xs text-red-500">{errors.last_name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contact Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="user@example.com"
                  className={cn(errors.email && 'border-red-500')}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone_number">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4 text-muted-foreground absolute ml-3" />
                  <Input
                    id="phone_number"
                    value={formData.phone_number}
                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                    placeholder="+256700000000"
                    className={cn('pl-10', errors.phone_number && 'border-red-500')}
                    disabled={isLoading}
                  />
                </div>
                {errors.phone_number && (
                  <p className="text-xs text-red-500">{errors.phone_number}</p>
                )}
              </div>
            </div>
          </div>

          {/* Account Credentials */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Account Credentials
            </h3>

            {/* Password Requirements Info */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Password must be at least 8 characters and include an uppercase letter and a number.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-1">
              <Label htmlFor="username">
                Username <span className="text-red-500">*</span>
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="johndoe"
                className={cn(errors.username && 'border-red-500')}
                disabled={isLoading}
              />
              {errors.username && (
                <p className="text-xs text-red-500">{errors.username}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="••••••••"
                    className={cn('pr-10', errors.password && 'border-red-500')}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Password strength:</span>
                      <span className={`font-medium ${getPasswordStrength(formData.password).color}`}>
                        {getPasswordStrength(formData.password).level}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          getPasswordStrength(formData.password).level === 'Strong' ? 'bg-green-500' :
                          getPasswordStrength(formData.password).level === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${getPasswordStrength(formData.password).percentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Validation Checklist */}
                {formData.password && (
                  <div className="space-y-1 text-xs">
                    <div className={`flex items-center gap-1 ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
                      <Check className="h-3 w-3" />
                      <span>At least 8 characters</span>
                    </div>
                    <div className={`flex items-center gap-1 ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                      <Check className="h-3 w-3" />
                      <span>One uppercase letter</span>
                    </div>
                    <div className={`flex items-center gap-1 ${/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                      <Check className="h-3 w-3" />
                      <span>One number</span>
                    </div>
                  </div>
                )}

                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirmPassword">
                  Confirm Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="••••••••"
                    className={cn('pr-10', errors.confirmPassword && 'border-red-500')}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500">{errors.confirmPassword}</p>
                )}
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Passwords match
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Role & Branch Settings */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Role & Branch Settings
            </h3>
            
            <div className="space-y-1">
              <Label htmlFor="role">
                Role <span className="text-red-500">*</span>
              </Label>
              {loadingRoles ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading roles...</span>
                </div>
              ) : (
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleInputChange('role', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className={cn(errors.role && 'border-red-500')}>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        <div className="flex items-center gap-2">
                          <Shield className="h-3 w-3" />
                          <span>{role.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({role.permissions_count} permissions)
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.role && (
                <p className="text-xs text-red-500">{errors.role}</p>
              )}
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="is_primary_branch"
                checked={formData.is_primary_branch}
                onCheckedChange={(checked) => handleInputChange('is_primary_branch', checked)}
                disabled={isLoading}
              />
              <Label htmlFor="is_primary_branch" className="cursor-pointer">
                Set as Primary Branch
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Primary branch users have full access to this branch's resources.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || loadingRoles}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create User
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

