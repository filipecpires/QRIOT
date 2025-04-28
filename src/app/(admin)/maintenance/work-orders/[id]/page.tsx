
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2, CalendarIcon, Search, ListFilter, XCircle, MessageSquare, FileText, Clock, User, Plus, Trash2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Added Avatar
import { Separator } from '@/components/ui/separator'; // Added Separator

// Define types consistent with list page
type WorkOrderStatus = 'Open' | 'In Progress' | 'Completed' | 'Cancelled';
type WorkOrderType = 'Planned' | 'Corrective';
type WorkOrderPriority = 'Low' | 'Medium' | 'High';

interface WorkOrder {
    id: string;
    workOrderNumber: string;
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
    assignedUserId?: string;
    assignedUserName?: string;
    notes?: WorkOrderNote[]; // Add notes array
}

// Structure for notes
interface WorkOrderNote {
    id: string;
    userId: string;
    userName: string;
    timestamp: Date;
    text: string;
}

// Schema for editing work order (some fields might be restricted based on status)
const workOrderEditSchema = z.object({
  // Fields typically editable regardless of status (unless completed/cancelled)
  priority: z.enum(['Low', 'Medium', 'High'], { required_error: 'Selecione a prioridade.' }),
  description: z.string().min(5, { message: 'A descrição deve ter pelo menos 5 caracteres.' }),
  assignedUserId: z.string().optional(),
  dueDate: z.date().optional(),
  // Status might only be updatable via specific actions (e.g., "Start Work", "Complete Work")
  status: z.enum(['Open', 'In Progress', 'Completed', 'Cancelled'], { required_error: 'Selecione o status.' }),
   completionDate: z.date().optional(), // Only relevant when moving to Completed
}).refine(data => !(data.status === 'Completed' && !data.completionDate), {
    message: 'Data de conclusão é obrigatória para status Concluído.',
    path: ['completionDate'],
});

type WorkOrderEditFormData = z.infer<typeof workOrderEditSchema>;

// Mock data - replace with actual data fetching
interface SimpleUser {
    id: string;
    name: string;
}

// Mock function to fetch detailed work order data
async function fetchWorkOrderData(id: string): Promise<WorkOrder | null> {
    console.log(`Fetching work order with ID: ${id}`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay

    // Example: Find WO from initial list (replace with actual DB fetch)
    const wo = [
        { id: 'wo1', workOrderNumber: 'WO-2024-001', assetId: 'ASSET001', assetTag: 'TI-NB-001', assetName: 'Notebook Dell Latitude 7400', status: 'Open', type: 'Corrective', priority: 'High', description: 'Tela piscando intermitentemente.', reportedDate: new Date(2024, 4, 20), dueDate: new Date(2024, 4, 22), assignedUserId: 'user3', assignedUserName: 'Carlos Pereira', notes: [{id: 'n1', userId:'user1', userName: 'João Silva', timestamp: new Date(2024, 4, 20, 10, 5), text: 'Usuário reportou o problema.'}] },
        { id: 'wo2', workOrderNumber: 'WO-2024-002', assetId: 'ASSET004', assetTag: 'TI-PROJ-002', assetName: 'Projetor Epson PowerLite', status: 'In Progress', type: 'Planned', priority: 'Medium', description: 'Limpeza preventiva da lente e filtro.', reportedDate: new Date(2024, 4, 15), dueDate: new Date(2024, 4, 30), assignedUserId: 'user5', assignedUserName: 'Pedro Santos', notes: [{id: 'n2', userId:'user2', userName: 'Maria Oliveira', timestamp: new Date(2024, 4, 15, 9, 0), text: 'Manutenção preventiva agendada.'}, {id: 'n3', userId:'user5', userName: 'Pedro Santos', timestamp: new Date(2024, 4, 26, 14, 0), text: 'Iniciada limpeza do filtro.'}] },
        { id: 'wo3', workOrderNumber: 'WO-2024-003', assetId: 'ASSET009', assetTag: 'ALM-PAL-001', assetName: 'Paleteira Manual', status: 'Completed', type: 'Corrective', priority: 'Low', description: 'Troca de roda desgastada.', reportedDate: new Date(2024, 4, 10), completionDate: new Date(2024, 4, 12, 16, 30), assignedUserId: 'user3', assignedUserName: 'Carlos Pereira', notes: [{id:'n4', userId:'user3', userName: 'Carlos Pereira', timestamp: new Date(2024, 4, 12, 16, 30), text: 'Roda trocada e testada. OK.'}] },
    ].find(w => w.id === id);

    return wo || null;
}

async function fetchUsersForSelect(): Promise<SimpleUser[]> {
     await new Promise(resolve => setTimeout(resolve, 500));
    return [
        { id: 'user1', name: 'João Silva' },
        { id: 'user2', name: 'Maria Oliveira' },
        { id: 'user3', name: 'Carlos Pereira' },
        { id: 'user4', name: 'Ana Costa' },
        { id: 'user5', name: 'Pedro Santos' },
    ];
}

// Mock function to add a note
async function addWorkOrderNote(woId: string, noteText: string, userId: string): Promise<WorkOrderNote | null> {
    console.log(`Adding note to WO ${woId}: "${noteText}" by User ${userId}`);
    await new Promise(resolve => setTimeout(resolve, 600));
    // Simulate adding to DB and returning the new note with generated ID and timestamp
    const user = await fetchUsersForSelect().then(users => users.find(u => u.id === userId)); // Get user name
    if (!user) return null;
    return {
        id: `note-${Date.now()}`,
        userId: userId,
        userName: user.name,
        timestamp: new Date(),
        text: noteText,
    }
}

function getInitials(name: string = ''): string {
    const names = name.split(' ');
    const firstInitial = names[0]?.[0] ?? '';
    const lastInitial = names.length > 1 ? names[names.length - 1]?.[0] ?? '' : '';
    return `${firstInitial}${lastInitial}`.toUpperCase() || '?';
}

export default function EditWorkOrderPage() {
  const router = useRouter();
  const params = useParams();
  const woId = params.id as string;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  // TODO: Get current user ID from auth context
  const currentUserId = 'user1'; // Example logged-in user

  const form = useForm<WorkOrderEditFormData>({
    resolver: zodResolver(workOrderEditSchema),
    // Default values will be set by useEffect after data fetch
  });

   useEffect(() => {
        const loadUsers = async () => {
            setIsLoadingUsers(true);
             try {
                const fetchedUsers = await fetchUsersForSelect();
                setUsers(fetchedUsers);
            } catch (error) {
                console.error("Error fetching users:", error);
                // Handle error - maybe disable user selection
            } finally {
                setIsLoadingUsers(false);
            }
        };

        const loadWorkOrder = async () => {
            setIsDataLoading(true);
             try {
                const data = await fetchWorkOrderData(woId);
                 if (data) {
                    setWorkOrder(data);
                    form.reset({
                        priority: data.priority,
                        description: data.description,
                        assignedUserId: data.assignedUserId || '__none__',
                        dueDate: data.dueDate,
                        status: data.status,
                        completionDate: data.completionDate,
                    });
                } else {
                    toast({ title: "Erro", description: "Ordem de Serviço não encontrada.", variant: "destructive" });
                    router.replace('/maintenance/work-orders');
                }
            } catch (error) {
                console.error("Error fetching work order:", error);
                 toast({ title: "Erro", description: "Falha ao carregar dados da OS.", variant: "destructive" });
            } finally {
                setIsDataLoading(false);
            }
        };

        if (woId) {
             loadUsers();
             loadWorkOrder();
        } else {
             router.replace('/maintenance/work-orders'); // Redirect if no ID
        }

   }, [woId, form, router, toast]);

  async function onSubmit(data: WorkOrderEditFormData) {
      if (!workOrder) return;
      // Prevent editing completed or cancelled orders directly via form submit
      if (workOrder.status === 'Completed' || workOrder.status === 'Cancelled') {
          toast({title: "Ação Inválida", description: "Não é possível editar Ordens de Serviço concluídas ou canceladas.", variant:"destructive"});
          return;
      }
    setIsLoading(true);
    const finalData = {
        ...data,
         assignedUserId: data.assignedUserId === '__none__' ? undefined : data.assignedUserId,
    };
    console.log('Updating work order data:', finalData);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Replace with actual API call to update the work order
    // try {
    //   const response = await fetch(`/api/maintenance/work-orders/${woId}`, {
    //     method: 'PUT', // or PATCH
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(finalData),
    //   });
    //   if (!response.ok) throw new Error('Failed to update work order');
    //   const result = await response.json();
       toast({
         title: 'Sucesso!',
         description: `Ordem de Serviço ${workOrder.workOrderNumber} atualizada.`,
         variant: 'default',
       });
       // Optionally refetch data or update local state more granularly
       const updatedWO = await fetchWorkOrderData(woId); // Refetch after update
       if(updatedWO) setWorkOrder(updatedWO);
    // } catch (error) {
    //   console.error('Error updating work order:', error);
    //   toast({
    //     title: 'Erro ao Atualizar',
    //     description: 'Não foi possível atualizar a ordem de serviço.',
    //     variant: 'destructive',
    //   });
    // } finally {
       setIsLoading(false);
    // }
       // --- REMOVE THIS BLOCK AFTER API IMPLEMENTATION ---
       setWorkOrder(prev => prev ? { ...prev, ...finalData, assignedUserName: users.find(u=>u.id === finalData.assignedUserId)?.name } : null); // Optimistic update
       setIsLoading(false);
      // --- END REMOVE BLOCK ---
  }

    const handleAddNote = async () => {
        if (!newNote.trim() || !workOrder) return;
        setIsAddingNote(true);
        try {
            const addedNote = await addWorkOrderNote(woId, newNote, currentUserId);
            if (addedNote) {
                setWorkOrder(prev => prev ? { ...prev, notes: [...(prev.notes || []), addedNote] } : null);
                setNewNote(''); // Clear input
                toast({ title: "Nota Adicionada", description: "Sua nota foi registrada com sucesso." });
            } else {
                 throw new Error("Falha ao salvar a nota.");
            }
        } catch (error) {
             console.error("Error adding note:", error);
             toast({ title: "Erro", description: "Não foi possível adicionar a nota.", variant: "destructive" });
        } finally {
             setIsAddingNote(false);
        }
    };

    // Helper to check if form should be disabled based on status
     const isFormDisabled = workOrder?.status === 'Completed' || workOrder?.status === 'Cancelled';


  if (isDataLoading || isLoadingUsers) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32 mb-4" />
        <Card>
            <CardHeader>
                <Skeleton className="h-7 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                 </div>
                <Skeleton className="h-24 w-full" />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                 </div>
                  <Skeleton className="h-10 w-full" />
                   <Skeleton className="h-10 w-full" />
                    {/* Notes Skeleton */}
                    <Separator />
                     <Skeleton className="h-6 w-1/3 mb-4" />
                     <Skeleton className="h-16 w-full" />
                     <Skeleton className="h-10 w-full" />
                     <Skeleton className="h-10 w-32" />
            </CardContent>
            <CardFooter>
                <Skeleton className="h-10 w-24" />
            </CardFooter>
        </Card>
      </div>
    );
  }

   if (!workOrder) {
    return <div className="text-center text-destructive">Ordem de Serviço não encontrada.</div>;
  }


  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" asChild className="mb-4">
        <Link href="/maintenance/work-orders">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista
        </Link>
      </Button>

      <Card>
         <CardHeader>
             <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                <div>
                     <CardTitle className="text-2xl">OS: {workOrder.workOrderNumber}</CardTitle>
                    <CardDescription>Detalhes da Ordem de Serviço para: <Link href={`/assets/${workOrder.assetId}/edit`} className="text-primary hover:underline">{workOrder.assetName} ({workOrder.assetTag})</Link></CardDescription>
                 </div>
                <Badge variant="secondary" className="w-fit text-sm">{workOrder.type === 'Planned' ? 'Planejada' : 'Corretiva'}</Badge>
             </div>
             <div className="text-xs text-muted-foreground mt-2">
                Reportada em: {format(workOrder.reportedDate, "dd/MM/yyyy HH:mm")}
             </div>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {/* Editable Fields */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isFormDisabled}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="Open">Aberta</SelectItem>
                                <SelectItem value="In Progress">Em Progresso</SelectItem>
                                <SelectItem value="Completed">Concluída</SelectItem>
                                <SelectItem value="Cancelled">Cancelada</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridade</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isFormDisabled}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a prioridade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Low">Baixa</SelectItem>
                          <SelectItem value="Medium">Média</SelectItem>
                          <SelectItem value="High">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="assignedUserId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsável</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || '__none__'} disabled={isLoadingUsers || isFormDisabled}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingUsers ? "Carregando..." : "Selecione o responsável"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="__none__">Ninguém atribuído</SelectItem>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

               <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição do Problema / Serviço</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={4} disabled={isFormDisabled}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Prazo de Conclusão</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              disabled={isFormDisabled}
                            >
                              {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) || isFormDisabled}
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 {/* Completion Date (only visible/required if status is Completed) */}
                 {form.watch('status') === 'Completed' && (
                     <FormField
                      control={form.control}
                      name="completionDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Data de Conclusão</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                  disabled={isFormDisabled}
                                >
                                  {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={isFormDisabled} // Allow past dates for completion
                                initialFocus
                                locale={ptBR}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                 )}
               </div>

                <Separator />

                {/* Notes Section */}
                 <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><MessageSquare /> Notas e Histórico</h3>
                     <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-3">
                        {(workOrder.notes && workOrder.notes.length > 0) ? workOrder.notes
                            .sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()) // Sort notes newest first
                            .map(note => (
                            <div key={note.id} className="flex items-start gap-3 text-sm p-3 border rounded-md bg-muted/50">
                                <Avatar className="h-8 w-8 border">
                                     {/* Basic avatar logic */}
                                    <AvatarFallback>{getInitials(note.userName)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                     <p className="font-medium">{note.userName}</p>
                                     <p className="text-muted-foreground whitespace-pre-wrap">{note.text}</p>
                                     <p className="text-xs text-muted-foreground mt-1" title={format(note.timestamp, "Pp", { locale: ptBR })}>
                                        {formatDistanceToNow(note.timestamp, { addSuffix: true, locale: ptBR })}
                                    </p>
                                </div>
                            </div>
                         )) : (
                            <p className="text-muted-foreground text-center">Nenhuma nota registrada.</p>
                         )}
                     </div>
                     {/* Add Note Input */}
                     {!isFormDisabled && (
                         <div className="space-y-2">
                            <Label htmlFor="new-note">Adicionar Nota</Label>
                            <Textarea
                                id="new-note"
                                placeholder="Digite sua nota aqui..."
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                rows={3}
                                disabled={isAddingNote}
                            />
                            <Button type="button" onClick={handleAddNote} disabled={isAddingNote || !newNote.trim()}>
                                {isAddingNote ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                Adicionar Nota
                            </Button>
                        </div>
                     )}
                 </div>

            </CardContent>
             <CardFooter className="flex justify-end">
                 <Button type="submit" disabled={isLoading || isFormDisabled}>
                    {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
                    </>
                    ) : (
                    <>
                        <Save className="mr-2 h-4 w-4" /> Salvar Alterações
                    </>
                    )}
                </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}

