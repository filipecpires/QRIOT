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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Schema for editing - password becomes optional
const userEditSchema = z.object({
  name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres.' }),
  email: z.string().email({ message: 'Email inválido.' }), // Email typically cannot be changed easily in Firebase Auth
  role: z.string().min(1, { message: 'Selecione um perfil.' }),
  managerId: z.string().optional(),
  password: z.string().min(8, { message: 'A nova senha deve ter pelo menos 8 caracteres.' }).optional().or(z.literal('')), // Optional for update
  isActive: z.boolean().default(true),
});

type UserEditFormData = z.infer<typeof userEditSchema>;

// Mock data - replace with actual data fetching later
const roles = ['Administrador', 'Gerente', 'Técnico', 'Inventariante'];
const managers = [ // Should exclude the current user being edited
  { id: 'user1', name: 'João Silva (Admin)' },
  { id: 'user2', name: 'Maria Oliveira (Gerente)' },
];

// Mock function to fetch user data by ID (excluding password)
async function fetchUserData(id: string): Promise<Omit<UserEditFormData, 'password'> | null> {
    console.log(`Fetching user with ID: ${id}`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
    if (id === 'user3') {
        return {
            name: 'Carlos Pereira',
            email: 'carlos.pereira@example.com',
            role: 'Técnico',
            managerId: 'user2', // Maria Oliveira
            isActive: true,
        };
    } else if (id === 'user4') {
         return {
            name: 'Ana Costa',
            email: 'ana.costa@example.com',
            role: 'Inventariante',
            managerId: 'user2', // Maria Oliveira
            isActive: false, // Example inactive user
        };
    }
    return null; // Not found
}

function getInitials(name: string): string {
    if (!name) return '';
    const names = name.split(' ');
    const firstInitial = names[0]?.[0] ?? '';
    const lastInitial = names.length > 1 ? names[names.length - 1]?.[0] ?? '' : '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
}


export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [userData, setUserData] = useState<Omit<UserEditFormData, 'password'> | null>(null);

  const form = useForm<UserEditFormData>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      name: '',
      email: '',
      role: '',
      managerId: '',
      password: '', // Keep password empty initially
      isActive: true,
    },
  });

 useEffect(() => {
        if (userId) {
            const loadData = async () => {
                setIsDataLoading(true);
                const data = await fetchUserData(userId);
                 if (data) {
                     setUserData(data);
                     form.reset({ // Reset form excluding password
                         name: data.name,
                         email: data.email,
                         role: data.role,
                         managerId: data.managerId,
                         isActive: data.isActive,
                         password: '', // Ensure password is empty
                     });
                 } else {
                     toast({ title: "Erro", description: "Usuário não encontrado.", variant: "destructive" });
                     router.replace('/users'); // Redirect if not found
                 }
                setIsDataLoading(false);
            };
            loadData();
        }
   }, [userId, form, router, toast]);


  async function onSubmit(data: UserEditFormData) {
    setIsLoading(true);
    console.log('Updating user data:', data);

    // Prepare data: Remove empty password if not provided
    const dataToSave = { ...data };
    if (!dataToSave.password) {
      delete dataToSave.password;
    }

    // Simulate API call (Firebase Auth update + Firestore update)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Replace with actual API call to update user data (Firestore) and potentially password (Auth)
    // try {
    //   // 1. Update user details in Firestore
    //   // 2. If password provided, update in Firebase Auth (requires re-authentication or admin SDK)
    //   toast({
    //     title: 'Sucesso!',
    //     description: `Usuário "${data.name}" atualizado com sucesso.`,
    //     variant: 'default',
    //   });
    //   router.push('/users'); // Redirect to users list
    // } catch (error) {
    //   console.error('Error updating user:', error);
    //   toast({
    //     title: 'Erro ao Atualizar',
    //     description: 'Não foi possível atualizar o usuário. Tente novamente.',
    //     variant: 'destructive',
    //   });
    // } finally {
       setIsLoading(false);
    // }
      // --- REMOVE THIS BLOCK AFTER API IMPLEMENTATION ---
     toast({
        title: 'Sucesso! (Simulado)',
        description: `Usuário "${data.name}" atualizado com sucesso.`,
      });
      router.push('/users');
    // --- END REMOVE BLOCK ---
  }

     if (isDataLoading) {
         return (
            <div className="container mx-auto py-10">
                 <Skeleton className="h-8 w-32 mb-4" />
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4 mb-4">
                             <Skeleton className="h-16 w-16 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-7 w-48" />
                                <Skeleton className="h-4 w-64" />
                            </div>
                         </div>
                        <Skeleton className="h-4 w-1/3" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <Skeleton className="h-10 w-full" />
                             <Skeleton className="h-10 w-full" />
                         </div>
                         <Skeleton className="h-10 w-full" />
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                         </div>
                         <Skeleton className="h-16 w-full border p-3" />
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                         <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-24" />
                    </CardFooter>
                </Card>
            </div>
        );
    }

    if (!userData) {
        return (
             <div className="container mx-auto py-10 flex justify-center">
                <p className="text-destructive">Erro ao carregar dados do usuário.</p>
             </div>
            );
    }


  return (
    <div className="container mx-auto py-10">
      <Button variant="outline" size="sm" asChild className="mb-4">
        <Link href="/users">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista
        </Link>
      </Button>
      <Card>
        <CardHeader>
            <div className="flex items-center gap-4 mb-4">
                 <Avatar className="h-16 w-16">
                    <AvatarImage src={`https://i.pravatar.cc/64?u=${userData.email}`} alt={userData.name} />
                    <AvatarFallback className="text-xl">{getInitials(userData.name)}</AvatarFallback>
                 </Avatar>
                <div>
                    <CardTitle className="text-2xl">Editar Usuário: {userData.name}</CardTitle>
                    <CardDescription>{userData.email}</CardDescription>
                 </div>
            </div>
             <CardDescription>Atualize as informações do usuário.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: João da Silva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} readOnly className="bg-muted cursor-not-allowed" />
                      </FormControl>
                       <FormDescription>O email não pode ser alterado.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

               <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova Senha (Opcional)</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Deixe em branco para manter a senha atual" {...field} />
                      </FormControl>
                       <FormDescription>Mínimo 8 caracteres se for alterar.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Perfil de Acesso</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o perfil" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role} value={role}>{role}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                  <FormField
                  control={form.control}
                  name="managerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gerente Direto (Opcional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || ''}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o gerente (se aplicável)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           <SelectItem value="">Nenhum</SelectItem>
                           {/* Filter out the current user from the managers list */}
                          {managers.filter(m => m.id !== userId).map((manager) => (
                            <SelectItem key={manager.id} value={manager.id}>{manager.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Define a hierarquia para visualização de ativos.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
               </div>
                 <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Usuário Ativo</FormLabel>
                        <FormDescription>
                          Usuários inativos não podem acessar o sistema.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          aria-readonly={userId === 'user1'} // Example: Prevent deactivating the main admin
                          disabled={userId === 'user1'} // Example: Prevent deactivating the main admin
                        />
                      </FormControl>
                    </FormItem>
                    )}
                />

            </CardContent>
             <CardFooter className="flex justify-between">
                 <Button type="button" variant="destructive" onClick={() => { /* Implement delete confirmation */ }} disabled={userId === 'user1' /* Example disable delete for admin */}>
                    <Trash2 className="mr-2 h-4 w-4" /> Excluir Usuário
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
