
import type { Metadata, Viewport } from 'next';
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
      url: "https://firebase.google.com/studio", 
    },
  ],
  manifest: "/manifest.json", // Added manifest link
};

export const viewport: Viewport = {
  themeColor: "#003049", // Added theme color matching primary color
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1, // Optional: restrict zoom for a more app-like feel
  userScalable: false, // Optional: restrict zoom
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Meta tag for theme color is handled by viewport export now */}
      </head>
      <body className={cn(geistSans.variable, geistMono.variable, 'antialiased')}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

