
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAdminLayoutContext } from '@/components/layout/admin-layout-context';

export default function LicensingRedirectPage() {
  const router = useRouter();
  const { currentCompanyId, currentDemoProfileName } = useAdminLayoutContext();

  useEffect(() => {
    // Redirect to the company-specific settings page which now includes licensing.
    // This page (/licensing) will effectively be deprecated or serve as a redirect.
    if (currentCompanyId) {
        const targetPath = `/settings/admin/company`;
        router.replace(currentDemoProfileName ? `${targetPath}?profile=${encodeURIComponent(currentDemoProfileName)}` : targetPath);
    } else {
        // Fallback if companyId is not yet available (should ideally not happen if context is robust)
        // Or redirect to a generic error page or dashboard.
         console.warn("[LicensingPage] Company ID not available, redirecting to My Dashboard.");
         const fallbackPath = '/my-dashboard';
         router.replace(currentDemoProfileName ? `${fallbackPath}?profile=${encodeURIComponent(currentDemoProfileName)}` : fallbackPath);
    }
  }, [router, currentCompanyId, currentDemoProfileName]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)]">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Redirecionando para configurações da empresa...</p>
    </div>
  );
}

