'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Ensure useRouter is imported
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Wrench,
  CheckSquare,
  MapPin,
  MoreHorizontal,
  UserSquare,
  Search,
  Edit,
  Eye,
  PackageSearch,
  MoveRight,
  CheckCircle,
  XCircle,
  Loader2,
  Inbox,
  User as UserIcon,
  Tag as TagIcon,
  CalendarDays,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// --- Mock Data Structures ---
interface AssetForMyDashboard {
  id: string;
  name: string;
  tag: string;
  status: 'active' | 'lost' | 'inactive' | 'maintenance'; // Added maintenance status
  locationName: string;
  category: string;
}

interface TransferRequest {
  id: string; // Transfer request ID
  assetId: string;
  assetName: string;
  assetTag: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string; // Logged-in user
  requestDate: Date;
  status: 'pending' | 'accepted' | 'rejected';
  processedDate?: Date;
}


// Mock Logged-in User ID (replace with actual auth context)
const MOCK_LOGGED_IN_USER_ID = 'user1'; // João Silva
const MOCK_LOGGED_IN_USER_NAME = 'João Silva';


// Mock All Assets (same as in assets/page.tsx for consistency, with responsibleUserId)
let allAssetsMockData = [
  { id: 'ASSET001', name: 'Notebook Dell Latitude 7400', category: 'Eletrônicos', tag: 'AB12C', location: 'Escritório 1', responsibleUserId: MOCK_LOGGED_IN_USER_ID, status: 'active', ownership: 'own' },
  { id: 'ASSET002', name: 'Monitor LG 27"', category: 'Eletrônicos', tag: 'DE34F', location: 'Escritório 2', responsibleUserId: 'user2', status: 'active', ownership: 'own' },
  { id: 'ASSET003', name: 'Cadeira de Escritório', category: 'Mobiliário', tag: 'GH56I', location: 'Sala de Reuniões', responsibleUserId: MOCK_LOGGED_IN_USER_ID, status: 'lost', ownership: 'rented' },
  { id: 'ASSET004', name: 'Projetor Epson PowerLite', category: 'Eletrônicos', tag: 'JK78L', location: 'Sala de Treinamento', responsibleUserId: MOCK_LOGGED_IN_USER_ID, status: 'maintenance', ownership: 'own' },
  { id: 'ASSET005', name: 'Teclado Gamer RGB', category: 'Eletrônicos', tag: 'MN90P', location: 'Escritório 1', responsibleUserId: 'user2', status: 'inactive', ownership: 'own' },
  { id: 'ASSET006', name: 'Impressora Multifuncional HP', category: 'Eletrônicos', tag: 'QR12S', location: 'Recepção', responsibleUserId: 'user3', status: 'active', ownership: 'own' },
];

let mockTransferRequests: TransferRequest[] = [
    { id: 'transfer1', assetId: 'ASSET002', assetName: 'Monitor LG 27"', assetTag: 'DE34F', fromUserId: 'user2', fromUserName: 'Maria Oliveira', toUserId: MOCK_LOGGED_IN_USER_ID, requestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), status: 'pending' },
    { id: 'transfer2', assetId: 'ASSET005', assetName: 'Teclado Gamer RGB', assetTag: 'MN90P', fromUserId: 'user2', fromUserName: 'Maria Oliveira', toUserId: MOCK_LOGGED_IN_USER_ID, requestDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), status: 'pending' },
    { id: 'transfer3', assetId: 'ASSET006', assetName: 'Impressora Multifuncional HP', assetTag: 'QR12S', fromUserId: 'user3', fromUserName: 'Carlos Pereira', toUserId: MOCK_LOGGED_IN_USER_ID, requestDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), status: 'accepted', processedDate: new Date(Date.now() - 23 * 60 * 60 * 1000) },
];


// --- Mock Fetch Functions ---
async function fetchMyAssets(userId: string): Promise<AssetForMyDashboard[]> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return allAssetsMockData
    .filter(asset => asset.responsibleUserId === userId)
    .map(asset => ({
      id: asset.id,
      name: asset.name,
      tag: asset.tag,
      status: asset.status as AssetForMyDashboard['status'], // Cast status
      locationName: asset.location,
      category: asset.category,
    }));
}

async function fetchTransferRequestsForUser(userId: string): Promise<TransferRequest[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    // Return all transfers involving the user, both incoming and outgoing pending
    return mockTransferRequests.filter(req => 
        (req.toUserId === userId && req.status === 'pending') || 
        (req.fromUserId === userId && req.status === 'pending')
    );
}


// Mock Action Functions (replace with actual API calls and logic)
async function reportAssetLost(assetId: string, assetName: string): Promise<{ success: boolean }> {
    console.log(`Reporting asset ${assetName} (ID: ${assetId}) as lost.`);
    await new Promise(resolve => setTimeout(resolve, 700));
    const assetIndex = allAssetsMockData.findIndex(a => a.id === assetId);
    if (assetIndex !== -1) {
        allAssetsMockData[assetIndex].status = 'lost';
    }
    return { success: true };
}

async function processTransferRequest(transferId: string, assetId: string, newResponsibleUserId: string, action: 'accept' | 'reject'): Promise<{ success: boolean }> {
    console.log(`${action === 'accept' ? 'Accepting' : 'Rejecting'} transfer ${transferId} for asset ${assetId} to user ${newResponsibleUserId}`);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const transferIndex = mockTransferRequests.findIndex(t => t.id === transferId);
    if (transferIndex === -1) return { success: false };

    if (action === 'accept') {
        mockTransferRequests[transferIndex].status = 'accepted';
        mockTransferRequests[transferIndex].processedDate = new Date();
        
        const assetIndex = allAssetsMockData.findIndex(a => a.id === assetId);
        if (assetIndex !== -1) {
            allAssetsMockData[assetIndex].responsibleUserId = newResponsibleUserId;
            // Optionally update asset status if needed, e.g., from 'transfer_pending' to 'active'
        } else {
            return {success: false}; // Asset not found for transfer
        }
    } else { // reject
        mockTransferRequests[transferIndex].status = 'rejected';
        mockTransferRequests[transferIndex].processedDate = new Date();
    }
    return { success: true };
}


export default function MyDashboardPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [myAssets, setMyAssets] = useState<AssetForMyDashboard[]>([]);
  const [transferRequests, setTransferRequests] = useState<TransferRequest[]>([]);
  const [isLoadingMyAssets, setIsLoadingMyAssets] = useState(true);
  const [isLoadingTransfers, setIsLoadingTransfers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [assetToAction, setAssetToAction] = useState<AssetForMyDashboard | null>(null);
  const [isLostConfirmOpen, setIsLostConfirmOpen] = useState(false);
  const [processingTransferId, setProcessingTransferId] = useState<string | null>(null);

  const loadMyAssets = useCallback(async () => {
      setIsLoadingMyAssets(true);
      setError(null);
      try {
        const fetchedAssets = await fetchMyAssets(MOCK_LOGGED_IN_USER_ID);
        setMyAssets(fetchedAssets);
      } catch (err) {
        console.error("Error fetching my assets:", err);
        setError("Falha ao carregar seus ativos.");
      } finally {
        setIsLoadingMyAssets(false);
      }
  }, []);

  const loadTransferRequests = useCallback(async () => {
    setIsLoadingTransfers(true);
    try {
        const transfers = await fetchTransferRequestsForUser(MOCK_LOGGED_IN_USER_ID);
        setTransferRequests(transfers);
    } catch (err) {
        console.error("Error fetching transfer requests:", err);
        toast({ title: "Erro", description: "Falha ao carregar solicitações de transferência.", variant: "destructive"});
    } finally {
        setIsLoadingTransfers(false);
    }
  }, [toast]);

  useEffect(() => {
    loadMyAssets();
    loadTransferRequests();
  }, [loadMyAssets, loadTransferRequests]);

  const filteredAssets = myAssets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReportLost = (asset: AssetForMyDashboard) => {
    setAssetToAction(asset);
    setIsLostConfirmOpen(true);
  };

  const confirmReportLost = async () => {
    if (!assetToAction) return;
    const result = await reportAssetLost(assetToAction.id, assetToAction.name);
    if (result.success) {
      loadMyAssets(); // Refetch assets to update status
      toast({ title: "Ativo Reportado", description: `${assetToAction.name} foi marcado como perdido.` });
    } else {
      toast({ title: "Erro", description: "Falha ao reportar perda do ativo.", variant: "destructive" });
    }
    setIsLostConfirmOpen(false);
    setAssetToAction(null);
  };

  const handleRequestMaintenance = (asset: AssetForMyDashboard) => {
    router.push(`/maintenance/work-orders/new?assetId=${asset.id}&assetName=${encodeURIComponent(asset.name)}`);
  };
  
  const handlePerformInventory = (asset: AssetForMyDashboard) => {
    router.push('/inventory/scan'); 
    toast({ title: "Inventariar Ativo", description: `Redirecionando para inventário. Escaneie ${asset.name}...` });
  };

  const handleChangeLocation = (asset: AssetForMyDashboard) => {
    router.push(`/assets/${asset.id}/edit`); 
  };
  
  const handleTransferResponsibility = (asset: AssetForMyDashboard) => {
    router.push(`/my-dashboard/transfer/${asset.id}`);
  };

  const handleTransferAction = async (transfer: TransferRequest, action: 'accept' | 'reject') => {
    setProcessingTransferId(transfer.id);
    const result = await processTransferRequest(transfer.id, transfer.assetId, MOCK_LOGGED_IN_USER_ID, action);
    if (result.success) {
        const actionText = action === 'accept' ? 'Aceita' : 'Rejeitada';
        toast({ title: `Transferência ${actionText}`, description: `A solicitação para ${transfer.assetName} foi ${actionText.toLowerCase()}.`});
        loadMyAssets(); // If accepted, asset might appear in "My Assets"
        loadTransferRequests(); // Refresh pending transfers
    } else {
        toast({ title: "Erro", description: `Falha ao ${action === 'accept' ? 'aceitar' : 'rejeitar'} a transferência.`, variant: "destructive"});
    }
    setProcessingTransferId(null);
  };

  const getStatusBadge = (status: AssetForMyDashboard['status']) => {
    switch (status) {
      case 'active': return <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">Ativo</Badge>;
      case 'lost': return <Badge variant="destructive">Perdido</Badge>;
      case 'inactive': return <Badge variant="secondary">Inativo</Badge>;
      case 'maintenance': return <Badge variant="default" className="bg-orange-500 hover:bg-orange-600 text-white">Em Manutenção</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2"><UserSquare className="h-8 w-8" /> Meu Painel - {MOCK_LOGGED_IN_USER_NAME}</h1>
      </div>

        {/* Pending Transfer Requests Card */}
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Inbox className="h-5 w-5 text-primary"/> Solicitações de Transferência</CardTitle>
                <CardDescription>Ativos aguardando sua ação ou enviados por você para transferência de responsabilidade.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoadingTransfers ? (
                     Array.from({length: 2}).map((_,i) => (
                        <div key={`skel-transfer-${i}`} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-md mb-2 gap-2">
                            <div className="space-y-1 flex-1">
                                <Skeleton className="h-4 w-4/5" />
                                <Skeleton className="h-3 w-3/5" />
                                <Skeleton className="h-3 w-2/5" />
                            </div>
                            <div className="flex gap-2 self-start sm:self-center">
                                <Skeleton className="h-9 w-24 rounded-md" />
                                <Skeleton className="h-9 w-24 rounded-md" />
                            </div>
                        </div>
                     ))
                ) : transferRequests.length > 0 ? (
                    <div className="space-y-3">
                        {transferRequests.map(transfer => {
                            const isIncoming = transfer.toUserId === MOCK_LOGGED_IN_USER_ID;
                            return (
                            <div key={transfer.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-md gap-3 hover:bg-muted/50 transition-colors">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <TagIcon className="h-4 w-4 text-muted-foreground"/>
                                        <p className="font-medium">{transfer.assetName} <span className="text-muted-foreground">({transfer.assetTag})</span></p>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-0.5">
                                        <UserIcon className="h-3 w-3"/>
                                        <span>{isIncoming ? `De: ${transfer.fromUserName}` : `Para: ${transfer.toUserId === 'user2' ? 'Maria Oliveira' : transfer.toUserId}`}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <CalendarDays className="h-3 w-3"/>
                                         <span title={format(transfer.requestDate, 'PPPp', { locale: ptBR })}>
                                            Solicitado {formatDistanceToNow(transfer.requestDate, { addSuffix: true, locale: ptBR })}
                                        </span>
                                    </div>
                                </div>
                                {isIncoming && transfer.status === 'pending' && (
                                    <div className="flex gap-2 mt-2 sm:mt-0 self-start sm:self-center">
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            onClick={() => handleTransferAction(transfer, 'reject')} 
                                            disabled={processingTransferId === transfer.id}
                                        >
                                            {processingTransferId === transfer.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                                            Rejeitar
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            onClick={() => handleTransferAction(transfer, 'accept')} 
                                            disabled={processingTransferId === transfer.id} 
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            {processingTransferId === transfer.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                                            Aceitar
                                        </Button>
                                    </div>
                                )}
                                {!isIncoming && transfer.status === 'pending' && (
                                    <Badge variant="outline" className="mt-2 sm:mt-0 text-yellow-600 border-yellow-500">Aguardando Aprovação</Badge>
                                )}
                                 {transfer.status === 'accepted' && (
                                    <Badge variant="default" className="mt-2 sm:mt-0 bg-green-100 text-green-700">Aceita</Badge>
                                )}
                                {transfer.status === 'rejected' && (
                                    <Badge variant="destructive" className="mt-2 sm:mt-0">Rejeitada</Badge>
                                )}
                            </div>
                        )})}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center py-4">Nenhuma solicitação de transferência pendente.</p>
                )}
            </CardContent>
        </Card>


      <Card>
        <CardHeader>
          <CardTitle>Meus Ativos</CardTitle>
          <CardDescription>Lista de ativos sob sua responsabilidade.</CardDescription>
          <div className="pt-4">
            <Input
              placeholder="Buscar por nome, tag, local..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:max-w-md"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Ativo</TableHead>
                  <TableHead className="hidden sm:table-cell">Tag</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Localização</TableHead>
                  <TableHead className="hidden md:table-cell">Categoria</TableHead>
                  <TableHead className="text-right w-[50px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingMyAssets && Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={`skel-myasset-${i}`}>
                    <TableCell><Skeleton className="h-4 w-4/5" /></TableCell>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
                  </TableRow>
                ))}
                {!isLoadingMyAssets && filteredAssets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell>
                      <div className="font-medium">{asset.name}</div>
                      <div className="text-xs text-muted-foreground sm:hidden">Tag: {asset.tag}</div>
                      <div className="text-xs text-muted-foreground md:hidden">Local: {asset.locationName}</div>
                       <div className="text-xs text-muted-foreground md:hidden">Cat: {asset.category}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs hidden sm:table-cell">{asset.tag}</TableCell>
                    <TableCell>{getStatusBadge(asset.status)}</TableCell>
                    <TableCell className="hidden md:table-cell">{asset.locationName}</TableCell>
                    <TableCell className="hidden md:table-cell">{asset.category}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>{asset.name}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleReportLost(asset)} disabled={asset.status === 'lost'}>
                            <AlertTriangle className="mr-2 h-4 w-4 text-orange-500" /> Reportar Perda
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRequestMaintenance(asset)}>
                            <Wrench className="mr-2 h-4 w-4 text-blue-500" /> Solicitar Manutenção
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePerformInventory(asset)}>
                            <PackageSearch className="mr-2 h-4 w-4 text-green-500" /> Inventariar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleChangeLocation(asset)}>
                            <MapPin className="mr-2 h-4 w-4 text-purple-500" /> Alterar Local
                          </DropdownMenuItem>
                           <DropdownMenuItem onClick={() => handleTransferResponsibility(asset)}>
                            <MoveRight className="mr-2 h-4 w-4 text-teal-500" /> Transferir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoadingMyAssets && filteredAssets.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      {error || "Nenhum ativo encontrado sob sua responsabilidade."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Mostrando <strong>{filteredAssets.length}</strong> de <strong>{myAssets.length}</strong> ativos.
          </div>
        </CardFooter>
      </Card>

      {/* Confirmation Dialog for Reporting Lost */}
      <AlertDialog open={isLostConfirmOpen} onOpenChange={setIsLostConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Perda de Ativo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja reportar o ativo "{assetToAction?.name}" ({assetToAction?.tag}) como perdido?
              Esta ação será registrada e o administrador será notificado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAssetToAction(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReportLost}
              className="bg-destructive hover:bg-destructive/90"
            >
              Confirmar Perda
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
