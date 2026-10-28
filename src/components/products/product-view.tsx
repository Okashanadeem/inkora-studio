'use client';

import * as React from 'react';
import { Container, Section } from '@/components/shared/layout';
import { Price } from '@/components/shared/price';
import { OptionPicker } from '@/components/shared/option-picker';
import { QuantityStepper, TierPriceTable } from '@/components/shared/pricing-controls';
import { WhatsAppButton } from '@/components/shared/whatsapp-button';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldCheck, Truck, ShoppingBag, ImageIcon } from 'lucide-react';

interface ProductViewProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    base_price: number;
    category?: { name: string; slug: string };
    options: {
      id?: string;
      name: string;
      option_values: { id?: string; label: string; price_modifier: number }[];
    }[];
    priceTiers: { min_qty: number; unit_price: number }[];
  };
}

export function ProductCustomizerView({ product }: ProductViewProps) {
  const [selectedOptions, setSelectedOptions] = React.useState<Record<string, string>>(() => {
    // Default to the first option value for each group
    const initial: Record<string, string> = {};
    product.options.forEach((group) => {
      if (group.option_values.length > 0) {
        initial[group.name] = group.option_values[0].label;
      }
    });
    return initial;
  });

  const [quantity, setQuantity] = React.useState(1);

  // Calculate live price based on base price, option modifiers, and quantity/tiers
  const unitPrice = React.useMemo(() => {
    let price = product.base_price;

    // Check tier pricing first
    if (product.priceTiers && product.priceTiers.length > 0) {
      const matchedTier = [...product.priceTiers]
        .sort((a, b) => b.min_qty - a.min_qty)
        .find((t) => quantity >= t.min_qty);
      if (matchedTier) {
        price = matchedTier.unit_price;
      }
    }

    // Add option modifiers
    product.options.forEach((group) => {
      const selectedLabel = selectedOptions[group.name];
      if (selectedLabel) {
        const optionVal = group.option_values.find((v) => v.label === selectedLabel);
        if (optionVal) {
          price += optionVal.price_modifier;
        }
      }
    });

    return price;
  }, [product, selectedOptions, quantity]);

  const totalPrice = unitPrice * quantity;

  const handleSelectOption = (groupName: string, valueLabel: string) => {
    setSelectedOptions((prev) => ({ ...prev, [groupName]: valueLabel }));
  };

  return (
    <Section spacing="md">
      <Container size="xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Gallery / Product Mockup */}
          <div className="space-y-4 sticky top-24">
            <div className="aspect-4/3 rounded-2xl border bg-muted/40 flex flex-col items-center justify-center p-8 text-center">
              <div className="h-16 w-16 rounded-full bg-background flex items-center justify-center text-muted-foreground shadow-xs mb-3">
                <ImageIcon className="h-8 w-8 opacity-50" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">{product.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Real-time preview will adapt with uploaded artwork in Phase 5.
              </p>
            </div>
          </div>

          {/* Configuration & Order Panel */}
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {product.category?.name || 'Custom Print'}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Free Shipping on orders above PKR 3,000
                </span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                {product.name}
              </h1>
              <div className="pt-2 flex items-baseline gap-3">
                <Price amount={unitPrice} className="text-2xl font-bold" />
                {quantity > 1 && (
                  <span className="text-sm text-muted-foreground">
                    (Total: <Price amount={totalPrice} />)
                  </span>
                )}
              </div>
            </div>

            {/* Options Picker */}
            <OptionPicker
              options={product.options}
              selectedValues={selectedOptions}
              onSelectOption={handleSelectOption}
            />

            {/* Bulk Pricing Tiers */}
            {product.priceTiers.length > 0 && (
              <TierPriceTable tiers={product.priceTiers} currentQuantity={quantity} />
            )}

            {/* Quantity Stepper */}
            <div className="space-y-2">
              <span className="font-semibold text-sm text-foreground block">Select Quantity</span>
              <QuantityStepper quantity={quantity} onChange={setQuantity} min={1} />
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button size="lg" className="flex-1 gap-2 font-medium">
                <ShoppingBag className="h-4 w-4" /> Add to Cart (PKR {totalPrice.toLocaleString()})
              </Button>
              <WhatsAppButton productName={product.name} productSlug={product.slug} size="lg" />
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 rounded-xl border bg-muted/10 p-4 text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <span>Digital artwork proof before printing</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary shrink-0" />
                <span>Fast nationwide delivery across Pakistan</span>
              </div>
            </div>

            {/* Detailed Tabs */}
            <Tabs defaultValue="specifications" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                <TabsTrigger
                  value="specifications"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Specifications
                </TabsTrigger>
                <TabsTrigger
                  value="turnaround"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Production & Shipping
                </TabsTrigger>
                <TabsTrigger
                  value="faq"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  FAQs
                </TabsTrigger>
              </TabsList>
              <TabsContent
                value="specifications"
                className="pt-4 text-sm text-muted-foreground space-y-2"
              >
                <p>
                  {product.description ||
                    'Premium custom-print product manufactured with archival grade inks and substrate.'}
                </p>
              </TabsContent>
              <TabsContent
                value="turnaround"
                className="pt-4 text-sm text-muted-foreground space-y-2"
              >
                <p>
                  Standard print production turnaround is 2-4 business days after proof approval.
                  Delivered via tracked courier across all major cities in Pakistan.
                </p>
              </TabsContent>
              <TabsContent value="faq" className="pt-4 text-sm text-muted-foreground space-y-2">
                <p>
                  <strong>How do I send my artwork?</strong> You can upload your PDF, PNG, or TIFF
                  file directly during checkout, or send it directly to our team via WhatsApp.
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Container>
    </Section>
  );
}
