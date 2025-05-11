

'use client';

import { useState, useEffect, ChangeEvent, DragEvent } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2, Plus, Trash2, QrCode, Eye, AlertTriangle, Link as LinkIcon, UploadCloud, X, Building, CalendarDays, DollarSign } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from '@/lib/utils';
import { QrCodeModal } from '@/components/feature/qr-code-modal';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';


// Define structure for existing photos
interface ExistingPhoto {
    id: string;
    url: string;
    name?: string;
}

// Schema for individual attachment
const attachmentSchema = z.object({
  id: z.string().optional(), // For existing attachments during edit
  name: z.string().min(1, { message: 'Nome do anexo é obrigatório.' }),
  url: z.string().url({ message: 'URL inválida.' }),
  isPublic: z.boolean().default(false),
});

// Updated schema with rental fields and attachments
const assetSchema = z.object({
  name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres.' }),
  category: z.string().min(1, { message: 'Selecione uma categoria.' }),
  tag: z.string()
    .length(5, { message: 'A tag deve ter 5 caracteres.' }) // Keep length validation
    .regex(/^[A-Z0-9]+$/, { message: 'A tag deve conter apenas letras maiúsculas e números.'}) // Keep regex validation
    .describe('A tag é única dentro da empresa e não pode ser alterada após a criação.'), // Clarified description for edit page
  locationId: z.string().min(1, { message: 'Selecione um local.' }),
  responsibleUserId: z.string().min(1, { message: 'Selecione um responsável.' }),
  parentId: z.string().optional(),
  ownershipType: z.enum(['own', 'rented'], { required_error: 'Selecione o tipo de propriedade.' }).default('own'),
  rentalCompany: z.string().optional(),
  rentalStartDate: z.date().optional(),
  rentalEndDate: z.date().optional(),
  rentalCost: z.number().optional(),
  characteristics: z.array(z.object({
      id: z.string().optional(),
      key: z.string().min(1, { message: 'Nome da característica é obrigatório.'}),
      value: z.string().min(1, { message: 'Valor da característica é obrigatório.'}),
      isPublic: z.boolean().default(false),
      isActive: z.boolean().default(true), // Keep isActive for DB logic
  })).optional(),
  attachments: z.array(attachmentSchema).optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'lost', 'inactive']).default('active'),
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

// Mock data
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

// Mock function to fetch existing assets for parent selection
async function fetchAssetsForParent(excludeId?: string): Promise<{ id: string; name: string; tag: string }[]> {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
  const allAssets = [
    { id: 'ASSET001', name: 'Notebook Dell Latitude 7400', tag: 'AB12C' },
    { id: 'ASSET002', name: 'Monitor LG 27"', tag: 'DE34F' },
    { id: 'ASSET003', name: 'Cadeira de Escritório', tag: 'GH56I' },
    { id: 'ASSET004', name: 'Projetor Epson PowerLite', tag: 'JK78L' },
  ];
  return allAssets.filter(asset => asset.id !== excludeId);
}

// Mock data with existing photos, rental info, and attachments
interface AssetDataFromAPI extends Omit<AssetFormData, 'rentalStartDate' | 'rentalEndDate' | 'attachments'> {
    photos?: ExistingPhoto[];
    attachments?: Attachment[]; // Use Attachment type
    rentalStartDate?: string; // Dates as strings for initial fetch
    rentalEndDate?: string;
}


// Mock function to fetch asset data by ID
async function fetchAssetData(id: string): Promise<AssetDataFromAPI | null> {
     console.log(`Fetching asset with ID: ${id}`);
     await new Promise(resolve => setTimeout(resolve, 1000));
    if (id === 'ASSET001') {
         return {
            name: 'Notebook Dell Latitude 7400',
            category: 'Eletrônicos',
            tag: 'AB12C', // Example generated tag
            locationId: 'loc1',
            responsibleUserId: 'user1',
            parentId: undefined,
            ownershipType: 'own',
            characteristics: [
                { id: 'char1', key: 'Processador', value: 'Intel Core i7', isPublic: true, isActive: true },
                { id: 'char2', key: 'Memória RAM', value: '16GB', isPublic: true, isActive: true },
                { id: 'char3', key: 'Armazenamento', value: '512GB SSD', isPublic: true, isActive: true },
                { id: 'char4', key: 'Número de Série', value: 'ABC123XYZ', isPublic: false, isActive: true },
                { id: 'char5', key: 'Voltagem', value: 'Bivolt', isPublic: true, isActive: true },
                { id: 'char6', key: 'Ano Fabricação', value: '2022', isPublic: true, isActive: true},
                { id: 'char7', key: 'Cor', value: 'Prata', isPublic: false, isActive: false }, // Logically deleted
            ],
            attachments: [
                { id: 'attach1', name: 'Manual do Usuário', url: 'https://example.com/manual.pdf', isPublic: true },
                { id: 'attach2', name: 'Nota Fiscal', url: 'https://example.com/invoice.pdf', isPublic: false },
             ],
            description: 'Notebook corporativo para desenvolvimento.',
            status: 'active',
            photos: [
                { id: 'photo1', url: 'https://picsum.photos/seed/asset001/200/150', name: 'vista_frontal.jpg' },
                { id: 'photo2', url: 'https://picsum.photos/seed/asset001_side/200/150', name: 'vista_lateral.jpg' },
            ]
         };
    } else if (id === 'ASSET003') {
         return {
            name: 'Cadeira de Escritório',
            category: 'Mobiliário',
            tag: 'GH56I', // Example generated tag
            locationId: 'loc3',
            responsibleUserId: 'user3',
            parentId: 'ASSET001',
            ownershipType: 'rented', // Example rented asset
            rentalCompany: 'LocaTudo Móveis',
            rentalStartDate: '2024-01-15', // ISO string format
            rentalEndDate: '2025-01-14', // ISO string format
            rentalCost: 50.00,
             characteristics: [
                 { id: 'char8', key: 'Cor', value: 'Preta', isPublic: true, isActive: true },
                 { id: 'char9', key: 'Material', value: 'Tecido', isPublic: true, isActive: true },
            ],
            attachments: [],
            description: 'Cadeira ergonômica. Marcada como perdida.',
            status: 'lost',
            photos: [ { id: 'photo3', url: 'https://picsum.photos/seed/asset003/200/150', name: 'cadeira.jpg' } ]
         };
    }
     return null;
}


export default function EditAssetPage() {
  const router = useRouter();
  const params = useParams();
  const assetId = params.id as string;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [characteristics, setCharacteristics] = useState<{ id?: string, key: string; value: string; isPublic: boolean, isActive: boolean }[]>([]);
  const [assetData, setAssetData] = useState<AssetDataFromAPI | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [existingPhotos, setExistingPhotos] = useState<ExistingPhoto[]>([]);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [photosToRemove, setPhotosToRemove] = useState<string[]>([]);
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
    },
  });

   const { fields: attachmentFields, append: appendAttachment, remove: removeAttachment, update: updateAttachment } = useFieldArray({
    control: form.control,
    name: "attachments",
  });

   useEffect(() => {
        if (assetId) {
            const loadData = async () => {
                setIsDataLoading(true);
                setIsLoadingParents(true);
                const data = await fetchAssetData(assetId);
                 if (data) {
                     setAssetData(data);

                      // Convert date strings to Date objects for the form
                      // Filter characteristics to only include active ones for the state `characteristics`
                     const activeCharacteristics = (data.characteristics || []).filter(c => c.isActive);
                     // Keep ALL characteristics in the form data for submission logic
                     const allCharacteristicsForForm = data.characteristics || [];

                     const formData = {
                        ...data,
                        parentId: data.parentId || '__none__',
                        rentalStartDate: data.rentalStartDate ? new Date(data.rentalStartDate) : undefined,
                        rentalEndDate: data.rentalEndDate ? new Date(data.rentalEndDate) : undefined,
                        characteristics: allCharacteristicsForForm, // Form holds all for saving isActive=false
                        attachments: data.attachments || [],
                     };

                     form.reset(formData);
                     setCharacteristics(activeCharacteristics); // State only holds active for display/editing
                     setExistingPhotos(data.photos || []);
                     setNewPhotos([]);
                     setPhotosToRemove([]);

                     try {
                         const assets = await fetchAssetsForParent(assetId);
                         setParentAssets(assets);
                     } catch (error) {
                        console.error("Error fetching parent assets:", error);
                         toast({ title: "Erro", description: "Não foi possível carregar a lista de ativos pais.", variant: "destructive" });
                     } finally {
                        setIsLoadingParents(false);
                     }

                 } else {
                     toast({ title: "Erro", description: "Ativo não encontrado.", variant: "destructive" });
                     router.replace('/assets');
                     setIsLoadingParents(false);
                 }
                setIsDataLoading(false);
            };
            loadData();
        }
   }, [assetId, form, router, toast]);

   const ownershipType = form.watch('ownershipType');

   const addCharacteristic = () => {
       const newChar = { key: '', value: '', isPublic: false, isActive: true };
       // Add to the local state for immediate display
       setCharacteristics(prev => [...prev, newChar]);
       // Update the form's characteristics array as well
       form.setValue('characteristics', [...form.getValues('characteristics'), newChar]);
   };

   // This function now logically "deletes" by setting isActive to false in the form state
   const removeCharacteristic = (index: number) => {
        // Find the actual index in the form's array corresponding to the visible index
        const activeCharacteristics = form.getValues('characteristics').filter(c => c.isActive);
        const characteristicToRemove = activeCharacteristics[index];
        const formIndex = form.getValues('characteristics').findIndex(c => c.id === characteristicToRemove?.id || (c.key === characteristicToRemove?.key && c.value === characteristicToRemove?.value && !c.id)); // Match by ID or content for new ones

        if (formIndex !== -1) {
            const updatedFormCharacteristics = [...form.getValues('characteristics')];
            updatedFormCharacteristics[formIndex].isActive = false;
            form.setValue('characteristics', updatedFormCharacteristics);

            // Update the local state to remove it from the visible list
            setCharacteristics(prev => prev.filter((_, i) => i !== index));

            toast({ title: "Característica Desativada", description: "A característica foi marcada como inativa e não será exibida, mas permanecerá no histórico.", variant: "default" });
        } else {
             console.error("Could not find characteristic in form data to deactivate.");
             // Fallback: remove directly from local state if form sync fails somehow
              setCharacteristics(prev => prev.filter((_, i) => i !== index));
        }
   };

   // Handles changes only for VISIBLE characteristics
   const handleCharacteristicChange = (index: number, field: 'key' | 'value' | 'isPublic', value: string | boolean) => {
       // Update the local state for immediate UI feedback
        const updatedLocalCharacteristics = [...characteristics];
        if (field === 'isPublic') {
            updatedLocalCharacteristics[index][field] = value as boolean;
        } else {
            updatedLocalCharacteristics[index][field] = value as string;
        }
        setCharacteristics(updatedLocalCharacteristics);

        // Find the corresponding characteristic in the form data and update it
        const characteristicToUpdate = updatedLocalCharacteristics[index];
        const formIndex = form.getValues('characteristics').findIndex(c => c.id === characteristicToUpdate?.id || (c.key === characteristicToUpdate?.key && c.value === characteristicToUpdate?.value && !c.id)); // Match by ID or content

        if (formIndex !== -1) {
            const updatedFormCharacteristics = [...form.getValues('characteristics')];
            if (field === 'isPublic') {
                updatedFormCharacteristics[formIndex][field] = value as boolean;
            } else {
                 updatedFormCharacteristics[formIndex][field] = value as string;
            }
            form.setValue('characteristics', updatedFormCharacteristics);
        } else {
            console.error("Could not find characteristic in form data to update.");
        }
   };

    const handleAddAttachment = () => {
        if (newAttachmentName && newAttachmentUrl) {
            try {
                new URL(newAttachmentUrl); // Basic validation
                appendAttachment({ name: newAttachmentName, url: newAttachmentUrl, isPublic: false });
                setNewAttachmentName('');
                setNewAttachmentUrl('');
            } catch (_) {
                 toast({ title: "URL Inválida", description: "Por favor, insira uma URL válida.", variant: "destructive" });
            }
        } else {
            toast({ title: "Campos Incompletos", description: "Preencha o nome e a URL do anexo.", variant: "destructive" });
        }
    };

    const handleAttachmentPublicToggle = (index: number, checked: boolean) => {
        updateAttachment(index, { ...attachmentFields[index], isPublic: checked });
    };


  // --- File Upload Handlers ---
   const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
     if (event.target.files) {
       const files = Array.from(event.target.files);
       setNewPhotos(prev => [...prev, ...files.filter(file => file.type.startsWith('image/'))]);
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
       setNewPhotos(prev => [...prev, ...files.filter(file => file.type.startsWith('image/'))]);
     }
   };

   const removeNewFile = (index: number) => {
     setNewPhotos(prev => prev.filter((_, i) => i !== index));
   };

    const markExistingPhotoForRemoval = (photoId: string) => {
        setExistingPhotos(prev => prev.filter(p => p.id !== photoId));
        setPhotosToRemove(prev => [...prev, photoId]);
    };
  // --- End File Upload Handlers ---

  async function onSubmit(data: AssetFormData) {
    setIsLoading(true);

    // Note: 'data.characteristics' already contains ALL characteristics, including inactive ones
    // The server should handle saving based on the 'isActive' flag

     // Clean up rental data if ownership is 'own'
    const cleanedData = data.ownershipType === 'own'
        ? { ...data, rentalCompany: undefined, rentalStartDate: undefined, rentalEndDate: undefined, rentalCost: undefined }
        : { ...data };

    // Exclude the 'tag' field from the data sent for update, as it should not be changed.
    const { tag, ...dataWithoutTag } = cleanedData;

    const dataToSave = {
         ...dataWithoutTag,
         parentId: dataWithoutTag.parentId === '__none__' ? undefined : dataWithoutTag.parentId,
         // Attachments are already in cleanedData from form state
     };
     console.log('Data prepared for saving (excluding tag):', dataToSave);


    // TODO: Implement file upload and removal logic
    // 1. Upload `newPhotos` to storage and get URLs.
    // 2. Delete photos in `photosToRemove` from storage and Firestore.
    // 3. Update the asset document in Firestore with new photo URLs and remove old ones.

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Replace with actual API call
       toast({
         title: 'Sucesso!',
         description: `Ativo "${data.name}" atualizado com sucesso.`,
         variant: 'default',
       });
       router.push('/assets');
       setIsLoading(false);
  }

    if (isDataLoading) {
        return (
            <div className="space-y-6"> {/* Use simple div instead of container */}
                <Skeleton className="h-8 w-32 mb-4" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/2 mb-2" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <Skeleton className="h-10 w-full" />
                             <Skeleton className="h-10 w-full" />
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             <Skeleton className="h-10 w-full" />
                             <Skeleton className="h-10 w-full" />
                             <Skeleton className="h-10 w-full" />
                         </div>
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-1/3 mb-4"/> {/* Ownership Type */}
                          <Skeleton className="h-20 w-full" />
                          <Skeleton className="h-10 w-1/3" /> {/* Status */}
                         <Skeleton className="h-24 w-full" /> {/* Characteristics */}
                          <Skeleton className="h-10 w-1/3" />
                           {/* Photo skeleton */}
                          <div>
                            <Skeleton className="h-6 w-1/4 mb-2" />
                             <div className="mb-4 grid grid-cols-3 gap-4">
                                <Skeleton className="aspect-video rounded-md" />
                                <Skeleton className="aspect-video rounded-md" />
                             </div>
                            <Skeleton className="h-32 w-full border-dashed border-2 rounded-md" />
                          </div>
                          {/* Attachment skeleton */}
                           <div>
                             <Skeleton className="h-6 w-1/4 mb-2" />
                             <Skeleton className="h-10 w-full mb-2 border rounded-md" />
                             <Skeleton className="h-10 w-full border rounded-md" />
                          </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-24" />
                    </CardFooter>
                </Card>
            </div>
        );
    }

     if (!assetData) {
        return (
             <div className="flex justify-center">
                <p className="text-destructive">Erro ao carregar dados do ativo.</p>
             </div>
            );
    }

    const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/public/asset/${assetData.tag}` : '';


  return (
    <div className="space-y-6"> {/* Use simple div instead of container */}
      <div className="flex justify-between items-center mb-4">
         <Button variant="outline" size="sm" asChild>
            <Link href="/assets">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista
            </Link>
          </Button>
          <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={publicUrl} target="_blank">
                    <Eye className="mr-2 h-4 w-4" /> Ver Página Pública
                </Link>
              </Button>
               <Button variant="outline" size="sm" onClick={() => setIsQrModalOpen(true)}>
                <QrCode className="mr-2 h-4 w-4" /> Ver QR Code
              </Button>
          </div>

      </div>

       {assetData?.status === 'lost' && (
            <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Atenção!</AlertTitle>
                <AlertDescription>
                    Este ativo está atualmente marcado como <span className="font-semibold">PERDIDO</span>.
                </AlertDescription>
            </Alert>
        )}
        {assetData?.status === 'inactive' && (
            <Alert variant="default" className="mb-6 bg-muted">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Atenção!</AlertTitle>
                <AlertDescription>
                    Este ativo está atualmente marcado como <span className="font-semibold">INATIVO</span>.
                </AlertDescription>
            </Alert>
        )}


      <Card>
        <CardHeader>
          <CardTitle>Editar Ativo: {assetData.name}</CardTitle>
          <CardDescription>Atualize as informações do ativo <Badge variant="secondary">{assetData.tag}</Badge>.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {/* Basic Info Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nome do Ativo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                 {/* Tag field is now read-only */}
                 <FormField control={form.control} name="tag" render={({ field }) => (<FormItem><FormLabel>Tag Única</FormLabel><FormControl><Input {...field} readOnly className="bg-muted cursor-not-allowed" /></FormControl><FormDescription>A tag única é gerada pelo sistema e não pode ser alterada.</FormDescription><FormMessage /></FormItem>)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Categoria</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="locationId" render={({ field }) => (<FormItem><FormLabel>Local</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{locations.map(loc => <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>)}<SelectItem value="__new__">-- Criar Novo Local --</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="responsibleUserId" render={({ field }) => (<FormItem><FormLabel>Responsável</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{users.map(user => <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>)}<SelectItem value="__new__">-- Criar Novo Usuário --</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              </div>

              {/* Parent Asset Field */}
              <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ativo Pai (Opcional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || '__none__'} disabled={isLoadingParents}>
                        <FormControl>
                          <SelectTrigger>
                             <SelectValue placeholder={isLoadingParents ? "Carregando ativos..." : "Selecione um ativo pai (se aplicável)"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="__none__">Nenhum</SelectItem>
                          {parentAssets.map((asset) => (
                            <SelectItem key={asset.id} value={asset.id}>
                                {asset.name} ({asset.tag})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Vincule este ativo a outro já existente (ex: monitor a um computador).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

               {/* Ownership Type */}
                 <FormField
                   control={form.control}
                   name="ownershipType"
                   render={({ field }) => (
                     <FormItem className="space-y-3">
                       <FormLabel>Tipo de Propriedade</FormLabel>
                       <FormControl>
                         <RadioGroup
                           onValueChange={field.onChange}
                           defaultValue={field.value}
                           className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0"
                         >
                           <FormItem className="flex items-center space-x-2">
                             <FormControl>
                               <RadioGroupItem value="own" />
                             </FormControl>
                             <FormLabel className="font-normal">Próprio</FormLabel>
                           </FormItem>
                           <FormItem className="flex items-center space-x-2">
                             <FormControl>
                               <RadioGroupItem value="rented" />
                             </FormControl>
                             <FormLabel className="font-normal">Alugado</FormLabel>
                           </FormItem>
                         </RadioGroup>
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />

                 {/* Rental Information (Conditional) */}
                 {ownershipType === 'rented' && (
                    <Card className="p-4 bg-muted/30 border-dashed">
                      <CardDescription className="mb-4">Informações da Locação</CardDescription>
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="rentalCompany"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Empresa Locadora</FormLabel>
                              <FormControl>
                                <Input placeholder="Nome da empresa" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <FormField
                             control={form.control}
                             name="rentalStartDate"
                             render={({ field }) => (
                               <FormItem className="flex flex-col">
                                 <FormLabel>Data Início Locação</FormLabel>
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
                                         <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                                       </Button>
                                     </FormControl>
                                   </PopoverTrigger>
                                   <PopoverContent className="w-auto p-0" align="start">
                                     <Calendar
                                       mode="single"
                                       selected={field.value}
                                       onSelect={field.onChange}
                                       disabled={(date) => date < new Date("1900-01-01")}
                                       initialFocus
                                       locale={ptBR}
                                     />
                                   </PopoverContent>
                                 </Popover>
                                 <FormMessage />
                               </FormItem>
                             )}
                           />
                            <FormField
                             control={form.control}
                             name="rentalEndDate"
                             render={({ field }) => (
                               <FormItem className="flex flex-col">
                                 <FormLabel>Data Fim Locação</FormLabel>
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
                                         <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                                       </Button>
                                     </FormControl>
                                   </PopoverTrigger>
                                   <PopoverContent className="w-auto p-0" align="start">
                                     <Calendar
                                       mode="single"
                                       selected={field.value}
                                       onSelect={field.onChange}
                                       disabled={(date) =>
                                           date < (form.getValues('rentalStartDate') || new Date("1900-01-01"))
                                       }
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
                         <FormField
                          control={form.control}
                          name="rentalCost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Valor do Aluguel (Mensal, Opcional)</FormLabel>
                               <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="150.00"
                                        className="pl-8"
                                        {...field}
                                        onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} // Handle parsing
                                    />
                                </FormControl>
                               </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormMessage>{form.formState.errors.rentalCompany?.message}</FormMessage>
                      <FormMessage>{form.formState.errors.rentalEndDate?.message}</FormMessage>
                    </Card>
                 )}


              <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />

               {/* Status Field */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status do Ativo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className={cn(
                              field.value === 'lost' && 'border-destructive text-destructive focus:ring-destructive',
                              field.value === 'inactive' && 'border-muted text-muted-foreground focus:ring-gray-500'
                          )}>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="lost">Perdido</SelectItem>
                           <SelectItem value="inactive">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                       <FormDescription>Define a condição atual do ativo.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

             {/* Characteristics Section - Only displays active characteristics */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Características Adicionais (Ativas)</h3>
                 {/* Map over the local 'characteristics' state which only contains active ones */}
                 {characteristics.map((char, index) => (
                     <div key={char.id || `active-${index}`} className="flex flex-col sm:flex-row sm:items-end gap-2 mb-3 p-3 border rounded-md bg-muted/30">
                        <div className="flex-grow space-y-2 sm:space-y-0 sm:flex sm:gap-2 w-full">
                            <FormItem className="flex-1 min-w-0">
                            <FormLabel className="text-xs">Característica</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Ex: Voltagem"
                                    value={char.key}
                                    onChange={(e) => handleCharacteristicChange(index, 'key', e.target.value)}
                                />
                            </FormControl>
                            </FormItem>

                            <FormItem className="flex-1 min-w-0">
                                <FormLabel className="text-xs">Valor</FormLabel>
                                <FormControl>
                                <Input
                                    placeholder="Ex: 220V"
                                    value={char.value}
                                    onChange={(e) => handleCharacteristicChange(index, 'value', e.target.value)}
                                />
                                </FormControl>
                            </FormItem>
                        </div>
                        <div className="flex items-center justify-between sm:justify-start gap-2 pt-2 sm:pt-0 sm:pb-1 w-full sm:w-auto">
                            <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                    <Checkbox
                                        checked={char.isPublic}
                                        onCheckedChange={(checked) => handleCharacteristicChange(index, 'isPublic', !!checked)}
                                    />
                                </FormControl>
                                <FormLabel className="text-xs font-normal !mt-0">
                                Público?
                                </FormLabel>
                            </FormItem>
                            <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeCharacteristic(index)} // This now sets isActive=false
                            className="text-destructive hover:bg-destructive/10"
                            title="Desativar Característica"
                            >
                            <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                 ))}
                 <Button type="button" variant="outline" size="sm" onClick={addCharacteristic}>
                   <Plus className="mr-2 h-4 w-4" /> Adicionar Nova Característica
                 </Button>
                 <p className="text-xs text-muted-foreground mt-1">Características desativadas não são exibidas aqui, mas não são excluídas permanentemente.</p>
              </div>

              {/* Photo Upload Section */}
               <div>
                <h3 className="text-lg font-semibold mb-2">Fotos do Ativo</h3>
                 {/* Display existing and new photos */}
                 <div className="mb-4 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                     {/* Existing photos */}
                    {existingPhotos.map((photo) => (
                        <div key={photo.id} className="relative group border rounded-md overflow-hidden aspect-square">
                            <Image src={photo.url} alt={photo.name || `Foto ${photo.id}`} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw" />
                             <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity p-0"
                                onClick={() => markExistingPhotoForRemoval(photo.id)}
                                title="Remover Imagem Existente"
                            >
                                <Trash2 className="h-3 w-3" />
                             </Button>
                        </div>
                    ))}
                     {/* New photo previews */}
                     {newPhotos.map((file, index) => (
                       <div key={`new-${index}`} className="relative group border rounded-md overflow-hidden aspect-square">
                         <Image
                           src={URL.createObjectURL(file)}
                           alt={`Preview ${index + 1}`}
                           fill
                           style={{ objectFit: 'cover' }}
                           sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                           onLoad={() => URL.revokeObjectURL(URL.createObjectURL(file))} // Clean up object URL
                         />
                         <Button
                           type="button"
                           variant="destructive"
                           size="icon"
                           className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity p-0"
                           onClick={() => removeNewFile(index)}
                           title="Remover Nova Imagem"
                         >
                           <X className="h-3 w-3" />
                         </Button>
                       </div>
                     ))}
                 </div>
                 {/* Dropzone */}
                 <div
                  className={cn(
                    "relative border-2 border-dashed border-border rounded-md p-6 text-center transition-colors duration-200 ease-in-out",
                    isDragging ? 'border-primary bg-accent/10' : 'bg-muted/20'
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2"/>
                  <p className="text-muted-foreground text-sm mb-1">
                    Arraste e solte novas fotos aqui ou
                  </p>
                  <Label htmlFor="file-upload" className="text-primary font-medium cursor-pointer hover:underline">
                    clique para selecionar
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/*"
                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" // Adjusted class for proper overlay
                    onChange={handleFileChange}
                  />
                   <p className="text-xs text-muted-foreground mt-2">Adicione mais fotos para o ativo.</p>
                </div>
              </div>

              {/* Attachments Section */}
               <div>
                 <h3 className="text-lg font-semibold mb-2">Anexos (Links Externos)</h3>
                 {/* Display existing attachments */}
                 {attachmentFields.map((field, index) => (
                   <div key={field.id} className="flex flex-col sm:flex-row sm:items-end gap-2 mb-3 p-3 border rounded-md bg-muted/50">
                    <div className="flex-grow space-y-2 sm:space-y-0 sm:flex sm:gap-2 w-full">
                        <FormField
                        control={form.control}
                        name={`attachments.${index}.name`}
                        render={({ field: inputField }) => ( // Renamed to avoid conflict with outer 'field'
                            <FormItem className="flex-1 min-w-0">
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                                <Input {...inputField} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name={`attachments.${index}.url`}
                        render={({ field: inputField }) => ( // Renamed
                            <FormItem className="flex-1 min-w-0">
                            <FormLabel>URL</FormLabel>
                            <FormControl>
                                <Input {...inputField} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                    <div className="flex items-center justify-between sm:justify-start gap-2 pt-2 sm:pt-0 sm:pb-1 w-full sm:w-auto">
                        <FormField
                        control={form.control}
                        name={`attachments.${index}.isPublic`}
                        render={({ field: checkboxField }) => (
                            <FormItem className="flex flex-col items-center space-y-1">
                            <FormLabel className="text-xs font-normal">Público?</FormLabel>
                            <FormControl>
                                <Checkbox
                                checked={checkboxField.value}
                                onCheckedChange={checkboxField.onChange} // Directly use onChange from RHF
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAttachment(index)}
                        className="text-destructive hover:bg-destructive/10"
                        title="Remover Anexo"
                        >
                        <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                   </div>
                 ))}

                 {/* Input for new attachment */}
                 <div className="flex flex-col sm:flex-row sm:items-end gap-2 mt-4">
                    <div className="w-full sm:flex-1">
                        <Label htmlFor="new-attachment-name">Nome do Novo Anexo</Label>
                        <Input
                            id="new-attachment-name"
                            placeholder="Ex: Manual de Instruções"
                            value={newAttachmentName}
                            onChange={(e) => setNewAttachmentName(e.target.value)}
                         />
                    </div>
                    <div className="w-full sm:flex-1">
                        <Label htmlFor="new-attachment-url">Link do Anexo</Label>
                        <Input
                             id="new-attachment-url"
                             placeholder="https://..."
                             value={newAttachmentUrl}
                             onChange={(e) => setNewAttachmentUrl(e.target.value)}
                         />
                    </div>
                     <Button type="button" variant="outline" size="sm" onClick={handleAddAttachment} className="w-full sm:w-auto">
                         <LinkIcon className="mr-2 h-4 w-4" />
                         Adicionar Anexo
                    </Button>
                 </div>
                 <FormDescription>Adicione links para manuais, notas fiscais, etc. e defina a visibilidade pública.</FormDescription>
                  {form.formState.errors.attachments && (
                    <FormMessage>{form.formState.errors.attachments.message}</FormMessage>
                  )}
              </div>


            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
                 <Button type="button" variant="destructive" onClick={() => { /* Implement delete confirmation */ }} className="w-full sm:w-auto">
                    <Trash2 className="mr-2 h-4 w-4" /> Excluir Ativo
                 </Button>
                 <div className="flex gap-2 w-full sm:w-auto">
                    <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1 sm:flex-none">
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading} className="flex-1 sm:flex-none">
                        {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Atualizando...
                        </>
                        ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" /> Salvar Alterações
                        </>
                        )}
                    </Button>
                 </div>
            </CardFooter>
          </form>
        </Form>
      </Card>

       {assetData && (
           <QrCodeModal
             isOpen={isQrModalOpen}
             onClose={() => setIsQrModalOpen(false)}
             qrValue={publicUrl}
             assetName={assetData.name}
             assetTag={assetData.tag}
           />
        )}
    </div>
  );
}



