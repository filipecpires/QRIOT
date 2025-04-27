
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";
// Removed Sidebar imports as they will be handled by group layouts

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'QRIoT.app - Gestão Inteligente de Ativos',
  description: 'Sistema online para gestão inteligente de ativos físicos com QR Code e IoT.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={cn(geistSans.variable, geistMono.variable, 'antialiased')}>
        {/* SidebarProvider is removed from here */}
        {children}
        <Toaster />
      </body>
    </html>
  );
}
