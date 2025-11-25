import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, X, Info, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Get variant styles for error toast
 */
const getVariantStyles = (variant: 'error' | 'warning' | 'info' | 'success') => {
  switch (variant) {
    case 'error':
      return {
        icon: AlertTriangle,
        iconColor: 'text-red-500',
        titleColor: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        violationColor: 'text-red-600',
        warningColor: 'text-orange-600',
        suggestionColor: 'text-blue-600'
      };
    case 'warning':
      return {
        icon: AlertTriangle,
        iconColor: 'text-orange-500',
        titleColor: 'text-orange-700',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        violationColor: 'text-orange-600',
        warningColor: 'text-orange-600',
        suggestionColor: 'text-blue-600'
      };
    case 'info':
      return {
        icon: Info,
        iconColor: 'text-blue-500',
        titleColor: 'text-blue-700',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        violationColor: 'text-blue-600',
        warningColor: 'text-blue-600',
        suggestionColor: 'text-blue-600'
      };
    case 'success':
      return {
        icon: CheckCircle2,
        iconColor: 'text-green-500',
        titleColor: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        violationColor: 'text-green-600',
        warningColor: 'text-green-600',
        suggestionColor: 'text-blue-600'
      };
    default:
      return {
        icon: AlertTriangle,
        iconColor: 'text-red-500',
        titleColor: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        violationColor: 'text-red-600',
        warningColor: 'text-orange-600',
        suggestionColor: 'text-blue-600'
      };
  }
};

export interface ErrorToastData {
  error: string;
  violations?: string[];
  warnings?: string[];
  suggestions?: string[];
  actions?: ErrorToastAction[];
  details?: any;
}

export interface ErrorToastAction {
  label: string;
  action: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export interface ErrorToastProps {
  data: ErrorToastData;
  title?: string;
  variant?: 'error' | 'warning' | 'info' | 'success';
  duration?: number;
  onClose?: () => void;
}

/**
 * Global Error Toast Component
 * 
 * A reusable component for displaying verbose error messages with:
 * - Structured error information
 * - Violations and warnings
 * - Actionable suggestions
 * - Custom actions
 * - Different severity levels
 */
export const ErrorToast: React.FC<ErrorToastProps> = ({
  data,
  title,
  variant = 'error',
  duration = 15000, // 15 seconds for verbose messages
  onClose
}) => {
  const { toast } = useToast();

  const styles = getVariantStyles(variant);
  const IconComponent = styles.icon;

  const errorDescription = (
    <div className={cn("p-4 rounded-lg border max-w-md", styles.bgColor, styles.borderColor)}>
      {/* Header with Icon */}
      <div className="flex items-start gap-3 mb-4">
        <IconComponent className={cn("h-5 w-5 mt-0.5 flex-shrink-0", styles.iconColor)} />
        <div className="flex-1">
          <h4 className={cn("font-semibold mb-1", styles.titleColor)}>
            {title || 'Error'}
          </h4>
          <p className="text-gray-700 text-sm">{data.error}</p>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 hover:bg-gray-200"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Violations */}
      {data.violations && data.violations.length > 0 && (
        <div className="mb-4">
          <div className="font-semibold text-sm mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className={styles.violationColor}>Violations:</span>
          </div>
          <div className="space-y-1">
            {data.violations.map((violation, index) => (
              <div key={index} className={cn("text-sm bg-white/50 p-2 rounded border-l-2 border-red-300", styles.violationColor)}>
                <span className="font-medium">{index + 1}.</span> {violation}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {data.warnings && data.warnings.length > 0 && (
        <div className="mb-4">
          <div className="font-semibold text-sm mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className={styles.warningColor}>Warnings:</span>
          </div>
          <div className="space-y-1">
            {data.warnings.map((warning, index) => (
              <div key={index} className={cn("text-sm bg-white/50 p-2 rounded border-l-2 border-orange-300", styles.warningColor)}>
                <span className="font-medium">{index + 1}.</span> {warning}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {data.suggestions && data.suggestions.length > 0 && (
        <div className="mb-4">
          <div className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span className={styles.suggestionColor}>Suggestions:</span>
          </div>
          <div className="space-y-2">
            {data.suggestions.map((suggestion, index) => (
              <div key={index} className="text-sm text-gray-700 bg-white/50 p-2 rounded border-l-2 border-blue-300">
                <span className="font-medium">{index + 1}.</span> {suggestion}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {data.actions && data.actions.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {data.actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'outline'}
                size="sm"
                onClick={action.action}
                className="text-xs"
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  toast({
    title: undefined, // We handle title in the description
    description: errorDescription,
    variant: variant === 'error' ? 'destructive' : 'default',
    duration,
  });
  
  return null;
};

/**
 * Hook for easy error toast usage
 */
export const useErrorToast = () => {
  const { toast } = useToast();

  const showErrorToast = (data: ErrorToastData, options?: {
    title?: string;
    variant?: 'error' | 'warning' | 'info' | 'success';
    duration?: number;
    onClose?: () => void;
  }) => {
    const styles = getVariantStyles(options?.variant || 'error');
    
    // Build the error description JSX
    const errorDescription = (
      <div className={`p-4 rounded-lg border ${styles.bgColor} ${styles.borderColor}`}>
        {/* Error Message */}
        <div className="flex items-start gap-3 mb-4">
          <styles.icon className={`h-5 w-5 mt-0.5 ${styles.iconColor}`} />
          <div className="flex-1">
            <h4 className={`font-semibold ${styles.titleColor} mb-1`}>
              {options?.title || 'Error'}
            </h4>
            <p className="text-gray-700 text-sm">{data.error}</p>
          </div>
        </div>

        {/* Violations */}
        {data.violations && data.violations.length > 0 && (
          <div className="mb-4">
            <div className="font-semibold text-sm mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className={styles.violationColor}>Violations:</span>
            </div>
            <div className="space-y-1">
              {data.violations.map((violation, index) => (
                <div key={index} className={`text-sm ${styles.violationColor} bg-white/50 p-2 rounded border-l-2 border-red-300`}>
                  <span className="font-medium">{index + 1}.</span> {violation}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {data.warnings && data.warnings.length > 0 && (
          <div className="mb-4">
            <div className="font-semibold text-sm mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className={styles.warningColor}>Warnings:</span>
            </div>
            <div className="space-y-1">
              {data.warnings.map((warning, index) => (
                <div key={index} className={`text-sm ${styles.warningColor} bg-white/50 p-2 rounded border-l-2 border-orange-300`}>
                  <span className="font-medium">{index + 1}.</span> {warning}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {data.suggestions && data.suggestions.length > 0 && (
          <div className="mb-4">
            <div className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span className={styles.suggestionColor}>Suggestions:</span>
            </div>
            <div className="space-y-2">
              {data.suggestions.map((suggestion, index) => (
                <div key={index} className="text-sm text-gray-700 bg-white/50 p-2 rounded border-l-2 border-blue-300">
                  <span className="font-medium">{index + 1}.</span> {suggestion}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {data.actions && data.actions.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {data.actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'outline'}
                  size="sm"
                  onClick={action.action}
                  className="text-xs"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    );

    // Call toast directly
    toast({
      title: undefined, // We handle title in the description
      description: errorDescription,
      variant: (options?.variant === 'error') ? 'destructive' : 'default',
      duration: options?.duration || 15000,
    });
  };

  return { showErrorToast };
};

/**
 * Utility function to create error toast data from API error
 */
export const createErrorToastData = (error: any): ErrorToastData => {
  if (error instanceof Error && 'violations' in error && 'warnings' in error) {
    // ApiError instance
    return {
      error: (error as any).error || error.message,
      violations: (error as any).violations || [],
      warnings: (error as any).warnings || [],
      details: (error as any).details,
    };
  }

  // Generic error
  return {
    error: error.message || 'An unexpected error occurred',
    details: error,
  };
};

/**
 * Predefined error toast configurations for common scenarios
 */
export const ErrorToastConfigs = {
  // Transaction errors
  transactionFailed: (error: any, suggestions?: string[]): ErrorToastData => ({
    ...createErrorToastData(error),
    suggestions: suggestions || [
      'Check your account balance',
      'Verify transaction limits',
      'Contact support if the issue persists'
    ],
    actions: [
      {
        label: 'View Account',
        action: () => {
          // Navigate to account page
          console.log('Navigate to account page');
        },
        variant: 'outline'
      },
      {
        label: 'Contact Support',
        action: () => {
          // Open support modal
          console.log('Open support modal');
        },
        variant: 'secondary'
      }
    ]
  }),

  // Validation errors
  validationFailed: (error: any): ErrorToastData => ({
    ...createErrorToastData(error),
    suggestions: [
      'Review the highlighted fields',
      'Ensure all required information is provided',
      'Check format requirements'
    ]
  }),

  // Network errors
  networkError: (_error: any): ErrorToastData => ({
    error: 'Network connection failed',
    suggestions: [
      'Check your internet connection',
      'Try again in a few moments',
      'Contact support if the problem continues'
    ],
    actions: [
      {
        label: 'Retry',
        action: () => window.location.reload(),
        variant: 'default'
      }
    ]
  }),

  // Permission errors
  permissionDenied: (_error: any): ErrorToastData => ({
    error: 'Access denied',
    suggestions: [
      'Contact your administrator for access',
      'Verify your account permissions',
      'Try logging in again'
    ],
    actions: [
      {
        label: 'Contact Admin',
        action: () => {
          console.log('Open contact admin modal');
        },
        variant: 'outline'
      }
    ]
  })
};