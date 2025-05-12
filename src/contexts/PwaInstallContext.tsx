
'use client';

import type { ReactNode} from 'react';
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useToast } from '@/hooks/use-toast';

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
  const [canInstall, setCanInstall] = useState(false); // Initial state is false
  const { toast } = useToast();

  useEffect(() => {
    console.log('[PWAContext] useEffect setup running.');

    // Check initial installed state
    if (typeof window !== 'undefined') {
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('[PWAContext] Initial check: App is running in standalone mode.');
            setIsPwaInstalled(true);
            setCanInstall(false);
        } else {
            console.log('[PWAContext] Initial check: App is NOT in standalone mode.');
            setIsPwaInstalled(false); // Explicitly set if not standalone
            // canInstall remains false until beforeinstallprompt fires
        }
    } else {
        console.log('[PWAContext] Initial check: Window not defined (SSR or pre-hydration).');
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      console.log('[PWAContext] "beforeinstallprompt" event fired.');
      event.preventDefault(); // Prevent the mini-infobar from appearing on mobile
      const typedEvent = event as BeforeInstallPromptEvent;
      
      // Check again for standalone mode, as this event might fire after initial checks
      if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
        console.log('[PWAContext] "beforeinstallprompt": Detected standalone mode, setting app as installed.');
        setIsPwaInstalled(true);
        setCanInstall(false);
        setInstallPromptEvent(null); // Clear any stored prompt
      } else {
        console.log('[PWAContext] "beforeinstallprompt": Storing prompt event, setting canInstall = true.');
        setInstallPromptEvent(typedEvent);
        setCanInstall(true); // Now the app can be installed via the prompt
      }
    };

    const handleAppInstalled = () => {
      console.log('[PWAContext] "appinstalled" event fired.');
      setIsPwaInstalled(true);
      setCanInstall(false);
      setInstallPromptEvent(null); // Clear the saved prompt event
    };

    console.log('[PWAContext] Adding event listeners for "beforeinstallprompt" and "appinstalled".');
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Cleanup function
    return () => {
      console.log('[PWAContext] Cleaning up event listeners.');
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []); // Empty dependency array, runs once on mount

  const triggerInstallPrompt = useCallback(async () => {
    if (!installPromptEvent) {
      console.warn('[PWAContext] triggerInstallPrompt: No installPromptEvent available. App might be installed, prompt dismissed, or criteria not met.');
      toast({
        title: 'Instalação não disponível',
        description: isPwaInstalled ? 'O app já está instalado.' : 'O prompt de instalação não pôde ser exibido agora. Tente mais tarde ou verifique as configurações do navegador.',
        variant: 'default',
      });
      setCanInstall(false); // Ensure canInstall is false if prompt isn't available
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
        setIsPwaInstalled(true); // This will also be caught by 'appinstalled' event, but good to set here.
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
    // The prompt can only be used once.
    setInstallPromptEvent(null);
    setCanInstall(false);
    console.log('[PWAContext] triggerInstallPrompt: Prompt used or failed, canInstall set to false.');
  }, [installPromptEvent, toast, isPwaInstalled]);

  return (
    <PwaInstallContext.Provider value={{ installPromptEvent, isPwaInstalled, canInstall, triggerInstallPrompt }}>
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

