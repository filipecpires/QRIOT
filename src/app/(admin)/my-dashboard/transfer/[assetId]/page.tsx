'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Send, Loader2, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

// Schema for transfer request
const transferSchema = z.object({
  newResponsibleUserId: z.string().min(1, { message: 'Selecione um novo responsável.' }),
});

type TransferFormData = z.infer<typeof transferSchema>;

interface AssetDetails {
  id: string;
  name: string;
  tag: string;
}

interface UserForSelect {
  id: string;
  name: string;
}

// Mock function to fetch asset details by ID (replace with actual API call)
async function fetchAssetDetailsForTransfer(assetId: string): Promise<AssetDetails | null> {
  console.log(`Fetching asset details for transfer: ${assetId}`);
  await new Promise(resolve => setTimeout(resolve, 500));
  const mockAssets: AssetDetails[] = [
    { id: 'ASSET001', name: 'Notebook Dell Latitude 7400', tag: 'AB12C' },
    { id: 'ASSET003', name: 'Cadeira de Escritório', tag: 'GH56I' },
    { id: 'ASSET004', name: 'Projetor Epson PowerLite', tag: 'JK78L' },
  ];
  return mockAssets.find(asset => asset.id === assetId) || null;
}

// Mock function to fetch users for transfer (excluding current user)
async function fetchUsersForTransfer(currentUserId: string): Promise<UserForSelect[]> {
  console.log(`Fetching users for transfer, excluding ${currentUserId}`);
  await new Promise(resolve => setTimeout(resolve, 500));
  const allUsers: UserForSelect[] = [
    { id: 'user1', name: 'João Silva' },
    { id: 'user2', name: 'Maria Oliveira' },
    { id: 'user3', name: 'Carlos Pereira' },
    { id: 'user4', name: 'Ana Costa' },
  ];
  return allUsers.filter(user => user.id !== currentUserId);
}

// Mock function to initiate transfer (replace with actual API call)
async function initiateAssetTransfer(assetId: string, assetName: string, newResponsibleUserId: string, newResponsibleUserName: string): Promise<{ success: boolean; message?: string }> {
  console.log(`Initiating transfer of asset ${assetName} (ID: ${assetId}) to user ${newResponsibleUserName} (ID: ${newResponsibleUserId})`);
  await new Promise(resolve => setTimeout(resolve, 1000));
  // In a real app:
  // 1. Create a transfer request document in Firestore (e.g., status 'pending', fromUser, toUser, assetId).
  // 2. Notify the `newResponsibleUserId` (e.g., via email, in-app notification).
  return { success: true, message: `Solicitação de transferência para ${newResponsibleUserName} enviada.` };
}

// Mock Logged-in User ID (replace with actual auth context)
const MOCK_LOGGED_IN_USER_ID = 'user1';

export default function TransferAssetPage() {
  const router = useRouter();
  const params = useParams();
  const assetId = params.assetId as string;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [assetDetails, setAssetDetails] = useState<AssetDetails | null>(null);
  const [usersForTransfer, setUsersForTransfer] = useState<UserForSelect[]>([]);

  const form = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      newResponsibleUserId: '',
    },
  });

  useEffect(() => {
    if (!assetId) {
      toast({ title: "Erro", description: "ID do ativo não fornecido.", variant: "destructive" });
      router.replace('/my-dashboard');
      return;
    }

    const loadData = async () => {
      setIsDataLoading(true);
      try {
        const [fetchedAsset, fetchedUsers] = await Promise.all([
          fetchAssetDetailsForTransfer(assetId),
          fetchUsersForTransfer(MOCK_LOGGED_IN_USER_ID),
        ]);

        if (!fetchedAsset) {
          toast({ title: "Erro", description: "Ativo não encontrado.", variant: "destructive" });
          router.replace('/my-dashboard');
          return;
        }
        setAssetDetails(fetchedAsset);
        setUsersForTransfer(fetchedUsers);
      } catch (error) {
        console.error("Error loading data for transfer:", error);
        toast({ title: "Erro", description: "Não foi possível carregar os dados para transferência.", variant: "destructive" });
        router.replace('/my-dashboard');
      } finally {
        setIsDataLoading(false);
      }
    };

    loadData();
  }, [assetId, router, toast]);

  async function onSubmit(data: TransferFormData) {
    if (!assetDetails) return;

    setIsLoading(true);
    const selectedUser = usersForTransfer.find(u => u.id === data.newResponsibleUserId);
    if (!selectedUser) {
        toast({ title: "Erro", description: "Usuário selecionado inválido.", variant: "destructive" });
        setIsLoading(false);
        return;
    }

    try {
      const result = await initiateAssetTransfer(assetDetails.id, assetDetails.name, data.newResponsibleUserId, selectedUser.name);
      if (result.success) {
        toast({
          title: 'Sucesso!',
          description: result.message || `Solicitação de transferência para ${assetDetails.name} enviada.`,
        });
        router.push('/my-dashboard');
      } else {
        toast({
          title: 'Falha na Solicitação',
          description: result.message || 'Não foi possível iniciar a transferência.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error initiating transfer:', error);
      toast({
        title: 'Erro Inesperado',
        description: 'Ocorreu um erro ao processar a solicitação.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isDataLoading || !assetDetails) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/4 mb-4" />
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-1" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" size="sm" asChild>
        <Link href="/my-dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Meu Painel
        </Link>
      </Button>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Transferir Responsabilidade do Ativo</CardTitle>
          <CardDescription>
            Ativo: <span className="font-semibold">{assetDetails.name}</span> (<Badge variant="secondary">{assetDetails.tag}</Badge>)
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="newResponsibleUserId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transferir para:</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading || usersForTransfer.length === 0}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={usersForTransfer.length === 0 ? "Nenhum usuário disponível" : "Selecione o novo responsável"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {usersForTransfer.length > 0 ? (
                          usersForTransfer.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                {user.name}
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no_users" disabled>Nenhum usuário para transferência</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormDescription>
                Ao enviar, uma solicitação será enviada para o usuário selecionado. A transferência só será efetivada após a aceitação.
              </FormDescription>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || usersForTransfer.length === 0}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando Solicitação...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Enviar Solicitação
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
