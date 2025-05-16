
'use client';

import { useState, useCallback, ChangeEvent, DragEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2, Plus, Trash2, UploadCloud, X, Building, CalendarDays, DollarSign, Link as LinkIcon, Wrench, PackageSearch, Award } from 'lucide-react'; 
import { Checkbox } from '@/components/ui/checkbox';
import { cn, generateAssetTag } from '@/lib/utils'; 
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale'; 
import { Separator } from '@/components/ui/separator';


// Schema for individual attachment
const attachmentSchema = z.object({
  id: z.string().optional(), 
  name: z.string().min(1, { message: 'Nome do anexo é obrigatório.' }),
  url: z.string().url({ message: 'URL inválida.' }),
  isPublic: z.boolean().default(false),
});


const assetSchema = z.object({
  name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres.' }),
  category: z.string().min(1, { message: 'Selecione uma categoria.' }),
  tag: z.string()
    .length(5, { message: 'A tag deve ter 5 caracteres.' }) 
    .regex(/^[A-Z0-9]+$/, { message: 'A tag deve conter apenas letras maiúsculas e números.'}) 
    .describe('A tag única é gerada automaticamente pelo sistema.'), 
  locationId: z.string().min(1, { message: 'Selecione um local.' }),
  responsibleUserId: z.string().min(1, { message: 'Selecione um responsável.' }),
  parentId: z.string().optional(),
  ownershipType: z.enum(['own', 'rented'], { required_error: 'Selecione o tipo de propriedade.' }).default('own'),
  rentalCompany: z.string().optional(),
  rentalStartDate: z.date().optional(),
  rentalEndDate: z.date().optional(),
  rentalCost: z.number().optional(),
  characteristics: z.array(z.object({
      key: z.string().min(1, { message: 'Nome da característica é obrigatório.'}),
      value: z.string().min(1, { message: 'Valor da característica é obrigatório.'}),
      isPublic: z.boolean().default(false),
  })).optional(),
  attachments: z.array(attachmentSchema).optional(), 
  description: z.string().optional(),
  status: z.enum(['active', 'lost', 'inactive', 'maintenance']).default('active'),

  // New fields for Expiration Schedule
  lastMaintenanceDate: z.date().optional(),
  nextMaintenanceDate: z.date().optional(),
  maintenanceIntervalDays: z.number().int().min(0).optional().nullable(),
  certificationName: z.string().optional(),
  certificationExpiryDate: z.date().optional(),
  warrantyExpiryDate: z.date().optional(),
  lastInventoryDate: z.date().optional(),
  nextInventoryDate: z.date().optional(),
  inventoryIntervalDays: z.number().int().min(0).optional().nullable(),

}).refine(data => {
    if (data.ownershipType === 'rented') {
        return !!data.rentalCompany && !!data.rentalStartDate && !!data.rentalEndDate;
    }
    return true;
}, {
    message: 'Empresa locadora, data de início e término são obrigatórios para ativos alugados.',
    path: ['rentalCompany'], 
}).refine(data => {
    if (data.ownershipType === 'rented' && data.rentalStartDate && data.rentalEndDate) {
        return data.rentalEndDate >= data.rentalStartDate;
    }
    return true;
}, {
    message: 'Data de término deve ser igual ou posterior à data de início.',
    path: ['rentalEndDate'],
});


type AssetFormData = z.infer<typeof assetSchema>;
type Attachment = z.infer<typeof attachmentSchema>;


const categories = ['Eletrônicos', 'Mobiliário', 'Ferramentas', 'Veículos', 'Outros'];
const locations = [
  { id: 'loc1', name: 'Escritório 1' },
  { id: 'loc2', name: 'Escritório 2' },
  { id: 'loc3', name: 'Sala de Reuniões' },
  { id: 'loc4', name: 'Sala de Treinamento' },
  { id: 'loc5', name: 'Almoxarifado' },
];
const users = [
  { id: 'user1', name: 'João Silva' },
  { id: 'user2', name: 'Maria Oliveira' },
  { id: 'user3', name: 'Carlos Pereira' },
  { id: 'user4', name: 'Ana Costa' },
];


async function fetchAssetsForParent(): Promise<{ id: string; name: string; tag: string }[]> {
  await new Promise(resolve => setTimeout(resolve, 500)); 
  return [
    { id: 'ASSET001', name: 'Notebook Dell Latitude 7400', tag: 'TI-NB-001' },
    { id: 'ASSET002', name: 'Monitor LG 27"', tag: 'TI-MN-005' },
    { id: 'ASSET003', name: 'Cadeira de Escritório', tag: 'MOB-CAD-012' },
    { id: 'ASSET004', name: 'Projetor Epson PowerLite', tag: 'TI-PROJ-002' },
  ];
}


export default function NewAssetPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [characteristics, setCharacteristics] = useState<{ key: string; value: string; isPublic: boolean }[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [parentAssets, setParentAssets] = useState<{ id: string; name: string; tag: string }[]>([]);
  const [isLoadingParents, setIsLoadingParents] = useState(true);
  const [newAttachmentName, setNewAttachmentName] = useState('');
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('');

  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: '',
      category: '',
      tag: '', 
      locationId: '',
      responsibleUserId: '',
      parentId: '__none__',
      ownershipType: 'own', 
      rentalCompany: '',
      rentalStartDate: undefined,
      rentalEndDate: undefined,
      rentalCost: undefined,
      characteristics: [],
      attachments: [], 
      description: '',
      status: 'active',
      // Defaults for new schedule fields
      lastMaintenanceDate: undefined,
      nextMaintenanceDate: undefined,
      maintenanceIntervalDays: null,
      certificationName: '',
      certificationExpiryDate: undefined,
      warrantyExpiryDate: undefined,
      lastInventoryDate: undefined,
      nextInventoryDate: undefined,
      inventoryIntervalDays: null,
    },
  });

  const { fields: attachmentFields, append: appendAttachment, remove: removeAttachment } = useFieldArray({
    control: form.control,
    name: "attachments",
  });

   useEffect(() => {
    const loadParentAssets = async () => {
      setIsLoadingParents(true);
      try {
        const assets = await fetchAssetsForParent();
        setParentAssets(assets);
      } catch (error) {
        console.error("Error fetching parent assets:", error);
        toast({ title: "Erro", description: "Não foi possível carregar a lista de ativos pais.", variant: "destructive" });
      } finally {
        setIsLoadingParents(false);
      }
    };
    loadParentAssets();
   }, [toast]);

   const ownershipType = form.watch('ownershipType'); 

   const addCharacteristic = () => {
    setCharacteristics([...characteristics, { key: '', value: '', isPublic: false }]);
    form.setValue('characteristics', [...characteristics, { key: '', value: '', isPublic: false }]);
   };

   const removeCharacteristic = (index: number) => {
    const updatedCharacteristics = characteristics.filter((_, i) => i !== index);
    setCharacteristics(updatedCharacteristics);
    form.setValue('characteristics', updatedCharacteristics);
   };

   const handleCharacteristicChange = (index: number, field: 'key' | 'value' | 'isPublic', value: string | boolean) => {
      const updatedCharacteristics = [...characteristics];
      if (field === 'isPublic') {
         updatedCharacteristics[index][field] = value as boolean;
      } else {
         updatedCharacteristics[index][field] = value as string;
      }
      setCharacteristics(updatedCharacteristics);
      form.setValue('characteristics', updatedCharacteristics);
   };

    const handleAddAttachment = () => {
        if (newAttachmentName && newAttachmentUrl) {
            try {
                new URL(newAttachmentUrl);
                appendAttachment({ name: newAttachmentName, url: newAttachmentUrl, isPublic: false });
                setNewAttachmentName('');
                setNewAttachmentUrl('');
            } catch (_) {
                toast({ title: "URL Inválida", description: "Por favor, insira uma URL válida para o anexo.", variant: "destructive" });
            }
        } else {
             toast({ title: "Campos Incompletos", description: "Preencha o nome e a URL do anexo.", variant: "destructive" });
        }
    };

   const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
     if (event.target.files) {
       const files = Array.from(event.target.files);
       setSelectedFiles(prev => [...prev, ...files.filter(file => file.type.startsWith('image/'))]); 
     }
   };

   const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
     event.preventDefault();
     setIsDragging(true);
   };

   const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
     event.preventDefault();
     setIsDragging(false);
   };

   const handleDrop = (event: DragEvent<HTMLDivElement>) => {
     event.preventDefault();
     setIsDragging(false);
     if (event.dataTransfer.files) {
       const files = Array.from(event.dataTransfer.files);
       setSelectedFiles(prev => [...prev, ...files.filter(file => file.type.startsWith('image/'))]);
     }
   };

   const removeFile = (index: number) => {
     setSelectedFiles(prev => prev.filter((_, i) => i !== index));
   };

  async function onSubmit(data: AssetFormData) {
    setIsLoading(true);
    const generatedTag = generateAssetTag(); 
    const cleanedData = data.ownershipType === 'own'
        ? { ...data, rentalCompany: undefined, rentalStartDate: undefined, rentalEndDate: undefined, rentalCost: undefined }
        : { ...data };

    const dataToSave = {
        ...cleanedData,
        tag: generatedTag, 
        parentId: cleanedData.parentId === '__none__' ? undefined : cleanedData.parentId,
        maintenanceIntervalDays: data.maintenanceIntervalDays === null ? undefined : data.maintenanceIntervalDays,
        inventoryIntervalDays: data.inventoryIntervalDays === null ? undefined : data.inventoryIntervalDays,
    };
    console.log('Data prepared for saving:', dataToSave);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast({
         title: 'Sucesso!',
         description: `Ativo "${data.name}" cadastrado com a tag ${generatedTag}.`, 
         variant: 'default',
    });
    router.push('/assets'); 
    setIsLoading(false);
  }

  return (
    <div className="space-y-6"> 
      <Button variant="outline" size="sm" asChild className="mb-4">
        <Link href="/assets">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista
        </Link>
      </Button>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                        <CardTitle>Informações Principais</CardTitle>
                        <CardDescription>Preencha as informações detalhadas do ativo. A tag será gerada automaticamente.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                        {/* Basic Info Fields */}
                        <div className="grid grid-cols-1 gap-6"> 
                            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Nome do Ativo</FormLabel> <FormControl> <Input placeholder="Ex: Notebook Dell Latitude 7400" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField control={form.control} name="category" render={({ field }) => ( <FormItem> <FormLabel>Categoria</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl> <SelectTrigger> <SelectValue placeholder="Selecione a categoria" /> </SelectTrigger> </FormControl> <SelectContent> {categories.map((cat) => ( <SelectItem key={cat} value={cat}>{cat}</SelectItem> ))} </SelectContent> </Select> <FormMessage /> </FormItem> )}/>
                            <FormField control={form.control} name="locationId" render={({ field }) => ( <FormItem> <FormLabel>Local de Instalação</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl> <SelectTrigger> <SelectValue placeholder="Selecione o local" /> </SelectTrigger> </FormControl> <SelectContent> {locations.map((loc) => ( <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem> ))} <SelectItem value="__new__">-- Criar Novo Local --</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem> )}/>
                            <FormField control={form.control} name="responsibleUserId" render={({ field }) => ( <FormItem> <FormLabel>Responsável</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl> <SelectTrigger> <SelectValue placeholder="Selecione o responsável" /> </SelectTrigger> </FormControl> <SelectContent> {users.map((user) => ( <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem> ))} <SelectItem value="__new__">-- Criar Novo Usuário --</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem> )}/>
                        </div>
                        <FormField control={form.control} name="parentId" render={({ field }) => ( <FormItem> <FormLabel>Ativo Pai (Opcional)</FormLabel> <Select onValueChange={field.onChange} value={field.value || '__none__'} disabled={isLoadingParents}> <FormControl> <SelectTrigger> <SelectValue placeholder={isLoadingParents ? "Carregando ativos..." : "Selecione um ativo pai (se aplicável)"} /> </SelectTrigger> </FormControl> <SelectContent> <SelectItem value="__none__">Nenhum</SelectItem> {parentAssets.map((asset) => ( <SelectItem key={asset.id} value={asset.id}> {asset.name} ({asset.tag}) </SelectItem> ))} </SelectContent> </Select> <FormDescription>Vincule este ativo a outro já existente (ex: monitor a um computador).</FormDescription> <FormMessage /> </FormItem> )}/>
                        <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Descrição / Observações</FormLabel> <FormControl> <Textarea placeholder="Detalhes adicionais sobre o ativo..." {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Propriedade e Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <FormField control={form.control} name="ownershipType" render={({ field }) => ( <FormItem className="space-y-3"> <FormLabel>Tipo de Propriedade</FormLabel> <FormControl> <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0" > <FormItem className="flex items-center space-x-2"> <FormControl> <RadioGroupItem value="own" /> </FormControl> <FormLabel className="font-normal">Próprio</FormLabel> </FormItem> <FormItem className="flex items-center space-x-2"> <FormControl> <RadioGroupItem value="rented" /> </FormControl> <FormLabel className="font-normal">Alugado</FormLabel> </FormItem> </RadioGroup> </FormControl> <FormMessage /> </FormItem> )}/>
                            {ownershipType === 'rented' && (
                                <Card className="p-4 bg-muted/30 border-dashed">
                                <CardDescription className="mb-4">Informações da Locação</CardDescription>
                                <div className="space-y-4">
                                    <FormField control={form.control} name="rentalCompany" render={({ field }) => ( <FormItem> <FormLabel>Empresa Locadora</FormLabel> <FormControl> <Input placeholder="Nome da empresa" {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField control={form.control} name="rentalStartDate" render={({ field }) => ( <FormItem className="flex flex-col"> <FormLabel>Data Início Locação</FormLabel> <Popover> <PopoverTrigger asChild> <FormControl> <Button variant={"outline"} className={cn( "w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground" )} > {field.value ? ( format(field.value, "PPP", { locale: ptBR }) ) : ( <span>Selecione a data</span> )} <CalendarDays className="ml-auto h-4 w-4 opacity-50" /> </Button> </FormControl> </PopoverTrigger> <PopoverContent className="w-auto p-0" align="start"> <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date("1900-01-01")} initialFocus locale={ptBR} /> </PopoverContent> </Popover> <FormMessage /> </FormItem> )}/>
                                    <FormField control={form.control} name="rentalEndDate" render={({ field }) => ( <FormItem className="flex flex-col"> <FormLabel>Data Fim Locação</FormLabel> <Popover> <PopoverTrigger asChild> <FormControl> <Button variant={"outline"} className={cn( "w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground" )} > {field.value ? ( format(field.value, "PPP", { locale: ptBR }) ) : ( <span>Selecione a data</span> )} <CalendarDays className="ml-auto h-4 w-4 opacity-50" /> </Button> </FormControl> </PopoverTrigger> <PopoverContent className="w-auto p-0" align="start"> <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < (form.getValues('rentalStartDate') || new Date("1900-01-01")) } initialFocus locale={ptBR} /> </PopoverContent> </Popover> <FormMessage /> </FormItem> )}/>
                                    </div>
                                    <FormField control={form.control} name="rentalCost" render={({ field }) => ( <FormItem> <FormLabel>Valor do Aluguel (Mensal, Opcional)</FormLabel> <div className="relative"> <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /> <FormControl> <Input type="number" step="0.01" placeholder="150.00" className="pl-8" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /> </FormControl> </div> <FormMessage /> </FormItem> )}/>
                                </div>
                                <FormMessage>{form.formState.errors.rentalCompany?.message}</FormMessage>
                                <FormMessage>{form.formState.errors.rentalEndDate?.message}</FormMessage>
                                </Card>
                            )}
                             <FormField control={form.control} name="status" render={({ field }) => ( <FormItem> <FormLabel>Status do Ativo</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl> <SelectTrigger> <SelectValue placeholder="Selecione o status" /> </SelectTrigger> </FormControl> <SelectContent> <SelectItem value="active">Ativo</SelectItem> <SelectItem value="lost">Perdido</SelectItem> <SelectItem value="inactive">Inativo</SelectItem> <SelectItem value="maintenance">Em Manutenção</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem> )}/>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Datas e Agendamentos</CardTitle>
                            <CardDescription>Gerencie prazos de manutenção, garantia, certificações e inventário.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             {/* Maintenance Fields */}
                            <div className="space-y-2 p-3 border rounded-md bg-muted/20">
                                <Label className="font-medium flex items-center gap-1"><Wrench className="h-4 w-4 text-primary"/>Manutenção</Label>
                                <FormField control={form.control} name="lastMaintenanceDate" render={({ field }) => ( <FormItem className="flex flex-col"> <FormLabel className="text-xs">Última Manutenção</FormLabel> <Popover> <PopoverTrigger asChild> <FormControl> <Button variant="outline" size="sm" className={cn("w-full justify-start text-left font-normal text-xs", !field.value && "text-muted-foreground")}> <CalendarDays className="mr-1 h-3 w-3" /> {field.value ? format(field.value, "dd/MM/yy") : <span>Nenhuma</span>} </Button> </FormControl> </PopoverTrigger> <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} locale={ptBR} /></PopoverContent> </Popover> <FormMessage /> </FormItem> )}/>
                                <FormField control={form.control} name="nextMaintenanceDate" render={({ field }) => ( <FormItem className="flex flex-col"> <FormLabel className="text-xs">Próxima Manutenção</FormLabel> <Popover> <PopoverTrigger asChild> <FormControl> <Button variant="outline" size="sm" className={cn("w-full justify-start text-left font-normal text-xs", !field.value && "text-muted-foreground")}> <CalendarDays className="mr-1 h-3 w-3" /> {field.value ? format(field.value, "dd/MM/yy") : <span>Não agendada</span>} </Button> </FormControl> </PopoverTrigger> <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} locale={ptBR} /></PopoverContent> </Popover> <FormMessage /> </FormItem> )}/>
                                <FormField control={form.control} name="maintenanceIntervalDays" render={({ field }) => ( <FormItem> <FormLabel className="text-xs">Intervalo (dias)</FormLabel> <FormControl><Input type="number" placeholder="Ex: 90" {...field} onChange={e => field.onChange(parseInt(e.target.value) || null)} value={field.value ?? ""} className="h-8 text-xs" /></FormControl> <FormMessage /> </FormItem> )}/>
                            </div>

                            {/* Warranty Field */}
                             <div className="space-y-2 p-3 border rounded-md bg-muted/20">
                                <Label className="font-medium flex items-center gap-1"><CalendarDays className="h-4 w-4 text-primary"/>Garantia</Label>
                                <FormField control={form.control} name="warrantyExpiryDate" render={({ field }) => ( <FormItem className="flex flex-col"> <FormLabel className="text-xs">Data de Expiração da Garantia</FormLabel> <Popover> <PopoverTrigger asChild> <FormControl> <Button variant="outline" size="sm" className={cn("w-full justify-start text-left font-normal text-xs", !field.value && "text-muted-foreground")}> <CalendarDays className="mr-1 h-3 w-3" /> {field.value ? format(field.value, "dd/MM/yy") : <span>Não definida</span>} </Button> </FormControl> </PopoverTrigger> <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} locale={ptBR} /></PopoverContent> </Popover> <FormMessage /> </FormItem> )}/>
                            </div>
                            
                            {/* Certification Fields */}
                             <div className="space-y-2 p-3 border rounded-md bg-muted/20">
                                <Label className="font-medium flex items-center gap-1"><Award className="h-4 w-4 text-primary"/>Certificação</Label> 
                                <FormField control={form.control} name="certificationName" render={({ field }) => ( <FormItem> <FormLabel className="text-xs">Nome da Certificação</FormLabel> <FormControl><Input placeholder="Ex: ISO 9001, NR-12" {...field} className="h-8 text-xs" /></FormControl> <FormMessage /> </FormItem> )}/>
                                <FormField control={form.control} name="certificationExpiryDate" render={({ field }) => ( <FormItem className="flex flex-col"> <FormLabel className="text-xs">Data de Expiração</FormLabel> <Popover> <PopoverTrigger asChild> <FormControl> <Button variant="outline" size="sm" className={cn("w-full justify-start text-left font-normal text-xs", !field.value && "text-muted-foreground")}> <CalendarDays className="mr-1 h-3 w-3" /> {field.value ? format(field.value, "dd/MM/yy") : <span>Não definida</span>} </Button> </FormControl> </PopoverTrigger> <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} locale={ptBR} /></PopoverContent> </Popover> <FormMessage /> </FormItem> )}/>
                            </div>

                            {/* Inventory Fields */}
                             <div className="space-y-2 p-3 border rounded-md bg-muted/20">
                                <Label className="font-medium flex items-center gap-1"><PackageSearch className="h-4 w-4 text-primary"/>Inventário</Label>
                                <FormField control={form.control} name="lastInventoryDate" render={({ field }) => ( <FormItem className="flex flex-col"> <FormLabel className="text-xs">Último Inventário</FormLabel> <Popover> <PopoverTrigger asChild> <FormControl> <Button variant="outline" size="sm" className={cn("w-full justify-start text-left font-normal text-xs", !field.value && "text-muted-foreground")}> <CalendarDays className="mr-1 h-3 w-3" /> {field.value ? format(field.value, "dd/MM/yy") : <span>Nenhum</span>} </Button> </FormControl> </PopoverTrigger> <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} locale={ptBR} /></PopoverContent> </Popover> <FormMessage /> </FormItem> )}/>
                                <FormField control={form.control} name="nextInventoryDate" render={({ field }) => ( <FormItem className="flex flex-col"> <FormLabel className="text-xs">Próximo Inventário</FormLabel> <Popover> <PopoverTrigger asChild> <FormControl> <Button variant="outline" size="sm" className={cn("w-full justify-start text-left font-normal text-xs", !field.value && "text-muted-foreground")}> <CalendarDays className="mr-1 h-3 w-3" /> {field.value ? format(field.value, "dd/MM/yy") : <span>Não agendado</span>} </Button> </FormControl> </PopoverTrigger> <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} locale={ptBR} /></PopoverContent> </Popover> <FormMessage /> </FormItem> )}/>
                                <FormField control={form.control} name="inventoryIntervalDays" render={({ field }) => ( <FormItem> <FormLabel className="text-xs">Intervalo (dias)</FormLabel> <FormControl><Input type="number" placeholder="Ex: 365" {...field} onChange={e => field.onChange(parseInt(e.target.value) || null)} value={field.value ?? ""} className="h-8 text-xs" /></FormControl> <FormMessage /> </FormItem> )}/>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Características Adicionais</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            {characteristics.map((char, index) => (
                                <div key={index} className="flex flex-col sm:flex-row sm:items-end gap-2 mb-3 p-3 border rounded-md bg-muted/50">
                                    <div className="flex-grow space-y-2 sm:space-y-0 sm:flex sm:gap-2 w-full">
                                        <FormField control={form.control} name={`characteristics.${index}.key`} render={({ field }) => ( <FormItem className="flex-1 min-w-0"> <FormLabel>Característica</FormLabel> <FormControl> <Input placeholder="Ex: Voltagem" value={char.key} onChange={(e) => handleCharacteristicChange(index, 'key', e.target.value)} /> </FormControl> <FormMessage /> </FormItem> )}/>
                                        <FormField control={form.control} name={`characteristics.${index}.value`} render={({ field }) => ( <FormItem className="flex-1 min-w-0"> <FormLabel>Valor</FormLabel> <FormControl> <Input placeholder="Ex: 220V" value={char.value} onChange={(e) => handleCharacteristicChange(index, 'value', e.target.value)} /> </FormControl> <FormMessage /> </FormItem> )}/>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-start gap-2 pt-2 sm:pt-0 sm:pb-1 w-full sm:w-auto">
                                        <FormField control={form.control} name={`characteristics.${index}.isPublic`} render={({ field }) => ( <FormItem className="flex items-center space-x-2"> <FormControl> <Checkbox checked={char.isPublic} onCheckedChange={(checked) => handleCharacteristicChange(index, 'isPublic', !!checked)} /> </FormControl> <FormLabel className="text-sm font-normal !mt-0"> Visível publicamente? </FormLabel> <FormMessage /> </FormItem> )}/>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeCharacteristic(index)} className="text-destructive hover:bg-destructive/10" title="Remover Característica" > <Trash2 className="h-4 w-4" /> </Button>
                                    </div>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={addCharacteristic}> <Plus className="mr-2 h-4 w-4" /> Adicionar Característica </Button>
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader><CardTitle>Fotos e Anexos</CardTitle></CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Fotos do Ativo</h3>
                                <div className={cn( "relative border-2 border-dashed border-border rounded-md p-6 text-center transition-colors duration-200 ease-in-out", isDragging ? 'border-primary bg-accent/10' : 'bg-muted/20' )} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} >
                                <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2"/>
                                <p className="text-muted-foreground text-sm mb-1"> Arraste e solte as fotos aqui ou </p>
                                <Label htmlFor="file-upload" className="text-primary font-medium cursor-pointer hover:underline"> clique para selecionar </Label>
                                <Input id="file-upload" type="file" multiple accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} />
                                <p className="text-xs text-muted-foreground mt-2">Apenas imagens são permitidas.</p>
                                </div>
                                {selectedFiles.length > 0 && (
                                <div className="mt-4 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {selectedFiles.map((file, index) => (
                                    <div key={index} className="relative group border rounded-md overflow-hidden aspect-square">
                                        <Image src={URL.createObjectURL(file)} alt={`Preview ${index + 1}`} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw" onLoad={() => URL.revokeObjectURL(URL.createObjectURL(file))} />
                                        <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity p-0" onClick={() => removeFile(index)} title="Remover Imagem" > <X className="h-3 w-3" /> </Button>
                                    </div>
                                    ))}
                                </div>
                                )}
                            </div>
                             <div>
                                <h3 className="text-lg font-semibold mb-2">Anexos (Links Externos)</h3>
                                {attachmentFields.map((field, index) => (
                                <div key={field.id} className="flex flex-col sm:flex-row sm:items-end gap-2 mb-3 p-3 border rounded-md bg-muted/50">
                                    <div className="flex-grow space-y-2 sm:space-y-0 sm:flex sm:gap-2 w-full">
                                        <FormField control={form.control} name={`attachments.${index}.name`} render={({ field: inputField }) => ( <FormItem className="flex-1 min-w-0"> <FormLabel>Nome</FormLabel> <FormControl> <Input {...inputField} /> </FormControl> <FormMessage /> </FormItem> )}/>
                                        <FormField control={form.control} name={`attachments.${index}.url`} render={({ field: inputField }) => ( <FormItem className="flex-1 min-w-0"> <FormLabel>URL</FormLabel> <FormControl> <Input {...inputField} /> </FormControl> <FormMessage /> </FormItem> )}/>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-start gap-2 pt-2 sm:pt-0 sm:pb-1 w-full sm:w-auto">
                                        <FormField control={form.control} name={`attachments.${index}.isPublic`} render={({ field: checkboxField }) => ( <FormItem className="flex flex-col items-center space-y-1"> <FormLabel className="text-xs font-normal">Público?</FormLabel> <FormControl> <Checkbox checked={checkboxField.value} onCheckedChange={checkboxField.onChange} /> </FormControl> <FormMessage /> </FormItem> )}/>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeAttachment(index)} className="text-destructive hover:bg-destructive/10" title="Remover Anexo" > <Trash2 className="h-4 w-4" /> </Button>
                                    </div>
                                </div>
                                ))}
                                <div className="flex flex-col sm:flex-row sm:items-end gap-2 mt-4">
                                    <div className="w-full sm:flex-1"> <Label htmlFor="new-attachment-name">Nome do Novo Anexo</Label> <Input id="new-attachment-name" placeholder="Ex: Manual de Instruções" value={newAttachmentName} onChange={(e) => setNewAttachmentName(e.target.value)} /> </div>
                                    <div className="w-full sm:flex-1"> <Label htmlFor="new-attachment-url">Link do Anexo</Label> <Input id="new-attachment-url" placeholder="https://..." value={newAttachmentUrl} onChange={(e) => setNewAttachmentUrl(e.target.value)} /> </div>
                                    <Button type="button" variant="outline" size="sm" onClick={handleAddAttachment} className="w-full sm:w-auto"> <LinkIcon className="mr-2 h-4 w-4" /> Adicionar Anexo </Button>
                                </div>
                                <FormDescription>Adicione links para manuais, notas fiscais, etc.</FormDescription>
                                {form.formState.errors.attachments && ( <FormMessage>{form.formState.errors.attachments.message}</FormMessage> )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <CardFooter className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? ( <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> ) : ( <><Save className="mr-2 h-4 w-4" /> Salvar Ativo</> )}
              </Button>
            </CardFooter>
          </form>
        </Form>
    </div>
  );
}

