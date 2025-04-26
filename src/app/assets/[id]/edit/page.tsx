'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image'; // Import Image from next/image

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2, Plus, Trash2, QrCode, Eye, AlertTriangle, Link as LinkIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from '@/lib/utils'; // Import cn utility function
import { QrCodeModal } from '@/components/feature/qr-code-modal'; // Import the QR Code modal


const assetSchema = z.object({
  name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres.' }),
  category: z.string().min(1, { message: 'Selecione uma categoria.' }),
  tag: z.string().min(1, { message: 'A tag única é obrigatória.' }).regex(/^[a-zA-Z0-9_-]+$/, { message: 'Use apenas letras, números, _ ou -.'}), // Unique validation should be server-side
  locationId: z.string().min(1, { message: 'Selecione um local.' }),
  responsibleUserId: z.string().min(1, { message: 'Selecione um responsável.' }),
  characteristics: z.array(z.object({
      id: z.string().optional(), // Keep track of existing characteristics for updates/logical delete
      key: z.string().min(1, { message: 'Nome da característica é obrigatório.'}),
      value: z.string().min(1, { message: 'Valor da característica é obrigatório.'}),
      isPublic: z.boolean().default(false),
      isActive: z.boolean().default(true), // For logical deletion
  })).optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'lost', 'inactive']).default('active'), // Add status field
  // photos: // Handle file uploads separately
  // attachments: // Handle links separately
});

type AssetFormData = z.infer<typeof assetSchema>;

// Mock data - replace with actual data fetching later
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

// Mock function to fetch asset data by ID
async function fetchAssetData(id: string): Promise<AssetFormData | null> {
     console.log(`Fetching asset with ID: ${id}`);
     await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
    if (id === 'ASSET001') {
         return {
            name: 'Notebook Dell Latitude 7400',
            category: 'Eletrônicos',
            tag: 'TI-NB-001',
            locationId: 'loc1',
            responsibleUserId: 'user1',
            characteristics: [
                { id: 'char1', key: 'Processador', value: 'Intel Core i7', isPublic: true, isActive: true },
                { id: 'char2', key: 'Memória RAM', value: '16GB', isPublic: true, isActive: true },
                { id: 'char3', key: 'Armazenamento', value: '512GB SSD', isPublic: true, isActive: true },
                { id: 'char4', key: 'Número de Série', value: 'ABC123XYZ', isPublic: false, isActive: true },
                { id: 'char5', key: 'Voltagem', value: 'Bivolt', isPublic: true, isActive: true },
                { id: 'char6', key: 'Ano Fabricação', value: '2022', isPublic: true, isActive: true},
                { id: 'char7', key: 'Cor', value: 'Prata', isPublic: false, isActive: false }, // Example inactive characteristic
            ],
            description: 'Notebook corporativo para desenvolvimento.',
            status: 'active',
         };
    } else if (id === 'ASSET003') {
         return {
            name: 'Cadeira de Escritório',
            category: 'Mobiliário',
            tag: 'MOB-CAD-012',
            locationId: 'loc3',
            responsibleUserId: 'user3',
             characteristics: [
                 { id: 'char8', key: 'Cor', value: 'Preta', isPublic: true, isActive: true },
                 { id: 'char9', key: 'Material', value: 'Tecido', isPublic: true, isActive: true },
            ],
            description: 'Cadeira ergonômica. Marcada como perdida.',
            status: 'lost',
         };
    }
     return null; // Not found
}


export default function EditAssetPage() {
  const router = useRouter();
  const params = useParams();
  const assetId = params.id as string;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [characteristics, setCharacteristics] = useState<{ id?: string, key: string; value: string; isPublic: boolean, isActive: boolean }[]>([]);
  const [assetData, setAssetData] = useState<AssetFormData | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: '',
      category: '',
      tag: '',
      locationId: '',
      responsibleUserId: '',
      characteristics: [],
      description: '',
      status: 'active',
    },
  });

   useEffect(() => {
        if (assetId) {
            const loadData = async () => {
                setIsDataLoading(true);
                const data = await fetchAssetData(assetId);
                 if (data) {
                     setAssetData(data);
                     form.reset(data); // Populate form with fetched data
                     setCharacteristics(data.characteristics || []); // Set characteristics state
                 } else {
                     toast({ title: "Erro", description: "Ativo não encontrado.", variant: "destructive" });
                     router.replace('/assets'); // Redirect if not found
                 }
                setIsDataLoading(false);
            };
            loadData();
        }
   }, [assetId, form, router, toast]);


   const addCharacteristic = () => {
       const newChar = { key: '', value: '', isPublic: false, isActive: true };
       const updatedCharacteristics = [...characteristics, newChar];
        setCharacteristics(updatedCharacteristics);
        form.setValue('characteristics', updatedCharacteristics);
   };

   // Function to handle logical deletion/reactivation
   const toggleCharacteristicActive = (index: number) => {
       const updatedCharacteristics = [...characteristics];
       updatedCharacteristics[index].isActive = !updatedCharacteristics[index].isActive;
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


  async function onSubmit(data: AssetFormData) {
    setIsLoading(true);
    console.log('Updating asset data:', data);
    // Ensure characteristics have the correct structure for saving
    const characteristicsToSave = characteristics.map(char => ({
         id: char.id, // Include ID for existing ones
         key: char.key,
         value: char.value,
         isPublic: char.isPublic,
         isActive: char.isActive,
     }));
     const dataToSave = { ...data, characteristics: characteristicsToSave };
     console.log('Data prepared for saving:', dataToSave);


    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Replace with actual API call to update the asset
    // try {
    //   const response = await fetch(`/api/assets/${assetId}`, { // Use assetId in URL
    //     method: 'PUT', // or PATCH
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(dataToSave),
    //   });
    //   if (!response.ok) throw new Error('Failed to update asset');
    //   const result = await response.json();
       toast({
         title: 'Sucesso!',
         description: `Ativo "${data.name}" atualizado com sucesso.`,
         variant: 'default',
       });
       router.push('/assets'); // Redirect to assets list
    // } catch (error) {
    //   console.error('Error updating asset:', error);
    //   toast({
    //     title: 'Erro ao Atualizar',
    //     description: 'Não foi possível atualizar o ativo. Tente novamente.',
    //     variant: 'destructive',
    //   });
    // } finally {
       setIsLoading(false);
    // }
  }

    if (isDataLoading) {
        return (
            <div className="container mx-auto py-10">
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
                         <Skeleton className="h-20 w-full" />
                          <Skeleton className="h-10 w-1/3" />
                         <Skeleton className="h-24 w-full" />
                          <Skeleton className="h-10 w-1/3" />
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
        // This case should ideally be handled by the redirect in useEffect,
        // but added as a fallback.
        return (
             <div className="container mx-auto py-10 flex justify-center">
                <p className="text-destructive">Erro ao carregar dados do ativo.</p>
             </div>
            );
    }

    // Construct the public URL based on the asset tag
    const publicUrl = `${window.location.origin}/public/asset/${assetData.tag}`;


  return (
    <div className="container mx-auto py-10">
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
              {/* Basic Info Fields (same as new form) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nome do Ativo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="tag" render={({ field }) => (<FormItem><FormLabel>Tag Única</FormLabel><FormControl><Input {...field} readOnly className="bg-muted cursor-not-allowed" /></FormControl><FormDescription>A tag não pode ser alterada.</FormDescription><FormMessage /></FormItem>)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Categoria</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="locationId" render={({ field }) => (<FormItem><FormLabel>Local</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{locations.map(loc => <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>)}<SelectItem value="new">-- Criar Novo Local --</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="responsibleUserId" render={({ field }) => (<FormItem><FormLabel>Responsável</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{users.map(user => <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>)}<SelectItem value="new">-- Criar Novo Usuário --</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
              </div>
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

             {/* Characteristics Section */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Características Adicionais</h3>
                 {characteristics.map((char, index) => (
                     <div key={char.id || `new-${index}`} className={cn(
                         "flex items-end gap-2 mb-3 p-3 border rounded-md",
                         char.isActive ? "bg-muted/30" : "bg-destructive/10 border-destructive/50 opacity-70"
                     )}>
                        <FormField control={form.control} name={`characteristics.${index}.key`} render={({ field: keyField }) => (
                           <FormItem className="flex-1">
                              <FormLabel className="text-xs">Característica</FormLabel>
                              <FormControl>
                                 <Input
                                    placeholder="Ex: Voltagem"
                                    value={char.key}
                                    onChange={(e) => handleCharacteristicChange(index, 'key', e.target.value)}
                                    disabled={!char.isActive}
                                    className={cn(!char.isActive && "line-through")}
                                 />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                          )}
                        />
                         <FormField control={form.control} name={`characteristics.${index}.value`} render={({ field: valueField }) => (
                             <FormItem className="flex-1">
                                <FormLabel className="text-xs">Valor</FormLabel>
                                <FormControl>
                                  <Input
                                      placeholder="Ex: 220V"
                                      value={char.value}
                                      onChange={(e) => handleCharacteristicChange(index, 'value', e.target.value)}
                                      disabled={!char.isActive}
                                      className={cn(!char.isActive && "line-through")}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                           )}
                         />
                         <FormField control={form.control} name={`characteristics.${index}.isPublic`} render={({ field: publicField }) => (
                              <FormItem className="flex items-center space-x-2 pb-1">
                                <FormControl>
                                    <Checkbox
                                        checked={char.isPublic}
                                        onCheckedChange={(checked) => handleCharacteristicChange(index, 'isPublic', !!checked)}
                                        disabled={!char.isActive}
                                     />
                                </FormControl>
                                <FormLabel className="text-xs font-normal !mt-0">
                                  Público?
                                </FormLabel>
                                <FormMessage />
                               </FormItem>
                             )}
                         />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                           onClick={() => toggleCharacteristicActive(index)}
                          className={cn(
                              "hover:bg-opacity-20",
                              char.isActive ? "text-destructive hover:bg-destructive" : "text-green-600 hover:bg-green-600"
                          )}
                          title={char.isActive ? "Desativar Característica" : "Reativar Característica"}
                        >
                          {char.isActive ? <Trash2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        </Button>
                    </div>
                 ))}
                 <Button type="button" variant="outline" size="sm" onClick={addCharacteristic}>
                   <Plus className="mr-2 h-4 w-4" /> Adicionar Nova Característica
                 </Button>
                 <p className="text-xs text-muted-foreground mt-1">Características desativadas não são excluídas permanentemente.</p>
              </div>

              {/* Photo Upload Section - Placeholder */}
               <div>
                <h3 className="text-lg font-semibold mb-2">Fotos do Ativo</h3>
                 {/* Display existing photos with remove option */}
                 <div className="mb-4 grid grid-cols-3 gap-4">
                     {/* Example existing photo */}
                    <div className="relative group border rounded-md overflow-hidden aspect-video">
                        <Image src="https://picsum.photos/seed/asset001/200/150" alt="Existing Photo" layout="fill" objectFit="cover" />
                         <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Trash2 className="h-3 w-3" />
                         </Button>
                    </div>
                    {/* Add more existing photos */}
                 </div>
                <div className="border-2 border-dashed border-border rounded-md p-6 text-center">
                    <p className="text-muted-foreground">Arraste e solte novas fotos aqui ou clique para selecionar.</p>
                    <Input type="file" multiple className="mt-2 opacity-0 absolute w-full h-full top-0 left-0 cursor-pointer" />
                </div>
              </div>

               {/* Attachments Section - Placeholder */}
                <div>
                <h3 className="text-lg font-semibold mb-2">Anexos (Links Externos)</h3>
                 {/* Display existing attachments with remove option */}
                  <div className="mb-4 space-y-2">
                     {/* Example existing attachment */}
                    <div className="flex items-center justify-between border p-2 rounded-md bg-muted/50">
                        <a href="https://example.com/manual.pdf" target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline flex items-center gap-1">
                             <LinkIcon className="h-4 w-4" /> Manual do Usuário
                        </a>
                        <Button variant="ghost" size="icon" className="text-destructive h-6 w-6">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                     {/* Add more existing attachments */}
                 </div>
                 <div className="flex items-end gap-2 mb-3">
                    <div className="flex-1">
                        <Label htmlFor="attachment-link" className="text-xs">Novo Link</Label>
                        <Input id="attachment-link" placeholder="https://..." />
                    </div>
                     <div className="flex-1">
                        <Label htmlFor="attachment-name" className="text-xs">Nome do Anexo</Label>
                        <Input id="attachment-name" placeholder="Ex: Nota Fiscal" />
                    </div>
                    <Button type="button" variant="outline" size="sm">
                       <Plus className="mr-1 h-4 w-4" /> Adicionar
                    </Button>
                 </div>
              </div>


            </CardContent>
            <CardFooter className="flex justify-between">
                 <Button type="button" variant="destructive" onClick={() => { /* Implement delete confirmation */ }}>
                    <Trash2 className="mr-2 h-4 w-4" /> Excluir Ativo
                 </Button>
                 <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading}>
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
