import { Container, Section, PageHeader } from '@/components/shared/layout';
import { ProductCard, ProductGrid } from '@/components/shared/product-card';
import { getPublishedProducts } from '@/modules/products/queries';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Custom Print Products | Inkora Studio Pakistan',
  description:
    'Browse custom print products in Pakistan. Art prints, premium business cards, plaques, and merchandise. Instant proofing and fast shipping.',
};

export default async function ProductsCatalogPage() {
  const products = await getPublishedProducts();

  // If database is empty during early phase, provide high-quality fallback items
  const displayProducts =
    products.length > 0
      ? products.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          basePrice: p.base_price,
          categoryName: (p.categories as { name?: string })?.name || 'Custom Print',
          isCustomizable: p.is_customizable,
        }))
      : [
          {
            id: '1',
            name: 'Fine Art Matte Print',
            slug: 'fine-art-matte-print',
            basePrice: 1200,
            categoryName: 'Art Prints',
            isCustomizable: true,
            isTrending: true,
          },
          {
            id: '2',
            name: 'Velvet Business Cards (500 pcs)',
            slug: 'velvet-business-cards-500',
            basePrice: 3500,
            categoryName: 'Business Cards',
            isCustomizable: true,
            discountPercentage: 15,
          },
          {
            id: '3',
            name: 'Cast Acrylic Desk Plaque',
            slug: 'cast-acrylic-desk-plaque',
            basePrice: 2800,
            categoryName: 'Merchandise',
            isCustomizable: true,
          },
          {
            id: '4',
            name: 'Museum Canvas Wrap',
            slug: 'museum-canvas-wrap',
            basePrice: 4200,
            categoryName: 'Art Prints',
            isCustomizable: true,
            isTrending: true,
          },
        ];

  return (
    <Section spacing="lg">
      <Container size="xl" className="space-y-8">
        <PageHeader
          title="Custom Print Catalog"
          description="Select a product to customize specifications, view bulk tiers, or upload artwork."
        />

        <ProductGrid>
          {displayProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              slug={product.slug}
              basePrice={product.basePrice}
              categoryName={product.categoryName}
              isCustomizable={product.isCustomizable}
              isTrending={Boolean((product as { isTrending?: boolean }).isTrending)}
              discountPercentage={(product as { discountPercentage?: number }).discountPercentage}
            />
          ))}
        </ProductGrid>
      </Container>
    </Section>
  );
}
