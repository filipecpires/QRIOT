import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, List, MapPin, Users } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Ativos</CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div> {/* Placeholder */}
            <p className="text-xs text-muted-foreground">+20.1% from last month</p> {/* Placeholder */}
            <Button asChild size="sm" className="mt-4">
              <Link href="/assets/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Novo Ativo
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locais Cadastrados</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">56</div> {/* Placeholder */}
             <p className="text-xs text-muted-foreground">+5 since last month</p> {/* Placeholder */}
            <Button asChild size="sm" className="mt-4">
               <Link href="/locations/new">
                 <PlusCircle className="mr-2 h-4 w-4" /> Novo Local
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div> {/* Placeholder */}
             <p className="text-xs text-muted-foreground">+2 since last month</p> {/* Placeholder */}
            <Button asChild size="sm" className="mt-4">
              <Link href="/users/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Novo Usuário
              </Link>
            </Button>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventário Recente</CardTitle>
             {/* Replace with appropriate icon later */}
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-clipboard-check h-4 w-4 text-muted-foreground" viewBox="0 0 16 16">
               <path fillRule="evenodd" d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0"/>
               <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z"/>
               <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z"/>
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div> {/* Placeholder */}
            <p className="text-xs text-muted-foreground">Concluído nos últimos 30 dias</p> {/* Placeholder */}
             <Button variant="outline" size="sm" className="mt-4">
              Ver Relatório
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Add more dashboard components here, e.g., recent activity, lost items list */}
      <div className="mt-8">
         <Card>
            <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
                <CardDescription>Últimas movimentações e acessos.</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Placeholder for recent activity feed */}
                <p className="text-muted-foreground">Nenhuma atividade recente registrada.</p>
            </CardContent>
         </Card>
      </div>
       <div className="mt-8">
         <Card className="border-destructive">
            <CardHeader>
                <CardTitle className="text-destructive">Ativos Perdidos</CardTitle>
                <CardDescription>Itens marcados como perdidos recentemente.</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Placeholder for lost assets list */}
                <p className="text-muted-foreground">Nenhum ativo marcado como perdido.</p>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
