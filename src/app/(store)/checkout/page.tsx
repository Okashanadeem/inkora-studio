'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Container, Section, PageHeader } from '@/components/shared/layout';
import { useCartStore } from '@/lib/cart/cart-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Price } from '@/components/shared/price';
import { PromoCodeInput } from '@/components/shared/promo-code-input';
import { placeOrderAction } from '@/modules/orders/actions';
import { ShieldCheck, Truck, ArrowRight, Lock } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const subtotal = getSubtotal();
  const [couponDiscount, setCouponDiscount] = React.useState(0);
  const [appliedCouponCode, setAppliedCouponCode] = React.useState('');
  const shippingTotal = subtotal >= 3000 ? 0 : 250;
  const grandTotal = Math.max(0, subtotal - couponDiscount + shippingTotal);

  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Form State (Section 7: 3 clear sections)
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [marketingConsent, setMarketingConsent] = React.useState(false);

  const [addressLine1, setAddressLine1] = React.useState('');
  const [city, setCity] = React.useState('');
  const [province, setProvince] = React.useState('Punjab');
  const [postalCode, setPostalCode] = React.useState('');

  const [paymentMethod, setPaymentMethod] = React.useState<
    'cod' | 'bank_transfer' | 'online' | 'quotation'
  >('cod');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setErrorMessage('Your cart is empty. Please add items before placing an order.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const idempotencyKey = `idemp-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

      const orderResult = await placeOrderAction({
        contact: {
          fullName,
          email,
          phone,
          marketingConsent,
        },
        shipping: {
          addressLine1,
          city,
          province,
          postalCode,
        },
        items: items.map((i) => ({
          productId: i.productId,
          productName: i.name,
          quantity: i.quantity,
          optionsSnapshot: i.options,
          artworkKey: i.artworkKey,
        })),
        paymentMethod,
        idempotencyKey,
        couponCode: appliedCouponCode || undefined,
      });

      clearCart();
      router.push(`/order/${orderResult.trackingToken}`);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section spacing="md">
      <Container size="xl">
        <PageHeader
          title="Secure Checkout"
          description="Single-page ordering. Guest checkout supported with instant WhatsApp & email tracking."
        />

        {items.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Button onClick={() => router.push('/products')} className="mt-4">
              Return to Catalog
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-6">
            {/* Left 2 Cols: Form Sections */}
            <div className="lg:col-span-2 space-y-8">
              {/* Section 1: Contact Information */}
              <div className="rounded-xl border bg-card p-6 space-y-4">
                <h3 className="text-base font-bold text-foreground">1. Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      required
                      placeholder="Ahmed Khan"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      placeholder="ahmed@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone Number (WhatsApp preferred)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      placeholder="0300 1234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                {/* Double opt-in marketing checkbox (Unchecked by default - Section 13) */}
                <div className="flex items-start gap-2.5 pt-2">
                  <Checkbox
                    id="marketing"
                    checked={marketingConsent}
                    onCheckedChange={(c) => setMarketingConsent(Boolean(c))}
                  />
                  <Label
                    htmlFor="marketing"
                    className="text-xs font-normal text-muted-foreground leading-snug cursor-pointer"
                  >
                    Email me about new products, offers and updates. I can unsubscribe at any time.
                  </Label>
                </div>
              </div>

              {/* Section 2: Delivery Address */}
              <div className="rounded-xl border bg-card p-6 space-y-4">
                <h3 className="text-base font-bold text-foreground">2. Delivery Address</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="address">Street Address / House / Flat</Label>
                    <Input
                      id="address"
                      required
                      placeholder="House 12, Street 4, Sector F-7/1"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      required
                      placeholder="Islamabad / Lahore / Karachi"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="province">Province</Label>
                    <Input
                      id="province"
                      required
                      placeholder="Punjab / Sindh / KPK / Islamabad"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Payment Method */}
              <div className="rounded-xl border bg-card p-6 space-y-4">
                <h3 className="text-base font-bold text-foreground">3. Payment Method</h3>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(v) =>
                    setPaymentMethod(v as 'cod' | 'bank_transfer' | 'online' | 'quotation')
                  }
                  className="space-y-3"
                >
                  <div className="flex items-start gap-3 p-3.5 rounded-lg border bg-muted/20">
                    <RadioGroupItem value="cod" id="pm-cod" className="mt-0.5" />
                    <Label htmlFor="pm-cod" className="cursor-pointer space-y-1">
                      <span className="font-semibold text-sm text-foreground block">
                        Cash on Delivery (COD)
                      </span>
                      <span className="text-xs text-muted-foreground block">
                        Pay in cash upon arrival. First-time or high-value orders may require
                        WhatsApp phone confirmation.
                      </span>
                    </Label>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-lg border bg-muted/20">
                    <RadioGroupItem value="bank_transfer" id="pm-bank" className="mt-0.5" />
                    <Label htmlFor="pm-bank" className="cursor-pointer space-y-1">
                      <span className="font-semibold text-sm text-foreground block">
                        Direct Bank Transfer (IBFT) / Raast
                      </span>
                      <span className="text-xs text-muted-foreground block">
                        Transfer directly to our corporate bank account. Share screenshot proof on
                        WhatsApp.
                      </span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Right Col: Order Summary */}
            <div className="space-y-6">
              <div className="rounded-xl border bg-card p-6 space-y-4 sticky top-24">
                <h3 className="text-base font-bold text-foreground">Order Summary</h3>

                <div className="space-y-3 max-h-64 overflow-y-auto divide-y pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="pt-3 first:pt-0 flex justify-between text-xs">
                      <div>
                        <span className="font-medium text-foreground block line-clamp-1">
                          {item.name}
                        </span>
                        <span className="text-muted-foreground">Qty: {item.quantity}</span>
                      </div>
                      <Price amount={item.unitPrice * item.quantity} />
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <Price amount={subtotal} />
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount ({appliedCouponCode})</span>
                      <span>
                        -<Price amount={couponDiscount} />
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Shipping</span>
                    {shippingTotal === 0 ? (
                      <span className="text-emerald-600 font-semibold text-xs">FREE</span>
                    ) : (
                      <Price amount={shippingTotal} />
                    )}
                  </div>
                  <div className="flex justify-between font-bold text-base pt-2 border-t text-foreground">
                    <span>Total</span>
                    <Price amount={grandTotal} className="text-lg" />
                  </div>
                </div>

                {/* Promo Code Input */}
                <div className="pt-2 border-t">
                  <PromoCodeInput
                    subtotal={subtotal}
                    onApplyDiscount={(discount, promoName) => {
                      setCouponDiscount(discount);
                      setAppliedCouponCode(promoName);
                    }}
                  />
                </div>

                {errorMessage && (
                  <p className="text-xs text-destructive font-medium">{errorMessage}</p>
                )}

                <Button type="submit" size="lg" disabled={loading} className="w-full gap-2">
                  <Lock className="h-4 w-4" />
                  {loading
                    ? 'Processing Order...'
                    : `Place Order (PKR ${grandTotal.toLocaleString()})`}
                </Button>

                <div className="space-y-2 pt-2 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    <span>Server-authoritative price verification</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-primary" />
                    <span>Nationwide tracked dispatch across Pakistan</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </Container>
    </Section>
  );
}
