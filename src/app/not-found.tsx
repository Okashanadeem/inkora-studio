import { Container, Section } from '@/components/shared/layout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PackageX } from 'lucide-react';

export default function NotFound() {
  return (
    <Section spacing="lg">
      <Container size="sm" className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <PackageX className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
          Page not found (404)
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sorry, we couldn&apos;t find the page or product you were looking for.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/">
            <Button variant="default">Back to Homepage</Button>
          </Link>
          <Link href="/products">
            <Button variant="outline">Browse Products</Button>
          </Link>
        </div>
      </Container>
    </Section>
  );
}
