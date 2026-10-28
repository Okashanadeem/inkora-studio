'use client';

import * as React from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/cart/cart-store';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Price } from '@/components/shared/price';
import { QuantityStepper } from '@/components/shared/pricing-controls';
import { Trash2, ShoppingBag, ArrowRight, FileCheck } from 'lucide-react';
import { EmptyState } from '@/components/shared/states';

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();
  const freeShippingThreshold = 3000;
  const progressToFreeShipping = Math.min(
    100,
    Math.round((subtotal / freeShippingThreshold) * 100),
  );
  const amountRemaining = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col justify-between p-6">
        <div>
          <SheetHeader className="pb-4 border-b">
            <SheetTitle className="flex items-center gap-2 text-lg font-bold">
              <ShoppingBag className="h-5 w-5" />
              <span>Shopping Cart ({items.length})</span>
            </SheetTitle>
          </SheetHeader>

          {/* Free Shipping Progress Meter */}
          {items.length > 0 && (
            <div className="py-3 px-1 border-b space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span>
                  {amountRemaining === 0 ? (
                    <span className="text-emerald-600 font-semibold">
                      🎉 You unlocked FREE Shipping!
                    </span>
                  ) : (
                    <span>
                      Add <Price amount={amountRemaining} /> more for <strong>FREE Delivery</strong>
                    </span>
                  )}
                </span>
                <span className="text-muted-foreground">{progressToFreeShipping}%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progressToFreeShipping}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Lines */}
          <div className="py-4 space-y-4 max-h-[55vh] overflow-y-auto pr-1">
            {items.length === 0 ? (
              <EmptyState
                title="Your cart is empty"
                description="Browse our custom print catalog to customize and add items."
                actionLabel="Explore Products"
                onAction={closeCart}
              />
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex gap-4 p-3 rounded-xl border bg-card/60">
                  <div className="flex-1 space-y-1">
                    <h4 className="font-semibold text-sm line-clamp-1">{item.name}</h4>
                    <div className="text-xs text-muted-foreground">
                      {Object.entries(item.options).map(([k, v]) => (
                        <span key={k} className="mr-2">
                          {k}: {v}
                        </span>
                      ))}
                    </div>

                    {item.artworkKey && (
                      <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium pt-0.5">
                        <FileCheck className="h-3.5 w-3.5" />
                        <span>Artwork attached</span>
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between">
                      <QuantityStepper
                        quantity={item.quantity}
                        onChange={(q) => updateQuantity(item.id, q)}
                        min={1}
                      />
                      <Price
                        amount={item.unitPrice * item.quantity}
                        className="text-sm font-bold"
                      />
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive self-start"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer with subtotal and checkout button */}
        {items.length > 0 && (
          <SheetFooter className="border-t pt-4 space-y-3">
            <div className="flex justify-between items-baseline text-base font-bold w-full">
              <span>Subtotal</span>
              <Price amount={subtotal} className="text-xl" />
            </div>
            <p className="text-xs text-muted-foreground text-left">
              Shipping & taxes calculated at checkout. Prices recalculated on server.
            </p>
            <div className="flex flex-col gap-2 w-full pt-1">
              <Link href="/checkout" onClick={closeCart} className="w-full">
                <Button className="w-full gap-2 font-medium" size="lg">
                  Proceed to Checkout <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={closeCart} className="w-full">
                Continue Shopping
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
