
'use client';

import { useState, useEffect } from 'react'; // Added useEffect
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
// import { Switch } from '@/components/ui/switch'; // Removed Switch, status is active by default

const userSchema = z.object({
  name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres.' }),
  email: z.string().email({ message: 'Email inválido.' }),
  role: z.string().min(1, { message: 'Selecione um perfil.' }),
  managerId: z.string().optional(), // Optional, as admins/top-level managers might not have one
  password: z.string().min(8, { message: 'A senha deve ter pelo menos 8 caracteres.' }),
  // isActive is true by default, no need for field unless explicit control needed during creation
});

type UserFormData = z.infer<typeof userSchema>;

// Mock data - replace with actual data fetching later
const roles = ['Administrador', 'Gerente', 'Técnico', 'Inventariante'];
const initialManagers = [ // Example data
  { id: 'user1', name: 'João Silva (Admin)' },
  { id: 'user2', name: 'Maria Oliveira (Gerente)' },
];


export default function NewUserPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [managers, setManagers] = useState<{id: string, name: string}[]>([]); // State for managers list
  const [isLoadingManagers, setIsLoadingManagers] = useState(true);

  // Fetch managers on component mount
   useEffect(() => {
       const fetchManagers = async () => {
           setIsLoadingManagers(true);
           // TODO: Replace with actual API call to fetch users with Admin or Manager roles
           await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
           setManagers(initialManagers);
           setIsLoadingManagers(false);
       };
       fetchManagers();
   }, []);


  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      role: '',
      managerId: '__none__', // Default to none
      password: '',
      // isActive: true, // No need to set here, handled by backend or default logic
    },
  });

  async function onSubmit(data: UserFormData) {
    setIsLoading(true);
    console.log('Submitting user data:', data);

    // Prepare data: map '__none__' to undefined for managerId
    const dataToSave = {
        ...data,
        managerId: data.managerId === '__none__' ? undefined : data.managerId,
        isActive: true, // Explicitly set status for backend
    };

    // Simulate API call (Firebase Auth + Firestore)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Replace with actual API call to create user (Auth) and save user data (Firestore)
    // try {
    //   // 1. Create user in Firebase Auth
    //   // 2. Save user details (including role, managerId, status) in Firestore (using dataToSave)
    //   // 3. Send welcome email (optional)
    //   toast({
    //     title: 'Sucesso!',
    //     description: `Usuário "${data.name}" cadastrado. Um email de boas-vindas foi enviado.`,
    //     variant: 'default',
    //   });
    //   router.push('/users'); // Redirect to users list
    // } catch (error) {
    //   console.error('Error saving user:', error);
    //   let errorMessage = 'Não foi possível cadastrar o usuário. Tente novamente.';
    //   // Handle specific Firebase Auth errors (e.g., email-already-in-use)
    //   // if (error.code === 'auth/email-already-in-use') {
    //   //    errorMessage = 'Este email já está em uso por outro usuário.';
    //   // }
    //   toast({
    //     title: 'Erro ao Salvar',
    //     description: errorMessage,
    //     variant: 'destructive',
    //   });
    // } finally {
       setIsLoading(false);
    // }
     // --- REMOVE THIS BLOCK AFTER API IMPLEMENTATION ---
     toast({
        title: 'Sucesso! (Simulado)',
        description: `Usuário "${data.name}" cadastrado. Email de boas-vindas enviado (simulado).`,
      });
      router.push('/users');
    // --- END REMOVE BLOCK ---
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" asChild className="mb-4">
        <Link href="/users">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Cadastrar Novo Usuário</CardTitle>
          <CardDescription>Preencha as informações para criar um novo usuário no sistema.</CardDescription>
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
                        <Input type="email" placeholder="Ex: joao.silva@empresa.com" {...field} />
                      </FormControl>
                       <FormDescription>Este será o login do usuário.</FormDescription>
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
                      <FormLabel>Senha Inicial</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} />
                      </FormControl>
                       <FormDescription>Mínimo 8 caracteres. O usuário poderá alterar depois.</FormDescription>
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
                       <Select
                         onValueChange={field.onChange}
                         value={field.value || '__none__'}
                         disabled={isLoadingManagers}
                        >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={isLoadingManagers ? "Carregando..." : "Selecione o gerente"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           <SelectItem value="__none__">Nenhum</SelectItem>
                          {managers.map((manager) => (
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
               {/* isActive field is removed - handled by default logic */}
                 {/* <FormField
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
                        />
                      </FormControl>
                    </FormItem>
                    )}
                /> */}

            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || isLoadingManagers}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Salvar Usuário
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

    