
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
    PlusCircle,
    List,
    MapPin,
    Users,
    ScanLine,
    CheckSquare,
    History,
    AlertTriangle,
    CalendarClock,
    FileWarning,
    Package
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// --- Mock Data Structures ---
interface AssetSummary {
  total: number;
  active: number;
  inactive: number;
  lost: number;
  rented: number;
  own: number;
}

interface CountByCategory {
  name: string;
  value: number;
}

interface CountByStatus {
    name: string;
    value: number;
}

interface RecentActivityLog {
  id: string;
  timestamp: Date;
  userName: string;
  action: string;
  entityName: string;
}

interface ExpiringRental {
    id: string;
    name: string;
    tag: string;
    rentalEndDate: Date;
}

interface LostAsset {
     id: string;
     name: string;
     tag: string;
     lostDate: Date; // Assuming we track when it was marked lost
}

// --- Mock Fetch Functions ---
async function fetchDashboardData(): Promise<{
    summary: AssetSummary;
    byCategory: CountByCategory[];
    byStatus: CountByStatus[];
    recentActivity: RecentActivityLog[];
    expiringRentals: ExpiringRental[];
    lostAssets: LostAsset[];
    locationCount: number;
    userCount: number;
}> {
  await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate delay

  const summary: AssetSummary = {
    total: 1234,
    active: 1050,
    inactive: 50,
    lost: 34,
    rented: 150,
    own: 1084,
  };

  const byCategory: CountByCategory[] = [
    { name: 'Eletrônicos', value: 600 },
    { name: 'Mobiliário', value: 350 },
    { name: 'Ferramentas', value: 150 },
    { name: 'Veículos', value: 34 },
    { name: 'Outros', value: 100 },
  ];

  const byStatus: CountByStatus[] = [
      { name: 'Ativo', value: summary.active },
      { name: 'Inativo', value: summary.inactive },
      { name: 'Perdido', value: summary.lost },
    ];

  const recentActivity: RecentActivityLog[] = [
    { id: 'log1', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), userName: 'João Silva', action: 'CREATE', entityName: 'Novo Monitor (TI-MN-006)' },
    { id: 'log2', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), userName: 'Maria Oliveira', action: 'UPDATE', entityName: 'Notebook Dell (TI-NB-001)' },
    { id: 'log3', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), userName: 'Carlos Pereira', action: 'MARK_LOST', entityName: 'Cadeira Escritório (MOB-CAD-012)' },
     { id: 'log4', timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), userName: 'João Silva', action: 'CREATE_USER', entityName: 'Ana Costa' },
     { id: 'log5', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), userName: 'Maria Oliveira', action: 'UPDATE_LOCATION', entityName: 'Escritório 1' },
  ];

  const expiringRentals: ExpiringRental[] = [
      { id: 'ASSET003', name: 'Cadeira Escritório', tag: 'MOB-CAD-012', rentalEndDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)}, // 15 days
      { id: 'ASSETRENT01', name: 'Impressora HP Laser', tag: 'TI-IMP-001', rentalEndDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)}, // 25 days
      { id: 'ASSETRENT02', name: 'Servidor Dell R740', tag: 'SRV-DELL-01', rentalEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)}, // 5 days
   ];

   const lostAssets: LostAsset[] = [
        { id: 'ASSET003', name: 'Cadeira Escritório', tag: 'MOB-CAD-012', lostDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        { id: 'ASSETLOST01', name: 'Furadeira Bosch', tag: 'FER-FUR-005', lostDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
    ];

  return {
    summary,
    byCategory,
    byStatus,
    recentActivity,
    expiringRentals,
    lostAssets,
    locationCount: 56,
    userCount: 12,
  };
}


// Chart Colors
const COLORS_CATEGORY = ['#003049', '#d62828', '#f77f00', '#fcbf49', '#eae2b7']; // Example Colors
const COLORS_STATUS = ['#22c55e', '#6b7280', '#ef4444']; // Green, Gray, Red

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<Awaited<ReturnType<typeof fetchDashboardData>> | null>(null);

     useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                const fetchedData = await fetchDashboardData();
                setData(fetchedData);
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError("Falha ao carregar os dados do dashboard.");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                 <Skeleton className="h-8 w-32 mb-6" />
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-36" />
                    <Skeleton className="h-36" />
                    <Skeleton className="h-36" />
                    <Skeleton className="h-36" />
                </div>
                 <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                     <Skeleton className="h-80" />
                     <Skeleton className="h-80" />
                 </div>
                 <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    <Skeleton className="h-64" />
                    <Skeleton className="h-64" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64 text-destructive">
                <AlertTriangle className="mr-2 h-6 w-6" /> {error}
            </div>
        );
    }

    if (!data) {
        return null; // Or a different loading/empty state
    }

    const { summary, byCategory, byStatus, recentActivity, expiringRentals, lostAssets, locationCount, userCount } = data;


    return (
        <div className="space-y-8"> {/* Increased spacing */}
          <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
          {/* Summary Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Ativos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {summary.active} Ativos / {summary.lost} Perdidos / {summary.rented} Alugados
                </p>
                <Button asChild size="sm" variant="outline" className="mt-4">
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
                <div className="text-2xl font-bold">{locationCount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Locais físicos gerenciados</p>
                <Button asChild size="sm" variant="outline" className="mt-4">
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
                <div className="text-2xl font-bold">{userCount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Usuários com acesso ao sistema</p>
                <Button asChild size="sm" variant="outline" className="mt-4">
                  <Link href="/users/new">
                    <PlusCircle className="mr-2 h-4 w-4" /> Novo Usuário
                  </Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inventário Rápido</CardTitle>
                <ScanLine className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                 <p className="text-xs text-muted-foreground mb-2">Use o scan para inventário contínuo.</p>
                 {/* Placeholder for inventory status */}
                 {/* <div className="text-2xl font-bold">85%</div>
                 <p className="text-xs text-muted-foreground">Concluído nos últimos 30 dias</p> */}
                 <Button variant="default" size="sm" className="mt-4 w-full" asChild>
                   <Link href="/inventory/scan">
                     <CheckSquare className="mr-2 h-4 w-4" /> Iniciar Inventário por Scan
                   </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

           {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Ativos por Categoria</CardTitle>
                         <CardDescription>Distribuição dos ativos pelas categorias cadastradas.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={byCategory}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {byCategory.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS_CATEGORY[index % COLORS_CATEGORY.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => value.toLocaleString()}/>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Ativos por Status</CardTitle>
                         <CardDescription>Distribuição dos ativos por status atual.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                             <BarChart data={byStatus} layout="vertical" margin={{ right: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={80}/>
                                <Tooltip formatter={(value: number) => value.toLocaleString()}/>
                                {/* <Legend /> */}
                                 <Bar dataKey="value" name="Quantidade" barSize={40}>
                                     {byStatus.map((entry, index) => (
                                        <Cell cursor="pointer" fill={COLORS_STATUS[index % COLORS_STATUS.length]} key={`cell-${index}`} />
                                     ))}
                                 </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity, Rentals Expiring, Lost Assets */}
             <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                   <CardHeader>
                       <CardTitle className="flex items-center gap-2"><History className="h-5 w-5"/> Atividade Recente</CardTitle>
                       <CardDescription>Últimas ações realizadas no sistema.</CardDescription>
                   </CardHeader>
                   <CardContent>
                      {recentActivity.length > 0 ? (
                        <ul className="space-y-3 text-sm">
                          {recentActivity.map(log => (
                             <li key={log.id} className="flex justify-between items-center">
                                <div>
                                    <span className="font-medium">{log.userName}</span>{' '}
                                    <span className="text-muted-foreground">{log.action.toLowerCase()}</span>{' '}
                                    <span className="font-medium truncate" title={log.entityName}>{log.entityName}</span>
                                </div>
                                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2" title={format(log.timestamp, "Pp", { locale: ptBR })}>
                                     {format(log.timestamp, "HH:mm", { locale: ptBR })}
                                </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                          <p className="text-muted-foreground text-center">Nenhuma atividade recente.</p>
                      )}
                         <Button variant="link" size="sm" asChild className="mt-4 px-0">
                             <Link href="/audit-log">Ver Log Completo</Link>
                         </Button>
                   </CardContent>
                </Card>

                 <Card className="lg:col-span-1">
                   <CardHeader>
                       <CardTitle className="flex items-center gap-2 text-orange-600"><CalendarClock className="h-5 w-5"/> Locações Vencendo</CardTitle>
                       <CardDescription>Ativos alugados com término próximo (30 dias).</CardDescription>
                   </CardHeader>
                   <CardContent>
                      {expiringRentals.length > 0 ? (
                         <Table>
                           <TableHeader>
                             <TableRow>
                               <TableHead>Ativo</TableHead>
                               <TableHead>Vencimento</TableHead>
                             </TableRow>
                           </TableHeader>
                           <TableBody>
                             {expiringRentals
                                .sort((a,b) => a.rentalEndDate.getTime() - b.rentalEndDate.getTime()) // Sort by closest expiration
                                .slice(0, 5) // Show top 5
                                .map(rental => (
                               <TableRow key={rental.id}>
                                 <TableCell className="p-2">
                                     <Link href={`/assets/${rental.id}/edit`} className="font-medium hover:underline truncate block" title={`${rental.name} (${rental.tag})`}>
                                        {rental.name}
                                     </Link>
                                     <span className="text-xs text-muted-foreground">{rental.tag}</span>
                                 </TableCell>
                                 <TableCell className="p-2 text-xs text-right">
                                    {format(rental.rentalEndDate, "dd/MM/yy", { locale: ptBR })}
                                </TableCell>
                               </TableRow>
                             ))}
                           </TableBody>
                         </Table>
                      ) : (
                          <p className="text-muted-foreground text-center">Nenhuma locação vencendo em breve.</p>
                      )}
                         <Button variant="link" size="sm" asChild className="mt-4 px-0">
                             <Link href="/assets?filter=rented_expiring">Ver Todas</Link> {/* TODO: Implement filter */}
                         </Button>
                   </CardContent>
                </Card>

                 <Card className="border-destructive lg:col-span-1">
                   <CardHeader>
                       <CardTitle className="flex items-center gap-2 text-destructive"><FileWarning className="h-5 w-5"/> Ativos Perdidos</CardTitle>
                       <CardDescription>Ativos marcados como perdidos recentemente.</CardDescription>
                   </CardHeader>
                   <CardContent>
                      {lostAssets.length > 0 ? (
                         <Table>
                            <TableHeader>
                             <TableRow>
                               <TableHead>Ativo</TableHead>
                               <TableHead>Marcado em</TableHead>
                             </TableRow>
                           </TableHeader>
                            <TableBody>
                             {lostAssets.slice(0, 5).map(asset => ( // Show top 5 recent
                               <TableRow key={asset.id}>
                                 <TableCell className="p-2">
                                     <Link href={`/assets/${asset.id}/edit`} className="font-medium hover:underline truncate block" title={`${asset.name} (${asset.tag})`}>
                                        {asset.name}
                                     </Link>
                                     <span className="text-xs text-muted-foreground">{asset.tag}</span>
                                 </TableCell>
                                 <TableCell className="p-2 text-xs text-right">
                                    {format(asset.lostDate, "dd/MM/yy", { locale: ptBR })}
                                </TableCell>
                               </TableRow>
                             ))}
                           </TableBody>
                         </Table>
                      ) : (
                           <p className="text-muted-foreground text-center">Nenhum ativo marcado como perdido.</p>
                      )}
                         <Button variant="link" size="sm" asChild className="mt-4 px-0">
                             <Link href="/assets?filter=lost">Ver Todos</Link> {/* TODO: Implement filter */}
                         </Button>
                   </CardContent>
                </Card>
            </div>
        </div>
    );
}

    