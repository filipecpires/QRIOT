
'use client';

import { Button } from '@/components/ui/button';
import { Download, CheckCircle } from 'lucide-react';
import { usePwaInstall } from '@/contexts/PwaInstallContext';
import { useToast } from '@/hooks/use-toast';

export function PwaInstallPromptButton() {
  const { canInstall, isPwaInstalled, triggerInstallPrompt } = usePwaInstall();
  const { toast } = useToast();

  const handleInstallClick = async () => {
    if (isPwaInstalled) {
      toast({
        title: 'App Já Instalado',
        description: 'O QRIoT.app já está instalado no seu dispositivo.',
        variant: 'default',
      });
      return;
    }
    if (!canInstall) {
      toast({
        title: 'Instalação Indisponível',
        description: 'O navegador não ofereceu a opção de instalação no momento. Verifique se os critérios de PWA são atendidos ou tente mais tarde.',
        variant: 'default',
      });
      return;
    }
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
      disabled={!canInstall && !isPwaInstalled} // Disable if not installable AND not already installed
      className="w-full justify-start text-left"
      title={!canInstall && !isPwaInstalled ? "Opção de instalação não disponível no momento. Verifique o console para mais detalhes." : "Instalar QRIoT.app"}
    >
      <Download className="mr-2 h-4 w-4" /> {canInstall ? 'Instalar App' : 'Instalar App (Indisponível)'}
    </Button>
  );
}

