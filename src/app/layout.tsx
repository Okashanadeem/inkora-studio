import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Header, Footer } from '@/components/shared/shell';
import { FloatingWhatsAppButton } from '@/components/shared/floating-whatsapp';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Inkora Studio — Premium Custom Printing in Pakistan',
  description:
    'Browse custom print products, customize with your artwork, and order with instant WhatsApp support and reliable delivery across Pakistan.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <TooltipProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <FloatingWhatsAppButton />
        </TooltipProvider>
      </body>
    </html>
  );
}
