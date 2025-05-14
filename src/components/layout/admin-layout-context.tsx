
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { MOCK_LOGGED_IN_USER_ID, MOCK_LOGGED_IN_USER_NAME, DEMO_USER_PROFILES, MOCK_COMPANY_ID } from '@/lib/mock-data';
import type { UserRole } from '@/types/user';

const ROLES = {
    ADMIN: "Administrador" as UserRole,
    MANAGER: "Gerente" as UserRole,
    TECHNICIAN: "Técnico" as UserRole,
    INVENTORY: "Inventariante" as UserRole,
    EMPLOYEE: "Funcionário" as UserRole,
};

interface AdminLayoutContextType {
  currentUserId: string;
  currentUserName: string;
  currentCompanyId: string;
  displayUserRole: UserRole;
  displayUserEmail: string;
  displayUserAvatar: string;
  currentDemoProfileName: string | null;
}

const AdminLayoutContext = createContext<AdminLayoutContextType | undefined>(undefined);

export const AdminLayoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [currentUserId, setCurrentUserId] = useState<string>(MOCK_LOGGED_IN_USER_ID);
  const [currentUserName, setCurrentUserName] = useState<string>(MOCK_LOGGED_IN_USER_NAME);
  const [currentCompanyId, setCurrentCompanyId] = useState<string>(MOCK_COMPANY_ID); // Default company
  const [displayUserRole, setDisplayUserRole] = useState<UserRole>(ROLES.ADMIN);
  const [displayUserEmail, setDisplayUserEmail] = useState<string>(`${MOCK_LOGGED_IN_USER_NAME.toLowerCase().replace(/\s+/g, '.').split('(')[0]}@xyz.com`);
  const [displayUserAvatar, setDisplayUserAvatar] = useState<string>(`https://i.pravatar.cc/40?u=${encodeURIComponent(MOCK_LOGGED_IN_USER_NAME)}`);
  const [currentDemoProfileName, setCurrentDemoProfileName] = useState<string | null>(null);

  useEffect(() => {
    const profileQueryParam = searchParams.get('profile');
    const sessionDemoProfileName = typeof window !== 'undefined' ? sessionStorage.getItem('selectedDemoProfileName') : null;
    let activeProfileName: string | null = null;

    if (profileQueryParam) {
      activeProfileName = decodeURIComponent(profileQueryParam);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('selectedDemoProfileName', activeProfileName);
      }
      console.log(`[AdminLayoutContext] Demo profile selected via URL: ${activeProfileName}`);
    } else if (sessionDemoProfileName) {
      activeProfileName = sessionDemoProfileName;
      console.log(`[AdminLayoutContext] Demo profile restored from session: ${activeProfileName}`);
    }
    
    setCurrentDemoProfileName(activeProfileName);

    if (activeProfileName) {
      const demoUser = DEMO_USER_PROFILES[activeProfileName as keyof typeof DEMO_USER_PROFILES];
      if (demoUser) {
        setCurrentUserId(demoUser.id);
        setCurrentUserName(demoUser.name);
        setCurrentCompanyId(demoUser.companyId); // Use companyId from demo profile
        setDisplayUserRole(demoUser.role);
        setDisplayUserEmail(`${activeProfileName.toLowerCase().replace(/\s+/g, '.').split('(')[0]}@${demoUser.companyId.toLowerCase()}.com`);
        setDisplayUserAvatar(`https://i.pravatar.cc/40?u=${encodeURIComponent(demoUser.name)}`);
      } else {
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('selectedDemoProfileName');
        }
        // Fallback to default if profile name is invalid
        setCurrentUserId(MOCK_LOGGED_IN_USER_ID);
        setCurrentUserName(MOCK_LOGGED_IN_USER_NAME);
        setCurrentCompanyId(MOCK_COMPANY_ID);
        setDisplayUserRole(ROLES.ADMIN);
        setDisplayUserEmail(`${MOCK_LOGGED_IN_USER_NAME.toLowerCase().replace(/\s+/g, '.').split('(')[0]}@xyz.com`);
        setDisplayUserAvatar(`https://i.pravatar.cc/40?u=${encodeURIComponent(MOCK_LOGGED_IN_USER_NAME)}`);
        console.warn(`[AdminLayoutContext] Invalid demo profile name "${activeProfileName}", falling back to default.`);
      }
    } else {
      // No demo profile active, use default mock user
      setCurrentUserId(MOCK_LOGGED_IN_USER_ID);
      setCurrentUserName(MOCK_LOGGED_IN_USER_NAME);
      setCurrentCompanyId(MOCK_COMPANY_ID);
      setDisplayUserRole(ROLES.ADMIN);
      setDisplayUserEmail(`${MOCK_LOGGED_IN_USER_NAME.toLowerCase().replace(/\s+/g, '.').split('(')[0]}@xyz.com`);
      setDisplayUserAvatar(`https://i.pravatar.cc/40?u=${encodeURIComponent(MOCK_LOGGED_IN_USER_NAME)}`);
      console.log('[AdminLayoutContext] No demo profile active, using default mock user.');
    }
  }, [searchParams, pathname]); // pathname dependency to re-evaluate if query params change on navigation

  const contextValue = useMemo(() => ({
    currentUserId,
    currentUserName,
    currentCompanyId,
    displayUserRole,
    displayUserEmail,
    displayUserAvatar,
    currentDemoProfileName,
  }), [
    currentUserId, currentUserName, currentCompanyId, 
    displayUserRole, displayUserEmail, displayUserAvatar, 
    currentDemoProfileName
  ]);

  return (
    <AdminLayoutContext.Provider value={contextValue}>
      {children}
    </AdminLayoutContext.Provider>
  );
};

export const useAdminLayoutContext = (): AdminLayoutContextType => {
  const context = useContext(AdminLayoutContext);
  if (context === undefined) {
    throw new Error('useAdminLayoutContext must be used within an AdminLayoutProvider');
  }
  return context;
};
