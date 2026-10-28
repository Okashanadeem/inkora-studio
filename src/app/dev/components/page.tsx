'use client';

import * as React from 'react';
import { Container, Section, PageHeader } from '@/components/shared/layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Price, DiscountBadge } from '@/components/shared/price';
import { EmptyState, ErrorState, LoadingCardSkeleton } from '@/components/shared/states';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { DataTable } from '@/components/shared/data-table';
import { Flame } from 'lucide-react';

export default function ComponentGalleryPage() {
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const sampleTableData = [
    { id: '1', sku: 'PRN-A4-MATTE', name: 'A4 Matte Print', price: 1200, status: 'Active' },
    { id: '2', sku: 'CRD-BIZ-500', name: 'Business Cards (500)', price: 3500, status: 'Active' },
    { id: '3', sku: 'PLQ-ACR-001', name: 'Desk Plaque', price: 2800, status: 'Draft' },
  ];

  return (
    <Section spacing="lg">
      <Container size="xl" className="space-y-12">
        <PageHeader
          title="Component Gallery & Design Tokens (/dev/components)"
          description="Visual test harness for shadcn/ui primitives and Inkora shared composite components across viewports (360px, 768px, 1280px)."
        />

        {/* Buttons & Badges */}
        <div className="space-y-4 rounded-xl border p-6">
          <h2 className="text-xl font-semibold">1. Buttons, Variants & Badges</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button>Default Primary (Deep Ink)</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5">
              <Flame className="h-4 w-4 fill-current" /> Trending Offer
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Badge>Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <DiscountBadge percentage={20} />
            <DiscountBadge label="BEST SELLER" />
          </div>
        </div>

        {/* Pricing System */}
        <div className="space-y-4 rounded-xl border p-6">
          <h2 className="text-xl font-semibold">2. Integer Money & Pricing Formatter (`Price`)</h2>
          <div className="flex flex-wrap items-baseline gap-8">
            <div>
              <span className="text-xs text-muted-foreground block mb-1">Standard PKR</span>
              <Price amount={2500} />
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-1">Discounted PKR</span>
              <Price amount={2000} originalAmount={2500} />
            </div>
            <div>
              <span className="text-xs text-muted-foreground block mb-1">High Value Integer</span>
              <Price amount={145000} originalAmount={160000} />
            </div>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="space-y-4 rounded-xl border p-6 max-w-xl">
          <h2 className="text-xl font-semibold">3. Inputs & Forms</h2>
          <div className="space-y-3">
            <Input placeholder="Enter your full name..." />
            <Input type="email" placeholder="email@domain.com" />
            <Textarea placeholder="Special instructions for custom printing..." />
          </div>
        </div>

        {/* Data States */}
        <div className="space-y-6 rounded-xl border p-6">
          <h2 className="text-xl font-semibold">4. Data States (Loading, Empty, Error)</h2>
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Skeleton Loader:</h3>
            <LoadingCardSkeleton count={3} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Empty State:</h3>
              <EmptyState
                title="No Orders Found"
                description="You haven't placed any custom print orders yet. Browse our catalog to get started."
                actionLabel="Explore Catalog"
                onAction={() => {}}
              />
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Error State:</h3>
              <ErrorState
                title="Unable to load catalog"
                message="Failed to connect to the database. Please check your network connection and retry."
                onRetry={() => alert('Retry triggered')}
              />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="space-y-4 rounded-xl border p-6">
          <h2 className="text-xl font-semibold">5. Shared DataTable</h2>
          <DataTable
            keyExtractor={(item) => item.id}
            data={sampleTableData}
            columns={[
              { header: 'SKU', accessorKey: 'sku' },
              { header: 'Product Name', accessorKey: 'name' },
              {
                header: 'Base Price',
                cell: (item) => <Price amount={item.price} />,
              },
              {
                header: 'Status',
                cell: (item) => (
                  <Badge variant={item.status === 'Active' ? 'default' : 'secondary'}>
                    {item.status}
                  </Badge>
                ),
              },
            ]}
          />
        </div>

        {/* Modal / Dialog */}
        <div className="space-y-4 rounded-xl border p-6">
          <h2 className="text-xl font-semibold">6. Confirm Dialog</h2>
          <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
            Open Destructive Action Dialog
          </Button>
          <ConfirmDialog
            isOpen={confirmOpen}
            onOpenChange={setConfirmOpen}
            title="Cancel Custom Order?"
            description="Are you sure you want to cancel this order? This action cannot be undone."
            confirmLabel="Yes, Cancel Order"
            isDestructive
            onConfirm={() => {
              setConfirmOpen(false);
              alert('Order cancelled');
            }}
          />
        </div>
      </Container>
    </Section>
  );
}
