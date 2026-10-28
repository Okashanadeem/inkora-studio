import * as React from 'react';
import { cn } from '@/lib/utils';
import { formatPKR } from '@/lib/money';

export interface PriceProps extends React.HTMLAttributes<HTMLSpanElement> {
  amount: number;
  originalAmount?: number;
  showCurrency?: boolean;
}

export function Price({ amount, originalAmount, className, ...props }: PriceProps) {
  const isDiscounted = originalAmount !== undefined && originalAmount > amount;

  return (
    <span className={cn('inline-flex items-baseline gap-2 font-medium', className)} {...props}>
      <span className="text-foreground">{formatPKR(amount)}</span>
      {isDiscounted && (
        <span className="text-sm text-muted-foreground line-through">
          {formatPKR(originalAmount)}
        </span>
      )}
    </span>
  );
}

export interface DiscountBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  percentage?: number;
  label?: string;
}

export function DiscountBadge({ percentage, label, className, ...props }: DiscountBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent',
        className,
      )}
      {...props}
    >
      {label || (percentage ? `${percentage}% OFF` : 'OFFER')}
    </span>
  );
}
