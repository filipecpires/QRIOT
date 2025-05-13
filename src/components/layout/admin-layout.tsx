
'use client'; 

import type { ReactNode} from 'react';
import React, { useEffect, useState } from 'react'; // Added useEffect and useState
import { usePathname, useSearchParams } from 'next/navigation'; // Added imports for routing info
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from '@/components/ui/sidebar';
import { QrCode, LayoutDashboard, MapPin, Settings, LogOut, GitMerge, History, FileText, ScanLine, Printer, Tag, PanelLeft, UserCircle, ChevronDown, Briefcase, Wrench as MaintenanceIcon, ShieldCheck, BarChart, CheckSquare, UserSquare, Users } from 'lucide-react';
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
import { MOCK_LOGGED_IN_USER_ID, MOCK_LOGGED_IN_USER_NAME, DEMO_USER_PROFILES } from '@/lib/mock-data';

// Mock function to get initials (replace with actual logic if needed)
function getInitials(name: string): string {
    if (!name) return '?';
    const names = name.split(' ');
    const firstInitial = names[0]?.[0] ?? '';
    const lastInitial = names.length > 1 ? names[names.length - 1]?.[0] ?? '' : '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
}

type UserRole = "Administrador" | "Gerente" | "Técnico" | "Inventariante" | "Funcionário";

const ROLES = {
    ADMIN: "Administrador" as UserRole,
    MANAGER: "Gerente" as UserRole,
    TECHNICIAN: "Técnico" as UserRole,
    INVENTORY: "Inventariante" as UserRole,
    EMPLOYEE: "Funcionário" as UserRole,
};

// Internal component to consume SidebarContext
function AdminLayoutContent({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [displayUserName, setDisplayUserName] = useState(MOCK_LOGGED_IN_USER_NAME);
    const [displayUserEmail, setDisplayUserEmail] = useState(`${MOCK_LOGGED_IN_USER_NAME.toLowerCase().replace(' ','_')}@qriot.app`); // Mock email
    const [displayUserAvatar, setDisplayUserAvatar] = useState(`https://i.pravatar.cc/40?u=${MOCK_LOGGED_IN_USER_NAME}`);
    const [displayUserRole, setDisplayUserRole] = useState<UserRole>(ROLES.ADMIN); // Default mock role

    useEffect(() => {
        const profileQueryParam = searchParams.get('profile');
        if (pathname === '/my-dashboard' && profileQueryParam) {
            const decodedProfileName = decodeURIComponent(profileQueryParam);
            const demoUser = DEMO_USER_PROFILES[decodedProfileName as keyof typeof DEMO_USER_PROFILES];
            if(demoUser) {
                setDisplayUserName(demoUser.name);
                setDisplayUserEmail(`${decodedProfileName.toLowerCase().replace(/\s+/g, '.')}@qriot.app`);
                setDisplayUserAvatar(`https://i.pravatar.cc/40?u=${encodeURIComponent(demoUser.name)}`);
                setDisplayUserRole(demoUser.role); 
            } else {
                // Fallback for unrecognized profile names, though ideally this shouldn't happen with defined profiles
                setDisplayUserName(`Demo: ${decodedProfileName}`);
                setDisplayUserEmail(`demo.${decodedProfileName.toLowerCase().replace(/\s+/g, '.')}@qriot.app`);
                setDisplayUserAvatar(`https://i.pravatar.cc/40?u=${encodeURIComponent(decodedProfileName)}`);
                setDisplayUserRole(ROLES.EMPLOYEE); // Default to a base role
            }
        } else {
            // For other pages or if no profile param, use default mock user
            setDisplayUserName(MOCK_LOGGED_IN_USER_NAME);
            setDisplayUserEmail(`${MOCK_LOGGED_IN_USER_NAME.toLowerCase().replace(' ','_')}@qriot.app`);
            setDisplayUserAvatar(`https://i.pravatar.cc/40?u=${MOCK_LOGGED_IN_USER_NAME}`);
            setDisplayUserRole(ROLES.ADMIN); // Default to Admin if not a demo profile view
        }
    }, [pathname, searchParams]);


    const { isMobile, setOpenMobile, open } = useSidebar();

    const handleMobileMenuClick = () => {
        if (isMobile) {
            setOpenMobile(false);
        }
    };

    const sidebarCollapsibleStyle = open ? {} : { justifyContent: 'center' };

    // Access control checks
    const canAccess = (allowedRoles: UserRole[]): boolean => {
        return allowedRoles.includes(displayUserRole);
    };


    return (
        <>
            {/* The actual sidebar component */}
            <Sidebar collapsible="icon">
                <SidebarHeader>
                    <Link href="/my-dashboard" className="flex items-center gap-2 p-2 group-data-[collapsible=icon]:justify-center">
                        <QrCode className="h-6 w-6 text-sidebar-primary" />
                        <span className="font-semibold text-lg text-sidebar-foreground group-data-[collapsible=icon]:hidden">QRIoT.app</span>
                    </Link>
                </SidebarHeader>
                <SidebarContent className="p-0"> 
                    <SidebarMenu className="p-2 space-y-1 group-data-[collapsible=icon]:p-1 group-data-[collapsible=icon]:space-y-1">
                        {/* Dashboard (General Admin/Manager Dashboard) */}
                        {canAccess([ROLES.ADMIN, ROLES.MANAGER]) && (
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Dashboard Geral" style={sidebarCollapsibleStyle} onClick={handleMobileMenuClick}>
                                    <Link href="/dashboard">
                                        <LayoutDashboard />
                                        <span className="group-data-[collapsible=icon]:hidden">Dashboard Geral</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                         {/* Meu Painel */}
                         {canAccess([ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN, ROLES.INVENTORY, ROLES.EMPLOYEE]) && (
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Meu Painel" style={sidebarCollapsibleStyle} onClick={handleMobileMenuClick}>
                                    <Link href="/my-dashboard">
                                        <UserSquare />
                                        <span className="group-data-[collapsible=icon]:hidden">Meu Painel</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                        {/* Assets */}
                        {canAccess([ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN, ROLES.INVENTORY]) && (
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Ativos" style={sidebarCollapsibleStyle} onClick={handleMobileMenuClick}>
                                    <Link href="/assets">
                                        <Briefcase /> 
                                        <span className="group-data-[collapsible=icon]:hidden">Ativos</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                        {/* Asset Tree */}
                         {canAccess([ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN, ROLES.INVENTORY]) && (
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Árvore de Ativos" style={sidebarCollapsibleStyle} onClick={handleMobileMenuClick}>
                                    <Link href="/assets/tree">
                                        <GitMerge />
                                        <span className="group-data-[collapsible=icon]:hidden">Árvore de Ativos</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                        {/* Inventory Scan */}
                        {canAccess([ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN, ROLES.INVENTORY]) && (
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Inventário (Scan)" style={sidebarCollapsibleStyle} onClick={handleMobileMenuClick}>
                                    <Link href="/inventory/scan">
                                        <CheckSquare />
                                        <span className="group-data-[collapsible=icon]:hidden">Inventário (Scan)</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                        {/* Characteristic Scan */}
                        {canAccess([ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN]) && (
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Reg. Caract. (Scan)" style={sidebarCollapsibleStyle} onClick={handleMobileMenuClick}>
                                    <Link href="/characteristics/scan">
                                        <ScanLine />
                                        <span className="group-data-[collapsible=icon]:hidden">Reg. Caract. (Scan)</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                        {/* Locations */}
                        {canAccess([ROLES.ADMIN, ROLES.MANAGER]) && (
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Locais" style={sidebarCollapsibleStyle} onClick={handleMobileMenuClick}>
                                    <Link href="/locations">
                                        <MapPin />
                                        <span className="group-data-[collapsible=icon]:hidden">Locais</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                        {/* Maintenance */}
                        {canAccess([ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN]) && (
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Manutenção" style={sidebarCollapsibleStyle} onClick={handleMobileMenuClick}>
                                    <Link href="/maintenance/work-orders">
                                        <MaintenanceIcon />
                                        <span className="group-data-[collapsible=icon]:hidden">Manutenção</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                        {/* Print Labels */}
                        {canAccess([ROLES.ADMIN, ROLES.MANAGER]) && (
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Imprimir Etiquetas" style={sidebarCollapsibleStyle} onClick={handleMobileMenuClick}>
                                    <Link href="/labels/print">
                                        <Printer />
                                        <span className="group-data-[collapsible=icon]:hidden">Imprimir Etiquetas</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                        {/* Audit Log */}
                        {canAccess([ROLES.ADMIN]) && (
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip="Log de Auditoria" style={sidebarCollapsibleStyle} onClick={handleMobileMenuClick}>
                                    <Link href="/audit-log">
                                        <History />
                                        <span className="group-data-[collapsible=icon]:hidden">Log de Auditoria</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
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
                                        <AvatarImage src={displayUserAvatar} alt={displayUserName} />
                                        <AvatarFallback>{getInitials(displayUserName)}</AvatarFallback>
                                    </Avatar>
                                    <span className="hidden md:inline text-sm font-medium">{displayUserName}</span>
                                    <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:inline" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{displayUserName}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {displayUserEmail} ({displayUserRole})
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {canAccess([ROLES.ADMIN, ROLES.MANAGER, ROLES.TECHNICIAN, ROLES.INVENTORY, ROLES.EMPLOYEE]) && (
                                <DropdownMenuItem asChild>
                                    <Link href="/profile">
                                        <UserCircle className="mr-2 h-4 w-4" />
                                        <span>Meu Perfil</span>
                                    </Link>
                                </DropdownMenuItem>
                                )}
                                {canAccess([ROLES.ADMIN, ROLES.MANAGER]) && (
                                <DropdownMenuItem asChild>
                                    <Link href="/licensing">
                                        <FileText className="mr-2 h-4 w-4" />
                                        <span>Licença</span>
                                    </Link>
                                </DropdownMenuItem>
                                )}
                                 {canAccess([ROLES.ADMIN]) && (
                                <DropdownMenuItem asChild>
                                    <Link href="/settings">
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Configurações</span>
                                    </Link>
                                </DropdownMenuItem>
                                )}
                                {canAccess([ROLES.ADMIN]) && (
                                    <DropdownMenuItem asChild>
                                        <Link href="/settings/admin">
                                            <ShieldCheck className="mr-2 h-4 w-4" />
                                            <span>Administração</span>
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    {/* PWA Install Button */}
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
                 <main className="flex-1 p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 overflow-auto"> 
                    {children}
                </main>
            </SidebarInset>
        </>
    );
}


export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SidebarProvider>
  );
}

    