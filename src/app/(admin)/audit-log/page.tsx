
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Search, Filter, RotateCcw, User, Edit, Plus, Trash2, Eye, EyeOff, MapPin, Tag, QrCode, AlertTriangle } from 'lucide-react'; // Added QrCode, AlertTriangle
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area'; // For displaying details

// Define Audit Log Entry Structure
interface AuditLogEntry {
    id: string;
    timestamp: Date;
    userId: string; // ID of the user performing the action
    userName: string; // Name of the user
    action: string; // e.g., 'CREATE', 'UPDATE', 'DELETE', 'MARK_LOST', 'CHANGE_VISIBILITY'
    entityType: 'Asset' | 'Characteristic' | 'Location' | 'User'; // Type of entity affected
    entityId: string; // ID of the affected entity
    entityName: string; // Name/Tag of the affected entity (e.g., asset tag, location name)
    details?: {
        fieldName?: string; // Field that was changed (for UPDATE)
        oldValue?: any;
        newValue?: any;
    }; // Store changes (optional for CREATE/DELETE)
}

// Mock function to fetch audit logs - Replace with actual API call
async function fetchAuditLogs(filters: any): Promise<{ logs: AuditLogEntry[], total: number }> {
    console.log("Fetching logs with filters:", filters);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    // Mock Data - In a real app, query Firestore based on filters and pagination
    const allLogs: AuditLogEntry[] = [
        { id: 'log1', timestamp: new Date(2024, 3, 26, 10, 30), userId: 'user1', userName: 'João Silva', action: 'CREATE', entityType: 'Asset', entityId: 'ASSET001', entityName: 'Notebook Dell X (TI-NB-001)' },
        { id: 'log2', timestamp: new Date(2024, 3, 26, 11, 15), userId: 'user2', userName: 'Maria Oliveira', action: 'UPDATE', entityType: 'Asset', entityId: 'ASSET001', entityName: 'Notebook Dell X (TI-NB-001)', details: { fieldName: 'locationId', oldValue: 'loc1', newValue: 'loc3' } },
        { id: 'log3', timestamp: new Date(2024, 3, 27, 9, 0), userId: 'user1', userName: 'João Silva', action: 'CREATE', entityType: 'Characteristic', entityId: 'char1', entityName: 'Voltagem (TI-NB-001)', details: { newValue: 'Bivolt' } },
        { id: 'log4', timestamp: new Date(2024, 3, 27, 14, 5), userId: 'user3', userName: 'Carlos Pereira', action: 'UPDATE', entityType: 'Characteristic', entityId: 'char2', entityName: 'Memória RAM (TI-NB-001)', details: { fieldName: 'value', oldValue: '8GB', newValue: '16GB' } },
        { id: 'log5', timestamp: new Date(2024, 3, 28, 16, 20), userId: 'user2', userName: 'Maria Oliveira', action: 'MARK_LOST', entityType: 'Asset', entityId: 'ASSET003', entityName: 'Cadeira Escritório (MOB-CAD-012)' },
        { id: 'log6', timestamp: new Date(2024, 3, 28, 17, 0), userId: 'user1', userName: 'João Silva', action: 'DELETE', entityType: 'Location', entityId: 'loc_temp', entityName: 'Local Temporário' },
        { id: 'log7', timestamp: new Date(2024, 3, 29, 8, 45), userId: 'user4', userName: 'Ana Costa', action: 'CHANGE_VISIBILITY', entityType: 'Characteristic', entityId: 'char5', entityName: 'Número Série (ASSET004)', details: { fieldName: 'isPublic', oldValue: true, newValue: false } },
        { id: 'log8', timestamp: new Date(2024, 3, 29, 10, 0), userId: 'user1', userName: 'João Silva', action: 'CREATE', entityType: 'User', entityId: 'user5', entityName: 'Pedro Santos' },
    ];

    // Apply basic filtering (example)
    const filteredLogs = allLogs.filter(log => {
        let match = true;
        if (filters.user && !log.userName.toLowerCase().includes(filters.user.toLowerCase())) match = false;
        if (filters.entityType && log.entityType !== filters.entityType) match = false;
        if (filters.action && log.action !== filters.action) match = false;
        if (filters.startDate && log.timestamp < filters.startDate) match = false;
        if (filters.endDate) {
            const endDate = new Date(filters.endDate);
            endDate.setHours(23, 59, 59, 999); // Include the whole end day
            if (log.timestamp > endDate) match = false;
        }
        return match;
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Sort newest first

    // Simulate pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const startIndex = (page - 1) * limit;
    const paginatedLogs = filteredLogs.slice(startIndex, startIndex + limit);

    return { logs: paginatedLogs, total: filteredLogs.length };
}

// Helper function to get action icon and color
const getActionVisuals = (action: string, details?: any) => {
    switch (action) {
        case 'CREATE': return { icon: Plus, color: 'text-green-600', label: 'Criação' };
        case 'UPDATE': return { icon: Edit, color: 'text-blue-600', label: 'Atualização' };
        case 'DELETE': return { icon: Trash2, color: 'text-red-600', label: 'Exclusão' };
        case 'MARK_LOST': return { icon: AlertTriangle, color: 'text-orange-600', label: 'Marcação Perdido' };
        case 'CHANGE_VISIBILITY':
             const isNowPublic = details?.newValue === true;
            return { icon: isNowPublic ? Eye : EyeOff, color: 'text-purple-600', label: isNowPublic ? 'Tornou Público' : 'Tornou Privado' };
        // Add more actions as needed (e.g., INVENTORY, LOGIN, LOGOUT)
        default: return { icon: Edit, color: 'text-gray-500', label: action };
    }
};

const getEntityTypeVisuals = (type: AuditLogEntry['entityType']) => {
     switch (type) {
        case 'Asset': return { icon: QrCode, label: 'Ativo' };
        case 'Characteristic': return { icon: Tag, label: 'Característica' };
        case 'Location': return { icon: MapPin, label: 'Local' };
        case 'User': return { icon: User, label: 'Usuário' };
        default: return { icon: Filter, label: type };
    }
}

export default function AuditLogPage() {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        user: '',
        entityType: '',
        action: '',
        startDate: null as Date | null,
        endDate: null as Date | null,
        page: 1,
        limit: 15, // Items per page
    });
    const [totalLogs, setTotalLogs] = useState(0);

    const fetchLogs = async (currentFilters: typeof filters) => {
        setLoading(true);
        setError(null);
        try {
            const { logs: fetchedLogs, total } = await fetchAuditLogs(currentFilters);
            setLogs(fetchedLogs);
            setTotalLogs(total);
        } catch (err) {
            console.error("Error fetching audit logs:", err);
            setError("Falha ao carregar os logs de auditoria.");
            setLogs([]);
            setTotalLogs(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs(filters);
    }, [filters]); // Refetch when filters change

    const handleFilterChange = (key: keyof typeof filters, value: any) => {
        // Reset page to 1 whenever filters change
        setFilters(prev => ({ ...prev, [key]: value === '__all__' ? '' : value, page: 1 }));
    };

    const handleResetFilters = () => {
        setFilters({
            user: '',
            entityType: '',
            action: '',
            startDate: null,
            endDate: null,
            page: 1,
            limit: 15,
        });
    };

    const totalPages = Math.ceil(totalLogs / filters.limit);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setFilters(prev => ({ ...prev, page: newPage }));
        }
    };

    return (
        <div className="space-y-6"> {/* Use simple div instead of container */}
            <h1 className="text-3xl font-bold mb-6">Log de Auditoria</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Registros de Atividade</CardTitle>
                    <CardDescription>Visualize todas as alterações realizadas no sistema.</CardDescription>
                     {/* Filter Section */}
                    <div className="pt-4 space-y-4 md:space-y-0 md:flex md:flex-wrap md:gap-4">
                        <Input
                            placeholder="Filtrar por usuário..."
                            value={filters.user}
                            onChange={(e) => handleFilterChange('user', e.target.value)}
                            className="w-full sm:max-w-xs"
                        />
                        <Select value={filters.entityType || '__all__'} onValueChange={(v) => handleFilterChange('entityType', v)}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Tipo de Entidade" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__all__">Todos Tipos</SelectItem>
                                <SelectItem value="Asset">Ativo</SelectItem>
                                <SelectItem value="Characteristic">Característica</SelectItem>
                                <SelectItem value="Location">Local</SelectItem>
                                <SelectItem value="User">Usuário</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filters.action || '__all__'} onValueChange={(v) => handleFilterChange('action', v)}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Tipo de Ação" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__all__">Todas Ações</SelectItem>
                                <SelectItem value="CREATE">Criação</SelectItem>
                                <SelectItem value="UPDATE">Atualização</SelectItem>
                                <SelectItem value="DELETE">Exclusão</SelectItem>
                                <SelectItem value="MARK_LOST">Marcação Perdido</SelectItem>
                                <SelectItem value="CHANGE_VISIBILITY">Visibilidade</SelectItem>
                                {/* Add more actions */}
                            </SelectContent>
                        </Select>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={"outline"} className="w-full md:w-auto justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {filters.startDate ? format(filters.startDate, "dd/MM/yy", { locale: ptBR }) : <span>Data Início</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={filters.startDate || undefined} onSelect={(d) => handleFilterChange('startDate', d || null)} initialFocus locale={ptBR}/>
                            </PopoverContent>
                        </Popover>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={"outline"} className="w-full md:w-auto justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {filters.endDate ? format(filters.endDate, "dd/MM/yy", { locale: ptBR }) : <span>Data Fim</span>}
                                </Button>
                            </PopoverTrigger>
                             <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={filters.endDate || undefined} onSelect={(d) => handleFilterChange('endDate', d || null)} initialFocus locale={ptBR}/>
                            </PopoverContent>
                        </Popover>
                        <Button variant="ghost" onClick={handleResetFilters} title="Limpar Filtros">
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[150px]">Data/Hora</TableHead>
                                    <TableHead>Usuário</TableHead>
                                    <TableHead>Ação</TableHead>
                                    <TableHead>Entidade</TableHead>
                                    <TableHead>Detalhes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={`skel-${i}`}>
                                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                    </TableRow>
                                ))}
                                {!loading && logs.map((log) => {
                                    const { icon: ActionIcon, color: actionColor, label: actionLabel } = getActionVisuals(log.action, log.details);
                                    const { icon: EntityIcon, label: entityLabel } = getEntityTypeVisuals(log.entityType);

                                    return (
                                        <TableRow key={log.id}>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {format(log.timestamp, "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                                            </TableCell>
                                            <TableCell className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground"/>
                                                {log.userName}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`flex items-center gap-1 w-fit ${actionColor} border-current/50`}>
                                                    <ActionIcon className={`h-3 w-3`} />
                                                    {actionLabel}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm">
                                                    <EntityIcon className="h-4 w-4 text-muted-foreground"/>
                                                    <span className="font-medium">{entityLabel}:</span>
                                                    <span className="truncate text-muted-foreground" title={log.entityName}>{log.entityName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                {log.details ? (
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button variant="ghost" size="sm">Ver Detalhes</Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-80">
                                                            <ScrollArea className="max-h-60">
                                                            <div className="grid gap-4">
                                                                <div className="space-y-2">
                                                                <h4 className="font-medium leading-none">Detalhes da Alteração</h4>
                                                                <p className="text-sm text-muted-foreground">
                                                                    Alterações registradas para esta ação.
                                                                </p>
                                                                </div>
                                                                <div className="grid gap-2">
                                                                    {log.details.fieldName && (
                                                                        <div className="grid grid-cols-2 items-center gap-2">
                                                                            <span className="text-muted-foreground">Campo:</span>
                                                                            <span className="font-semibold">{log.details.fieldName}</span>
                                                                        </div>
                                                                    )}
                                                                    {log.details.oldValue !== undefined && (
                                                                        <div className="grid grid-cols-2 items-start gap-2">
                                                                            <span className="text-muted-foreground">Valor Antigo:</span>
                                                                            <span className="break-all">{JSON.stringify(log.details.oldValue)}</span>
                                                                        </div>
                                                                    )}
                                                                    {log.details.newValue !== undefined && (
                                                                        <div className="grid grid-cols-2 items-start gap-2">
                                                                            <span className="text-muted-foreground">Valor Novo:</span>
                                                                            <span className="break-all">{JSON.stringify(log.details.newValue)}</span>
                                                                        </div>
                                                                    )}
                                                                    {!log.details.fieldName && log.details.newValue === undefined && log.details.oldValue === undefined && (
                                                                        <p className="text-muted-foreground text-center">Nenhum detalhe específico registrado.</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            </ScrollArea>
                                                        </PopoverContent>
                                                    </Popover>
                                                ) : (
                                                    <span className="text-muted-foreground italic">N/A</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {!loading && logs.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            {error || "Nenhum log encontrado para os filtros selecionados."}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                      {/* Pagination */}
                     <div className="flex items-center justify-end space-x-2 py-4">
                        <span className="text-sm text-muted-foreground">
                           Página {filters.page} de {totalPages} ({totalLogs} registros)
                        </span>
                        <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(filters.page - 1)}
                        disabled={filters.page <= 1 || loading}
                        >
                        Anterior
                        </Button>
                        <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(filters.page + 1)}
                        disabled={filters.page >= totalPages || loading}
                        >
                        Próxima
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
