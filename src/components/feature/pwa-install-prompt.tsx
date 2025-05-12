
'use client';

import { useEffect, useState } from 'react';
import { usePwaInstall } from '@/contexts/PwaInstallContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react'; // Removed X as it's not used for icon here

export function PwaInstallPrompt() {
  const { canInstall, isPwaInstalled, triggerInstallPrompt } = usePwaInstall();
  const { toast, dismiss } = useToast();
  const [toastId, setToastId] = useState<string | null>(null); // Store toast ID

  useEffect(() => {
    // Check if a toast has already been shown this session from sessionStorage
    const sessionToastShown = sessionStorage.getItem('pwaInstallToastShown');
    
    if (canInstall && !isPwaInstalled && sessionToastShown !== 'true') {
      // If a toast is already active from a previous render of this effect, dismiss it first
      if (toastId) {
        dismiss(toastId);
      }

      const newToastId = toast({
        title: 'Instalar QRIoT.app',
        description: 'Adicione nosso app à sua tela inicial para uma melhor experiência e acesso offline!',
        duration: Infinity, 
        action: (
          <div className="flex flex-col gap-2 items-stretch w-full mt-2">
            <Button
              size="sm"
              onClick={async () => {
                await triggerInstallPrompt();
                dismiss(newToastId); 
                sessionStorage.setItem('pwaInstallToastShown', 'true'); 
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
            >
              <Download className="mr-2 h-4 w-4" /> Instalar Agora
            </Button>
             <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                    dismiss(newToastId);
                    sessionStorage.setItem('pwaInstallToastShown', 'true'); 
                }}
                className="text-xs w-full text-muted-foreground hover:text-foreground"
            >
                Lembrar Mais Tarde
            </Button>
          </div>
        ),
      }).id;
      setToastId(newToastId);
    } else if ((!canInstall || isPwaInstalled) && toastId) {
      // If conditions no longer met (e.g., installed elsewhere, or prompt no longer available), dismiss active toast
      dismiss(toastId);
      setToastId(null);
    }

    // Cleanup the toast if the component unmounts or dependencies change causing a re-run
    return () => {
      if (toastId) {
        dismiss(toastId);
      }
    };
  }, [canInstall, isPwaInstalled, triggerInstallPrompt, toast, dismiss, toastId]); // Added toastId to deps

  return null; // This component only manages the toast
}
