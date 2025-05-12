
'use client';

import { Button } from '@/components/ui/button';
import { Download, CheckCircle } from 'lucide-react';
import { usePwaInstall } from '@/contexts/PwaInstallContext';
import { useToast } from '@/hooks/use-toast';

export function PwaInstallPromptButton() {
  const { canInstall, isPwaInstalled, triggerInstallPrompt } = usePwaInstall();
  const { toast } = useToast();

  const handleInstallClick = async () => {
    if (!canInstall || isPwaInstalled) {
      // This case should ideally be handled by disabling the button,
      // but good to have a fallback toast.
      toast({
        title: 'Instalação Indisponível',
        description: isPwaInstalled ? 'O app já está instalado.' : 'O navegador não ofereceu a opção de instalação no momento.',
        variant: 'default',
      });
      return;
    }
    // triggerInstallPrompt already handles toasts for success/dismissal
    await triggerInstallPrompt();
  };

  if (isPwaInstalled) {
    return (
      <Button variant="outline" disabled className="w-full justify-start text-left">
        <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> App Instalado
      </Button>
    );
  }

  return (
    <Button 
      onClick={handleInstallClick} 
      variant="outline" 
      disabled={!canInstall}
      className="w-full justify-start text-left"
      title={!canInstall ? "Opção de instalação não disponível no momento." : "Instalar QRIoT.app"}
    >
      <Download className="mr-2 h-4 w-4" /> {canInstall ? 'Instalar App' : 'Instalar App (Indisponível)'}
    </Button>
  );
}
