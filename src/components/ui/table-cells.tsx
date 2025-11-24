import React, { type ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  User,
  type LucideIcon,
} from 'lucide-react';

// ============================================================================
// AVATAR CELL
// ============================================================================

interface AvatarCellProps {
  name: string;
  subtitle?: string;
  icon?: LucideIcon;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarCell({ name, subtitle, icon, avatarUrl, size = 'md' }: AvatarCellProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  // Determine what to render in the avatar circle
  const renderIcon = () => {
    if (avatarUrl) {
      return <img src={avatarUrl} alt={name} className="w-full h-full rounded-full object-cover" />;
    }
    
    if (icon) {
      const Icon = icon;
      return (
        <Icon className={cn(
          'text-gray-700 dark:text-gray-300',
          size === 'sm' && 'h-3 w-3',
          size === 'md' && 'h-4 w-4',
          size === 'lg' && 'h-5 w-5'
        )} />
      );
    }
    
    // Default to first letter
    return (
      <span className="font-medium text-gray-700 dark:text-gray-300">
        {name.charAt(0).toUpperCase()}
      </span>
    );
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className={cn(
        'bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0',
        sizeClasses[size]
      )}>
        {renderIcon()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-medium text-gray-900 dark:text-white truncate">{name}</div>
        {subtitle && (
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{subtitle}</div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// STATUS BADGE CELL
// ============================================================================

interface StatusBadgeCellProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  icon?: ReactNode;
  showIcon?: boolean;
}

export function StatusBadgeCell({ status, variant = 'default', icon, showIcon = true }: StatusBadgeCellProps) {
  const variantConfig = {
    default: {
      className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      icon: <Clock className="h-3 w-3" />,
    },
    success: {
      className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    warning: {
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      icon: <AlertCircle className="h-3 w-3" />,
    },
    error: {
      className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      icon: <XCircle className="h-3 w-3" />,
    },
    info: {
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      icon: <AlertCircle className="h-3 w-3" />,
    },
  };

  const config = variantConfig[variant] || variantConfig.default;
  const displayIcon = (icon != null && icon !== false && icon !== true) ? icon : config.icon;

  return (
    <Badge className={cn('border-0 text-xs font-medium', config.className)}>
      {showIcon && <span className="mr-1">{displayIcon}</span>}
      {status}
    </Badge>
  );
}

// ============================================================================
// CURRENCY CELL
// ============================================================================

interface CurrencyCellProps {
  amount: number | string;
  currency: string;
  variant?: 'default' | 'positive' | 'negative';
  showCurrency?: boolean;
  decimals?: number;
}

export function CurrencyCell({ 
  amount, 
  currency, 
  variant = 'default',
  showCurrency = true,
  decimals = 2,
}: CurrencyCellProps) {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  const variantClasses = {
    default: 'text-gray-900 dark:text-white',
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
  };

  const formattedAmount = numAmount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={cn('font-medium', variantClasses[variant])}>
      {showCurrency && `${currency} `}{formattedAmount}
    </span>
  );
}

// ============================================================================
// DATE CELL
// ============================================================================

interface DateCellProps {
  date: string | Date;
  format?: 'short' | 'long' | 'time' | 'relative';
  icon?: LucideIcon;
  showIcon?: boolean;
}

export function DateCell({ date, format = 'short', icon: Icon, showIcon = false }: DateCellProps) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const formatDate = () => {
    switch (format) {
      case 'short':
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      case 'long':
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      case 'time':
        return dateObj.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });
      case 'relative':
        const now = new Date();
        const diffMs = now.getTime() - dateObj.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
      default:
        return dateObj.toLocaleDateString();
    }
  };

  return (
    <div className="flex items-center gap-2">
      {showIcon && Icon && <Icon className="h-4 w-4 text-gray-400" />}
      <span className="text-sm text-gray-600 dark:text-gray-400">{formatDate()}</span>
    </div>
  );
}

// ============================================================================
// TEXT WITH ICON CELL
// ============================================================================

interface TextWithIconCellProps {
  text: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
}

export function TextWithIconCell({ text, subtitle, icon: Icon, iconColor = "text-gray-500" }: TextWithIconCellProps) {
  return (
    <div className="flex items-center gap-2">
      <Icon className={`h-4 w-4 ${iconColor}`} />
      <div className="min-w-0">
        <div className="text-sm text-gray-700 dark:text-gray-300 truncate">{text}</div>
        {subtitle && (
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{subtitle}</div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MULTI-LINE CELL
// ============================================================================

interface MultiLineCellProps {
  primary: string | ReactNode;
  secondary?: string | ReactNode;
  tertiary?: string | ReactNode;
  primaryClassName?: string;
  secondaryClassName?: string;
  tertiaryClassName?: string;
}

export function MultiLineCell({ 
  primary, 
  secondary, 
  tertiary,
  primaryClassName,
  secondaryClassName,
  tertiaryClassName,
}: MultiLineCellProps) {
  return (
    <div className="min-w-0">
      <div className={cn('font-medium text-gray-900 dark:text-white', primaryClassName)}>
        {primary}
      </div>
      {secondary && (
        <div className={cn('text-xs text-gray-500 dark:text-gray-400 mt-0.5', secondaryClassName)}>
          {secondary}
        </div>
      )}
      {tertiary && (
        <div className={cn('text-xs text-gray-400 dark:text-gray-500 mt-0.5', tertiaryClassName)}>
          {tertiary}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TAG LIST CELL
// ============================================================================

interface TagListCellProps {
  tags: string[];
  maxVisible?: number;
  variant?: 'default' | 'primary' | 'secondary';
}

export function TagListCell({ tags, maxVisible = 2, variant = 'default' }: TagListCellProps) {
  const visibleTags = tags.slice(0, maxVisible);
  const remainingCount = tags.length - maxVisible;

  const variantClasses = {
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    primary: 'bg-primary/10 text-primary dark:bg-primary/20',
    secondary: 'bg-secondary/10 text-secondary dark:bg-secondary/20',
  };

  return (
    <div className="flex flex-wrap gap-1">
      {visibleTags.map((tag, index) => (
        <Badge 
          key={index} 
          variant="secondary"
          className={cn('text-xs px-2 py-0.5', variantClasses[variant])}
        >
          {tag}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge 
          variant="secondary"
          className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300"
        >
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
}

// ============================================================================
// PROGRESS CELL
// ============================================================================

interface ProgressCellProps {
  value: number;
  max?: number;
  showPercentage?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export function ProgressCell({ 
  value, 
  max = 100, 
  showPercentage = true,
  variant = 'default',
}: ProgressCellProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const variantClasses = {
    default: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={cn('h-full transition-all duration-300', variantClasses[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[3ch]">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}

// Export all components
export default {
  AvatarCell,
  StatusBadgeCell,
  CurrencyCell,
  DateCell,
  TextWithIconCell,
  MultiLineCell,
  TagListCell,
  ProgressCell,
};

