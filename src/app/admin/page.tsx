import { PageHeader } from '@/components/shared/layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Package, ShoppingBag, ShieldAlert, Star } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Overview"
        description="Monitor custom-print sales, high-risk holds, artwork verifications, and customer orders."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Orders Today
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">4 awaiting artwork approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue (Today)
            </CardTitle>
            <span className="text-xs font-bold text-muted-foreground">PKR</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">PKR 42,500</div>
            <p className="text-xs text-muted-foreground mt-1">Verified payments only</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Risk Review Queue
            </CardTitle>
            <ShieldAlert className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">2</div>
            <p className="text-xs text-muted-foreground mt-1">Held for COD / phone verification</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Reviews Pending
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground mt-1">
              Verified buyers awaiting moderation
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 pt-4">
        <Link href="/admin/products">
          <Button variant="default" className="gap-2">
            <Package className="h-4 w-4" /> Manage Catalog
          </Button>
        </Link>
        <Link href="/admin/risk">
          <Button variant="outline" className="gap-2">
            <ShieldAlert className="h-4 w-4" /> View Risk Queue
          </Button>
        </Link>
      </div>
    </div>
  );
}
