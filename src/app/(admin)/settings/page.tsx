
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Save } from 'lucide-react';

export default function SettingsPage() {
  // Add state and handlers for form submission later
  return (
    <div className="space-y-6"> {/* Use simple div instead of container */}
      <h1 className="text-3xl font-bold mb-6">Configurações</h1>

      <div className="space-y-8">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações Gerais</CardTitle>
            <CardDescription>Ajustes gerais do sistema QRIoT.app.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Nome da Empresa</Label>
              <Input id="company-name" placeholder="Nome da sua empresa" defaultValue="Minha Empresa Exemplo" />
              <p className="text-sm text-muted-foreground">
                Este nome pode aparecer em relatórios ou páginas públicas.
              </p>
            </div>
            {/* Add more general settings like default language, timezone etc. if needed */}
          </CardContent>
           <CardFooter className="flex justify-end">
                <Button disabled> {/* Enable after implementing save logic */}
                    <Save className="mr-2 h-4 w-4" /> Salvar Gerais
                </Button>
           </CardFooter>
        </Card>

        {/* Public Page Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Página Pública do Ativo</CardTitle>
            <CardDescription>Controle as informações exibidas na página pública acessada pelo QR Code.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between space-x-2 border p-3 rounded-md">
                 <Label htmlFor="show-category" className="flex flex-col space-y-1">
                    <span>Exibir Categoria</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                      Mostrar a categoria do ativo na página pública.
                    </span>
                 </Label>
                <Switch id="show-category" defaultChecked />
             </div>
             <div className="flex items-center justify-between space-x-2 border p-3 rounded-md">
                 <Label htmlFor="show-location" className="flex flex-col space-y-1">
                    <span>Exibir Localização</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                      Mostrar o nome do local de instalação.
                    </span>
                 </Label>
                <Switch id="show-location" defaultChecked />
             </div>
             <div className="flex items-center justify-between space-x-2 border p-3 rounded-md">
                 <Label htmlFor="show-responsible" className="flex flex-col space-y-1">
                    <span>Exibir Responsável</span>
                     <span className="font-normal leading-snug text-muted-foreground">
                      Mostrar o nome do responsável pelo ativo.
                    </span>
                 </Label>
                <Switch id="show-responsible" />
             </div>
              <div className="flex items-center justify-between space-x-2 border p-3 rounded-md">
                 <Label htmlFor="show-inventory-date" className="flex flex-col space-y-1">
                    <span>Exibir Data do Último Inventário</span>
                     <span className="font-normal leading-snug text-muted-foreground">
                      Mostrar quando o ativo foi inventariado pela última vez.
                    </span>
                 </Label>
                <Switch id="show-inventory-date" defaultChecked />
             </div>
             {/* Note: Individual characteristic visibility is managed per asset */}
             <p className="text-sm text-muted-foreground pt-2">
                A visibilidade de características específicas (como Voltagem, Capacidade) é definida individualmente no cadastro de cada ativo.
            </p>
          </CardContent>
           <CardFooter className="flex justify-end">
                <Button disabled> {/* Enable after implementing save logic */}
                    <Save className="mr-2 h-4 w-4" /> Salvar Config. Pública
                </Button>
           </CardFooter>
        </Card>

        {/* User Management Settings */}
         <Card>
          <CardHeader>
            <CardTitle>Gerenciamento de Usuários</CardTitle>
            <CardDescription>Configurações relacionadas a perfis e permissões.</CardDescription>
          </CardHeader>
          <CardContent>
             <p className="text-muted-foreground">
                Configurações avançadas de permissões por perfil serão adicionadas aqui futuramente.
             </p>
            {/* Add settings like password policies, session duration etc. */}
          </CardContent>
           {/* No footer needed for placeholder */}
           {/* <CardFooter className="flex justify-end">
                <Button disabled>
                    <Save className="mr-2 h-4 w-4" /> Salvar Config. Usuários
                </Button>
           </CardFooter> */}
        </Card>

        {/* Data Management Settings */}
        <Card>
            <CardHeader>
                <CardTitle>Gerenciamento de Dados</CardTitle>
                <CardDescription>Opções para exportação e importação de dados.</CardDescription>
            </CardHeader>
             <CardContent className="space-y-4">
                <Button variant="outline" disabled>Exportar Todos os Ativos (CSV)</Button>
                <Button variant="outline" disabled>Importar Ativos (CSV)</Button>
                 <p className="text-sm text-muted-foreground pt-2">
                    Funcionalidades de importação/exportação serão implementadas.
                 </p>
             </CardContent>
        </Card>

      </div>
    </div>
  );
}
