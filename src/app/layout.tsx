import type { Metadata, Viewport } from 'next'; // Import Viewport
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Basic Metadata
export const metadata: Metadata = {
  title: 'QRIoT.app - Gestão Inteligente de Ativos',
  description: 'Sistema online para gestão inteligente de ativos físicos com QR Code e IoT.',
  keywords: ["qriot", "asset management", "gestao de ativos", "qr code"],
  authors: [
    { name: "Firebase Studio" },
    {
      name: "Firebase Studio",
      url: "https://firebase.google.com/studio", // Replace with actual URL if available
    },
  ],
   // Removed PWA specific keys like manifest, generator, themeColor etc.
   // openGraph: { ... }, // Keep OpenGraph tags if needed
   // icons: { ... }, // Keep icon tags if needed (favicon, apple-touch-icon)
};

// Basic Viewport Configuration (Removed PWA themeColor)
export const viewport: Viewport = {
  viewport: "width=device-width, initial-scale=1", // Standard viewport
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
       {/* Removed manifest link */}
      <body className={cn(geistSans.variable, geistMono.variable, 'antialiased')}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
