
'use client';

import { useEffect, useRef } from 'react';
import { usePwaInstall } from '@/contexts/PwaInstallContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export function PwaInstallPrompt() {
  const { canInstall, isPwaInstalled, triggerInstallPrompt } = usePwaInstall();
  const { toast, dismiss } = useToast();
  const toastIdRef = useRef<string | null>(null); // Use ref to store toast ID

  useEffect(() => {
    const sessionToastShown = sessionStorage.getItem('pwaInstallToastShown');
    
    if (canInstall && !isPwaInstalled && sessionToastShown !== 'true') {
      // Only show a new toast if one isn't already active from this specific prompt logic
      if (!toastIdRef.current) { 
        const newToast = toast({
          title: 'Instalar QRIoT.app',
          description: 'Adicione nosso app à sua tela inicial para uma melhor experiência e acesso offline!',
          duration: Infinity, 
          action: (
            <div className="flex flex-col gap-2 items-stretch w-full mt-2">
              <Button
                size="sm"
                onClick={async () => {
                  if (toastIdRef.current) { // Dismiss before triggering prompt
                    dismiss(toastIdRef.current);
                    toastIdRef.current = null;
                  }
                  await triggerInstallPrompt(); // This function from context handles its own outcomes
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
                      if (toastIdRef.current) {
                        dismiss(toastIdRef.current);
                        toastIdRef.current = null;
                      }
                      sessionStorage.setItem('pwaInstallToastShown', 'true'); 
                  }}
                  className="text-xs w-full text-muted-foreground hover:text-foreground"
              >
                  Lembrar Mais Tarde
              </Button>
            </div>
          ),
          onDismiss: () => { // Ensure toastIdRef is cleared if toast is dismissed externally
            if (newToast.id === toastIdRef.current) { 
                 sessionStorage.setItem('pwaInstallToastShown', 'true'); // Also mark as shown if dismissed
                 toastIdRef.current = null;
            }
          },
          onAutoClose: () => { // Ensure toastIdRef is cleared on auto close
             if (newToast.id === toastIdRef.current) {
                 sessionStorage.setItem('pwaInstallToastShown', 'true');
                 toastIdRef.current = null;
             }
          }
        });
        toastIdRef.current = newToast.id; 
      }
    } else {
      // Conditions to show toast are not met (e.g., already installed, cannot install, or toast already shown this session)
      // If there's an active toast managed by this component, dismiss it.
      if (toastIdRef.current) { 
        dismiss(toastIdRef.current);
        toastIdRef.current = null; 
      }
    }
    
    // Cleanup function for the effect
    return () => {
      if (toastIdRef.current) {
        // console.log("[PwaInstallPrompt] Cleaning up active toast:", toastIdRef.current);
        // dismiss(toastIdRef.current); // Avoid dismissing on every re-render if not necessary
        // toastIdRef.current = null;
      }
    };

  }, [canInstall, isPwaInstalled, triggerInstallPrompt, toast, dismiss]); 

  return null; 
}
