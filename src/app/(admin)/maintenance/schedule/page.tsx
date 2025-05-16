'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CalendarCheck2, Search, Filter, AlertTriangle, Wrench, CalendarDays, PackageSearch, RotateCcw, Info, CircleAlert } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays, isPast, isFuture, addDays, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Asset } from '@/types/asset';
import { useAdminLayoutContext } from '@/components/layout/admin-layout-context';
import { allAssetsMockData } from '@/lib/mock-data'; // Using mock data directly for now

type EventType = 'Manutenção' | 'Certificação' | 'Garantia' | 'Inventário';

interface ExpirationEvent {
  id: string; // assetId + eventType + date for uniqueness
  assetId: string;
  assetName: string;
  assetTag: string;
  eventType: EventType;
  dueDate: Date;
  status: 'Vencido' | 'Hoje' | 'Em Breve' | 'Agendado';
  daysRemaining?: number; // Positive for upcoming, negative for overdue
}

// Mock service function to fetch and process expiration events for a company
async function fetchExpirationEvents(
  filters: {
    eventType: string;
    dateRange: string; // 'next7', 'next30', 'overdue', 'custom'
    customStartDate?: Date | null;
    customEndDate?: Date | null;
    searchTerm: string;
  },
  companyId: string
): Promise<ExpirationEvent[]> {
  console.log(`[SchedulePage] Fetching expiration events for company ${companyId} with filters:`, filters);
  await new Promise(resolve => setTimeout(resolve, 800));

  const today = startOfDay(new Date());
  const relevantAssets = allAssetsMockData.filter(asset => asset.companyId === companyId);
  let events: ExpirationEvent[] = [];

  relevantAssets.forEach(asset => {
    if (asset.nextMaintenanceDate && (filters.eventType === '__all__' || filters.eventType === 'Manutenção')) {
      events.push({
        id: `${asset.id}-maintenance-${asset.nextMaintenanceDate.toISOString()}`,
        assetId: asset.id, assetName: asset.name, assetTag: asset.tag,
        eventType: 'Manutenção', dueDate: asset.nextMaintenanceDate,
        status: 'Agendado', // Will be refined below
      });
    }
    if (asset.certificationExpiryDate && (filters.eventType === '__all__' || filters.eventType === 'Certificação')) {
      events.push({
        id: `${asset.id}-certification-${asset.certificationExpiryDate.toISOString()}`,
        assetId: asset.id, assetName: asset.name, assetTag: asset.tag,
        eventType: 'Certificação', dueDate: asset.certificationExpiryDate,
        status: 'Agendado',
      });
    }
    if (asset.warrantyExpiryDate && (filters.eventType === '__all__' || filters.eventType === 'Garantia')) {
      events.push({
        id: `${asset.id}-warranty-${asset.warrantyExpiryDate.toISOString()}`,
        assetId: asset.id, assetName: asset.name, assetTag: asset.tag,
        eventType: 'Garantia', dueDate: asset.warrantyExpiryDate,
        status: 'Agendado',
      });
    }
    if (asset.nextInventoryDate && (filters.eventType === '__all__' || filters.eventType === 'Inventário')) {
      events.push({
        id: `${asset.id}-inventory-${asset.nextInventoryDate.toISOString()}`,
        assetId: asset.id, assetName: asset.name, assetTag: asset.tag,
        eventType: 'Inventário', dueDate: asset.nextInventoryDate,
        status: 'Agendado',
      });
    }
  });

  // Calculate status and days remaining
  events = events.map(event => {
    const daysDiff = differenceInDays(startOfDay(event.dueDate), today);
    let status: ExpirationEvent['status'] = 'Agendado';
    if (isPast(event.dueDate) && !isToday(event.dueDate)) {
      status = 'Vencido';
    } else if (isToday(event.dueDate)) {
      status = 'Hoje';
    } else if (daysDiff <= 30 && daysDiff > 0) { // Includes "Hoje" if not caught above, which is fine.
      status = 'Em Breve';
    }
    return { ...event, status, daysRemaining: daysDiff };
  });

  // Apply date range filters
  let rangeStart: Date | null = null;
  let rangeEnd: Date | null = null;

  switch (filters.dateRange) {
    case 'next7':
      rangeStart = today;
      rangeEnd = endOfDay(addDays(today, 7));
      break;
    case 'next30':
      rangeStart = today;
      rangeEnd = endOfDay(addDays(today, 30));
      break;
    case 'overdue':
      rangeEnd = endOfDay(addDays(today, -1)); // Anything before today
      break;
    case 'today':
        rangeStart = today;
        rangeEnd = endOfDay(today);
        break;
    case 'custom':
      if (filters.customStartDate) rangeStart = startOfDay(filters.customStartDate);
      if (filters.customEndDate) rangeEnd = endOfDay(filters.customEndDate);
      break;
    case '__all__':
    default:
      // No date filter
      break;
  }

  events = events.filter(event => {
    const dueDateStartOfDay = startOfDay(event.dueDate);
    if (rangeStart && dueDateStartOfDay < rangeStart) return false;
    if (rangeEnd && dueDateStartOfDay > rangeEnd) return false;
    return true;
  });

  // Apply search term filter
  if (filters.searchTerm) {
    const termLower = filters.searchTerm.toLowerCase();
    events = events.filter(event =>
      event.assetName.toLowerCase().includes(termLower) ||
      event.assetTag.toLowerCase().includes(termLower)
    );
  }

  return events.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()); // Sort by due date ascending
}

function isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
}

export default function ExpirationSchedulePage() {
  const { toast } = useToast();
  const { currentCompanyId } = useAdminLayoutContext();
  const [events, setEvents] = useState<ExpirationEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    eventType: '__all__',
    dateRange: 'next30', // Default to next 30 days
    customStartDate: null as Date | null,
    customEndDate: null as Date | null,
    searchTerm: '',
  });

  const loadEvents = useCallback(async () => {
    if (!currentCompanyId) {
      setIsLoading(false);
      toast({ title: "Erro", description: "ID da empresa não encontrado.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const fetchedEvents = await fetchExpirationEvents(filters, currentCompanyId);
      setEvents(fetchedEvents);
    } catch (error) {
      console.error("Error fetching expiration events:", error);
      toast({ title: "Erro", description: "Não foi possível carregar o plano de vencimentos.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [currentCompanyId, filters, toast]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
        eventType: '__all__',
        dateRange: 'next30',
        customStartDate: null,
        customEndDate: null,
        searchTerm: '',
    });
  };

  const getStatusBadge = (status: ExpirationEvent['status'], daysRemaining?: number) => {
    switch (status) {
      case 'Vencido': return <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Vencido {daysRemaining && `(${Math.abs(daysRemaining)}d)`}</Badge>;
      case 'Hoje': return <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600 text-black flex items-center gap-1"><CircleAlert className="h-3 w-3" />Hoje</Badge>;
      case 'Em Breve': return <Badge variant="secondary" className="bg-orange-400 hover:bg-orange-500 text-black flex items-center gap-1"><CalendarDays className="h-3 w-3" />Em Breve {daysRemaining && `(${daysRemaining}d)`}</Badge>;
      case 'Agendado': return <Badge variant="outline">Agendado</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const eventTypeIcons: Record<EventType, React.ElementType> = {
    'Manutenção': Wrench,
    'Certificação': CalendarCheck2,
    'Garantia': CalendarDays,
    'Inventário': PackageSearch,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2"><CalendarCheck2 /> Plano de Vencimentos</h1>

      <Card>
        <CardHeader>
          <CardTitle>Próximos Eventos e Vencimentos</CardTitle>
          <CardDescription>Monitore os prazos de manutenção, certificações, garantias e inventários dos seus ativos.</CardDescription>
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 items-end flex-wrap">
            <Input
              placeholder="Buscar por ativo (nome, tag)..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="w-full lg:col-span-2"
            />
            <Select value={filters.eventType} onValueChange={(v) => handleFilterChange('eventType', v)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Tipo de Evento" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos Tipos</SelectItem>
                <SelectItem value="Manutenção">Manutenção</SelectItem>
                <SelectItem value="Certificação">Certificação</SelectItem>
                <SelectItem value="Garantia">Garantia</SelectItem>
                <SelectItem value="Inventário">Inventário</SelectItem>
              </SelectContent>
            </Select>
             <Select value={filters.dateRange} onValueChange={(v) => handleFilterChange('dateRange', v)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Período" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos Períodos</SelectItem>
                <SelectItem value="overdue">Vencidos</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="next7">Próximos 7 dias</SelectItem>
                <SelectItem value="next30">Próximos 30 dias</SelectItem>
                {/* <SelectItem value="custom">Período Específico</SelectItem> */}
              </SelectContent>
            </Select>
             {/* TODO: Add custom date range pickers if 'custom' selected */}
            <Button variant="ghost" onClick={handleResetFilters} title="Limpar Filtros" className="w-full lg:w-auto">
                <RotateCcw className="h-4 w-4 mr-2 lg:mr-0" /> <span className="lg:hidden">Limpar</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ativo</TableHead>
                <TableHead className="hidden sm:table-cell">Tipo de Evento</TableHead>
                <TableHead>Data de Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skel-event-${i}`}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-28 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-20 rounded" /></TableCell>
                </TableRow>
              ))}
              {!isLoading && events.map((event) => {
                const EventIcon = eventTypeIcons[event.eventType];
                return (
                  <TableRow key={event.id}>
                    <TableCell>
                      <Link href={`/assets/${event.assetId}/edit`} className="font-medium text-primary hover:underline">{event.assetName}</Link>
                      <div className="text-xs text-muted-foreground">{event.assetTag}</div>
                      <div className="text-xs text-muted-foreground sm:hidden flex items-center gap-1 mt-1">
                        {EventIcon && <EventIcon className="h-3 w-3" />} {event.eventType}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-1 text-sm">
                            {EventIcon && <EventIcon className="h-4 w-4 text-muted-foreground" />}
                            {event.eventType}
                        </div>
                    </TableCell>
                    <TableCell className="text-sm">{format(event.dueDate, "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                    <TableCell>{getStatusBadge(event.status, event.daysRemaining)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/assets/${event.assetId}/edit`}>Ver Ativo</Link>
                      </Button>
                      {/* Add action like "Create Work Order" if applicable */}
                    </TableCell>
                  </TableRow>
                );
              })}
              {!isLoading && events.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    {currentCompanyId ? 'Nenhum evento encontrado para os filtros aplicados.' : 'Selecione uma empresa para ver o plano de vencimentos.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Mostrando <strong>{events.length}</strong> eventos.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}