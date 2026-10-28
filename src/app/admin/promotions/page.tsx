import { PageHeader } from '@/components/shared/layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/shared/data-table';
import { Price } from '@/components/shared/price';
import { Plus, Tag, CheckCircle2 } from 'lucide-react';
import { getAdminPromotionsList } from '@/modules/promotions/queries';

export default async function AdminPromotionsPage() {
  const promotions = await getAdminPromotionsList();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Promotions & Discount Engine"
        description="Configure automatic volume offers, scheduled seasonal sales, and coupon codes (Section 9)."
        actions={
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Create Promotion
          </Button>
        }
      />

      {/* Live Active Offers Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Tag className="h-4 w-4 text-primary" />
              <span>WELCOME20</span>
            </CardTitle>
            <Badge variant="default" className="text-[10px]">
              FIRST ORDER
            </Badge>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold">20% OFF</div>
            <p className="text-xs text-muted-foreground">
              Applied on first qualifying order. Single use per customer.
            </p>
          </CardContent>
        </Card>

        <Card className="border-accent/30 bg-accent/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              <Tag className="h-4 w-4 text-accent" />
              <span>SPEND2K</span>
            </CardTitle>
            <Badge variant="outline" className="text-[10px] text-accent border-accent/40">
              AUTOMATIC
            </Badge>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl font-bold">20% OFF</div>
            <p className="text-xs text-muted-foreground">
              Automatic unlock at PKR 2,000 subtotal (Max discount: PKR 500).
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Promotions Table */}
      <DataTable
        keyExtractor={(item) => item.id}
        data={promotions}
        emptyTitle="No custom promotions configured"
        emptyMessage="Default engine rules (WELCOME20 & SPEND2K) are actively available."
        columns={[
          {
            header: 'Promotion Name',
            cell: (item) => (
              <div>
                <span className="font-semibold text-foreground block">{item.name}</span>
                {item.coupon_code && (
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {item.coupon_code}
                  </span>
                )}
              </div>
            ),
          },
          {
            header: 'Discount',
            cell: (item) => (
              <span className="font-medium">
                {item.type === 'percentage' ? `${item.value}%` : <Price amount={item.value} />}
              </span>
            ),
          },
          {
            header: 'Min Spend',
            cell: (item) => <Price amount={item.min_spend} />,
          },
          {
            header: 'Audience',
            cell: (item) => <Badge variant="outline">{item.audience}</Badge>,
          },
          {
            header: 'Status',
            cell: (item) => (
              <Badge variant={item.is_active ? 'default' : 'secondary'}>
                {item.is_active ? 'ACTIVE' : 'PAUSED'}
              </Badge>
            ),
          },
        ]}
      />
    </div>
  );
}
