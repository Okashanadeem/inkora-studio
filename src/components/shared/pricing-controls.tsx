'use client';

import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { formatPKR } from '@/lib/money';

export interface QuantityStepperProps {
  quantity: number;
  min?: number;
  max?: number;
  onChange: (quantity: number) => void;
}

export function QuantityStepper({ quantity, min = 1, max = 1000, onChange }: QuantityStepperProps) {
  const handleDecrement = () => {
    if (quantity > min) onChange(quantity - 1);
  };

  const handleIncrement = () => {
    if (quantity < max) onChange(quantity + 1);
  };

  return (
    <div className="inline-flex items-center rounded-lg border bg-card">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-r-none"
        onClick={handleDecrement}
        disabled={quantity <= min}
      >
        <Minus className="h-3.5 w-3.5" />
        <span className="sr-only">Decrease quantity</span>
      </Button>

      <span className="w-12 text-center text-sm font-semibold tabular-nums">{quantity}</span>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-l-none"
        onClick={handleIncrement}
        disabled={quantity >= max}
      >
        <Plus className="h-3.5 w-3.5" />
        <span className="sr-only">Increase quantity</span>
      </Button>
    </div>
  );
}

export interface TierPrice {
  min_qty: number;
  unit_price: number;
}

export interface TierPriceTableProps {
  tiers: TierPrice[];
  currentQuantity: number;
}

export function TierPriceTable({ tiers, currentQuantity }: TierPriceTableProps) {
  if (tiers.length === 0) return null;

  return (
    <div className="rounded-lg border bg-muted/20 p-3 space-y-2 text-xs">
      <span className="font-semibold text-foreground block">Bulk Pricing Tiers</span>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {tiers.map((tier) => {
          const isActive = currentQuantity >= tier.min_qty;
          return (
            <div
              key={tier.min_qty}
              className={`p-2 rounded border transition-colors ${
                isActive ? 'border-primary/40 bg-primary/10 font-medium' : 'border-border bg-card'
              }`}
            >
              <div className="text-muted-foreground">{tier.min_qty}+ units</div>
              <div className="font-semibold text-foreground">
                {formatPKR(tier.unit_price)} / each
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
