
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Send, Loader2, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import type { AssetForMyDashboard as AssetDetails, UserForSelect, TransferRequest } from '@/types'; 
import { 
    allAssetsMockData, 
    mockTransferRequests, 
    finalMockUsersForSelect, 
} from '@/lib/mock-data';
import { useAdminLayoutContext } from '@/components/layout/admin-layout-context';


const transferSchema = z.object({
  newResponsibleUserId: z.string().min(1, { message: 'Selecione um novo responsável.' }),
});

type TransferFormData = z.infer<typeof transferSchema>;


async function fetchAssetDetailsForTransfer(assetId: string, companyId: string): Promise<AssetDetails | null> {
  console.log(`Fetching asset details for transfer: ${assetId} in company ${companyId}`);
  await new Promise(resolve => setTimeout(resolve, 500));
  const asset = allAssetsMockData.find(a => a.id === assetId && a.companyId === companyId);
  if (asset) {
    return {
        id: asset.id,
        name: asset.name,
        tag: asset.tag,
        category: asset.category,
        locationName: asset.locationName,
        status: asset.status as AssetDetails['status'], 
        responsibleUserId: asset.responsibleUserId,
        ownership: asset.ownership,
        companyId: asset.companyId,
    };
  }
  return null;
}

async function fetchUsersForTransfer(currentUserId: string, companyId: string): Promise<UserForSelect[]> {
  console.log(`Fetching users for transfer in company ${companyId}, excluding ${currentUserId}`);
  await new Promise(resolve => setTimeout(resolve, 500));
  return finalMockUsersForSelect.filter(user => user.id !== currentUserId && user.companyId === companyId);
}

async function initiateAssetTransfer(
    assetId: string, 
    assetName: string, 
    assetTag: string,
    fromUserId: string,
    fromUserName: string,
    newResponsibleUserId: string, 
    newResponsibleUserName: string,
    companyId: string // Ensure company context for the transfer
): Promise<{ success: boolean; message?: string }> {
  console.log(`Initiating transfer of asset ${assetName} (ID: ${assetId}) from ${fromUserName} to user ${newResponsibleUserName} (ID: ${newResponsibleUserId}) within company ${companyId}`);
  await new Promise(resolve => setTimeout(resolve, 1000));

  const newTransferRequest: TransferRequest = {
    id: `transfer-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    assetId,
    assetName,
    assetTag,
    fromUserId,
    fromUserName,
    toUserId: newResponsibleUserId,
    toUserName: newResponsibleUserName,
    requestDate: new Date(),
    status: 'pending',
    companyId: companyId, // Store companyId with the request
  };

  mockTransferRequests.push(newTransferRequest);
  console.log("Updated mockTransferRequests:", mockTransferRequests);

  return { success: true, message: `Solicitação de transferência para ${newResponsibleUserName} enviada.` };
}


export default function TransferAssetPage() {
  const router = useRouter();
  const params = useParams();
  const assetId = params.assetId as string;
  const { toast } = useToast();
  const { currentUserId, currentUserName, currentCompanyId, currentDemoProfileName } = useAdminLayoutContext();

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
    if (!assetId || !currentUserId || !currentCompanyId) {
      toast({ title: "Erro", description: "Informações de ativo ou usuário/empresa ausentes.", variant: "destructive" });
      router.replace(currentDemoProfileName ? `/my-dashboard?profile=${encodeURIComponent(currentDemoProfileName)}` : '/my-dashboard');
      return;
    }

    const loadData = async () => {
      setIsDataLoading(true);
      try {
        const [fetchedAsset, fetchedUsers] = await Promise.all([
          fetchAssetDetailsForTransfer(assetId, currentCompanyId),
          fetchUsersForTransfer(currentUserId, currentCompanyId), 
        ]);

        if (!fetchedAsset) {
          toast({ title: "Erro", description: "Ativo não encontrado ou não pertence à sua empresa.", variant: "destructive" });
          router.replace(currentDemoProfileName ? `/my-dashboard?profile=${encodeURIComponent(currentDemoProfileName)}` : '/my-dashboard');
          return;
        }
         if (fetchedAsset.responsibleUserId !== currentUserId) {
            toast({ title: "Acesso Negado", description: "Você não é o responsável atual por este ativo.", variant: "destructive" });
            router.replace(currentDemoProfileName ? `/my-dashboard?profile=${encodeURIComponent(currentDemoProfileName)}` : '/my-dashboard');
            return;
        }
        setAssetDetails(fetchedAsset);
        setUsersForTransfer(fetchedUsers);
      } catch (error) {
        console.error("Error loading data for transfer:", error);
        toast({ title: "Erro", description: "Não foi possível carregar os dados para transferência.", variant: "destructive" });
        router.replace(currentDemoProfileName ? `/my-dashboard?profile=${encodeURIComponent(currentDemoProfileName)}` : '/my-dashboard');
      } finally {
        setIsDataLoading(false);
      }
    };

    loadData();
  }, [assetId, router, toast, currentUserId, currentCompanyId, currentDemoProfileName]);

  async function onSubmit(data: TransferFormData) {
    if (!assetDetails || !currentUserId || !currentUserName || !currentCompanyId) {
        toast({title: "Erro", description: "Dados insuficientes para iniciar a transferência.", variant: "destructive"});
        return;
    }

    setIsLoading(true);
    const selectedUser = usersForTransfer.find(u => u.id === data.newResponsibleUserId);
    if (!selectedUser) {
        toast({ title: "Erro", description: "Usuário selecionado inválido.", variant: "destructive" });
        setIsLoading(false);
        return;
    }

    try {
      const result = await initiateAssetTransfer(
        assetDetails.id, 
        assetDetails.name, 
        assetDetails.tag,
        currentUserId, 
        currentUserName,
        data.newResponsibleUserId, 
        selectedUser.name,
        currentCompanyId // Pass companyId
      );
      if (result.success) {
        toast({
          title: 'Sucesso!',
          description: result.message || `Solicitação de transferência para ${assetDetails.name} enviada.`,
        });
        router.push(currentDemoProfileName ? `/my-dashboard?profile=${encodeURIComponent(currentDemoProfileName)}` : '/my-dashboard');
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
        <Link href={currentDemoProfileName ? `/my-dashboard?profile=${encodeURIComponent(currentDemoProfileName)}` : '/my-dashboard'}>
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
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoading || usersForTransfer.length === 0}>
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
