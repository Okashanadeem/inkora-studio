'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { applyCouponAction } from '@/modules/promotions/actions';
import { Tag, Check, X } from 'lucide-react';
import { formatPKR } from '@/lib/money';

export interface PromoCodeInputProps {
  subtotal: number;
  onApplyDiscount: (discount: number, promoName: string) => void;
}

export function PromoCodeInput({ subtotal, onApplyDiscount }: PromoCodeInputProps) {
  const [code, setCode] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [appliedName, setAppliedName] = React.useState<string | null>(null);
  const [statusMessage, setStatusMessage] = React.useState<{
    text: string;
    isError: boolean;
  } | null>(null);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setStatusMessage(null);

    try {
      const result = await applyCouponAction(subtotal, code.trim());
      if (result.isApplied) {
        setAppliedName(result.appliedPromotion?.name || code.toUpperCase());
        setStatusMessage({
          text: `Saved ${formatPKR(result.discountAmount)} with ${result.appliedPromotion?.name}!`,
          isError: false,
        });
        onApplyDiscount(result.discountAmount, result.appliedPromotion?.name || code);
      } else {
        setStatusMessage({
          text: result.message || 'Invalid coupon code or minimum spend requirement not met.',
          isError: true,
        });
      }
    } catch {
      setStatusMessage({ text: 'Failed to validate coupon code.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setCode('');
    setAppliedName(null);
    setStatusMessage(null);
    onApplyDiscount(0, '');
  };

  if (appliedName) {
    return (
      <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs">
        <div className="flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
          <Check className="h-4 w-4 shrink-0" />
          <span>Coupon &quot;{appliedName}&quot; applied</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRemove}
          className="h-6 w-6 text-muted-foreground hover:text-destructive"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <form onSubmit={handleApply} className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Promo code (e.g. WELCOME20)"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="pl-8 text-xs font-mono uppercase"
          />
        </div>
        <Button
          type="submit"
          size="sm"
          variant="outline"
          disabled={loading || !code.trim()}
          className="text-xs"
        >
          {loading ? 'Checking...' : 'Apply'}
        </Button>
      </form>

      {statusMessage && (
        <p className={`text-xs ${statusMessage.isError ? 'text-destructive' : 'text-emerald-600'}`}>
          {statusMessage.text}
        </p>
      )}
    </div>
  );
}
