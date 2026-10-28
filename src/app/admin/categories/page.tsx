import { PageHeader } from '@/components/shared/layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/shared/data-table';
import { Plus } from 'lucide-react';
import { getAdminCategoriesList } from '@/modules/products/queries';

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategoriesList();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Categories"
        description="Organize print offerings into structured categories for navigation and SEO landing pages."
        actions={
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        }
      />

      <DataTable
        keyExtractor={(item) => item.id}
        data={categories}
        emptyTitle="No categories found"
        emptyMessage="Add categories like Art Prints, Business Cards, or Plaques."
        columns={[
          {
            header: 'Category Name',
            cell: (item) => (
              <div>
                <span className="font-medium text-foreground block">{item.name}</span>
                <span className="text-xs text-muted-foreground font-mono">/{item.slug}</span>
              </div>
            ),
          },
          {
            header: 'Sort Order',
            accessorKey: 'sort_order',
          },
          {
            header: 'Status',
            cell: (item) => (
              <Badge variant={item.is_active ? 'default' : 'secondary'}>
                {item.is_active ? 'ACTIVE' : 'INACTIVE'}
              </Badge>
            ),
          },
        ]}
      />
    </div>
  );
}
