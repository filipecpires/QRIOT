
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
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      const typedEvent = event as BeforeInstallPromptEvent;
      
      if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
        setIsPwaInstalled(true);
        setCanInstall(false);
      } else {
        setInstallPromptEvent(typedEvent);
        setCanInstall(true);
        console.log('PWA installation prompt available and stored in context.');
      }
    };

    const handleAppInstalled = () => {
      console.log('PWA has been installed (appinstalled event).');
      setIsPwaInstalled(true);
      setCanInstall(false);
      setInstallPromptEvent(null);
    };

    // Check initial installed state
    if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
        console.log('App is already installed as PWA (initial check).');
        setIsPwaInstalled(true);
        setCanInstall(false);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerInstallPrompt = useCallback(async () => {
    if (!installPromptEvent) {
      toast({
        title: 'Instalação não disponível',
        description: 'O prompt de instalação não está pronto, o app já pode estar instalado ou o navegador não suporta esta ação no momento.',
        variant: 'default', // Changed to default as it's informational
      });
      return;
    }

    try {
      await installPromptEvent.prompt();
      const { outcome } = await installPromptEvent.userChoice;
      if (outcome === 'accepted') {
        toast({
          title: 'App Instalado!',
          description: 'QRIoT.app foi adicionado à sua tela inicial.',
        });
        setIsPwaInstalled(true);
        setCanInstall(false);
      } else {
        toast({
          title: 'Instalação Cancelada',
          description: 'Você pode instalar o app mais tarde pelo menu do navegador.',
        });
      }
    } catch (error) {
      console.error('Error during PWA install prompt:', error);
      toast({
        title: 'Erro na Instalação',
        description: 'Não foi possível iniciar a instalação do app.',
        variant: 'destructive',
      });
    }
    setInstallPromptEvent(null); // Prompt can only be used once
    setCanInstall(false);
  }, [installPromptEvent, toast]);

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
