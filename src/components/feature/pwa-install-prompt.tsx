
'use client';

import { useEffect, useState } from 'react';
import { usePwaInstall } from '@/contexts/PwaInstallContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

export function PwaInstallPrompt() {
  const { canInstall, isPwaInstalled, triggerInstallPrompt } = usePwaInstall();
  const { toast, dismiss } = useToast();
  const [toastShownThisSession, setToastShownThisSession] = useState(false);

  useEffect(() => {
    // Check if a toast has already been shown this session from sessionStorage
    const sessionToastShown = sessionStorage.getItem('pwaInstallToastShown');
    if (sessionToastShown === 'true') {
      setToastShownThisSession(true);
    }
  }, []);

  useEffect(() => {
    if (canInstall && !isPwaInstalled && !toastShownThisSession) {
      const { id } = toast({
        title: 'Instalar QRIoT.app',
        description: 'Adicione nosso app à sua tela inicial para uma melhor experiência!',
        duration: Infinity, // Keep toast until action or dismissed
        action: (
          <div className="flex flex-col gap-2 items-stretch w-full">
            <Button
              size="sm"
              onClick={async () => {
                await triggerInstallPrompt();
                dismiss(id);
                setToastShownThisSession(true);
                sessionStorage.setItem('pwaInstallToastShown', 'true');
              }}
              className="bg-accent text-accent-foreground hover:bg-accent/90 w-full"
            >
              <Download className="mr-2 h-4 w-4" /> Instalar
            </Button>
             <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                    dismiss(id);
                    setToastShownThisSession(true); // Dismiss for this session
                    sessionStorage.setItem('pwaInstallToastShown', 'true');
                }}
                className="text-xs w-full"
            >
                Agora Não
            </Button>
          </div>
        ),
      });
      // Mark as shown for this session to prevent re-triggering on navigation
      // setToastShownThisSession(true); // This is handled by the dismiss actions
    }
  }, [canInstall, isPwaInstalled, triggerInstallPrompt, toast, dismiss, toastShownThisSession]);

  // This component no longer renders UI itself, it just triggers a toast.
  return null;
}
