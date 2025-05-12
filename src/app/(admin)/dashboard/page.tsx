
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart as RechartsBarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
} from 'recharts';
import {
    Package,
    AlertTriangle,
    CalendarClock,
    History,
    ArrowRight,
    Building,
    Home,
    CheckSquare,
    RefreshCw,
    Users,
    MapPin,
    PlusCircle,
    Activity,
    FileWarning,
    TrendingUp,
    TrendingDown,
    BarChart as LucideBarChart
} from 'lucide-react';
import { format, subDays, differenceInDays, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '@/components/ui/chart';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from '@/lib/utils';
import { StatsCard } from '@/components/feature/stats-card';
import { Badge } from '@/components/ui/badge';

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
  entityType: 'Asset' | 'Location' | 'User' | 'Characteristic' | 'Other';
  details?: string;
}

interface ExpiringRental {
    id: string;
    name: string;
    tag: string;
    rentalEndDate: Date;
    rentalCompany: string;
}

interface LostAsset {
     id: string;
     name: string;
     tag: string;
     lostDate: Date;
     lastLocation?: string;
}

interface AssetCountByCategory {
    category: string;
    count: number;
    fill?: string;
}

interface AssetStatusCount {
    status: 'active' | 'lost' | 'inactive';
    count: number;
    fill?: string;
}

// --- Mock Fetch Functions ---
async function fetchDashboardData(): Promise<{
    summary: AssetSummary;
    byLocation: CountByLocation[];
    byCategory: AssetCountByCategory[];
    byStatus: AssetStatusCount[];
    assetHistory: AssetTimeSeries[];
    recentActivity: RecentActivityLog[];
    expiringRentals: ExpiringRental[];
    lostAssets: LostAsset[];
    locationCount: number;
    userCount: number;
    inventoryProgress: number;
    lastUpdatedAt: Date;
}> {
  await new Promise(resolve => setTimeout(resolve, 1200));

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
    { locationName: 'Outros Locais', count: 349 },
  ].sort((a, b) => b.count - a.count).slice(0, 5);

   const byCategory: AssetCountByCategory[] = [
       { category: 'Eletrônicos', count: 600 },
       { category: 'Mobiliário', count: 300 },
       { category: 'Ferramentas', count: 150 },
       { category: 'Veículos', count: 34 },
       { category: 'Outros', count: 150 },
   ].sort((a,b) => b.count - a.count);

   const byStatus: AssetStatusCount[] = [
        { status: 'active', count: summary.active },
        { status: 'lost', count: summary.lost },
        { status: 'inactive', count: summary.inactive },
    ];

   const assetHistory: AssetTimeSeries[] = Array.from({ length: 30 }).map((_, i) => {
       const date = subDays(new Date(), 29 - i);
       const baseCount = 800 + i * 10;
       const variation = Math.random() * 50 - 25;
       return {
           date: format(date, 'yyyy-MM-dd'),
           count: Math.max(0, Math.round(baseCount + variation)),
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
      { id: 'ASSET003', name: 'Cadeira Escritório', tag: 'MOB-CAD-012', rentalEndDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), rentalCompany: 'LocaTudo'},
      { id: 'ASSETRENT01', name: 'Impressora HP Laser', tag: 'TI-IMP-001', rentalEndDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), rentalCompany: 'Print Fácil'},
      { id: 'ASSETRENT02', name: 'Servidor Dell R740', tag: 'SRV-DELL-01', rentalEndDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), rentalCompany: 'ServerRent'},
   ];

   const lostAssets: LostAsset[] = [
        { id: 'ASSET003', name: 'Cadeira Escritório', tag: 'MOB-CAD-012', lostDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), lastLocation: 'Sala Reuniões' },
        { id: 'ASSETLOST01', name: 'Furadeira Bosch', tag: 'FER-FUR-005', lostDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), lastLocation: 'Oficina' },
    ];

  return {
    summary,
    byLocation,
    byCategory,
    byStatus,
    assetHistory,
    recentActivity,
    expiringRentals: expiringRentals.filter(r => differenceInDays(r.rentalEndDate, new Date()) <= 30),
    lostAssets,
    locationCount: 56,
    userCount: 12,
    inventoryProgress: 85,
    lastUpdatedAt: new Date(),
  };
}

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

const pastelColors = [
  'hsl(38, 95%, 80%)', 
  'hsl(160, 70%, 80%)',
  'hsl(210, 100%, 85%)',
  'hsl(300, 80%, 85%)',
  'hsl(0, 80%, 85%)',
  'hsl(25, 85%, 80%)',
];

const statusChartConfig = {
    count: { label: "Ativos" },
    active: { label: "Ativos", color: "hsl(140 60% 70%)" },
    lost: { label: "Perdidos", color: "hsl(0 80% 85%)" },
    inactive: { label: "Inativos", color: "hsl(45 80% 80%)" },
} satisfies ChartConfig;

const baseCategoryChartConfig = {
    count: { label: "Ativos" },
} satisfies ChartConfig;

const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 5) * cos;
    const sy = cy + (outerRadius + 5) * sin;
    const mx = cx + (outerRadius + 15) * cos;
    const my = cy + (outerRadius + 15) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 12;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';
    const categoryLabel = payload.category || 'Desconhecido';

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 4}
          outerRadius={outerRadius + 6}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
         <text x={ex + (cos >= 0 ? 1 : -1) * 8} y={ey} textAnchor={textAnchor} fill="hsl(var(--foreground))" className="text-xs font-medium">{categoryLabel}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 8} y={ey} dy={12} textAnchor={textAnchor} fill="hsl(var(--muted-foreground))" className="text-xs">
          {`${value} (${(percent * 100).toFixed(1)}%)`}
        </text>
      </g>
    );
};


export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<Awaited<ReturnType<typeof fetchDashboardData>> | null>(null);
    const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
    const [pieActiveIndex, setPieActiveIndex] = useState(0);

     const loadData = useCallback(async (showLoading = true) => {
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
        }, []); 

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        if (!lastUpdatedAt) return;
        const interval = setInterval(() => {
            setLastUpdatedAt(new Date(lastUpdatedAt));
        }, 60000);
        return () => clearInterval(interval);
    }, [lastUpdatedAt]);

    const assetHistoryChartData = useMemo(() => data?.assetHistory || [], [data?.assetHistory]);
    const assetHistoryChartConfig = useMemo(() => ({
        count: { label: "Ativos", color: "hsl(var(--primary))" },
    }), []);

    const categoryChartData = useMemo(() => {
        return (data?.byCategory || []).map((cat, index) => ({
            ...cat,
            fill: cat.fill || pastelColors[index % pastelColors.length],
        }));
    }, [data?.byCategory]);

    const dynamicCategoryChartConfig = useMemo(() => {
        const config: ChartConfig = { ...baseCategoryChartConfig };
        categoryChartData.forEach(cat => {
            if (cat.category) {
                 config[cat.category] = { label: cat.category, color: cat.fill };
            }
        });
        return config;
    }, [categoryChartData]);


     const statusChartData = useMemo(() => {
        return (data?.byStatus || []).map(stat => ({
             ...stat,
             fill: (statusChartConfig[stat.status as keyof typeof statusChartConfig] as { color: string })?.color || 'hsl(0, 0%, 80%)',
        }));
     }, [data?.byStatus]);


    const assetTrend = useMemo(() => {
        if (!data?.assetHistory || data.assetHistory.length < 2) return 0;
        const currentCount = data.assetHistory[data.assetHistory.length - 1].count;
        const pastCount = data.assetHistory[0].count;
        return currentCount - pastCount;
    }, [data?.assetHistory]);

     const onPieEnter = useCallback(
        (_: any, index: number) => {
            setPieActiveIndex(index);
        },
        [setPieActiveIndex]
     );


    if (loading && !data) {
        return (
            <div className="space-y-6 min-w-0">
                 <Skeleton className="h-8 w-32 mb-6" />
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                    <Skeleton className="h-32" />
                </div>
                 <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                     <Skeleton className="h-80" />
                     <Skeleton className="h-80" />
                 </div>
                 <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    <Skeleton className="h-[400px]" />
                    <Skeleton className="h-[400px]" />
                </div>
                 <div className="grid gap-6">
                    <Skeleton className="h-[300px]" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
             <div className="flex flex-col items-center justify-center h-64 text-destructive min-w-0">
                <AlertTriangle className="mr-2 h-6 w-6" />
                <p>{error}</p>
                <Button onClick={() => loadData()} variant="outline" className="mt-4">Tentar Novamente</Button>
             </div>
        );
    }

    if (!data) {
        return null;
    }

    const { summary, recentActivity, expiringRentals, lostAssets, locationCount, userCount, inventoryProgress } = data;

    return (
        <div className="space-y-8 min-w-0">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
               <h1 className="text-3xl font-bold">Dashboard Geral</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Button onClick={() => loadData(false)} variant="ghost" size="icon" disabled={loading} className="h-8 w-8">
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}/>
                    </Button>
                   <span>
                     Última atualização:{' '}
                      {lastUpdatedAt ? formatDistanceToNow(lastUpdatedAt, { addSuffix: true, locale: ptBR }) : 'Carregando...'}
                  </span>
               </div>
           </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
             <StatsCard
                title="Total de Ativos"
                value={summary.total.toLocaleString()}
                icon={Package}
                description={
                  <span className={cn("flex items-center gap-1 text-xs", assetTrend >= 0 ? "text-green-600" : "text-red-600")}>
                      {assetTrend >= 0 ? <TrendingUp className="h-4 w-4"/> : <TrendingDown className="h-4 w-4"/>}
                      {assetTrend > 0 ? '+' : ''}{assetTrend.toLocaleString()} nos últimos 30 dias
                  </span>
                }
                isLoading={loading}
                />
             <StatsCard
                title="Locais Cadastrados"
                value={locationCount.toLocaleString()}
                icon={MapPin}
                description={
                   <Link href="/locations" className="text-primary hover:underline flex items-center text-xs">
                        Gerenciar Locais <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                }
                isLoading={loading}
              />
             <StatsCard
                title="Usuários Ativos"
                value={userCount.toLocaleString()}
                icon={Users}
                 description={
                   <Link href="/settings/admin/users" className="text-primary hover:underline flex items-center text-xs">
                        Gerenciar Usuários <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                }
                isLoading={loading}
             />
             <StatsCard
                 title={`Inventário (${new Date().getFullYear()})`}
                value={`${inventoryProgress}%`}
                icon={CheckSquare}
                description={
                     <Link href="/inventory/scan" className="text-primary hover:underline flex items-center text-xs">
                        Iniciar Inventário <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                }
                isLoading={loading}
             />
          </div>

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                 <Card>
                    <CardHeader>
                        <CardTitle>Histórico de Ativos (Últimos 30 dias)</CardTitle>
                         <CardDescription>Contagem total de ativos ao longo do tempo.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[230px] sm:h-[250px]">
                         <ChartContainer config={assetHistoryChartConfig} className="h-full w-full">
                             <LineChart data={assetHistoryChartData} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tickFormatter={(value) => format(new Date(value + 'T00:00:00'), 'dd/MM')}
                                />
                                <YAxis tickLine={false} axisLine={false} tickMargin={8} width={30} />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent indicator="line" hideLabel />}
                                    />
                                <Line dataKey="count" type="monotone" stroke="var(--color-count)" strokeWidth={2} dot={false} name="Ativos" />
                            </LineChart>
                        </ChartContainer>
                    </CardContent>
                 </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Distribuição por Status</CardTitle>
                         <CardDescription>Distribuição atual dos ativos por status.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center h-[230px] sm:h-[250px]">
                        <ChartContainer config={statusChartConfig} className="h-full w-full">
                             <ResponsiveContainer width="100%" height="100%">
                                <RechartsBarChart
                                    data={statusChartData}
                                    layout="vertical"
                                    margin={{left: 10, right: 10, top: 10, bottom: 10}}
                                >
                                    <CartesianGrid horizontal={false} strokeDasharray="3 3"/>
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="status"
                                        type="category"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={10}
                                        width={60}
                                        tickFormatter={(value) => (statusChartConfig[value as keyof typeof statusChartConfig] as { label: string })?.label || value}
                                    />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                    <Bar dataKey="count" layout="vertical" radius={4}>
                                        {statusChartData.map((entry) => (
                                            <Cell key={`cell-${entry.status}`} fill={entry.fill} />
                                        ))}
                                     </Bar>
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                 <Card>
                    <CardHeader>
                        <CardTitle>Ativos por Categoria</CardTitle>
                        <CardDescription>Distribuição dos ativos por categoria principal.</CardDescription>
                    </CardHeader>
                     <CardContent className="flex items-center justify-center h-[230px] sm:h-[250px]">
                          <ChartContainer config={dynamicCategoryChartConfig} className="h-full w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                     <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="category" />} />
                                     <Pie
                                        data={categoryChartData}
                                        dataKey="count"
                                        nameKey="category"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={70}
                                        activeIndex={pieActiveIndex}
                                        activeShape={renderActiveShape}
                                        onMouseEnter={onPieEnter}
                                     >
                                        {categoryChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} name={entry.category}/>
                                        ))}
                                    </Pie>
                                    <ChartLegend content={<ChartLegendContent nameKey="category" />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Ativos por Localização (Top 5)</CardTitle>
                         <CardDescription>Concentração de ativos nos principais locais.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[230px] sm:h-[250px]">
                          <ChartContainer config={{ count: { label: "Ativos", color: "hsl(var(--primary))" } }} className="w-full h-full">
                             <ResponsiveContainer width="100%" height="100%">
                                <RechartsBarChart data={data.byLocation} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="locationName" hide/>
                                    <YAxis dataKey="locationName" type="category" width={80} tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                    <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                 </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                 <Card className="lg:col-span-1 flex flex-col h-full">
                   <CardHeader>
                       <CardTitle className="flex items-center gap-2 text-orange-600"><CalendarClock className="h-5 w-5"/> Locações Vencendo</CardTitle>
                       <CardDescription>Contratos terminando nos próximos 30 dias.</CardDescription>
                   </CardHeader>
                    <CardContent className="flex-grow">
                      {expiringRentals.length > 0 ? (
                         <div className="space-y-3">
                             {expiringRentals
                                .sort((a,b) => a.rentalEndDate.getTime() - b.rentalEndDate.getTime())
                                .slice(0, 5) 
                                .map(rental => {
                                    const daysLeft = differenceInDays(rental.rentalEndDate, new Date());
                                    const isUrgent = daysLeft <= 7;
                                    const isVeryUrgent = daysLeft <= 3;
                                    return (
                                         <Link key={rental.id} href={`/assets/${rental.id}/edit`} className="block p-2 border rounded-md hover:bg-muted/50 transition-colors">
                                             <div className="flex justify-between items-center">
                                                <p className="font-medium text-sm truncate" title={`${rental.name} (${rental.tag})`}>
                                                    {rental.name}
                                                </p>
                                                <span className={cn(
                                                    "text-xs font-medium whitespace-nowrap",
                                                    isVeryUrgent ? 'text-red-700 font-bold' : isUrgent ? 'text-orange-600' : ''
                                                )}>
                                                     {format(rental.rentalEndDate, "dd/MM")} ({daysLeft}d)
                                                </span>
                                             </div>
                                             <p className="text-xs text-muted-foreground flex items-center gap-1"><Building className="h-3 w-3"/>{rental.rentalCompany}</p>
                                        </Link>
                                     )
                                 })}
                         </div>
                      ) : (
                          <p className="text-muted-foreground text-center py-4">Nenhuma locação vencendo.</p>
                      )}
                   </CardContent>
                    <CardFooter>
                        <Button variant="outline" size="sm" className="w-full" asChild>
                            <Link href="/assets?filter=rented_expiring">
                                Ver Todas Locações <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>

                 <Card className="border-destructive lg:col-span-1 flex flex-col h-full">
                   <CardHeader>
                       <CardTitle className="flex items-center gap-2 text-destructive"><FileWarning className="h-5 w-5"/> Ativos Perdidos</CardTitle>
                       <CardDescription>Ativos marcados como perdidos.</CardDescription>
                   </CardHeader>
                    <CardContent className="flex-grow">
                      {lostAssets.length > 0 ? (
                         <div className="space-y-3">
                             {lostAssets.slice(0, 5).map(asset => (
                                  <Link key={asset.id} href={`/assets/${asset.id}/edit`} className="block p-2 border rounded-md hover:bg-muted/50 transition-colors">
                                     <div className="flex justify-between items-center">
                                         <p className="font-medium text-sm truncate" title={`${asset.name} (${asset.tag})`}>
                                            {asset.name}
                                        </p>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                                            {format(asset.lostDate, "dd/MM/yy")}
                                         </span>
                                    </div>
                                    {asset.lastLocation && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3"/>{asset.lastLocation}</p>}
                                 </Link>
                             ))}
                         </div>
                      ) : (
                           <p className="text-muted-foreground text-center py-4">Nenhum ativo perdido.</p>
                      )}
                   </CardContent>
                    <CardFooter>
                        <Button variant="outline" size="sm" className="w-full" asChild>
                             <Link href="/assets?filter=lost">
                                Ver Todos Perdidos <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>

             <div className="grid grid-cols-1 gap-6">
                 <Card className="flex flex-col h-full">
                   <CardHeader>
                       <CardTitle className="flex items-center gap-2"><History className="h-5 w-5"/> Atividade Recente</CardTitle>
                       <CardDescription>Últimas 5 ações realizadas no sistema.</CardDescription>
                   </CardHeader>
                   <CardContent className="flex-grow space-y-4">
                      {recentActivity.length > 0 ? (
                        recentActivity.slice(0, 5).map(log => {
                             const actionInfo = getActionDetails(log);
                             return (
                                <div key={log.id} className="flex items-start gap-3 text-sm">
                                     <actionInfo.icon className={`mt-1 h-4 w-4 flex-shrink-0 ${actionInfo.color}`} />
                                    <div className="flex-1 min-w-0"> {/* Added min-w-0 here */}
                                        <span className="font-medium">{log.userName}</span>{' '}
                                        <span className="text-muted-foreground break-words">{actionInfo.text}</span> {/* Added break-words */}
                                        <p className="text-xs text-muted-foreground" title={format(log.timestamp, "Pp", { locale: ptBR })}>
                                            {formatDistanceToNow(log.timestamp, { addSuffix: true, locale: ptBR })}
                                        </p>
                                    </div>
                                </div>
                             )
                          })
                      ) : (
                          <p className="text-muted-foreground text-center py-4">Nenhuma atividade recente.</p>
                      )}
                   </CardContent>
                    <CardFooter>
                        <Button variant="outline" size="sm" className="w-full" asChild>
                            <Link href="/audit-log">
                                Ver Log Completo <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
             </div>

        </div>
    );
}

