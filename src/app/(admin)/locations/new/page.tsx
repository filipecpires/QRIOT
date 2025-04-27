
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2, LocateFixed } from 'lucide-react';
import { getCurrentLocation, type Location } from '@/services/geolocation'; // Assuming service exists

const locationSchema = z.object({
  name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
  latitude: z.number({invalid_type_error: 'Latitude inválida.'}).min(-90).max(90),
  longitude: z.number({invalid_type_error: 'Longitude inválida.'}).min(-180).max(180),
});

type LocationFormData = z.infer<typeof locationSchema>;

export default function NewLocationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: '',
      latitude: undefined, // Start undefined to allow placeholder
      longitude: undefined,
    },
  });

  const fetchCurrentLocation = async () => {
    setIsFetchingLocation(true);
    try {
      const location: Location = await getCurrentLocation(); // Use the imported function
      form.setValue('latitude', location.lat);
      form.setValue('longitude', location.lng);
       toast({
           title: 'Localização Obtida',
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
    console.log('Submitting location data:', data);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Replace with actual API call to save the location
    // try {
    //   const response = await fetch('/api/locations', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(data),
    //   });
    //   if (!response.ok) throw new Error('Failed to save location');
    //   const result = await response.json();
       toast({
         title: 'Sucesso!',
         description: `Local "${data.name}" cadastrado com sucesso.`,
         variant: 'default',
       });
       router.push('/locations'); // Redirect to locations list
    // } catch (error) {
    //   console.error('Error saving location:', error);
    //   toast({
    //     title: 'Erro ao Salvar',
    //     description: 'Não foi possível cadastrar o local. Tente novamente.',
    //     variant: 'destructive',
    //   });
    // } finally {
       setIsLoading(false);
    // }
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
          <CardTitle>Cadastrar Novo Local</CardTitle>
          <CardDescription>Informe o nome e as coordenadas GPS do local de instalação.</CardDescription>
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
                    <Save className="mr-2 h-4 w-4" /> Salvar Local
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
