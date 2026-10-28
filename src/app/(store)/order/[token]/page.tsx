import { Container, Section } from '@/components/shared/layout';
import { Button } from '@/components/ui/button';
import { Price } from '@/components/shared/price';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ShieldAlert, ArrowRight, MessageCircle } from 'lucide-react';
import Link from 'next/link';

interface OrderTrackingProps {
  params: Promise<{ token: string }>;
}

export async function generateStaticParams() {
  return [{ token: 'demo-tracking-token' }];
}

export default async function OrderTrackingPage({ params }: OrderTrackingProps) {
  const { token } = await params;

  return (
    <Section spacing="lg">
      <Container size="sm" className="space-y-8">
        <div className="rounded-2xl border bg-card p-8 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <Badge variant="outline" className="font-mono text-xs">
            SECURE GUEST ORDER
          </Badge>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Thank you! Your order is received.
          </h1>

          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            We have registered your custom print order. Our studio team will review your
            specifications and prepare digital artwork proofs.
          </p>

          <div className="p-4 rounded-xl border bg-muted/20 text-xs text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Security Token:</span>
              <span className="font-mono">{token.slice(0, 16)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Production Status:</span>
              <span className="font-semibold text-primary">Pending Artwork & Payment Review</span>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href={`https://wa.me/923111257119?text=${encodeURIComponent(
                `Hi Inkora Studio, I just placed an order (Token: ${token.slice(0, 8)}). I would like to confirm my custom print requirements.`,
              )}`}
              target="_blank"
            >
              <Button
                variant="default"
                className="w-full sm:w-auto gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                <MessageCircle className="h-4 w-4" /> Confirm on WhatsApp
              </Button>
            </Link>

            <Link href="/products">
              <Button variant="outline" className="w-full sm:w-auto gap-2">
                Continue Browsing <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  );
}
