
'use client';

import { Button } from '@/components/ui/button';
import { Download, CheckCircle, AlertCircle } from 'lucide-react';
import { usePwaInstall } from '@/contexts/PwaInstallContext';
import { useToast } from '@/hooks/use-toast';

export function PwaInstallPromptButton() {
  const { canInstall, isPwaInstalled, triggerInstallPrompt } = usePwaInstall();
  const { toast } = useToast();

  const handleInstallClick = async () => {
    if (isPwaInstalled) {
      toast({
        title: 'Aplicativo Já Instalado',
        description: 'O QRIoT.app já está instalado no seu dispositivo.',
      });
      return;
    }
    if (!canInstall) {
      toast({
        title: 'Instalação Indisponível',
        description: 'O navegador não ofereceu a opção de instalação neste momento. Verifique as permissões ou tente mais tarde.',
        duration: 5000,
      });
      return;
    }
    // triggerInstallPrompt will handle its own success/failure toasts
    await triggerInstallPrompt();
  };

  if (isPwaInstalled) {
    return (
      <Button variant="outline" disabled className="w-full justify-start text-left text-green-700 dark:text-green-400 border-green-500">
        <CheckCircle className="mr-2 h-4 w-4" /> App Instalado
      </Button>
    );
  }

  // If not installed, the button's state depends on `canInstall`
  return (
    <Button 
      onClick={handleInstallClick} 
      variant="outline" 
      disabled={!canInstall} // Button is active only if `canInstall` is true
      className="w-full justify-start text-left"
      title={canInstall ? "Instalar QRIoT.app no seu dispositivo" : "A instalação do app não está disponível no momento."}
    >
      {canInstall ? (
        <>
          <Download className="mr-2 h-4 w-4" /> Instalar App
        </>
      ) : (
        <>
          <AlertCircle className="mr-2 h-4 w-4 text-muted-foreground" /> Instalar App (Indisponível)
        </>
      )}
    </Button>
  );
}
