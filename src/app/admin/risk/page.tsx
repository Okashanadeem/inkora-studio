import { PageHeader } from '@/components/shared/layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Price } from '@/components/shared/price';
import { ShieldAlert, CheckCircle, XCircle, Phone } from 'lucide-react';

export default async function AdminRiskReviewPage() {
  // Sample review orders illustrating the risk assessment engine in Phase 6
  const heldOrders = [
    {
      id: 'ord-101',
      orderNumber: 'INK-261028-4821',
      customer: 'Tariq Mehmood',
      phone: '0321 9876543',
      grandTotal: 14500,
      paymentMethod: 'COD',
      riskScore: 75,
      riskLevel: 'high',
      reasons: [
        'High value COD order (14,500 PKR exceeds 10,000 PKR threshold)',
        'First time guest purchaser with no verified delivery history',
      ],
      createdAt: '15 mins ago',
    },
    {
      id: 'ord-102',
      orderNumber: 'INK-261028-9124',
      customer: 'Unknown Guest',
      phone: '0300 111',
      grandTotal: 3200,
      paymentMethod: 'COD',
      riskScore: 65,
      riskLevel: 'high',
      reasons: ['Abnormal phone number digit length', 'Disposable email address domain detected'],
      createdAt: '1 hour ago',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Risk Review Queue"
        description="Orders placed on hold due to COD value thresholds, unusual volumes, or contact discrepancies."
      />

      <div className="space-y-4">
        {heldOrders.map((order) => (
          <Card key={order.id} className="border-accent/40 bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-bold">{order.orderNumber}</CardTitle>
                  <Badge variant="destructive" className="text-xs uppercase">
                    Risk Score: {order.riskScore} ({order.riskLevel})
                  </Badge>
                  <Badge variant="outline">{order.paymentMethod}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Customer: <strong>{order.customer}</strong> · Phone:{' '}
                  <strong>{order.phone}</strong> · Placed {order.createdAt}
                </p>
              </div>
              <Price amount={order.grandTotal} className="text-xl font-bold" />
            </CardHeader>

            <CardContent className="space-y-4 pt-2">
              <div className="p-3 rounded-lg bg-destructive/10 text-xs space-y-1 border border-destructive/20">
                <span className="font-semibold text-destructive block">
                  Triggered Risk Signals:
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                  {order.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  <span>Call or WhatsApp customer before approving production</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs text-destructive hover:bg-destructive/10"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Cancel Fake Order
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700"
                  >
                    <CheckCircle className="h-3.5 w-3.5" /> Approve Order
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
