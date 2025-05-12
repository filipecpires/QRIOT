
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
  const [canInstall, setCanInstall] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    console.log('[PWAContext] Initializing PWA context and event listeners.');

    const checkInstallationStatus = () => {
      if (typeof window !== 'undefined') {
        const installed = window.matchMedia('(display-mode: standalone)').matches;
        console.log(`[PWAContext] Initial installation status check: ${installed ? 'Standalone (Installed)' : 'Browser Tab'}`);
        setIsPwaInstalled(installed);
        if (installed) {
          setCanInstall(false); // If already installed, can't install again
        }
      } else {
        console.log('[PWAContext] Window not available for installation status check (SSR/pre-hydration).');
      }
    };
    checkInstallationStatus(); // Check on mount

    const handleBeforeInstallPrompt = (event: Event) => {
      console.log('[PWAContext] "beforeinstallprompt" event fired.');
      event.preventDefault();
      const typedEvent = event as BeforeInstallPromptEvent;
      
      // Re-check standalone status, as this event might fire after initial checks or if manifest changes
      if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
        console.log('[PWAContext] "beforeinstallprompt": Detected standalone mode again, app is installed.');
        setIsPwaInstalled(true);
        setCanInstall(false);
        setInstallPromptEvent(null);
      } else {
        console.log('[PWAContext] "beforeinstallprompt": Storing prompt event. Setting canInstall = true.');
        setInstallPromptEvent(typedEvent);
        setCanInstall(true);
        setIsPwaInstalled(false); // Explicitly set not installed if prompt is available
      }
    };

    const handleAppInstalled = () => {
      console.log('[PWAContext] "appinstalled" event fired. App installation confirmed.');
      setIsPwaInstalled(true);
      setCanInstall(false);
      setInstallPromptEvent(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      console.log('[PWAContext] Cleaning up PWA event listeners.');
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []); // Empty dependency array ensures this runs once on mount and unmount

  const triggerInstallPrompt = useCallback(async () => {
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
          title: 'Instalação Indisponível no Momento',
          description: 'Não foi possível exibir o prompt de instalação. Isso pode ocorrer se os critérios de PWA não forem atendidos, se o prompt já foi dispensado ou se o navegador não suportar esta ação agora. Tente novamente mais tarde ou verifique as configurações do navegador.',
          variant: 'default',
          duration: 8000,
        });
      }
      // Ensure canInstall is false if the prompt wasn't available/shown
      // (it should already be false if installPromptEvent is null, but this is a safeguard)
      if (!isPwaInstalled) {
        setCanInstall(false);
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
        // isPwaInstalled will be set by the 'appinstalled' event listener
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
    // The prompt can only be used once. Clear it and set canInstall to false.
    setInstallPromptEvent(null);
    setCanInstall(false);
    console.log('[PWAContext] triggerInstallPrompt: Prompt used or failed. installPromptEvent cleared, canInstall set to false.');
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

