import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Price, DiscountBadge } from '@/components/shared/price';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, ImageIcon } from 'lucide-react';

export interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  originalPrice?: number;
  categoryName?: string;
  isCustomizable?: boolean;
  isTrending?: boolean;
  discountPercentage?: number;
}

export function ProductCard({
  name,
  slug,
  basePrice,
  originalPrice,
  categoryName,
  isCustomizable = true,
  isTrending = false,
  discountPercentage,
}: ProductCardProps) {
  return (
    <Card className="group overflow-hidden flex flex-col justify-between transition-all duration-200 hover:shadow-md">
      <Link
        href={`/products/${slug}`}
        className="block relative aspect-4/3 w-full bg-muted/60 overflow-hidden flex items-center justify-center"
      >
        {/* Placeholder image container */}
        <div className="flex flex-col items-center justify-center text-muted-foreground group-hover:scale-105 transition-transform duration-300">
          <ImageIcon className="h-10 w-10 opacity-40 mb-1" />
          <span className="text-xs uppercase tracking-wider font-medium opacity-60">
            Custom Print
          </span>
        </div>

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {isTrending && (
            <Badge className="bg-accent text-accent-foreground gap-1 text-[10px] font-bold px-2 py-0.5">
              <Flame className="h-3 w-3 fill-current" /> TRENDING
            </Badge>
          )}
          {discountPercentage && <DiscountBadge percentage={discountPercentage} />}
        </div>
      </Link>

      <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {categoryName && (
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {categoryName}
            </span>
          )}
          <Link href={`/products/${slug}`}>
            <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1 mt-0.5">
              {name}
            </h3>
          </Link>
          {isCustomizable && (
            <p className="text-xs text-muted-foreground mt-0.5">Upload artwork or custom design</p>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <Price amount={basePrice} originalAmount={originalPrice} />
          <Link href={`/products/${slug}`}>
            <Button size="sm" variant="outline" className="h-8 px-3 text-xs">
              Customize
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProductGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {children}
    </div>
  );
}
