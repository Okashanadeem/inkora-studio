import Link from 'next/link';
import { Container, Section, PageHeader } from '@/components/shared/layout';
import { Button } from '@/components/ui/button';
import { Price, DiscountBadge } from '@/components/shared/price';
import { Flame, ArrowRight, ShieldCheck, Truck, MessageCircle } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <Section spacing="lg" className="border-b bg-gradient-to-b from-muted/50 to-background">
        <Container size="xl" className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3.5 py-1 text-xs font-semibold text-muted-foreground backdrop-blur mb-6">
            <Flame className="h-4 w-4 text-accent fill-accent" />
            <span>Top Quality Printing in Pakistan</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl max-w-4xl mx-auto leading-tight">
            Bring your creative artwork to life with premium custom prints.
          </h1>

          <p className="mt-5 max-w-2xl mx-auto text-base text-muted-foreground sm:text-lg">
            High-definition prints, customized merchandise, fast proofing, and low-friction
            ordering. Verified payment, COD, and instant WhatsApp support.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/products">
              <Button size="lg" className="font-medium gap-2">
                Explore Catalog <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/trending">
              <Button size="lg" variant="outline" className="gap-2">
                <Flame className="h-4 w-4 text-accent fill-accent" /> Trending Products
              </Button>
            </Link>
          </div>
        </Container>
      </Section>

      {/* Feature Value Props */}
      <Section spacing="md" className="border-b bg-card">
        <Container size="xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Verified Proofing</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Our team inspects artwork resolution and sends digital proofs before production.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Nationwide Delivery</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Safe packaging and parcel tracking delivered to your doorstep anywhere in
                  Pakistan.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-primary/10 p-3 text-primary">
                <MessageCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">WhatsApp Direct Support</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  One-tap inquiry with prefilled product details directly with our team.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Preview Section */}
      <Section spacing="md">
        <Container size="xl">
          <PageHeader
            title="Featured Samples"
            description="Preview how our design tokens and pricing engine format offerings."
            actions={
              <Link href="/dev/components">
                <Button variant="outline" size="sm">
                  View Component Gallery
                </Button>
              </Link>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <div className="rounded-xl border bg-card p-6 shadow-xs flex flex-col justify-between">
              <div>
                <DiscountBadge percentage={20} className="mb-3" />
                <h4 className="font-semibold text-lg">Custom Matte Art Print</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Archival quality heavy matte paper with pigment inks.
                </p>
              </div>
              <div className="mt-6 flex items-baseline justify-between">
                <Price amount={1999} originalAmount={2499} />
                <Button size="sm">Select Options</Button>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-xs flex flex-col justify-between">
              <div>
                <DiscountBadge label="POPULAR" className="mb-3" />
                <h4 className="font-semibold text-lg">Bulk Business Cards (500 pcs)</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  350gsm premium art card with velvet soft-touch lamination.
                </p>
              </div>
              <div className="mt-6 flex items-baseline justify-between">
                <Price amount={3500} />
                <Button size="sm">Select Options</Button>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-xs flex flex-col justify-between">
              <div>
                <DiscountBadge percentage={15} className="mb-3" />
                <h4 className="font-semibold text-lg">Custom Acrylic Desk Plaque</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  High-gloss laser-cut 5mm cast acrylic with UV printing.
                </p>
              </div>
              <div className="mt-6 flex items-baseline justify-between">
                <Price amount={2800} originalAmount={3300} />
                <Button size="sm">Select Options</Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
