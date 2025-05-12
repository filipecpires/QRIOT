
import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google'; // Using Geist directly
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";

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
  manifest: "/manifest.json", // Ensure your manifest.json is in public folder
  appleWebApp: { // iOS specific PWA settings
    capable: true,
    statusBarStyle: "default", // or "black-translucent"
    title: "QRIoT.app",
  },
  formatDetection: {
    telephone: false,
  },
  // icons: [ // Example of specifying multiple icons for PWA
  //   { rel: "apple-touch-icon", sizes: "180x180", url: "/icons/apple-touch-icon.png" },
  //   { rel: "icon", type: "image/png", sizes: "32x32", url: "/icons/favicon-32x32.png" },
  //   { rel: "icon", type: "image/png", sizes: "16x16", url: "/icons/favicon-16x16.png" },
  // ],
};

export const viewport: Viewport = {
  themeColor: "#003049", // Matches globals.css --primary (Dark Blue)
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Meta tags related to PWA are handled by next.config.ts and metadata object */}
      </head>
      <body className={cn(geistSans.variable, 'antialiased')}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

