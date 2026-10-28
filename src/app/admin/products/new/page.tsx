'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { saveProductAction } from '@/modules/products/actions';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    slug: '',
    description: '',
    basePrice: 1500,
    status: 'draft' as 'draft' | 'published' | 'archived',
    isCustomizable: true,
    seoTitle: '',
    seoDescription: '',
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormData((prev) => ({ ...prev, name, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await saveProductAction({
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        basePrice: Number(formData.basePrice),
        status: formData.status,
        isCustomizable: formData.isCustomizable,
        seoTitle: formData.seoTitle,
        seoDescription: formData.seoDescription,
        options: [],
        priceTiers: [],
        imageKeys: [],
      });
      router.push('/admin/products');
    } catch (err: unknown) {
      alert((err as Error).message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Products
      </Link>

      <PageHeader
        title="Add New Custom Print Product"
        description="Configure product specifications, base pricing, and search engine optimization metadata."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                required
                placeholder="e.g. Fine Art Matte Print"
                value={formData.name}
                onChange={handleNameChange}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                required
                placeholder="fine-art-matte-print"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Product Description</Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Describe material, archival specifications, turnaround time..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pricing & Customization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="basePrice">Base Price (PKR)</Label>
                <Input
                  id="basePrice"
                  type="number"
                  required
                  min={1}
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="status">Publish Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) =>
                    setFormData({ ...formData, status: val as 'draft' | 'published' | 'archived' })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft (Hidden)</SelectItem>
                    <SelectItem value="published">Published (Live in Store)</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="space-y-0.5">
                <Label>Allow Customer Artwork Uploads</Label>
                <p className="text-xs text-muted-foreground">
                  Enables upload dropzone and live DPI checks on the storefront.
                </p>
              </div>
              <Switch
                checked={formData.isCustomizable}
                onCheckedChange={(checked) => setFormData({ ...formData, isCustomizable: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Search Engine Optimization (SEO)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="seoTitle">SEO Title (~60 chars)</Label>
              <Input
                id="seoTitle"
                placeholder="Custom Art Print Printing in Pakistan | Inkora Studio"
                value={formData.seoTitle}
                onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="seoDescription">Meta Description (~155 chars)</Label>
              <Textarea
                id="seoDescription"
                rows={2}
                placeholder="Order custom museum-grade art prints with nationwide delivery..."
                value={formData.seoDescription}
                onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/admin/products">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading} className="gap-2">
            <Save className="h-4 w-4" /> {loading ? 'Saving...' : 'Save Product'}
          </Button>
        </div>
      </form>
    </div>
  );
}
