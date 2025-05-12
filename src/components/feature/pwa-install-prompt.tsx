
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
    const sessionToastShown = sessionStorage.getItem('pwaInstallToastShown');
    
    if (canInstall && !isPwaInstalled && sessionToastShown !== 'true') {
      // Only show a new toast if one isn't already active from this specific prompt logic
      if (!toastId) { 
        const newToast = toast({
          title: 'Instalar QRIoT.app',
          description: 'Adicione nosso app à sua tela inicial para uma melhor experiência e acesso offline!',
          duration: Infinity, 
          action: (
            <div className="flex flex-col gap-2 items-stretch w-full mt-2">
              <Button
                size="sm"
                onClick={async () => {
                  await triggerInstallPrompt();
                  // It's important that newToast.id is from the closure of when the toast was created
                  dismiss(newToast.id); 
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
                      // It's important that newToast.id is from the closure of when the toast was created
                      dismiss(newToast.id);
                      sessionStorage.setItem('pwaInstallToastShown', 'true'); 
                  }}
                  className="text-xs w-full text-muted-foreground hover:text-foreground"
              >
                  Lembrar Mais Tarde
              </Button>
            </div>
          ),
        });
        setToastId(newToast.id); 
      }
    } else {
      // Conditions to show toast are not met
      if (toastId) { // If there's an active toast managed by this component, dismiss it
        dismiss(toastId);
        setToastId(null); 
      }
    }

  }, [canInstall, isPwaInstalled, triggerInstallPrompt, toast, dismiss, toastId]); 

  return null; 
}
