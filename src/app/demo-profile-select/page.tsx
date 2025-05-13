
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, UserCog, UserCheck, Wrench, User, Loader2, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const profiles = [
  { name: 'Administrador', icon: UserCog, description: "Acesso total ao sistema, gerenciamento de usuários e configurações." },
  { name: 'Gerente', icon: UserCheck, description: "Visualiza e gerencia ativos de seus subordinados, cria usuários." },
  { name: 'Técnico', icon: Wrench, description: "Realiza manutenções, atualiza informações de ativos específicos." },
  { name: 'Inventariante', icon: User, description: "Focado em realizar inventários e verificar ativos em campo." },
  { name: 'Funcionário', icon: Briefcase, description: "Acessa seu painel pessoal e gerencia ativos sob sua responsabilidade." },
];

export default function DemoProfileSelectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleProfileSelect = async (profileName: string) => {
    setIsLoading(profileName);
    toast({
      title: `Entrando como ${profileName} (Demo)...`,
      description: 'Você será redirecionado para o painel.',
    });

    // Simulate a short delay before redirecting
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Navigate to MyDashboard, passing the selected profile as a query parameter
    router.push(`/my-dashboard?profile=${encodeURIComponent(profileName)}`);
    setIsLoading(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background p-4">
      <div className="absolute top-4 left-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Início
          </Link>
        </Button>
      </div>
      
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-primary mb-2">Selecione um Perfil Demo</h1>
        <p className="text-muted-foreground">
          Experimente o QRIoT.app com diferentes níveis de acesso e funcionalidades.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 w-full max-w-5xl">
        {profiles.map((profile) => (
          <Card 
            key={profile.name} 
            className="hover:shadow-xl transition-shadow cursor-pointer transform hover:scale-105 flex flex-col"
            onClick={() => !isLoading && handleProfileSelect(profile.name)}
          >
            <CardHeader className="items-center text-center pb-3">
              <profile.icon className="h-10 w-10 text-primary mb-3" />
              <CardTitle className="text-xl">{profile.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-center flex-grow">
              <CardDescription className="text-xs min-h-[4rem]"> 
                {profile.description}
              </CardDescription>
              </CardContent>
              <div className="p-4 pt-0 mt-auto">
                <Button 
                    className="w-full" 
                    disabled={!!isLoading}
                >
                    {isLoading === profile.name ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                    `Acessar como ${profile.name}`
                    )}
                </Button>
              </div>
          </Card>
        ))}
      </div>
      <p className="mt-10 text-xs text-muted-foreground">
        Este é um ambiente de demonstração. Os dados são fictícios e podem ser resetados.
      </p>
    </div>
  );
}

    