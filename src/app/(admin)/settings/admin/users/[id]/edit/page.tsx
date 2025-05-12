
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
import { ArrowLeft, Save, Loader2, Trash2, KeyRound } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PwaInstallPromptButton } from '@/components/feature/pwa-install-prompt-button'; // Import the PWA install button

// Schema for editing - password becomes optional
const userEditSchema = z.object({
  name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres.' }),
  email: z.string().email({ message: 'Email inválido.' }), // Email typically cannot be changed easily in Firebase Auth
  role: z.string().min(1, { message: 'Selecione um perfil.' }),
  managerId: z.string().optional(),
  // password: z.string().min(8, { message: 'A nova senha deve ter pelo menos 8 caracteres.' }).optional().or(z.literal('')), // Password change handled separately
  isActive: z.boolean().default(true),
});

type UserEditFormData = z.infer<typeof userEditSchema>;

// Mock data - replace with actual data fetching later
const roles = ['Administrador', 'Gerente', 'Técnico', 'Inventariante'];
const initialUsers = [ // Added for fetchUserData mock
  { id: 'user1', name: 'João Silva', email: 'joao.silva@example.com', role: 'Administrador', managerId: null, status: 'active' },
  { id: 'user2', name: 'Maria Oliveira', email: 'maria.oliveira@example.com', role: 'Gerente', managerId: 'user1', status: 'active' },
  { id: 'user3', name: 'Carlos Pereira', email: 'carlos.pereira@example.com', role: 'Técnico', managerId: 'user2', status: 'active' },
  { id: 'user4', name: 'Ana Costa', email: 'ana.costa@example.com', role: 'Inventariante', managerId: 'user2', status: 'inactive' },
  { id: 'user5', name: 'Pedro Santos', email: 'pedro.santos@example.com', role: 'Técnico', managerId: 'user2', status: 'active' },
  { id: 'other-company-user', name: 'Outro Usuário', email: 'outro@empresa.com', role: 'Técnico', managerId: null, status: 'active' }
];
const initialManagers = [ // Should exclude the current user being edited and be filtered by company
  { id: 'user1', name: 'João Silva (Admin)' },
  { id: 'user2', name: 'Maria Oliveira (Gerente)' },
];

// Mock function to fetch user data by ID (excluding password)
async function fetchUserData(id: string, companyId: string): Promise<Omit<UserEditFormData, 'password'> | null> {
    console.log(`Fetching user with ID: ${id} for company: ${companyId}`);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay

    // Filter mock data by companyId (example)
    const companyUsers = initialUsers.filter(u => u.id !== 'other-company-user'); // Placeholder filtering

    const user = companyUsers.find(u => u.id === id);
    if (!user) return null;

    return {
        name: user.name,
        email: user.email,
        role: user.role,
        managerId: user.managerId || undefined, // Return undefined if null
        isActive: user.status === 'active',
    };
}

function getInitials(name: string): string {
    if (!name) return '';
    const names = name.split(' ');
    const firstInitial = names[0]?.[0] ?? '';
    const lastInitial = names.length > 1 ? names[names.length - 1]?.[0] ?? '' : '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
}


export default function AdminEditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [userData, setUserData] = useState<Omit<UserEditFormData, 'password'> | null>(null);
  const [managers, setManagers] = useState<{id: string, name: string}[]>([]);
  const [isLoadingManagers, setIsLoadingManagers] = useState(true);

  // Placeholder for logged-in user's info (replace with actual auth context)
  const loggedInUserId = 'user1'; // Example: assume admin is logged in
  const loggedInUserRole = 'Administrador'; // Example: assume admin is logged in
  const companyId = 'COMPANY_XYZ'; // Assume this is obtained from user context

  const form = useForm<UserEditFormData>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      name: '',
      email: '',
      role: '',
      managerId: '__none__', // Default to none
      // password: '', // Password handled separately
      isActive: true,
    },
  });

 useEffect(() => {
        // Fetch managers list (excluding the user being edited and filtered by company)
       const fetchManagers = async () => {
           setIsLoadingManagers(true);
           console.log("Fetching managers for company:", companyId);
           // TODO: Replace with actual API call to fetch Admin/Manager users for this company
           await new Promise(resolve => setTimeout(resolve, 500));
           setManagers(initialManagers.filter(m => m.id !== userId)); // Filter out self
           setIsLoadingManagers(false);
       };

       fetchManagers();

        if (userId) {
            const loadData = async () => {
                setIsDataLoading(true);
                const data = await fetchUserData(userId, companyId);
                 if (data) {
                     setUserData(data);
                     form.reset({ // Reset form excluding password
                         name: data.name,
                         email: data.email,
                         role: data.role,
                         managerId: data.managerId || '__none__', // Ensure managerId is string or '__none__'
                         isActive: data.isActive,
                         // password: '', // Ensure password is empty
                     });
                 } else {
                     toast({ title: "Erro", description: "Usuário não encontrado ou não pertence a esta empresa.", variant: "destructive" });
                     router.replace('/settings/admin/users'); // Redirect if not found
                 }
                setIsDataLoading(false);
            };
            loadData();
        }
   }, [userId, form, router, toast, companyId]);


  // Check if the logged-in user can edit the target user based on roles/hierarchy within the company
  const canEdit = () => {
      if (!userData) return false;
      // TODO: Implement proper permission check based on company roles and hierarchy
      if (loggedInUserRole === 'Administrador') return true; // Admin can edit anyone in their company
      if (loggedInUserRole === 'Gerente') {
         // Check if target user is a subordinate of the logged-in manager (within the same company)
         // For now, let's assume managers can edit anyone except Admins (placeholder)
         return userData.role !== 'Administrador';
      }
      return false; // Technicians/Inventors cannot edit
  };

   // Check if logged-in user can delete the target user within the company
    const canDelete = () => {
        if (!userData) return false;
        // Only Admins can delete, and not themselves or other Admins in the same company
        return loggedInUserRole === 'Administrador' && userData.id !== loggedInUserId && userData.role !== 'Administrador';
    };

    // Check if logged-in user can toggle activation status within the company
    const canToggleStatus = () => {
        if (!userData) return false;
        // Admins can toggle anyone except themselves
        if (loggedInUserRole === 'Administrador') return userData.id !== loggedInUserId;
        // Managers can toggle their subordinates (placeholder logic for company)
        if (loggedInUserRole === 'Gerente') {
            // TODO: Check if target user is subordinate within the same company
            return userData.role !== 'Administrador'; // Example: Manager cannot deactivate Admin
        }
        return false;
    };

    // Check if logged-in user can reset password within the company
    const canResetPassword = () => {
        if (!userData) return false;
        // Admins can reset anyone in their company
        if (loggedInUserRole === 'Administrador') return true;
        // Managers can reset subordinates (placeholder logic for company)
        if (loggedInUserRole === 'Gerente') {
             // TODO: Check if target user is subordinate within the same company
             return userData.role !== 'Administrador'; // Example: Manager cannot reset Admin
        }
        return false;
    };


  async function onSubmit(data: UserEditFormData) {
      if (!canEdit()) {
         toast({ title: "Permissão Negada", description: "Você não tem permissão para editar este usuário.", variant: "destructive" });
         return;
      }

    setIsLoading(true);
    console.log('Updating user data:', data, 'for company:', companyId);

    // Prepare data: map '__none__' to undefined
    const dataToSave = {
        ...data,
        managerId: data.managerId === '__none__' ? undefined : data.managerId,
        companyId: companyId, // Ensure company context is maintained
    };

    // Simulate API call ( Firestore update)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Replace with actual API call to update user data (Firestore)
    // try {
    //   // Update user details in Firestore (using dataToSave)
    //   // Ensure Firestore rules check companyId and permissions
    //   toast({
    //     title: 'Sucesso!',
    //     description: `Usuário "${data.name}" atualizado com sucesso.`,
    //     variant: 'default',
    //   });
        // Redirect to the admin users list
    //   router.push('/settings/admin/users');
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
      // Redirect to the admin users list
      router.push('/settings/admin/users');
    // --- END REMOVE BLOCK ---
  }

   const resetPasswordAction = async () => {
       if (!canResetPassword() || !userData) return;

        setIsLoading(true); // Indicate loading for the reset action
        console.log(`Initiating password reset for ${userData.email}`);
        // TODO: Implement API call to trigger Firebase password reset email
         await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        try {
            // await sendPasswordResetEmail(auth, userData.email); // Firebase function
            toast({
                title: "Email de Redefinição Enviado",
                description: `Um email foi enviado para ${userData.email} com instruções.`,
            });
        } catch (error) {
             console.error("Password reset failed:", error);
             toast({ title: "Erro", description: "Falha ao enviar email de redefinição.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const deleteUserAction = () => {
        if (!canDelete() || !userData) return;
        // Logic is inside the AlertDialog on confirm
        console.log(`Attempting to delete user ${userData.name} from company ${companyId}`);
         // TODO: Call actual API inside AlertDialog confirm action
         // Ensure API deletes user from Auth and Firestore (with company context check)
         // Show confirmation dialog (handled by AlertDialogTrigger/Content)
    }


     if (isDataLoading || isLoadingManagers) {
         return (
            <div className="space-y-6">
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
                         {/* <Skeleton className="h-10 w-full" /> Password field removed */}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                         </div>
                         <Skeleton className="h-16 w-full border p-3" />
                         <Skeleton className="h-10 w-40" /> {/* Reset password button placeholder */}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Skeleton className="h-10 w-32" /> {/* Delete button placeholder */}
                         <div className="flex gap-2">
                             <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-24" />
                         </div>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    if (!userData) {
        // This case should ideally be handled by the redirect in useEffect,
        // but kept as a fallback.
        return (
             <div className="flex justify-center">
                <p className="text-destructive">Erro ao carregar dados do usuário.</p>
             </div>
            );
    }


  return (
    <div className="space-y-6">
       {/* Ensure back link points to the correct admin path */}
      <Button variant="outline" size="sm" asChild className="mb-4">
        <Link href="/settings/admin/users">
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
                        <Input placeholder="Ex: João da Silva" {...field} disabled={!canEdit()} />
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

               {/* Password field removed - handled by Reset Password button */}

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Perfil de Acesso</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!canEdit() || userData.role === 'Administrador'}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o perfil" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role} value={role} disabled={role === 'Administrador' && loggedInUserRole !== 'Administrador'}>
                                {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                       <FormDescription>Define as permissões do usuário.</FormDescription>
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
                         disabled={!canEdit() || isLoadingManagers}
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
                          aria-readonly={!canToggleStatus()}
                          disabled={!canToggleStatus()}
                        />
                      </FormControl>
                    </FormItem>
                    )}
                />

                 <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={resetPasswordAction}
                        disabled={!canResetPassword() || isLoading}
                        className="w-full sm:w-fit"
                    >
                    <KeyRound className="mr-2 h-4 w-4" /> Redefinir Senha por Email
                    </Button>
                    <PwaInstallPromptButton />
                 </div>

            </CardContent>
             <CardFooter className="flex justify-between">
                <AlertDialog>
                     <AlertDialogTrigger asChild>
                         <Button type="button" variant="destructive" disabled={!canDelete()}>
                             <Trash2 className="mr-2 h-4 w-4" /> Excluir Usuário
                         </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                         <AlertDialogHeader>
                           <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                           <AlertDialogDescription>
                             Tem certeza que deseja excluir permanentemente o usuário "{userData.name}"? Esta ação não pode ser desfeita e removerá o acesso do usuário.
                           </AlertDialogDescription>
                         </AlertDialogHeader>
                         <AlertDialogFooter>
                           <AlertDialogCancel>Cancelar</AlertDialogCancel>
                           <AlertDialogAction
                             onClick={deleteUserAction}
                             className="bg-destructive hover:bg-destructive/90"
                           >
                             Confirmar Exclusão
                           </AlertDialogAction>
                         </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                 <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isLoading || !canEdit()}>
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

