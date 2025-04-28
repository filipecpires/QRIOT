
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2, CalendarIcon, Search, ListFilter } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

// Define types
type WorkOrderStatus = 'Open' | 'In Progress' | 'Completed' | 'Cancelled';
type WorkOrderType = 'Planned' | 'Corrective';
type WorkOrderPriority = 'Low' | 'Medium' | 'High';

// Schema for new work order
const workOrderSchema = z.object({
  assetId: z.string().min(1, { message: 'Selecione um ativo.' }),
  type: z.enum(['Planned', 'Corrective'], { required_error: 'Selecione o tipo.' }),
  priority: z.enum(['Low', 'Medium', 'High'], { required_error: 'Selecione a prioridade.' }),
  description: z.string().min(5, { message: 'A descrição deve ter pelo menos 5 caracteres.' }),
  assignedUserId: z.string().optional(),
  dueDate: z.date().optional(),
});

type WorkOrderFormData = z.infer<typeof workOrderSchema>;

// Mock data - replace with actual data fetching
interface SimpleAsset {
    id: string;
    name: string;
    tag: string;
}
interface SimpleUser {
    id: string;
    name: string;
}

async function fetchAssetsForSelect(): Promise<SimpleAsset[]> {
    await new Promise(resolve => setTimeout(resolve, 700));
    return [
        { id: 'ASSET001', name: 'Notebook Dell Latitude 7400', tag: 'TI-NB-001' },
        { id: 'ASSET002', name: 'Monitor LG 27"', tag: 'TI-MN-005' },
        { id: 'ASSET003', name: 'Cadeira de Escritório', tag: 'MOB-CAD-012' },
        { id: 'ASSET004', name: 'Projetor Epson PowerLite', tag: 'TI-PROJ-002' },
        { id: 'ASSET009', name: 'Paleteira Manual', tag: 'ALM-PAL-001' },
    ];
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

export default function NewWorkOrderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [assets, setAssets] = useState<SimpleAsset[]>([]);
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [assetSearchTerm, setAssetSearchTerm] = useState('');

   // Fetch assets and users
   useEffect(() => {
        const loadData = async () => {
            setIsLoadingAssets(true);
            setIsLoadingUsers(true);
            try {
                const [fetchedAssets, fetchedUsers] = await Promise.all([
                    fetchAssetsForSelect(),
                    fetchUsersForSelect()
                ]);
                setAssets(fetchedAssets);
                setUsers(fetchedUsers);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast({ title: "Erro", description: "Não foi possível carregar ativos ou usuários.", variant: "destructive" });
            } finally {
                 setIsLoadingAssets(false);
                 setIsLoadingUsers(false);
            }
        };
        loadData();
    }, [toast]);

    // Filter assets based on search term
    const filteredAssets = assets.filter(asset =>
        asset.name.toLowerCase().includes(assetSearchTerm.toLowerCase()) ||
        asset.tag.toLowerCase().includes(assetSearchTerm.toLowerCase())
    );

  const form = useForm<WorkOrderFormData>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      assetId: '',
      type: undefined,
      priority: 'Medium', // Default priority
      description: '',
      assignedUserId: undefined,
      dueDate: undefined,
    },
  });

  async function onSubmit(data: WorkOrderFormData) {
    setIsLoading(true);
    const workOrderNumber = `WO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`; // Simple WO number generation
    const finalData = {
        ...data,
        workOrderNumber,
        status: 'Open', // Default status
        reportedDate: new Date(),
         assignedUserId: data.assignedUserId === '__none__' ? undefined : data.assignedUserId,
    };
    console.log('Submitting work order data:', finalData);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Replace with actual API call to save the work order
    // try {
    //   const response = await fetch('/api/maintenance/work-orders', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(finalData),
    //   });
    //   if (!response.ok) throw new Error('Failed to save work order');
    //   const result = await response.json();
       toast({
         title: 'Sucesso!',
         description: `Ordem de Serviço ${workOrderNumber} criada com sucesso.`,
         variant: 'default',
       });
       router.push('/maintenance/work-orders'); // Redirect to list page
    // } catch (error) {
    //   console.error('Error saving work order:', error);
    //   toast({
    //     title: 'Erro ao Salvar',
    //     description: 'Não foi possível criar a ordem de serviço. Tente novamente.',
    //     variant: 'destructive',
    //   });
    // } finally {
       setIsLoading(false);
    // }
     // --- REMOVE THIS BLOCK AFTER API IMPLEMENTATION ---
       setIsLoading(false);
    // --- END REMOVE BLOCK ---
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
          <CardTitle>Criar Nova Ordem de Serviço</CardTitle>
          <CardDescription>Preencha as informações para registrar uma nova manutenção.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {/* Asset Selection with Search */}
              <FormField
                control={form.control}
                name="assetId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Ativo</FormLabel>
                    <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoadingAssets}
                    >
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder={isLoadingAssets ? "Carregando ativos..." : "Selecione o ativo"} />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {/* Search Input */}
                             <div className="p-2">
                                <Input
                                    placeholder="Buscar ativo por nome ou tag..."
                                    value={assetSearchTerm}
                                    onChange={(e) => setAssetSearchTerm(e.target.value)}
                                    className="w-full"
                                    disabled={isLoadingAssets}
                                />
                             </div>
                             <SelectGroup>
                                <SelectLabel className="px-2">Ativos Encontrados</SelectLabel>
                                {isLoadingAssets ? (
                                    <SelectItem value="loading" disabled>Carregando...</SelectItem>
                                ) : filteredAssets.length > 0 ? (
                                    filteredAssets.map((asset) => (
                                    <SelectItem key={asset.id} value={asset.id}>
                                        {asset.name} ({asset.tag})
                                    </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="notfound" disabled>Nenhum ativo encontrado</SelectItem>
                                )}
                             </SelectGroup>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />

              {/* Type and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Manutenção</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Planned">Planejada</SelectItem>
                          <SelectItem value="Corrective">Corretiva</SelectItem>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição do Problema / Serviço</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descreva o problema encontrado ou o serviço a ser realizado..." {...field} rows={4}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Assigned User and Due Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                  control={form.control}
                  name="assignedUserId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsável (Opcional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || '__none__'} disabled={isLoadingUsers}>
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
                 <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Prazo de Conclusão (Opcional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: ptBR })
                              ) : (
                                <span>Selecione a data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} // Allow selecting today
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || isLoadingAssets || isLoadingUsers}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Salvar Ordem de Serviço
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
