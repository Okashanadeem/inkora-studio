'use client';

import * as React from 'react';
import Link from 'next/link';
import { Container } from '@/components/shared/layout';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, ShoppingBag, Flame } from 'lucide-react';
import { useCartStore } from '@/lib/cart/cart-store';
import { CartDrawer } from '@/components/shared/cart-drawer';

export function Header() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { openCart, getItemCount } = useCartStore();
  const itemCount = getItemCount();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    {
      name: 'Trending',
      href: '/trending',
      icon: <Flame className="h-4 w-4 text-accent fill-accent" />,
    },
    { name: 'About', href: '/about' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="bg-primary px-4 py-2 text-center text-xs font-medium text-primary-foreground">
        Custom printing across Pakistan · WhatsApp inquiry available on all items
      </div>
      <Container size="xl" className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-foreground">
              INKORA<span className="text-accent font-extrabold">.</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative" onClick={openCart}>
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                {itemCount}
              </span>
            )}
            <span className="sr-only">Shopping Cart</span>
          </Button>

          <CartDrawer />

          {/* Mobile Navigation Sheet */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px]">
              <div className="flex flex-col gap-6 pt-6">
                <Link
                  href="/"
                  className="text-xl font-bold tracking-tight"
                  onClick={() => setIsOpen(false)}
                >
                  INKORA<span className="text-accent font-extrabold">.</span>
                </Link>
                <div className="flex flex-col gap-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {item.icon}
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t bg-muted/40 text-muted-foreground">
      <Container size="xl" className="py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <h3 className="text-base font-bold text-foreground">
              INKORA STUDIO<span className="text-accent font-extrabold">.</span>
            </h3>
            <p className="text-sm">
              Custom-print e-commerce platform delivering high quality prints, cards, merchandise,
              and gifts across Pakistan.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Catalog</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/products" className="hover:text-foreground">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/trending" className="hover:text-foreground">
                  Trending Items
                </Link>
              </li>
              <li>
                <Link href="/categories/prints" className="hover:text-foreground">
                  Art Prints
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Customer Support</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/shipping" className="hover:text-foreground">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/refunds" className="hover:text-foreground">
                  Refunds & Returns
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Inquiries</h4>
            <p className="mt-3 text-sm">
              Have questions about custom or bulk printing? Reach us directly on WhatsApp.
            </p>
          </div>
        </div>
        <div className="mt-12 border-t pt-6 text-center text-xs">
          © 2026 Inkora Studio. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}
