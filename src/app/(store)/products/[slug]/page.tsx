import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/modules/products/queries';
import { ProductCustomizerView } from '@/components/products/product-view';
import { Metadata } from 'next';
import { env } from '@/lib/env';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found | Inkora Studio',
    };
  }

  const title = product.seo_title || `${product.name} | Custom Printing Pakistan | Inkora Studio`;
  const description =
    product.seo_description ||
    product.description ||
    `Order ${product.name} custom printed in Pakistan. High quality printing, instant proofs, and WhatsApp inquiry.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${env.NEXT_PUBLIC_SITE_URL}/products/${product.slug}`,
      siteName: 'Inkora Studio',
      locale: 'en_PK',
      type: 'website',
    },
  };
}

export async function generateStaticParams() {
  return [
    { slug: 'fine-art-matte-print' },
    { slug: 'velvet-business-cards-500' },
    { slug: 'cast-acrylic-desk-plaque' },
  ];
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const productData = await getProductBySlug(slug);

  if (!productData) {
    notFound();
  }

  // JSON-LD Structured Data for Google Rich Results (Section 16)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productData.name,
    description: productData.description,
    offers: {
      '@type': 'Offer',
      price: productData.base_price,
      priceCurrency: 'PKR',
      availability: 'https://schema.org/InStock',
      url: `${env.NEXT_PUBLIC_SITE_URL}/products/${productData.slug}`,
    },
  };

  const category = Array.isArray(productData.categories)
    ? productData.categories[0]
    : productData.categories;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductCustomizerView
        product={{
          id: productData.id,
          name: productData.name,
          slug: productData.slug,
          description: productData.description,
          base_price: productData.base_price,
          category: category ? { name: category.name, slug: category.slug } : undefined,
          options: productData.options || [],
          priceTiers: productData.priceTiers || [],
        }}
      />
    </>
  );
}
