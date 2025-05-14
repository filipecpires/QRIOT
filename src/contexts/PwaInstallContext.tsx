
'use client';

import type { ReactNode} from 'react';
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PwaInstallContextType {
  installPromptEvent: BeforeInstallPromptEvent | null;
  isPwaInstalled: boolean;
  canInstall: boolean;
  triggerInstallPrompt: () => Promise<void>;
}

const PwaInstallContext = createContext<PwaInstallContextType | undefined>(undefined);

export const PwaInstallProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const { toast, dismiss } = useToast();
  const [managedToastId, setManagedToastId] = useState<string | null>(null);

  // Effect to handle 'beforeinstallprompt' and 'appinstalled' events
  useEffect(() => {
    console.log('[PWAContext] Initializing PWA context and event listeners for install prompt.');

    const checkInstallationStatus = () => {
      if (typeof window !== 'undefined') {
        const installed = window.matchMedia('(display-mode: standalone)').matches;
        console.log(`[PWAContext] Initial installation status check: ${installed ? 'Standalone (Installed)' : 'Browser Tab'}`);
        setIsPwaInstalled(installed);
        if (installed) {
          setCanInstall(false); 
        }
      } else {
        console.log('[PWAContext] Window not available for installation status check (SSR/pre-hydration).');
      }
    };
    checkInstallationStatus();

    const handleBeforeInstallPrompt = (event: Event) => {
      console.log('[PWAContext] "beforeinstallprompt" event fired.');
      event.preventDefault();
      const typedEvent = event as BeforeInstallPromptEvent;
      
      if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
        console.log('[PWAContext] "beforeinstallprompt": Detected standalone mode, app is already installed.');
        setIsPwaInstalled(true);
        setCanInstall(false);
        setInstallPromptEvent(null);
      } else {
        console.log('[PWAContext] "beforeinstallprompt": Storing prompt event. Setting canInstall = true.');
        setInstallPromptEvent(typedEvent);
        setCanInstall(true);
        setIsPwaInstalled(false); 
      }
    };

    const handleAppInstalled = () => {
      console.log('[PWAContext] "appinstalled" event fired. App installation confirmed.');
      setIsPwaInstalled(true);
      setCanInstall(false);
      setInstallPromptEvent(null);
      sessionStorage.setItem('pwaInstallToastShown', 'true'); 
      if (managedToastId) { 
        dismiss(managedToastId);
        setManagedToastId(null);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      console.log('[PWAContext] Cleaning up PWA event listeners for install prompt.');
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [managedToastId, dismiss]);

  const triggerInstallHandler = useCallback(async () => {
    if (!installPromptEvent) {
      console.warn('[PWAContext] triggerInstallPrompt: No installPromptEvent available.');
      if (isPwaInstalled) {
        toast({
          title: 'App Já Instalado',
          description: 'O QRIoT.app já está funcionando como um aplicativo no seu dispositivo.',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Instalação Indisponível',
          description: 'Não foi possível exibir o prompt de instalação. Tente novamente mais tarde ou verifique as configurações do navegador.',
          variant: 'default',
          duration: 8000,
        });
      }
      if (!isPwaInstalled) {
        setCanInstall(false);
      }
      // Dismiss the managed toast if it exists, as the prompt cannot be shown.
      if (managedToastId) {
        dismiss(managedToastId);
        setManagedToastId(null);
      }
      return;
    }

    console.log('[PWAContext] triggerInstallPrompt: Prompting user for PWA installation...');
    try {
      await installPromptEvent.prompt();
      const { outcome } = await installPromptEvent.userChoice;
      console.log(`[PWAContext] User choice: ${outcome}`);
      if (outcome === 'accepted') {
        toast({
          title: 'App Instalado!',
          description: 'QRIoT.app foi adicionado à sua tela inicial.',
        });
      } else {
        toast({
          title: 'Instalação Cancelada',
          description: 'Você pode instalar o app mais tarde pelo menu do navegador.',
        });
      }
    } catch (error) {
      console.error('[PWAContext] Error during PWA install prompt:', error);
      toast({
        title: 'Erro na Instalação',
        description: 'Não foi possível iniciar a instalação do app.',
        variant: 'destructive',
      });
    }
    setInstallPromptEvent(null);
    setCanInstall(false);
    // Dismiss and clear the toast ID regardless of outcome, as the prompt is used.
    if (managedToastId) {
      dismiss(managedToastId);
      setManagedToastId(null);
    }
  }, [installPromptEvent, isPwaInstalled, toast, dismiss, managedToastId]);


  // Effect to show/hide the install toast
  useEffect(() => {
    const sessionToastShown = sessionStorage.getItem('pwaInstallToastShown');
    
    if (canInstall && !isPwaInstalled && sessionToastShown !== 'true') {
      if (!managedToastId) {
        const newToast = toast({
          title: 'Instalar QRIoT.app',
          description: 'Adicione nosso app à sua tela inicial para uma melhor experiência e acesso offline!',
          duration: Infinity, 
          action: (
            <div className="flex flex-col gap-2 items-stretch w-full mt-2">
              <Button
                size="sm"
                onClick={async () => {
                  await triggerInstallHandler(); // This will handle dismissing its own toastId if set
                  // No need to dismiss newToast.id here as triggerInstallHandler does it via managedToastId
                  sessionStorage.setItem('pwaInstallToastShown', 'true');
                  // managedToastId will be cleared by triggerInstallHandler
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
              >
                <Download className="mr-2 h-4 w-4" /> Instalar Agora
              </Button>
               <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                      dismiss(newToast.id); // Dismiss this specific toast
                      sessionStorage.setItem('pwaInstallToastShown', 'true'); 
                      setManagedToastId(null); 
                  }}
                  className="text-xs w-full text-muted-foreground hover:text-foreground"
              >
                  Lembrar Mais Tarde
              </Button>
            </div>
          ),
          onDismiss: () => {
            if (newToast.id === managedToastId) { 
                 sessionStorage.setItem('pwaInstallToastShown', 'true');
                 setManagedToastId(null);
            }
          },
          onAutoClose: () => { 
             if (newToast.id === managedToastId) {
                 sessionStorage.setItem('pwaInstallToastShown', 'true');
                 setManagedToastId(null);
             }
          }
        });
        setManagedToastId(newToast.id);
      }
    } else {
      if (managedToastId) { 
        dismiss(managedToastId);
        setManagedToastId(null); 
      }
    }
  }, [canInstall, isPwaInstalled, triggerInstallHandler, toast, dismiss]); // Removed managedToastId from here

  return (
    <PwaInstallContext.Provider value={{ installPromptEvent, isPwaInstalled, canInstall, triggerInstallPrompt: triggerInstallHandler }}>
      {children}
    </PwaInstallContext.Provider>
  );
};

export const usePwaInstall = (): PwaInstallContextType => {
  const context = useContext(PwaInstallContext);
  if (context === undefined) {
    throw new Error('usePwaInstall must be used within a PwaInstallProvider');
  }
  return context;
};
