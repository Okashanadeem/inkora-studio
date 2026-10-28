import { PageHeader } from '@/components/shared/layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/shared/data-table';
import { Price } from '@/components/shared/price';
import { Plus, Edit } from 'lucide-react';
import Link from 'next/link';
import { getAdminProductsList } from '@/modules/products/queries';

export default async function AdminProductsPage() {
  const products = await getAdminProductsList();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products & Catalog"
        description="Create, edit, toggle publish status, and configure pricing tiers for custom print products."
        actions={
          <Link href="/admin/products/new">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </Link>
        }
      />

      <DataTable
        keyExtractor={(item) => item.id}
        data={products}
        emptyTitle="No products found"
        emptyMessage="Start by adding your first customizable print product."
        columns={[
          {
            header: 'Product Name',
            cell: (item) => (
              <div>
                <span className="font-medium text-foreground block">{item.name}</span>
                <span className="text-xs text-muted-foreground font-mono">/{item.slug}</span>
              </div>
            ),
          },
          {
            header: 'Base Price',
            cell: (item) => <Price amount={item.base_price} />,
          },
          {
            header: 'Customizable',
            cell: (item) => (
              <Badge variant={item.is_customizable ? 'outline' : 'secondary'}>
                {item.is_customizable ? 'Yes' : 'No'}
              </Badge>
            ),
          },
          {
            header: 'Status',
            cell: (item) => (
              <Badge
                variant={
                  item.status === 'published'
                    ? 'default'
                    : item.status === 'draft'
                      ? 'secondary'
                      : 'outline'
                }
              >
                {item.status.toUpperCase()}
              </Badge>
            ),
          },
          {
            header: 'Actions',
            className: 'text-right',
            cell: (item) => (
              <div className="flex justify-end gap-2">
                <Link href={`/admin/products/${item.id}`}>
                  <Button variant="ghost" size="sm" className="gap-1 h-8 px-2">
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </Button>
                </Link>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
