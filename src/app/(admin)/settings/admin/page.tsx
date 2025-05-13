
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Building, Users, Settings } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Administração</h1>
      <p className="text-muted-foreground">
        Gerencie as configurações da sua empresa e os usuários do sistema.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" /> Dados da Empresa
            </CardTitle>
            <CardDescription>
              Visualize e edite as informações da sua empresa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder content */}
            <p className="text-sm text-muted-foreground mb-4">
              Configure o nome e outros detalhes da sua empresa que podem ser usados em relatórios ou páginas públicas.
            </p>
            <Button asChild variant="outline">
              <Link href="/settings/admin/company">Gerenciar Empresa</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Gerenciar Usuários
            </CardTitle>
            <CardDescription>
              Adicione, edite ou remova usuários do sistema para esta empresa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder content */}
             <p className="text-sm text-muted-foreground mb-4">
               Controle o acesso e as permissões dos usuários vinculados à sua empresa.
             </p>
            <Button asChild variant="outline">
              <Link href="/settings/admin/users">Gerenciar Usuários</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Optional: Link back to general settings */}
        {/* <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" /> Configurações Gerais
            </CardTitle>
            <CardDescription>
              Acesse outras configurações do sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <p className="text-sm text-muted-foreground mb-4">
                Ajuste as configurações gerais da aplicação, como preferências da página pública.
             </p>
            <Button asChild variant="outline">
              <Link href="/settings">Ir para Configurações Gerais</Link>
            </Button>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
}

