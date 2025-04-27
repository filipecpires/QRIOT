
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2, LocateFixed, Trash2 } from 'lucide-react';
import { getCurrentLocation, type Location } from '@/services/geolocation'; // Assuming service exists
import { Skeleton } from '@/components/ui/skeleton';

const locationSchema = z.object({
  name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
  latitude: z.number({invalid_type_error: 'Latitude inválida.'}).min(-90).max(90),
  longitude: z.number({invalid_type_error: 'Longitude inválida.'}).min(-180).max(180),
});

type LocationFormData = z.infer<typeof locationSchema>;


// Mock function to fetch location data by ID
async function fetchLocationData(id: string): Promise<LocationFormData | null> {
     console.log(`Fetching location with ID: ${id}`);
     await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
    if (id === 'loc1') {
        return { name: 'Escritório 1', latitude: -23.5505, longitude: -46.6333 };
    } else if (id === 'loc3') {
         return { name: 'Sala de Reuniões', latitude: -23.5500, longitude: -46.6330 };
    }
     return null; // Not found
}


export default function EditLocationPage() {
  const router = useRouter();
  const params = useParams();
  const locationId = params.id as string;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [locationData, setLocationData] = useState<LocationFormData | null>(null);

  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: '',
      latitude: undefined,
      longitude: undefined,
    },
  });

 useEffect(() => {
        if (locationId) {
            const loadData = async () => {
                setIsDataLoading(true);
                const data = await fetchLocationData(locationId);
                 if (data) {
                     setLocationData(data);
                     form.reset(data); // Populate form
                 } else {
                     toast({ title: "Erro", description: "Local não encontrado.", variant: "destructive" });
                     router.replace('/locations'); // Redirect if not found
                 }
                setIsDataLoading(false);
            };
            loadData();
        }
   }, [locationId, form, router, toast]);


  const fetchCurrentLocation = async () => {
    setIsFetchingLocation(true);
    try {
      const location: Location = await getCurrentLocation();
      form.setValue('latitude', location.lat);
      form.setValue('longitude', location.lng);
       toast({
           title: 'Localização Atualizada',
           description: `Latitude: ${location.lat.toFixed(4)}, Longitude: ${location.lng.toFixed(4)}`,
        });
    } catch (error) {
      console.error("Error getting current location:", error);
      toast({
        title: 'Erro ao Obter Localização',
        description: 'Não foi possível obter a localização atual. Verifique as permissões do navegador.',
        variant: 'destructive',
      });
    } finally {
      setIsFetchingLocation(false);
    }
  };


  async function onSubmit(data: LocationFormData) {
    setIsLoading(true);
    console.log('Updating location data:', data);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Replace with actual API call to update the location
    // try {
    //   const response = await fetch(`/api/locations/${locationId}`, {
    //     method: 'PUT', // or PATCH
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(data),
    //   });
    //   if (!response.ok) throw new Error('Failed to update location');
    //   const result = await response.json();
       toast({
         title: 'Sucesso!',
         description: `Local "${data.name}" atualizado com sucesso.`,
         variant: 'default',
       });
       router.push('/locations'); // Redirect to locations list
    // } catch (error) {
    //   console.error('Error updating location:', error);
    //   toast({
    //     title: 'Erro ao Atualizar',
    //     description: 'Não foi possível atualizar o local. Tente novamente.',
    //     variant: 'destructive',
    //   });
    // } finally {
       setIsLoading(false);
    // }
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
                        <Skeleton className="h-10 w-full" />
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                         </div>
                         <Skeleton className="h-64 w-full" />
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-24" />
                    </CardFooter>
                </Card>
            </div>
        );
    }

    if (!locationData) {
         return (
             <div className="flex justify-center">
                <p className="text-destructive">Erro ao carregar dados do local.</p>
             </div>
            );
    }


  return (
    <div className="space-y-6"> {/* Use simple div instead of container */}
      <Button variant="outline" size="sm" asChild className="mb-4">
        <Link href="/locations">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Editar Local: {locationData.name}</CardTitle>
          <CardDescription>Atualize o nome e as coordenadas GPS do local de instalação.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Local</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Escritório Principal, Almoxarifado Central" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                 <FormField
                  control={form.control}
                  name="latitude"
                   render={({ field }) => (
                    <FormItem>
                      <FormLabel>Latitude</FormLabel>
                       <FormControl>
                         <Input type="number" step="any" placeholder="-23.5505" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="longitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Longitude</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" placeholder="-46.6333" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="button" variant="outline" onClick={fetchCurrentLocation} disabled={isFetchingLocation}>
                  {isFetchingLocation ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Obtendo...
                      </>
                  ) : (
                       <>
                          <LocateFixed className="mr-2 h-4 w-4" /> Usar Localização Atual
                       </>
                  )}

                </Button>
              </div>
              <FormDescription>
                  Você pode inserir as coordenadas manualmente ou usar sua localização atual (requer permissão do navegador).
             </FormDescription>

              {/* Add Map preview here later using @vis.gl/react-google-maps */}
                <div className="h-64 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                   Preview do Mapa (Implementar)
                </div>

            </CardContent>
            <CardFooter className="flex justify-between">
                <Button type="button" variant="destructive" onClick={() => { /* Implement delete confirmation */ }}>
                    <Trash2 className="mr-2 h-4 w-4" /> Excluir Local
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
    </div>
  );
}
