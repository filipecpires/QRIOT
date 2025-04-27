
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
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
  LineChart,
  Line,
} from 'recharts';
import {
    Package,
    MapPin,
    Users,
    ScanLine,
    CheckSquare,
    History,
    AlertTriangle,
    CalendarClock,
    FileWarning,
    Activity,
    TrendingUp,
    TrendingDown,
    PlusCircle,
    ArrowRight,
    Building,
    Home,
    ListChecks, // Added for recent inventory
    RefreshCw // Added for refresh
} from 'lucide-react';
import { format, subDays, differenceInDays, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'; // Import Chart components
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Import Alert components

// --- Mock Data Structures ---
interface AssetSummary {
  total: number;
  active: number;
  inactive: number;
  lost: number;
  rented: number;
  own: number;
}

interface CountByLocation {
    locationName: string;
    count: number;
}

interface AssetTimeSeries {
    date: string; // e.g., "YYYY-MM-DD"
    count: number;
}

interface RecentActivityLog {
  id: string;
  timestamp: Date;
  userName: string;
  action: string;
  entityName: string;
  entityType: 'Asset' | 'Location' | 'User' | 'Characteristic' | 'Other'; // Added entityType
  details?: string; // Optional details
}

interface ExpiringRental {
    id: string;
    name: string;
    tag: string;
    rentalEndDate: Date;
    rentalCompany: string; // Added rental company
}

interface LostAsset {
     id: string;
     name: string;
     tag: string;
     lostDate: Date; // Assuming we track when it was marked lost
     lastLocation?: string; // Added last known location
}

interface RecentInventory {
    id: string;
    name: string;
    tag: string;
    inventoryDate: Date;
    user: string; // User who performed the inventory
}


// --- Mock Fetch Functions ---
async function fetchDashboardData(): Promise<{
    summary: AssetSummary;
    byLocation: CountByLocation[];
    assetHistory: AssetTimeSeries[];
    recentActivity: RecentActivityLog[];
    expiringRentals: ExpiringRental[];
    lostAssets: LostAsset[];
    recentInventories: RecentInventory[]; // Added recent inventories
    locationCount: number;
    userCount: number;
    inventoryProgress: number; // Percentage
    lastUpdatedAt: Date; // Added last update time
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

  const byLocation: CountByLocation[] = [
    { locationName: 'Escritório 1', count: 150 },
    { locationName: 'Escritório 2', count: 120 },
    { locationName: 'Almoxarifado', count: 450 },
    { locationName: 'Sala Reuniões', count: 75 },
    { locationName: 'Sala Treinamento', count: 90 },
    { locationName: 'Outros Locais', count: 349 }, // Group smaller locations
  ].sort((a, b) => b.count - a.count).slice(0, 5); // Top 5 + Others

   const assetHistory: AssetTimeSeries[] = Array.from({ length: 30 }).map((_, i) => {
       const date = subDays(new Date(), 29 - i);
       const baseCount = 800 + i * 10;
       const variation = Math.random() * 50 - 25; // Random +/- 25
       return {
           date: format(date, 'yyyy-MM-dd'),
           count: Math.max(0, Math.round(baseCount + variation)), // Ensure count is not negative
       };
   });


  const recentActivity: RecentActivityLog[] = [
    { id: 'log1', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), userName: 'João Silva', action: 'CREATE', entityType: 'Asset', entityName: 'Novo Monitor (TI-MN-006)', details: 'Adicionado ao Escritório 1' },
    { id: 'log2', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), userName: 'Maria Oliveira', action: 'UPDATE', entityType: 'Asset', entityName: 'Notebook Dell (TI-NB-001)', details: 'Localização alterada para Sala Reuniões' },
    { id: 'log3', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), userName: 'Carlos Pereira', action: 'MARK_LOST', entityType: 'Asset', entityName: 'Cadeira Escritório (MOB-CAD-012)' },
     { id: 'log4', timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), userName: 'João Silva', action: 'CREATE', entityType: 'User', entityName: 'Ana Costa' },
     { id: 'log5', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), userName: 'Maria Oliveira', action: 'UPDATE', entityType: 'Location', entityName: 'Escritório 1', details: 'Coordenadas GPS atualizadas' },
      { id: 'log6', timestamp: new Date(Date.now() - 15 * 60 * 60 * 1000), userName: 'Carlos Pereira', action: 'INVENTORY', entityType: 'Asset', entityName: 'Projetor Epson (TI-PROJ-002)', details: `Inventário ${new Date().getFullYear()}` },
  ];

  const expiringRentals: ExpiringRental[] = [
      { id: 'ASSET003', name: 'Cadeira Escritório', tag: 'MOB-CAD-012', rentalEndDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), rentalCompany: 'LocaTudo'}, // 15 days
      { id: 'ASSETRENT01', name: 'Impressora HP Laser', tag: 'TI-IMP-001', rentalEndDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), rentalCompany: 'Print Fácil'}, // 25 days
      { id: 'ASSETRENT02', name: 'Servidor Dell R740', tag: 'SRV-DELL-01', rentalEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), rentalCompany: 'ServerRent'}, // 5 days
      { id: 'ASSETRENT03', name: 'Veículo Fiat Strada', tag: 'VEI-FIA-015', rentalEndDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000), rentalCompany: 'Movida'}, // 40 days (won't show by default if limit is 30 days)
   ];

   const lostAssets: LostAsset[] = [
        { id: 'ASSET003', name: 'Cadeira Escritório', tag: 'MOB-CAD-012', lostDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), lastLocation: 'Sala Reuniões' },
        { id: 'ASSETLOST01', name: 'Furadeira Bosch', tag: 'FER-FUR-005', lostDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), lastLocation: 'Oficina' },
    ];

   const recentInventories: RecentInventory[] = [
        { id: 'ASSET001', name: 'Notebook Dell Latitude 7400', tag: 'TI-NB-001', inventoryDate: new Date(Date.now() - 1 * 60 * 60 * 1000), user: 'Ana Costa' },
        { id: 'ASSET002', name: 'Monitor LG 27"', tag: 'TI-MN-005', inventoryDate: new Date(Date.now() - 3 * 60 * 60 * 1000), user: 'Ana Costa' },
        { id: 'ASSET009', name: 'Paleteira Manual', tag: 'ALM-PAL-001', inventoryDate: new Date(Date.now() - 5 * 60 * 60 * 1000), user: 'Carlos Pereira' },
        { id: 'ASSET004', name: 'Projetor Epson PowerLite', tag: 'TI-PROJ-002', inventoryDate: new Date(Date.now() - 15 * 60 * 60 * 1000), user: 'Carlos Pereira' }, // Older one
   ];

  return {
    summary,
    byLocation,
    assetHistory,
    recentActivity,
    expiringRentals: expiringRentals.filter(r => differenceInDays(r.rentalEndDate, new Date()) <= 30), // Filter for next 30 days
    lostAssets,
    recentInventories: recentInventories.sort((a,b) => b.inventoryDate.getTime() - a.inventoryDate.getTime()), // Sort most recent first
    locationCount: 56,
    userCount: 12,
    inventoryProgress: 85, // Example progress
    lastUpdatedAt: new Date(), // Current time for last update
  };
}

// Chart Colors
const COLORS_LOCATION = ['#003049', '#d62828', '#f77f00', '#fcbf49', '#eae2b7', '#6b7280']; // Added gray for 'Others'

// Action Descriptions and Icons
const getActionDetails = (log: RecentActivityLog) => {
    switch (log.action) {
        case 'CREATE': return { icon: PlusCircle, text: `criou ${log.entityType.toLowerCase()} ${log.entityName}`, color: 'text-green-600' };
        case 'UPDATE': return { icon: Activity, text: `atualizou ${log.entityType.toLowerCase()} ${log.entityName}`, color: 'text-blue-600' };
        case 'DELETE': return { icon: FileWarning, text: `excluiu ${log.entityType.toLowerCase()} ${log.entityName}`, color: 'text-red-600' };
        case 'MARK_LOST': return { icon: AlertTriangle, text: `marcou ${log.entityType.toLowerCase()} ${log.entityName} como perdido`, color: 'text-orange-600' };
        case 'INVENTORY': return { icon: CheckSquare, text: `inventariou ${log.entityType.toLowerCase()} ${log.entityName}`, color: 'text-purple-600' };
        default: return { icon: History, text: `${log.action.toLowerCase()} em ${log.entityName}`, color: 'text-muted-foreground' };
    }
};


export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<Awaited<ReturnType<typeof fetchDashboardData>> | null>(null);
    const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

     const loadData = async (showLoading = true) => {
            if (showLoading) setLoading(true);
            setError(null);
            try {
                const fetchedData = await fetchDashboardData();
                setData(fetchedData);
                setLastUpdatedAt(fetchedData.lastUpdatedAt);
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError("Falha ao carregar os dados do dashboard.");
            } finally {
                 if (showLoading) setLoading(false);
            }
        };


    useEffect(() => {
        loadData();
    }, []);

    // Effect for relative time update
    useEffect(() => {
        if (!lastUpdatedAt) return;
        const interval = setInterval(() => {
            // Force re-render to update relative time
            setLastUpdatedAt(new Date(lastUpdatedAt));
        }, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [lastUpdatedAt]);


    if (loading) {
        return (
            <div className="space-y-6">
                 <Skeleton className="h-8 w-32 mb-6" />
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-48" /> {/* Increased height */}
                    <Skeleton className="h-48" />
                    <Skeleton className="h-48" />
                    <Skeleton className="h-48" />
                </div>
                 <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                     <Skeleton className="h-80" />
                     <Skeleton className="h-80" />
                 </div>
                 <div className="grid gap-6 lg:grid-cols-3"> {/* Adjusted grid for 3 cols */}
                    <Skeleton className="h-[400px]" />
                    <Skeleton className="h-[400px]" />
                    <Skeleton className="h-[400px]" />
                </div>
                 <div className="grid gap-6 lg:grid-cols-2"> {/* New row for 2 cols */}
                     <Skeleton className="h-[400px]" />
                    <Skeleton className="h-[400px]" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
             <div className="flex flex-col items-center justify-center h-64 text-destructive">
                <AlertTriangle className="mr-2 h-6 w-6" />
                <p>{error}</p>
                <Button onClick={() => loadData()} variant="outline" className="mt-4">Tentar Novamente</Button>
             </div>
        );
    }

    if (!data) {
        return null; // Or a different loading/empty state
    }

    const { summary, byLocation, assetHistory, recentActivity, expiringRentals, lostAssets, recentInventories, locationCount, userCount, inventoryProgress } = data;

    const assetTrend = assetHistory.length > 1
        ? assetHistory[assetHistory.length - 1].count - assetHistory[0].count
        : 0;

    // Chart config for time series
    const chartConfig = {
        count: { label: "Ativos", color: "hsl(var(--primary))" },
    } satisfies ChartContainer["config"];


    return (
        <div className="space-y-8"> {/* Increased spacing */}
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
               <h1 className="text-3xl font-bold">Dashboard Geral</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Button onClick={() => loadData(false)} variant="ghost" size="sm" disabled={loading}>
                     <RefreshCw className={`h-4 w-4 ${!loading ? '' : 'animate-spin'}`}/>
                  </Button>
                   <span>
                     Última atualização:{' '}
                      {lastUpdatedAt ? formatDistanceToNow(lastUpdatedAt, { addSuffix: true, locale: ptBR }) : 'Carregando...'}
                  </span>
               </div>
           </div>
          {/* Summary Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="h-full flex flex-col"> {/* Ensure cards take full height */}
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Ativos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex-grow"> {/* Allow content to grow */}
                <div className="text-2xl font-bold">{summary.total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  {assetTrend >= 0 ? <TrendingUp className="h-4 w-4 text-green-500"/> : <TrendingDown className="h-4 w-4 text-red-500"/>}
                  {assetTrend.toLocaleString()} nos últimos 30 dias
                </p>
                 <div className="text-xs text-muted-foreground mt-2 space-x-2">
                    <Badge variant="default" className="bg-green-500">{summary.active} Ativos</Badge>
                    <Badge variant="destructive">{summary.lost} Perdidos</Badge>
                    <Badge variant="secondary">{summary.inactive} Inativos</Badge>
                 </div>
                 <div className="text-xs text-muted-foreground mt-1 space-x-2">
                     <Badge variant="outline" className="border-blue-500 text-blue-700">{summary.own} Próprios</Badge>
                     <Badge variant="outline" className="border-orange-500 text-orange-700">{summary.rented} Alugados</Badge>
                 </div>
              </CardContent>
               <CardFooter className="pt-4"> {/* Add padding top */}
                    <Button size="sm" variant="outline" className="w-full" asChild>
                     <Link href="/assets">
                       Ver Todos Ativos <ArrowRight className="inline ml-1 h-4 w-4" />
                     </Link>
                    </Button>
               </CardFooter>
            </Card>
             <Card className="h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Locais Cadastrados</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-2xl font-bold">{locationCount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Locais físicos gerenciados</p>
                 {/* Placeholder for top location */}
                 {byLocation.length > 0 && <p className="text-xs text-muted-foreground mt-1">Principal: {byLocation[0].locationName} ({byLocation[0].count} ativos)</p>}
              </CardContent>
               <CardFooter className="pt-4">
                   <Button size="sm" variant="outline" className="w-full" asChild>
                     <Link href="/locations">
                         Gerenciar Locais <ArrowRight className="inline ml-1 h-4 w-4" />
                    </Link>
                  </Button>
               </CardFooter>
            </Card>
            <Card className="h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-2xl font-bold">{userCount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Usuários com acesso ao sistema</p>
                {/* Placeholder for roles breakdown */}
                {/* <p className="text-xs text-muted-foreground mt-1">2 Admins, 5 Gerentes...</p> */}
              </CardContent>
               <CardFooter className="pt-4">
                  <Button size="sm" variant="outline" className="w-full" asChild>
                    <Link href="/users">
                       Gerenciar Usuários <ArrowRight className="inline ml-1 h-4 w-4" />
                    </Link>
                  </Button>
               </CardFooter>
            </Card>
            <Card className="h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inventário ({new Date().getFullYear()})</CardTitle>
                <ScanLine className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex-grow">
                 <div className="text-2xl font-bold mb-2">{inventoryProgress}%</div>
                 {/* Add progress bar */}
                  <div className="w-full bg-muted rounded-full h-2.5">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: `${inventoryProgress}%` }}></div>
                 </div>
                 <p className="text-xs text-muted-foreground mt-1">Percentual de ativos inventariados este ano.</p>

              </CardContent>
                <CardFooter className="pt-4">
                    <Button variant="default" size="sm" className="w-full" asChild>
                       <Link href="/inventory/scan">
                         <CheckSquare className="inline mr-1 h-4 w-4" /> Iniciar Inventário
                       </Link>
                   </Button>
               </CardFooter>
            </Card>
          </div>

           {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Histórico de Ativos (Últimos 30 dias)</CardTitle>
                         <CardDescription>Total de ativos registrados ao longo do tempo.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                             <LineChart accessibilityLayer data={assetHistory} margin={{ left: 12, right: 12, top: 10, bottom: 10 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tickFormatter={(value) => format(new Date(value), 'dd/MM')}
                                />
                                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" hideLabel />} />
                                <Line dataKey="count" type="monotone" stroke="var(--color-count)" strokeWidth={2} dot={false} name="Ativos" />
                            </LineChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Top 5 Locais por Quantidade de Ativos</CardTitle>
                         <CardDescription>Distribuição dos ativos pelos principais locais.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                             <BarChart data={byLocation} layout="vertical" margin={{ right: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
                                <XAxis type="number" hide />
                                <YAxis dataKey="locationName" type="category" width={120} tick={{fontSize: 12}}/>
                                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" hideLabel />} />
                                 <Bar dataKey="count" name="Quantidade" layout="vertical" radius={4}>
                                     {byLocation.map((entry, index) => (
                                        <Cell cursor="pointer" fill={COLORS_LOCATION[index % COLORS_LOCATION.length]} key={`cell-${index}`} />
                                     ))}
                                 </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Activity, Rentals, Lost Assets - Now in 3 Columns */}
             <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-1 flex flex-col h-full">
                   <CardHeader>
                       <CardTitle className="flex items-center gap-2"><History className="h-5 w-5"/> Atividade Recente</CardTitle>
                       <CardDescription>Últimas 5 ações realizadas no sistema.</CardDescription>
                   </CardHeader>
                   <CardContent className="flex-grow">
                      {recentActivity.length > 0 ? (
                        <ul className="space-y-3 text-sm">
                          {recentActivity.slice(0, 5).map(log => {
                             const actionInfo = getActionDetails(log);
                             return (
                                <li key={log.id} className="flex items-start gap-3">
                                     <actionInfo.icon className={`mt-1 h-4 w-4 flex-shrink-0 ${actionInfo.color}`} />
                                    <div className="flex-1">
                                        <span className="font-medium">{log.userName}</span>{' '}
                                        <span className={actionInfo.color}>{actionInfo.text}</span>
                                        {log.details && <p className="text-xs text-muted-foreground italic">Detalhe: {log.details}</p>}
                                        <p className="text-xs text-muted-foreground" title={format(log.timestamp, "Pp", { locale: ptBR })}>
                                            {formatDistanceToNow(log.timestamp, { addSuffix: true, locale: ptBR })}
                                        </p>
                                    </div>
                                </li>
                             )
                          })}
                        </ul>
                      ) : (
                          <p className="text-muted-foreground text-center py-4">Nenhuma atividade recente.</p>
                      )}
                   </CardContent>
                    <CardFooter className="pt-4">
                        <Button variant="outline" size="sm" className="w-full" asChild>
                           <Link href="/audit-log">Ver Log Completo <ArrowRight className="inline ml-1 h-4 w-4" /></Link>
                        </Button>
                    </CardFooter>
                </Card>

                 <Card className="lg:col-span-1 flex flex-col h-full">
                   <CardHeader>
                       <CardTitle className="flex items-center gap-2 text-orange-600"><CalendarClock className="h-5 w-5"/> Locações Vencendo (30 dias)</CardTitle>
                       <CardDescription>Ativos alugados com término de contrato próximo.</CardDescription>
                   </CardHeader>
                    <CardContent className="flex-grow">
                      {expiringRentals.length > 0 ? (
                         <Table>
                           <TableHeader>
                             <TableRow>
                               <TableHead className="p-2">Ativo</TableHead>
                               <TableHead className="p-2 text-right">Vencimento</TableHead>
                             </TableRow>
                           </TableHeader>
                           <TableBody>
                             {expiringRentals
                                .sort((a,b) => a.rentalEndDate.getTime() - b.rentalEndDate.getTime()) // Sort by closest expiration
                                .slice(0, 5) // Show top 5
                                .map(rental => {
                                    const daysLeft = differenceInDays(rental.rentalEndDate, new Date());
                                    const isUrgent = daysLeft <= 7;
                                    const isVeryUrgent = daysLeft <= 3;
                                    return (
                                        <TableRow key={rental.id}>
                                          <TableCell className="p-2">
                                              <Link href={`/assets/${rental.id}/edit`} className="font-medium hover:underline truncate block text-sm" title={`${rental.name} (${rental.tag})`}>
                                                 {rental.name}
                                              </Link>
                                              <span className="text-xs text-muted-foreground flex items-center gap-1"><Building className="h-3 w-3"/>{rental.rentalCompany}</span>
                                          </TableCell>
                                          <TableCell className={`p-2 text-xs text-right font-medium ${isVeryUrgent ? 'text-red-700 font-bold' : isUrgent ? 'text-orange-600' : ''}`}>
                                             {format(rental.rentalEndDate, "dd/MM/yy", { locale: ptBR })} ({daysLeft}d)
                                         </TableCell>
                                        </TableRow>
                                     )
                                 })}
                           </TableBody>
                         </Table>
                      ) : (
                          <p className="text-muted-foreground text-center py-4">Nenhuma locação vencendo nos próximos 30 dias.</p>
                      )}
                   </CardContent>
                    <CardFooter className="pt-4">
                        <Button variant="outline" size="sm" className="w-full" asChild>
                           <Link href="/assets?filter=rented_expiring">Ver Todas Locações <ArrowRight className="inline ml-1 h-4 w-4" /></Link> {/* TODO: Implement filter */}
                         </Button>
                    </CardFooter>
                </Card>

                 <Card className="border-destructive lg:col-span-1 flex flex-col h-full">
                   <CardHeader>
                       <CardTitle className="flex items-center gap-2 text-destructive"><FileWarning className="h-5 w-5"/> Ativos Marcados como Perdidos</CardTitle>
                       <CardDescription>Ativos que foram recentemente marcados como perdidos.</CardDescription>
                   </CardHeader>
                    <CardContent className="flex-grow">
                      {lostAssets.length > 0 ? (
                         <Table>
                            <TableHeader>
                             <TableRow>
                               <TableHead className="p-2">Ativo</TableHead>
                               <TableHead className="p-2 text-right">Marcado em</TableHead>
                             </TableRow>
                           </TableHeader>
                            <TableBody>
                             {lostAssets.slice(0, 5).map(asset => ( // Show top 5 recent
                               <TableRow key={asset.id}>
                                 <TableCell className="p-2">
                                     <Link href={`/assets/${asset.id}/edit`} className="font-medium hover:underline truncate block text-sm" title={`${asset.name} (${asset.tag})`}>
                                        {asset.name}
                                     </Link>
                                     {asset.lastLocation && <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3"/>{asset.lastLocation}</span>}
                                 </TableCell>
                                 <TableCell className="p-2 text-xs text-right">
                                    {format(asset.lostDate, "dd/MM/yy", { locale: ptBR })}
                                </TableCell>
                               </TableRow>
                             ))}
                           </TableBody>
                         </Table>
                      ) : (
                           <p className="text-muted-foreground text-center py-4">Nenhum ativo marcado como perdido.</p>
                      )}
                   </CardContent>
                    <CardFooter className="pt-4">
                         <Button variant="outline" size="sm" className="w-full" asChild>
                             <Link href="/assets?filter=lost">Ver Todos Perdidos <ArrowRight className="inline ml-1 h-4 w-4" /></Link> {/* TODO: Implement filter */}
                         </Button>
                    </CardFooter>
                </Card>
            </div>

             {/* Recent Inventories */}
             <Card>
               <CardHeader>
                 <CardTitle className="flex items-center gap-2"><ListChecks className="h-5 w-5" /> Últimos Ativos Inventariados</CardTitle>
                 <CardDescription>Ativos verificados recentemente no inventário atual.</CardDescription>
               </CardHeader>
                <CardContent>
                    {recentInventories.length > 0 ? (
                         <Table>
                             <TableHeader>
                                <TableRow>
                                    <TableHead>Ativo</TableHead>
                                    <TableHead>Usuário</TableHead>
                                    <TableHead className="text-right">Data/Hora</TableHead>
                                </TableRow>
                             </TableHeader>
                             <TableBody>
                                {recentInventories.slice(0, 5).map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="p-2">
                                            <Link href={`/assets/${item.id}/edit`} className="font-medium hover:underline truncate block text-sm" title={`${item.name} (${item.tag})`}>
                                                {item.name}
                                            </Link>
                                             <span className="text-xs text-muted-foreground">{item.tag}</span>
                                        </TableCell>
                                         <TableCell className="p-2 text-sm">{item.user}</TableCell>
                                         <TableCell className="p-2 text-xs text-muted-foreground text-right" title={format(item.inventoryDate, "Pp", { locale: ptBR })}>
                                             {formatDistanceToNow(item.inventoryDate, { addSuffix: true, locale: ptBR })}
                                        </TableCell>
                                    </TableRow>
                                ))}
                             </TableBody>
                         </Table>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">Nenhum ativo inventariado recentemente.</p>
                    )}
                </CardContent>
                 <CardFooter className="pt-4">
                    <Button variant="outline" size="sm" className="w-full">
                       {/* Removed asChild because Button cannot have Link as direct child */}
                       <Link href="/inventory/scan">Ver Relatório Completo <ArrowRight className="inline ml-1 h-4 w-4" /></Link> {/* Link to inventory report page eventually */}
                     </Button>
                </CardFooter>
             </Card>

        </div>
    );
}
