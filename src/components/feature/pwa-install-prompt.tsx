
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Download, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PwaInstallPrompt() {
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault(); // Prevent the mini-infobar from appearing on mobile
      const typedEvent = event as BeforeInstallPromptEvent;
      setInstallPromptEvent(typedEvent);

      // Check if already installed (PWA mode)
      if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
        console.log('App is already installed as PWA.');
        setShowInstallBanner(false);
      } else {
        setShowInstallBanner(true);
        console.log('PWA installation available.');
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      console.log('PWA has been installed');
      setShowInstallBanner(false);
      setInstallPromptEvent(null); // Clear the event
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPromptEvent) {
      toast({
        title: 'Instalação não disponível',
        description: 'O prompt de instalação não está pronto ou já foi usado.',
        variant: 'destructive',
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
        setShowInstallBanner(false); // Hide banner after accepted prompt
      } else {
        toast({
          title: 'Instalação Cancelada',
          description: 'Você pode instalar o app mais tarde pelo menu do navegador.',
        });
        // Don't hide banner if dismissed, user might change their mind,
        // but browser might not show prompt again soon.
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
  };

  if (!showInstallBanner || !installPromptEvent) {
    return null;
  }

  return (
    <Alert className="fixed bottom-4 right-4 z-50 max-w-md shadow-lg bg-primary text-primary-foreground border-accent">
      <Download className="h-4 w-4 text-accent-foreground" />
      <AlertTitle className="font-semibold">Instalar QRIoT.app</AlertTitle>
      <AlertDescription className="text-sm text-primary-foreground/90">
        Adicione nosso app à sua tela inicial para acesso rápido e offline!
      </AlertDescription>
      <div className="mt-3 flex gap-2">
        <Button
          onClick={handleInstallClick}
          size="sm"
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Download className="mr-2 h-4 w-4" /> Instalar Agora
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowInstallBanner(false)}
          className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary/80"
        >
          <X className="mr-1 h-4 w-4" /> Dispensar
        </Button>
      </div>
    </Alert>
  );
}
