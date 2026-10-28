import Link from 'next/link';
import { Container } from '@/components/shared/layout';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  ShieldAlert,
  Percent,
  Flame,
  Star,
  Settings,
  ArrowLeft,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Categories', href: '/admin/categories', icon: Layers },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Risk Review', href: '/admin/risk', icon: ShieldAlert },
    { name: 'Promotions', href: '/admin/promotions', icon: Percent },
    { name: 'Trends', href: '/admin/trends', icon: Flame },
    { name: 'Reviews', href: '/admin/reviews', icon: Star },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r bg-card flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          <div className="p-6 border-b">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground mb-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Store
            </Link>
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              INKORA{' '}
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-mono">
                ADMIN
              </span>
            </h2>
          </div>
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t text-xs text-muted-foreground">Logged in as Staff / Admin</div>
      </aside>

      {/* Main Admin Content Area */}
      <div className="flex-1 flex flex-col overflow-x-hidden">
        <main className="flex-1 p-6 sm:p-8">
          <Container size="full">{children}</Container>
        </main>
      </div>
    </div>
  );
}
