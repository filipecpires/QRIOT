
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, List, MapPin, Users, ScanLine, CheckSquare } from 'lucide-react'; // Adjusted icons

export default function DashboardPage() {
  return (
    // Container removed as AdminLayout provides padding
    // <div className="container mx-auto py-10">
    <>
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
             <ScanLine className="h-4 w-4 text-muted-foreground" /> {/* Icon Changed */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div> {/* Placeholder */}
            <p className="text-xs text-muted-foreground">Concluído nos últimos 30 dias</p> {/* Placeholder */}
             <Button variant="outline" size="sm" className="mt-4" asChild>
               <Link href="/inventory/scan"> {/* Link to Scan Page */}
                 <CheckSquare className="mr-2 h-4 w-4" /> Iniciar Inventário
               </Link>
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
    {/* </div> */}
    </>
  );
}
