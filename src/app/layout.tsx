
import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google'; // Using Geist directly
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";
import { PwaInstallProvider } from '@/contexts/PwaInstallContext'; // Import the provider
import { PwaInstallPrompt } from '@/components/feature/pwa-install-prompt'; // Import PWA Install Prompt (toast version)

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'], // Specify available weights
});

// Basic Metadata
export const metadata: Metadata = {
  applicationName: 'QRIoT.app',
  title: 'QRIoT.app - Gestão Inteligente de Ativos',
  description: 'Sistema online para gestão inteligente de ativos físicos com QR Code e IoT.',
  keywords: ["qriot", "asset management", "gestao de ativos", "qr code", "iot", "inventario", "patrimonio"],
  authors: [
    { name: "Firebase Studio" },
    {
      name: "Firebase Studio",
      url: "https://firebase.google.com/studio", 
    },
  ],
  manifest: "/manifest.json", 
  appleWebApp: { 
    capable: true,
    statusBarStyle: "default", 
    title: "QRIoT.app",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#003049", 
  width: 'device-width',
  initialScale: 1,
  // Removed maximumScale and userScalable to allow user zooming for accessibility
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
      </head>
      <body className={cn(geistSans.variable, 'antialiased')}>
        <PwaInstallProvider>
          {children}
          <Toaster />
          <PwaInstallPrompt /> {/* This will now trigger the initial install toast */}
        </PwaInstallProvider>
      </body>
    </html>
  );
}

