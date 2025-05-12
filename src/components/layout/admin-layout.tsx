
'use client'; // Sidebar needs client-side hooks for interactivity and state

import type { ReactNode } from 'react';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from '@/components/ui/sidebar';
import { QrCode, LayoutDashboard, MapPin, Users, Settings, LogOut, GitMerge, History, FileText, ScanLine, Printer, Tag, PanelLeft, UserCircle, ChevronDown, Briefcase, Wrench as MaintenanceIcon, ShieldCheck, BarChart, CheckSquare } from 'lucide-react';
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

    const { isMobile, setOpenMobile } = useSidebar();

    const handleMobileMenuClick = () => {
        if (isMobile) {
            setOpenMobile(false);
        }
    };

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
        <SidebarContent className="p-0"> {/* Remove padding from content if items handle it */}
          <SidebarMenu className="p-2 group-data-[collapsible=icon]:p-1 group-data-[collapsible=icon]:space-y-1"> {/* Adjusted padding */}
            {/* Dashboard */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Dashboard" className="group-data-[collapsible=icon]:justify-center" onClick={handleMobileMenuClick}>
                <Link href="/dashboard">
                  <LayoutDashboard />
                  <span className="group-data-[collapsible=icon]:hidden">Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {/* Assets */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Ativos" className="group-data-[collapsible=icon]:justify-center" onClick={handleMobileMenuClick}>
                <Link href="/assets">
                  <QrCode />
                  <span className="group-data-[collapsible=icon]:hidden">Ativos</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             {/* Asset Tree */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Árvore de Ativos" className="group-data-[collapsible=icon]:justify-center" onClick={handleMobileMenuClick}>
                <Link href="/assets/tree">
                  <GitMerge />
                  <span className="group-data-[collapsible=icon]:hidden">Árvore de Ativos</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             {/* Inventory Scan */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Inventário (Scan)" className="group-data-[collapsible=icon]:justify-center" onClick={handleMobileMenuClick}>
                <Link href="/inventory/scan">
                  <CheckSquare />
                  <span className="group-data-[collapsible=icon]:hidden">Inventário (Scan)</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {/* Characteristic Scan */}
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Reg. Caract. (Scan)" className="group-data-[collapsible=icon]:justify-center" onClick={handleMobileMenuClick}>
                <Link href="/characteristics/scan">
                  <ScanLine />
                  <span className="group-data-[collapsible=icon]:hidden">Reg. Caract. (Scan)</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             {/* Locations */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Locais" className="group-data-[collapsible=icon]:justify-center" onClick={handleMobileMenuClick}>
                <Link href="/locations">
                  <MapPin />
                  <span className="group-data-[collapsible=icon]:hidden">Locais</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {/* Maintenance */}
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Manutenção" className="group-data-[collapsible=icon]:justify-center" onClick={handleMobileMenuClick}>
                <Link href="/maintenance/work-orders">
                  <MaintenanceIcon />
                  <span className="group-data-[collapsible=icon]:hidden">Manutenção</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             {/* Print Labels */}
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Imprimir Etiquetas" className="group-data-[collapsible=icon]:justify-center" onClick={handleMobileMenuClick}>
                <Link href="/labels/print">
                  <Printer />
                  <span className="group-data-[collapsible=icon]:hidden">Imprimir Etiquetas</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {/* Audit Log */}
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Log de Auditoria" className="group-data-[collapsible=icon]:justify-center" onClick={handleMobileMenuClick}>
                <Link href="/audit-log">
                  <History />
                  <span className="group-data-[collapsible=icon]:hidden">Log de Auditoria</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
         <SidebarFooter />
      </Sidebar>

      {/* Main content area that adjusts based on sidebar state */}
      <SidebarInset>
        {/* Header within the main content area */}
        <header className="flex h-14 items-center justify-between border-b bg-background px-4 lg:px-6 sticky top-0 z-30">
          <SidebarTrigger asChild>
               <Button variant="ghost" size="icon" className="h-8 w-8">
                 <PanelLeft />
                 <VisuallyHidden.Root>Toggle Sidebar</VisuallyHidden.Root>
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
                    <span className="flex items-center w-full">
                        <UserCircle className="mr-2 h-4 w-4" />
                        <span>Meu Perfil</span>
                    </span>
                  </Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                  <Link href="/licensing">
                    <span className="flex items-center w-full">
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Licença</span>
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <span className="flex items-center w-full">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Configurações</span>
                    </span>
                  </Link>
                </DropdownMenuItem>
                 {userRole === 'Administrador' && (
                     <DropdownMenuItem asChild>
                         <Link href="/settings/admin">
                            <span className="flex items-center w-full">
                                <Briefcase className="mr-2 h-4 w-4" />
                                <span>Administração</span>
                            </span>
                        </Link>
                     </DropdownMenuItem>
                 )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                   <Link href="/logout">
                    <span className="flex items-center w-full">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sair</span>
                    </span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
           </div>
        </header>
        {/* The actual page content rendered here */}
        <main className="flex-1 p-2 sm:p-4 md:p-6 lg:p-8 xl:p-10 overflow-auto"> {/* Increased padding for larger screens */}
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

