
import type { Metadata } from 'next';
import './globals.css';
import { Navigation } from '@/components/layout/navigation';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'STJÓRNENDAGÁTT Pro',
  description: 'Case management system for Landspítali Norðursins',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="is"><head>
        {/* Set language to Icelandic */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&display=swap" rel="stylesheet" />
      </head><body className="font-body antialiased bg-background text-foreground">
        <Navigation />
        <main>{children}</main>
        <Toaster />
      </body></html>
  );
}
