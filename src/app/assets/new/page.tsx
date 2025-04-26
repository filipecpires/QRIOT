
'use client';

import { useState, useCallback, ChangeEvent, DragEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
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
import { ArrowLeft, Save, Loader2, Plus, Trash2, UploadCloud, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const assetSchema = z.object({
  name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres.' }),
  category: z.string().min(1, { message: 'Selecione uma categoria.' }),
  tag: z.string().min(1, { message: 'A tag única é obrigatória.' }).regex(/^[a-zA-Z0-9_-]+$/, { message: 'Use apenas letras, números, _ ou -.'}), // Unique validation should be server-side
  locationId: z.string().min(1, { message: 'Selecione um local.' }),
  responsibleUserId: z.string().min(1, { message: 'Selecione um responsável.' }),
  characteristics: z.array(z.object({
      key: z.string().min(1, { message: 'Nome da característica é obrigatório.'}),
      value: z.string().min(1, { message: 'Valor da característica é obrigatório.'}),
      isPublic: z.boolean().default(false),
  })).optional(),
  description: z.string().optional(),
  // photos will be handled by component state and uploaded separately
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

export default function NewAssetPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [characteristics, setCharacteristics] = useState<{ key: string; value: string; isPublic: boolean }[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

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
    },
  });

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

  // --- File Upload Handlers ---
   const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
     if (event.target.files) {
       const files = Array.from(event.target.files);
       // Basic validation (e.g., check file type, size) can be added here
       setSelectedFiles(prev => [...prev, ...files.filter(file => file.type.startsWith('image/'))]); // Only accept images
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
  // --- End File Upload Handlers ---


  async function onSubmit(data: AssetFormData) {
    setIsLoading(true);
    console.log('Submitting asset data:', data);
    console.log('Selected files:', selectedFiles);

    // TODO: Implement file upload logic here (e.g., upload to Firebase Storage)
    // 1. Upload each file in `selectedFiles`
    // 2. Get the download URLs
    // 3. Add the URLs to the asset data before saving to Firestore

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Replace with actual API call to save the asset (including photo URLs)
    // try {
    //   const photoUrls = await uploadFiles(selectedFiles); // Your upload function
    //   const dataToSave = { ...data, photoUrls };
    //   const response = await fetch('/api/assets', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(dataToSave),
    //   });
    //   if (!response.ok) throw new Error('Failed to save asset');
    //   const result = await response.json();
       toast({
         title: 'Sucesso!',
         description: `Ativo "${data.name}" cadastrado com sucesso.`,
         variant: 'default',
       });
       router.push('/assets'); // Redirect to assets list
    // } catch (error) {
    //   console.error('Error saving asset:', error);
    //   toast({
    //     title: 'Erro ao Salvar',
    //     description: 'Não foi possível cadastrar o ativo. Tente novamente.',
    //     variant: 'destructive',
    //   });
    // } finally {
       setIsLoading(false);
    // }
  }

  return (
    <div className="container mx-auto py-10">
      <Button variant="outline" size="sm" asChild className="mb-4">
        <Link href="/assets">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Cadastrar Novo Ativo</CardTitle>
          <CardDescription>Preencha as informações detalhadas do ativo.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {/* Basic Info Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Ativo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Notebook Dell Latitude 7400" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="tag"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tag Única (Identificação)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: TI-NB-001" {...field} />
                      </FormControl>
                      <FormDescription>Use um código único para identificar o ativo.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                           {/* Add option to create new category? */}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="locationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Local de Instalação</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o local" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations.map((loc) => (
                            <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                          ))}
                           <SelectItem value="new">-- Criar Novo Local --</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="responsibleUserId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsável</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o responsável" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                          ))}
                           <SelectItem value="new">-- Criar Novo Usuário --</SelectItem>
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
                    <FormLabel>Descrição / Observações</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Detalhes adicionais sobre o ativo..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

             {/* Characteristics Section */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Características Adicionais</h3>
                 {characteristics.map((char, index) => (
                    <div key={index} className="flex items-end gap-2 mb-3 p-3 border rounded-md bg-muted/50">
                       <FormField
                          control={form.control}
                          name={`characteristics.${index}.key`}
                          render={({ field }) => (
                           <FormItem className="flex-1">
                              <FormLabel>Característica</FormLabel>
                              <FormControl>
                                 <Input
                                    placeholder="Ex: Voltagem"
                                    value={char.key}
                                    onChange={(e) => handleCharacteristicChange(index, 'key', e.target.value)}
                                 />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                          )}
                        />
                         <FormField
                          control={form.control}
                          name={`characteristics.${index}.value`}
                           render={({ field }) => (
                             <FormItem className="flex-1">
                                <FormLabel>Valor</FormLabel>
                                <FormControl>
                                  <Input
                                      placeholder="Ex: 220V"
                                      value={char.value}
                                      onChange={(e) => handleCharacteristicChange(index, 'value', e.target.value)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                           )}
                         />
                         <FormField
                            control={form.control}
                            name={`characteristics.${index}.isPublic`}
                             render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 pb-1">
                                <FormControl>
                                    <Checkbox
                                        checked={char.isPublic}
                                        onCheckedChange={(checked) => handleCharacteristicChange(index, 'isPublic', !!checked)}
                                     />
                                </FormControl>
                                <FormLabel className="text-sm font-normal !mt-0">
                                  Visível publicamente?
                                </FormLabel>
                                <FormMessage />
                               </FormItem>
                             )}
                         />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCharacteristic(index)}
                          className="text-destructive hover:bg-destructive/10"
                          title="Remover Característica"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                 ))}
                 <Button type="button" variant="outline" size="sm" onClick={addCharacteristic}>
                   <Plus className="mr-2 h-4 w-4" /> Adicionar Característica
                 </Button>
              </div>

              {/* Photo Upload Section */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Fotos do Ativo</h3>
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
                    Arraste e solte as fotos aqui ou
                  </p>
                  <Label htmlFor="file-upload" className="text-primary font-medium cursor-pointer hover:underline">
                    clique para selecionar
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/*" // Only accept image files
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                  />
                  <p className="text-xs text-muted-foreground mt-2">Apenas imagens são permitidas.</p>
                </div>

                 {/* Display uploaded image previews */}
                 {selectedFiles.length > 0 && (
                   <div className="mt-4 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                     {selectedFiles.map((file, index) => (
                       <div key={index} className="relative group border rounded-md overflow-hidden aspect-square">
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
                           onClick={() => removeFile(index)}
                           title="Remover Imagem"
                         >
                           <X className="h-3 w-3" />
                         </Button>
                       </div>
                     ))}
                   </div>
                 )}
              </div>

               {/* Attachments Section - Placeholder */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Anexos (Links Externos)</h3>
                 <div className="flex items-end gap-2 mb-3">
                    <div className="flex-1">
                        <Label htmlFor="attachment-link">Link do Anexo</Label>
                        <Input id="attachment-link" placeholder="Ex: https://docs.google.com/document/d/..." />
                    </div>
                     <div className="flex-1">
                        <Label htmlFor="attachment-name">Nome do Anexo</Label>
                        <Input id="attachment-name" placeholder="Ex: Manual de Instruções" />
                    </div>
                    <Button type="button" variant="outline" size="sm">
                       <Plus className="mr-2 h-4 w-4" /> Adicionar Anexo
                    </Button>
                 </div>
                 {/* Display added attachments here */}
              </div>

            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Salvar Ativo
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
