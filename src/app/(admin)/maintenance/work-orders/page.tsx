
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Search, Edit, Trash2, MoreHorizontal, Filter, Wrench, CalendarClock, Check, Hourglass, AlertCircle, AlertTriangle, XCircle, User as UserIcon, Calendar as CalendarIcon, Clock as ClockIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Define Work Order Structure
type WorkOrderStatus = 'Open' | 'In Progress' | 'Completed' | 'Cancelled';
type WorkOrderType = 'Planned' | 'Corrective';
type WorkOrderPriority = 'Low' | 'Medium' | 'High';

interface WorkOrder {
    id: string;
    workOrderNumber: string; // Example: WO-2024-001
    assetId: string;
    assetTag: string;
    assetName: string;
    status: WorkOrderStatus;
    type: WorkOrderType;
    priority: WorkOrderPriority;
    description: string;
    reportedDate: Date;
    dueDate?: Date;
    completionDate?: Date;
    assignedUserName?: string;
}

// Mock data - replace with actual data fetching later
const initialWorkOrders: WorkOrder[] = [
  { id: 'wo1', workOrderNumber: 'WO-2024-001', assetId: 'ASSET001', assetTag: 'TI-NB-001', assetName: 'Notebook Dell Latitude 7400', status: 'Open', type: 'Corrective', priority: 'High', description: 'Tela piscando intermitentemente.', reportedDate: new Date(2024, 4, 20), dueDate: new Date(2024, 4, 22), assignedUserName: 'Carlos Pereira' },
  { id: 'wo2', workOrderNumber: 'WO-2024-002', assetId: 'ASSET004', assetTag: 'TI-PROJ-002', assetName: 'Projetor Epson PowerLite', status: 'In Progress', type: 'Planned', priority: 'Medium', description: 'Limpeza preventiva da lente e filtro.', reportedDate: new Date(2024, 4, 15), dueDate: new Date(2024, 4, 30), assignedUserName: 'Pedro Santos' },
  { id: 'wo3', workOrderNumber: 'WO-2024-003', assetId: 'ASSET009', assetTag: 'ALM-PAL-001', assetName: 'Paleteira Manual', status: 'Completed', type: 'Corrective', priority: 'Low', description: 'Troca de roda desgastada.', reportedDate: new Date(2024, 4, 10), completionDate: new Date(2024, 4, 12), assignedUserName: 'Carlos Pereira' },
  { id: 'wo4', workOrderNumber: 'WO-2024-004', assetId: 'ASSET007', assetTag: 'MOB-MES-001', assetName: 'Mesa Escritório', status: 'Open', type: 'Corrective', priority: 'Medium', description: 'Gaveta emperrada.', reportedDate: new Date(2024, 4, 25), assignedUserName: 'Maria Oliveira' },
  { id: 'wo5', workOrderNumber: 'WO-2024-005', assetId: 'ASSET002', assetTag: 'TI-MN-005', assetName: 'Monitor LG 27"', status: 'Cancelled', type: 'Corrective', priority: 'Low', description: 'Botão liga/desliga não funciona.', reportedDate: new Date(2024, 4, 5), assignedUserName: 'João Silva' },
];

// Mock function to fetch work orders
async function fetchWorkOrders(filters: any): Promise<{ workOrders: WorkOrder[], total: number }> {
    console.log("Fetching work orders with filters:", filters);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    // Apply filtering
    let filteredData = initialWorkOrders.filter(wo => {
        const searchTermLower = filters.search?.toLowerCase() || '';
        const searchMatch = !searchTermLower ||
                            wo.workOrderNumber.toLowerCase().includes(searchTermLower) ||
                            wo.assetName.toLowerCase().includes(searchTermLower) ||
                            wo.assetTag.toLowerCase().includes(searchTermLower) ||
                            wo.description.toLowerCase().includes(searchTermLower);

        const statusMatch = !filters.status || filters.status === '__all__' || wo.status === filters.status;
        const typeMatch = !filters.type || filters.type === '__all__' || wo.type === filters.type;
        const priorityMatch = !filters.priority || filters.priority === '__all__' || wo.priority === filters.priority;
        const assignedUserMatch = !filters.assignedUser || filters.assignedUser === '__all__' || wo.assignedUserName === filters.assignedUser; // Simple match for demo

        return searchMatch && statusMatch && typeMatch && priorityMatch && assignedUserMatch;
    });

    // TODO: Add sorting logic if needed

    // Simulate pagination (optional, good for large datasets)
    // const page = filters.page || 1;
    // const limit = filters.limit || 10;
    // const startIndex = (page - 1) * limit;
    // const paginatedData = filteredData.slice(startIndex, startIndex + limit);

    return { workOrders: filteredData, total: filteredData.length };
}

// Mock function to delete a work order
async function deleteWorkOrderAction(woId: string): Promise<{ success: boolean }> {
    console.log(`Attempting to delete work order ${woId}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
}

// Status Badge Helper
const getStatusBadgeVariant = (status: WorkOrderStatus): { variant: "default" | "secondary" | "destructive" | "outline", icon?: React.ElementType, color?: string } => {
    switch (status) {
        case 'Open': return { variant: 'default', icon: AlertCircle, color: 'bg-blue-500 hover:bg-blue-600 text-white' };
        case 'In Progress': return { variant: 'secondary', icon: Hourglass, color: 'bg-yellow-500 hover:bg-yellow-600 text-black' };
        case 'Completed': return { variant: 'default', icon: Check, color: 'bg-green-600 hover:bg-green-700 text-white' };
        case 'Cancelled': return { variant: 'outline', icon: XCircle };
        default: return { variant: 'outline' };
    }
};

// Priority Badge Helper
const getPriorityBadgeVariant = (priority: WorkOrderPriority): { variant: "default" | "secondary" | "destructive" | "outline", color?: string } => {
    switch (priority) {
        case 'High': return { variant: 'destructive' };
        case 'Medium': return { variant: 'default', color: 'bg-orange-500 hover:bg-orange-600 text-white' };
        case 'Low': return { variant: 'secondary' };
        default: return { variant: 'outline' };
    }
};

// Mock User Data for Filter
const mockUsers = [
     { id: 'user1', name: 'João Silva' },
     { id: 'user2', name: 'Maria Oliveira' },
     { id: 'user3', name: 'Carlos Pereira' },
     { id: 'user4', name: 'Ana Costa' },
     { id: 'user5', name: 'Pedro Santos' },
];

export default function WorkOrdersPage() {
    const { toast } = useToast();
    const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        type: '',
        priority: '',
        assignedUser: '',
        // page: 1,
        // limit: 10,
    });
    const [totalWorkOrders, setTotalWorkOrders] = useState(0);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [woToDelete, setWoToDelete] = useState<WorkOrder | null>(null);


    const fetchData = async (currentFilters: typeof filters) => {
        setLoading(true);
        setError(null);
        try {
            const { workOrders: fetchedWOs, total } = await fetchWorkOrders(currentFilters);
            setWorkOrders(fetchedWOs);
            setTotalWorkOrders(total);
        } catch (err) {
            console.error("Error fetching work orders:", err);
            setError("Falha ao carregar as ordens de serviço.");
            setWorkOrders([]);
            setTotalWorkOrders(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(filters);
    }, [filters]);

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value === '__all__' ? '' : value })); // Reset page if paginating
    };

    const handleDeleteRequest = (wo: WorkOrder) => {
        setWoToDelete(wo);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!woToDelete) return;
        const result = await deleteWorkOrderAction(woToDelete.id);
        if (result.success) {
            setWorkOrders(prev => prev.filter(wo => wo.id !== woToDelete.id)); // Remove from state
            setTotalWorkOrders(prev => prev - 1); // Decrement total count
            toast({ title: "Sucesso", description: `Ordem de Serviço ${woToDelete.workOrderNumber} excluída.` });
        } else {
            toast({ title: "Erro", description: "Falha ao excluir a ordem de serviço.", variant: "destructive" });
        }
        setWoToDelete(null);
        setIsDeleteDialogOpen(false);
    };

    return (
        <div className="space-y-6 min-w-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2"><Wrench /> Ordens de Serviço</h1>
                <Button asChild>
                    <Link href="/maintenance/work-orders/new">
                        <PlusCircle className="mr-2 h-4 w-4" /> Nova Ordem de Serviço
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lista de Ordens de Serviço</CardTitle>
                    <CardDescription>Visualize e gerencie todas as ordens de manutenção.</CardDescription>
                    {/* Filter Section */}
                    <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                        <Input
                            placeholder="Buscar por nº, ativo, tag..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="lg:col-span-2 w-full"
                        />
                        <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
                            <SelectTrigger className="w-full"><SelectValue placeholder="Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__all__">Todos Status</SelectItem>
                                <SelectItem value="Open">Aberta</SelectItem>
                                <SelectItem value="In Progress">Em Progresso</SelectItem>
                                <SelectItem value="Completed">Concluída</SelectItem>
                                <SelectItem value="Cancelled">Cancelada</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filters.type} onValueChange={(v) => handleFilterChange('type', v)}>
                            <SelectTrigger className="w-full"><SelectValue placeholder="Tipo" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__all__">Todos Tipos</SelectItem>
                                <SelectItem value="Planned">Planejada</SelectItem>
                                <SelectItem value="Corrective">Corretiva</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filters.priority} onValueChange={(v) => handleFilterChange('priority', v)}>
                            <SelectTrigger className="w-full"><SelectValue placeholder="Prioridade" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__all__">Todas Prioridades</SelectItem>
                                <SelectItem value="Low">Baixa</SelectItem>
                                <SelectItem value="Medium">Média</SelectItem>
                                <SelectItem value="High">Alta</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="hidden sm:table-cell">Nº OS</TableHead>
                                <TableHead>Ativo</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="hidden md:table-cell">Tipo</TableHead>
                                <TableHead>Prioridade</TableHead>
                                <TableHead className="hidden sm:table-cell">Responsável</TableHead>
                                <TableHead className="hidden md:table-cell">Data Reporte</TableHead>
                                <TableHead className="hidden md:table-cell">Prazo</TableHead>
                                <TableHead className="text-right w-[50px]">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {loading && Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={`skel-wo-${i}`}>
                                     <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                                     <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded" /></TableCell>
                                </TableRow>
                             ))}
                             {!loading && workOrders.map((wo) => {
                                 const { variant: statusVariant, icon: StatusIcon, color: statusColor } = getStatusBadgeVariant(wo.status);
                                 const { variant: priorityVariant, color: priorityColor } = getPriorityBadgeVariant(wo.priority);
                                 return (
                                    <TableRow key={wo.id}>
                                         <TableCell className="font-mono text-xs hidden sm:table-cell">{wo.workOrderNumber}</TableCell>
                                        <TableCell>
                                             <div className="font-medium">{wo.assetName}</div>
                                             <div className="text-xs text-muted-foreground">{wo.assetTag}</div>
                                             <div className="text-xs text-muted-foreground sm:hidden">OS: {wo.workOrderNumber}</div>
                                             <div className="text-xs text-muted-foreground md:hidden">Tipo: {wo.type === 'Planned' ? 'Planejada' : 'Corretiva'}</div>
                                             <div className="text-xs text-muted-foreground sm:hidden">Resp: {wo.assignedUserName ?? '-'}</div>
                                             <div className="text-xs text-muted-foreground md:hidden">Reporte: {format(wo.reportedDate, "dd/MM/yy")}</div>
                                             <div className="text-xs text-muted-foreground md:hidden">Prazo: {wo.dueDate ? format(wo.dueDate, "dd/MM/yy") : '-'}</div>
                                        </TableCell>
                                        <TableCell>
                                             <Badge variant={statusVariant} className={cn("flex items-center gap-1 text-xs w-fit", statusColor)}>
                                                 {StatusIcon && <StatusIcon className="h-3 w-3" />}
                                                {wo.status === 'In Progress' ? 'Progresso' : wo.status === 'Open' ? 'Aberta' : wo.status === 'Completed' ? 'Concluída' : 'Cancelada'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">{wo.type === 'Planned' ? 'Planejada' : 'Corretiva'}</TableCell>
                                        <TableCell>
                                             <Badge variant={priorityVariant} className={cn("text-xs", priorityColor)}>
                                                {wo.priority === 'High' ? 'Alta' : wo.priority === 'Medium' ? 'Média' : 'Baixa'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">{wo.assignedUserName ?? '-'}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                                            {format(wo.reportedDate, "dd/MM/yy")}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                                             {wo.dueDate ? format(wo.dueDate, "dd/MM/yy") : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Abrir menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>{wo.workOrderNumber}</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem asChild>
                                                <Link href={`/maintenance/work-orders/${wo.id}`}>
                                                    <Edit className="mr-2 h-4 w-4" /> Detalhes / Editar
                                                </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                                    onSelect={(e) => {
                                                        e.preventDefault();
                                                        handleDeleteRequest(wo);
                                                    }}
                                                     disabled={wo.status === 'Completed' || wo.status === 'Cancelled'} // Prevent deleting completed/cancelled
                                                >
                                                <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                 );
                            })}
                            {!loading && workOrders.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                        {error || "Nenhuma ordem de serviço encontrada para os filtros selecionados."}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                 <CardFooter>
                    <div className="text-xs text-muted-foreground">
                         Mostrando <strong>{workOrders.length}</strong> de <strong>{totalWorkOrders}</strong> ordens de serviço.
                    </div>
                 </CardFooter>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir a Ordem de Serviço "{woToDelete?.workOrderNumber}" para o ativo "{woToDelete?.assetName}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setWoToDelete(null)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Confirmar Exclusão
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}


