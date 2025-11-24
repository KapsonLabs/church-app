import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MobileTableProps {
  data: any[];
  columns: any[];
  className?: string;
  renderMobileRow: (item: any, index: number) => React.ReactNode;
  title?: string;
}

export function MobileTable({ 
  data, 
  columns, 
  className, 
  renderMobileRow, 
  title 
}: MobileTableProps) {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null; // Let the regular table handle desktop
  }

  return (
    <div className={cn("space-y-4", className)}>
      {title && (
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      )}
      <div className="space-y-3">
        {data.map((item, index) => (
          <Card key={index} className="w-full">
            <CardContent className="p-4">
              {renderMobileRow(item, index)}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Utility component for mobile table rows
export function MobileTableRow({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {children}
    </div>
  );
}

// Utility component for mobile table field
export function MobileTableField({ 
  label, 
  value, 
  className 
}: { 
  label: string; 
  value: React.ReactNode; 
  className?: string; 
}) {
  return (
    <div className={cn("flex justify-between items-center", className)}>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className="text-sm text-foreground">{value}</div>
    </div>
  );
}

// Utility component for mobile table badge
export function MobileTableBadge({ 
  children, 
  variant = "default",
  className 
}: { 
  children: React.ReactNode; 
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string; 
}) {
  return (
    <Badge variant={variant} className={className}>
      {children}
    </Badge>
  );
}
