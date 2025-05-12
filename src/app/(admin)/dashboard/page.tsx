
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the user-specific dashboard
    router.replace('/my-dashboard');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)]">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">Redirecionando para o seu painel...</p>
    </div>
  );
}
