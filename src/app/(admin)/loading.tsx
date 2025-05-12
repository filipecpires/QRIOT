
'use client';

import { Loader2 } from 'lucide-react';

export default function AdminLoading() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-[calc(100vh-3.5rem-2rem)]"> {/* Adjusted min-h to account for header and some padding */}
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground text-lg">Carregando...</p>
    </div>
  );
}
