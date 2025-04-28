
'use client'; // Sidebar needs client-side hooks for interactivity and state

import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { QrCode, LayoutDashboard, MapPin, Users, Settings, LogOut, GitMerge, History, FileText, ScanLine, Printer, Tag, PanelLeft, UserCircle, ChevronDown, Briefcase, Wrench as MaintenanceIcon } from 'lucide-react'; // Added MaintenanceIcon
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

// Mock function to get initials (replace with actual logic if needed)
function getInitials(name: string): string {
    if (!name) return '?';
    const names = name.split(' ');
    const firstInitial = names[0]?.[0] ?? '';
    const lastInitial = names.length > 1 ? names[names.length - 1]?.[0] ?? '' : '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
}

export default function AdminLayout({ children }: { children: ReactNode }) {
    // Mock user data - replace with actual auth context later
    const userName = "João Silva";
    const userEmail = "joao.silva@example.com";
    const userAvatar = `https://i.pravatar.cc/40?u=${userEmail}`; // Placeholder avatar
    const userRole = "Administrador"; // Mock role

  return (
    <SidebarProvider defaultOpen={true}>
      {/* The actual sidebar component */}
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Link href="/dashboard" className="flex items-center gap-2 p-2 group-data-[collapsible=icon]:justify-center">
            <QrCode className="h-6 w-6 text-sidebar-primary" />
             {/* Apply group class to hide text when icon-only */}
            <span className="font-semibold text-lg text-sidebar-foreground group-data-[collapsible=icon]:hidden">QRIoT.app</span>
          </Link>
        </SidebarHeader>
        <SidebarContent> {/* Removed padding here, applied to SidebarMenu */}
          <SidebarMenu className="group-data-[collapsible=icon]:p-0"> {/* Remove padding when collapsed */}
            {/* Dashboard */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Dashboard">
                <Link href="/dashboard">
                  <LayoutDashboard />
                  <span className="group-data-[collapsible=icon]:hidden">Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {/* Assets */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Ativos">
                <Link href="/assets">
                  <QrCode />
                  <span className="group-data-[collapsible=icon]:hidden">Ativos</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             {/* Asset Tree */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Árvore Hierárquica">
                <Link href="/assets/tree">
                  <GitMerge />
                  <span className="group-data-[collapsible=icon]:hidden">Árvore Hierárquica</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             {/* Inventory Scan */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Inventário (Scan)">
                <Link href="/inventory/scan">
                  <ScanLine />
                  <span className="group-data-[collapsible=icon]:hidden">Inventário (Scan)</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {/* Characteristic Scan */}
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Registrar Caract. (Scan)">
                <Link href="/characteristics/scan">
                  <Tag />
                  <span className="group-data-[collapsible=icon]:hidden">Reg. Caract. (Scan)</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             {/* Locations */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Locais">
                <Link href="/locations">
                  <MapPin />
                  <span className="group-data-[collapsible=icon]:hidden">Locais</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {/* Maintenance */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Manutenção">
                <Link href="/maintenance/work-orders">
                  <MaintenanceIcon />
                  <span className="group-data-[collapsible=icon]:hidden">Manutenção</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             {/* Print Labels */}
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Imprimir Etiquetas">
                <Link href="/labels/print">
                  <Printer />
                  <span className="group-data-[collapsible=icon]:hidden">Imprimir Etiquetas</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {/* Audit Log */}
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Log de Auditoria">
                <Link href="/audit-log">
                  <History />
                  <span className="group-data-[collapsible=icon]:hidden">Log de Auditoria</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
         {/* Footer is empty, links moved to top dropdown */}
         <SidebarFooter />
      </Sidebar>

      {/* Main content area that adjusts based on sidebar state */}
      <SidebarInset>
        {/* Header within the main content area */}
        <header className="flex h-14 items-center justify-between border-b bg-background px-4 lg:px-6 sticky top-0 z-30"> {/* Added sticky */}
          {/* Sidebar Trigger Button - Visible on all screen sizes */}
          <SidebarTrigger asChild>
               <Button variant="ghost" size="icon" className="h-8 w-8">
                 <PanelLeft />
                 <span className="sr-only">Toggle Sidebar</span>
              </Button>
          </SidebarTrigger>

          {/* User Profile Dropdown */}
          <div className="flex items-center gap-4">
            <DropdownMenu>
               <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-auto px-2 flex items-center gap-2">
                     <Avatar className="h-6 w-6">
                        <AvatarImage src={userAvatar} alt={userName} />
                        <AvatarFallback>{getInitials(userName)}</AvatarFallback>
                     </Avatar>
                     <span className="hidden md:inline text-sm font-medium">{userName}</span>
                     <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:inline" />
                  </Button>
               </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userEmail}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Meu Perfil</span>
                  </Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                  <Link href="/licensing">
                     <FileText className="mr-2 h-4 w-4" />
                    <span>Licença</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                     <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </Link>
                </DropdownMenuItem>
                {/* Add Admin link conditionally */}
                 {userRole === 'Administrador' && (
                     <DropdownMenuItem asChild>
                         <Link href="/settings/admin">
                             <Briefcase className="mr-2 h-4 w-4" />
                             <span>Administração</span>
                        </Link>
                     </DropdownMenuItem>
                 )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                   <Link href="/logout">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
