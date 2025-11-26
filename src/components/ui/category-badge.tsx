// Note: Category type may not exist
// Stub type for build compatibility
type Category = {
  name: string;
  color: keyof typeof categoryColorMap;
};

import { cn } from '@/lib/utils';

interface CategoryBadgeProps {
  category: Category;
  className?: string;
}

const categoryColorMap: Record<string, string> = {
  friskv: 'bg-category-friskv/20 text-category-friskv border-category-friskv/30',
  software: 'bg-category-software/20 text-category-software border-category-software/30',
  bokforing: 'bg-category-bokforing/20 text-category-bokforing border-category-bokforing/30',
  internet: 'bg-category-internet/20 text-category-internet border-category-internet/30',
  fees: 'bg-category-fees/20 text-category-fees border-category-fees/30',
  income: 'bg-category-income/20 text-category-income border-category-income/30',
  office: 'bg-category-office/20 text-category-office border-category-office/30',
  dinner: 'bg-category-dinner/20 text-category-dinner border-category-dinner/30',
};

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border',
        categoryColorMap[category.color],
        className
      )}
    >
      {category.name}
    </span>
  );
}