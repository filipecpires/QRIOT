'use client'; 

import type { ReactNode} from 'react';
import React, { useEffect, useState } from 'react'; 
import { usePathname, useSearchParams } from 'next/navigation'; 
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from '@/components/ui/sidebar';
import { QrCode, LayoutDashboard, MapPin, Settings, LogOut, GitMerge, History, FileText, ScanLine, Printer, Tag, PanelLeft, UserCircle, ChevronDown, Briefcase, Wrench as MaintenanceIcon, ShieldCheck, BarChart, CheckSquare, UserSquare, Users, PackageSearch, CalendarCheck2 } from 'lucide-react'; // Added CalendarCheck2
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
import { PwaInstallPromptButton } from '@/components/feature/pwa-install-prompt-button'; 
import { MOCK_LOGGED_IN_USER_ID, MOCK_LOGGED_IN_USER_NAME, DEMO_USER_PROFILES, MOCK_COMPANY_ID } from '@/lib/mock-data';
import type { UserRole } from '@/types/user'; 
import { AdminLayoutProvider, useAdminLayoutContext } from './admin-layout-context';


function getInitials(name: string): string {
    if (!name) return '?';
    const names = name.split(' ');
    const firstInitial = names[0]?.[0] ?? '';
    const lastInitial = names.length > 1 ? names[names.length - 1]?.[0] ?? '' : '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
}

const ROLES = {
    ADMIN: "Administrador" as UserRole,
    MANAGER: "Gerente" as UserRole,
    TECHNICIAN: "Técnico" as UserRole,
    INVENTORY: "Inventariante" as UserRole,
    EMPLOYEE: "Funcionário" as UserRole,
};

function AdminLayoutContentInternal({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const { 
      currentUserId, currentUserName, currentCompanyId, 
      displayUserRole, displayUserEmail, displayUserAvatar, 
      currentDemoProfileName 
    } = useAdminLayoutContext();
    
    const { open, isMobile, openMobile, setOpenMobile } = useSidebar(); 

    const getDynamicLink = (basePath: string) => {
        if (currentDemoProfileName) {
            return `${basePath}?profile=${encodeURIComponent(currentDemoProfileName)}`;
        }
        return basePath;
    };
    
    const sidebarCollapsibleStyle = open ? {} : { justifyContent: 'center' };

    const canAccess = (allowedRoles: UserRole[]): boolean => {
        return allowedRoles.includes(displayUserRole);
    };


    return (
        <>
            <Sidebar collapsible="icon">
                <SidebarHeader>
                    <Link href={getDynamicLink("/my-dashboard")} className="flex items-center gap-2 p-2 group-data-[collapsible=icon]:justify-center">
                        <QrCode className="h-6 w-6 text-sidebar-primary" />
                        <span className="font-semibold text-lg text-sidebar-foreground group-data-[state=collapsed]:hidden">QRIoT.app</span>
                    </Link>
                </SidebarHeader>
                <SidebarContent className="p-0"> 
                    <SidebarMenu className="p-2 space-y-1 group-data-[collapsible=icon]:p-1 group-data-[collapsible=icon]:space-y-1">
                        {canAccess([ROLES.ADMIN, ROLES.MANAGER]) && (
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Dashboard Geral" style={sidebarCollapsibleStyle}>
                                    <Link href={getDynamicLink("/dashboard")}>
                                        <LayoutDashboard />
                                        <span className="group-data-[state=collapsed]:hidden">Dashboard Geral</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                         {canAccess([ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN, ROLES.INVENTORY, ROLES.EMPLOYEE]) && (
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Meu Painel" style={sidebarCollapsibleStyle}>
                                    <Link href={getDynamicLink("/my-dashboard")}>
                                        <UserSquare />
                                        <span className="group-data-[state=collapsed]:hidden">Meu Painel</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                        {canAccess([ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN, ROLES.INVENTORY]) && (
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Ativos" style={sidebarCollapsibleStyle}>
                                    <Link href={getDynamicLink("/assets")}>
                                        <Briefcase /> 
                                        <span className="group-data-[state=collapsed]:hidden">Ativos</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                         {canAccess([ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN, ROLES.INVENTORY]) && (
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Árvore de Ativos" style={sidebarCollapsibleStyle}>
                                    <Link href={getDynamicLink("/assets/tree")}>
                                        <GitMerge />
                                        <span className="group-data-[state=collapsed]:hidden">Árvore de Ativos</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                        {canAccess([ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN, ROLES.INVENTORY]) && (
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Inventário (Scan)" style={sidebarCollapsibleStyle}>
                                    <Link href={getDynamicLink("/inventory/scan")}>
                                        <CheckSquare />
                                        <span className="group-data-[state=collapsed]:hidden">Inventário (Scan)</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                        {canAccess([ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN]) && (
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Reg. Caract. (Scan)" style={sidebarCollapsibleStyle}>
                                    <Link href={getDynamicLink("/characteristics/scan")}>
                                        <ScanLine />
                                        <span className="group-data-[state=collapsed]:hidden">Reg. Caract. (Scan)</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                        {canAccess([ROLES.ADMIN, ROLES.MANAGER]) && (
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Locais" style={sidebarCollapsibleStyle}>
                                    <Link href={getDynamicLink("/locations")}>
                                        <MapPin />
                                        <span className="group-data-[state=collapsed]:hidden">Locais</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                        {canAccess([ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN]) && (
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Ordens de Serviço" style={sidebarCollapsibleStyle}>
                                    <Link href={getDynamicLink("/maintenance/work-orders")}>
                                        <MaintenanceIcon />
                                        <span className="group-data-[state=collapsed]:hidden">Ordens de Serviço</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                         {canAccess([ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN]) && ( // Added new menu item
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Plano de Vencimentos" style={sidebarCollapsibleStyle}>
                                    <Link href={getDynamicLink("/maintenance/schedule")}>
                                        <CalendarCheck2 />
                                        <span className="group-data-[state=collapsed]:hidden">Plano de Vencimentos</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                        {canAccess([ROLES.ADMIN, ROLES.MANAGER, ROLES.INVENTORY]) && (
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Imprimir Etiquetas" style={sidebarCollapsibleStyle}>
                                    <Link href={getDynamicLink("/labels/print")}>
                                        <Printer />
                                        <span className="group-data-[state=collapsed]:hidden">Imprimir Etiquetas</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                        {canAccess([ROLES.ADMIN]) && (
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Log de Auditoria" style={sidebarCollapsibleStyle}>
                                    <Link href={getDynamicLink("/audit-log")}>
                                        <History />
                                        <span className="group-data-[state=collapsed]:hidden">Log de Auditoria</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                    </SidebarMenu>
                </SidebarContent>
                <SidebarFooter />
            </Sidebar>

            <SidebarInset>
                <header className="flex h-14 items-center justify-between border-b bg-background px-4 lg:px-6 sticky top-0 z-40"> 
                    <SidebarTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <PanelLeft />
                            <VisuallyHidden.Root>Toggle Sidebar</VisuallyHidden.Root>
                        </Button>
                    </SidebarTrigger>

                    <div className="flex items-center gap-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-auto px-2 flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={displayUserAvatar} alt={currentUserName} />
                                        <AvatarFallback>{getInitials(currentUserName)}</AvatarFallback>
                                    </Avatar>
                                    <span className="hidden md:inline text-sm font-medium">{currentUserName}</span>
                                    <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:inline" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{currentUserName}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {displayUserEmail} ({displayUserRole})
                                        </p>
                                         {currentCompanyId && <p className="text-xs leading-none text-muted-foreground">Empresa: {currentCompanyId}</p>}
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {canAccess([ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN, ROLES.INVENTORY, ROLES.EMPLOYEE]) && (
                                <DropdownMenuItem asChild>
                                    <Link href={getDynamicLink("/profile")}>
                                        <UserCircle className="mr-2 h-4 w-4" />
                                        <span>Meu Perfil</span>
                                    </Link>
                                </DropdownMenuItem>
                                )}
                                 {canAccess([ROLES.ADMIN]) && (
                                <DropdownMenuItem asChild>
                                    <Link href={getDynamicLink("/settings")}>
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Configurações Gerais</span>
                                    </Link>
                                </DropdownMenuItem>
                                )}
                                {canAccess([ROLES.ADMIN]) && (
                                    <DropdownMenuItem asChild>
                                        <Link href={getDynamicLink("/settings/admin")}>
                                            <ShieldCheck className="mr-2 h-4 w-4" />
                                            <span>Administração</span>
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <PwaInstallPromptButton />
                                </DropdownMenuItem>
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
                <main className="flex-1 p-2 xs:p-3 sm:pl-0 md:pl-0 lg:pl-0 sm:p-4 md:px-6 md:py-4 lg:px-8 lg:py-6 xl:px-10 xl:py-8 overflow-auto bg-muted/30 dark:bg-background/30">
                    {children}
                </main>
            </SidebarInset>
        </>
    );
}


export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminLayoutProvider>
        <SidebarProvider defaultOpen={true}>
            <AdminLayoutContentInternal>{children}</AdminLayoutContentInternal>
        </SidebarProvider>
    </AdminLayoutProvider>
  );
}