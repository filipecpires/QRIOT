
'use client';

import type { ReactNode} from 'react';
import React, { createContext, useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
// Button and Download are not directly used in the context provider logic itself anymore for the initial toast
// They are used by components consuming the context (PwaInstallPrompt.tsx and PwaInstallPromptButton.tsx)

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
  const { toast } = useToast(); // Toast is used in triggerInstallPrompt

  // Effect for 'beforeinstallprompt' and 'appinstalled' listeners
  useEffect(() => {
    console.log('[PWAContext] Setting up PWA event listeners.');

    const checkInitialInstallationStatus = () => {
      if (typeof window !== 'undefined') {
        const standalone = window.matchMedia('(display-mode: standalone)').matches;
        // In dev, generally consider it NOT installed initially to allow 'beforeinstallprompt' to be captured and tested.
        // The event handler for 'beforeinstallprompt' will then set the correct PWA-related states.
        const initiallyConsideredInstalled = process.env.NODE_ENV === 'development' ? false : standalone;
        
        console.log(`[PWAContext] Initial check: ${initiallyConsideredInstalled ? 'Standalone (Installed)' : 'Browser Tab'}. Mode: ${process.env.NODE_ENV}`);
        setIsPwaInstalled(initiallyConsideredInstalled);
      } else {
         console.log('[PWAContext] Window object not available for initial installation status check.');
      }
    };
    checkInitialInstallationStatus();

    const handleBeforeInstallPrompt = (event: Event) => {
      console.log('[PWAContext] "beforeinstallprompt" event fired.');
      event.preventDefault(); // Prevent the mini-infobar from appearing on mobile automatically

      // Check if already considered installed (e.g. by a previous 'appinstalled' event or if not in dev mode and display-mode is standalone)
      // We use a local variable here because `isPwaInstalled` state might not be updated yet in this event handler's closure.
      const currentStandaloneStatus = typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches;
      const effectivelyInstalled = process.env.NODE_ENV === 'development' ? false : currentStandaloneStatus;

      if (effectivelyInstalled) {
          console.log('[PWAContext] "beforeinstallprompt": App is effectively installed, not storing prompt.');
          setIsPwaInstalled(true);
          setInstallPromptEvent(null); 
          return;
      }
      
      console.log('[PWAContext] "beforeinstallprompt": Storing prompt event.');
      setInstallPromptEvent(event as BeforeInstallPromptEvent);
      setIsPwaInstalled(false); // Explicitly set to false if prompt is available
    };

    const handleAppInstalled = () => {
      console.log('[PWAContext] "appinstalled" event fired.');
      setIsPwaInstalled(true);
      setInstallPromptEvent(null); // Clear the prompt event as it's no longer needed
      sessionStorage.setItem('pwaInstallToastShown', 'true'); // Prevent initial toast from re-appearing
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      console.log('[PWAContext] Cleaning up PWA event listeners.');
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []); // Run once on mount and cleanup on unmount

  const triggerInstallPrompt = useCallback(async () => {
    if (!installPromptEvent) {
      console.warn('[PWAContext] triggerInstallPrompt: No install prompt event available.');
      if (isPwaInstalled) {
        toast({ title: 'App Já Instalado', description: 'O QRIoT.app já está como um app no seu dispositivo.' });
      } else {
        toast({ title: 'Instalação Indisponível', description: 'Não é possível instalar o app agora. Tente mais tarde ou verifique as configurações do navegador.' });
      }
      return;
    }

    console.log('[PWAContext] Prompting user for PWA installation...');
    try {
      await installPromptEvent.prompt();
      const { outcome } = await installPromptEvent.userChoice;
      console.log(`[PWAContext] User choice: ${outcome}`);
      if (outcome === 'accepted') {
        toast({ title: 'App Instalado!', description: 'QRIoT.app foi adicionado à sua tela inicial.' });
        // The 'appinstalled' event listener will handle setting isPwaInstalled and clearing installPromptEvent.
      } else {
        toast({ title: 'Instalação Cancelada', description: 'Você pode instalar o app mais tarde pelo menu do navegador.' });
      }
    } catch (error) {
      console.error('[PWAContext] Error during PWA install prompt:', error);
      toast({ title: 'Erro na Instalação', description: 'Não foi possível iniciar a instalação.', variant: 'destructive' });
    }
    // Clear the event as it can only be used once, regardless of outcome.
    // If accepted, the 'appinstalled' event will handle state. If dismissed, it's consumed.
    setInstallPromptEvent(null);
  }, [installPromptEvent, isPwaInstalled, toast]);

  // Derived state for canInstall
  const canInstall = !!installPromptEvent && !isPwaInstalled;

  const contextValue = useMemo(() => ({
    installPromptEvent,
    isPwaInstalled,
    canInstall,
    triggerInstallPrompt,
  }), [installPromptEvent, isPwaInstalled, canInstall, triggerInstallPrompt]);

  return (
    <PwaInstallContext.Provider value={contextValue}>
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
