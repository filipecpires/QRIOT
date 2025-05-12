
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PwaInstallPromptButton() {
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault(); // Prevent the mini-infobar from appearing on mobile
      const typedEvent = event as BeforeInstallPromptEvent;
      setInstallPromptEvent(typedEvent);
      setCanInstall(true);
      console.log('PWA installation prompt available.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      console.log('PWA has been installed');
      setIsPwaInstalled(true);
      setCanInstall(false);
      setInstallPromptEvent(null); // Clear the event
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    
    // Check if already installed (PWA mode)
    if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
      console.log('App is already installed as PWA.');
      setIsPwaInstalled(true);
      setCanInstall(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPromptEvent) {
      toast({
        title: 'Instalação não disponível',
        description: 'O prompt de instalação não está pronto, já foi usado ou o app já está instalado.',
        variant: 'default',
      });
      return;
    }

    try {
      await installPromptEvent.prompt(); // Show the browser's install dialog
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
    // The prompt can only be used once.
    setInstallPromptEvent(null);
    setCanInstall(false); // Prompt is no longer available
  };

  if (isPwaInstalled) {
    return (
      <Button variant="outline" disabled>
        <Download className="mr-2 h-4 w-4" /> App Instalado
      </Button>
    );
  }

  if (!canInstall) {
    return (
      <Button variant="outline" disabled title="A instalação PWA não está disponível ou já foi solicitada.">
        <Download className="mr-2 h-4 w-4" /> Instalar App (Indisponível)
      </Button>
    );
  }

  return (
    <Button onClick={handleInstallClick} variant="outline">
      <Download className="mr-2 h-4 w-4" /> Instalar App
    </Button>
  );
}
