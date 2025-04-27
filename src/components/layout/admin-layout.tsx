
'use client'; // Sidebar needs client-side hooks for interactivity and state

import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { QrCode, LayoutDashboard, MapPin, Users, Settings, LogOut, GitMerge, History, FileText, ScanLine, Printer, Tag, PanelLeft } from 'lucide-react'; // Added PanelLeft for trigger
import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Import Button for the trigger

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      {/* The actual sidebar component */}
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Link href="/dashboard" className="flex items-center gap-2 p-2 group-data-[collapsible=icon]:justify-center">
            <QrCode className="h-6 w-6 text-sidebar-primary" />
            <span className="font-semibold text-lg text-sidebar-foreground group-data-[collapsible=icon]:hidden">QRIoT.app</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {/* Dashboard */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Dashboard">
                <Link href="/dashboard">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {/* Assets */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Ativos">
                <Link href="/assets">
                  <QrCode />
                  <span>Ativos</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             {/* Asset Tree */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Árvore Hierárquica">
                <Link href="/assets/tree">
                  <GitMerge />
                  <span>Árvore Hierárquica</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             {/* Inventory Scan */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Inventário (Scan)">
                <Link href="/inventory/scan">
                  <ScanLine />
                  <span>Inventário (Scan)</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {/* Characteristic Scan */}
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Registrar Caract. (Scan)">
                <Link href="/characteristics/scan">
                  <Tag />
                  <span>Reg. Caract. (Scan)</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             {/* Locations */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Locais">
                <Link href="/locations">
                  <MapPin />
                  <span>Locais</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             {/* Users */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Usuários">
                <Link href="/users">
                  <Users />
                  <span>Usuários</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {/* Print Labels */}
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Imprimir Etiquetas">
                <Link href="/labels/print">
                  <Printer />
                  <span>Imprimir Etiquetas</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {/* Audit Log */}
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
             {/* Licensing */}
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Licença">
                <Link href="/licensing">
                  <FileText />
                  <span>Licença</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {/* Settings */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Configurações">
                <Link href="/settings">
                  <Settings />
                  <span>Configurações</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             {/* Logout */}
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

      {/* Main content area that adjusts based on sidebar state */}
      <SidebarInset>
        {/* Header within the main content area */}
        <header className="flex h-14 items-center justify-between border-b bg-background px-4 lg:px-6">
          {/* Sidebar Trigger Button - Visible on all screen sizes */}
          <SidebarTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <PanelLeft />
                <span className="sr-only">Toggle Sidebar</span>
              </Button>
          </SidebarTrigger>

          {/* Placeholder for user avatar/menu or other header content */}
          <div className="flex items-center gap-4">
             {/* Add User Avatar/Menu Here later */}
             <span className="font-semibold hidden md:inline"></span> {/* Title removed, more space for user menu */}
           </div>
        </header>
        {/* The actual page content rendered here */}
        <main className="flex-1 p-4 md:p-6 overflow-auto"> {/* Ensure main content is scrollable */}
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
