

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Toaster } from "@/components/ui/toaster";
import { QrCode, LayoutDashboard, MapPin, Users, Settings, LogOut, GitMerge, History, FileText, ScanLine, Printer, Tag } from 'lucide-react'; // Added icons
import Link from 'next/link';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'QRot.io - Gestão de Ativos',
  description: 'Sistema online para gestão de ativos físicos com QR Code.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={cn(geistSans.variable, geistMono.variable, 'antialiased')}>
        <SidebarProvider defaultOpen={true}>
          <Sidebar collapsible="icon">
            <SidebarHeader>
              <Link href="/" className="flex items-center gap-2 p-2 group-data-[collapsible=icon]:justify-center">
                 <QrCode className="h-6 w-6 text-sidebar-primary" />
                 <span className="font-semibold text-lg text-sidebar-foreground group-data-[collapsible=icon]:hidden">QRot.io</span>
              </Link>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Dashboard">
                    <Link href="/dashboard">
                      <LayoutDashboard />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Ativos">
                    <Link href="/assets">
                      <QrCode />
                      <span>Ativos</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                   <SidebarMenuButton asChild tooltip="Árvore Hierárquica">
                    <Link href="/assets/tree">
                      <GitMerge />
                      <span>Árvore Hierárquica</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                   <SidebarMenuButton asChild tooltip="Inventário (Scan)">
                    <Link href="/inventory/scan">
                      <ScanLine />
                      <span>Inventário (Scan)</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                   <SidebarMenuButton asChild tooltip="Registrar Caract. (Scan)">
                    <Link href="/characteristics/scan">
                      <Tag />
                      <span>Reg. Caract. (Scan)</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Locais">
                    <Link href="/locations">
                      <MapPin />
                      <span>Locais</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Usuários">
                    <Link href="/users">
                      <Users />
                      <span>Usuários</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                   <SidebarMenuButton asChild tooltip="Imprimir Etiquetas">
                    <Link href="/labels/print">
                      <Printer />
                      <span>Imprimir Etiquetas</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Log de Auditoria">
                    <Link href="/audit-log">
                      <History />
                      <span>Log de Auditoria</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
              <SidebarMenu>
                 <SidebarMenuItem>
                   <SidebarMenuButton asChild tooltip="Licença">
                    <Link href="/licensing">
                      <FileText />
                      <span>Licença</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                   <SidebarMenuButton asChild tooltip="Configurações">
                    <Link href="/settings">
                      <Settings />
                      <span>Configurações</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                   <SidebarMenuButton asChild tooltip="Sair">
                    <Link href="/logout"> {/* Update with actual logout logic later */}
                      <LogOut />
                      <span>Sair</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset>
            <header className="flex h-14 items-center justify-between border-b bg-background px-4 lg:px-6">
               <SidebarTrigger className="md:hidden" /> {/* Mobile Trigger */}
              <h1 className="text-lg font-semibold">QRot.io</h1>
              {/* Add User Avatar/Menu Here later */}
            </header>
            <main className="flex-1 p-4 md:p-6">
              {children}
            </main>
             <Toaster />
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
