'use client';

import { useState, useEffect } from 'react';
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
  Users,
  MoreHorizontal,
  UserSquare,
  Search,
  Edit,
  Eye,
  PackagePlus,
  PackageMinus,
  PackageSearch,
  MoveRight,
  CheckCircle,
  XCircle,
  Loader2,
  Inbox,
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
}


// Mock Logged-in User ID (replace with actual auth context)
const MOCK_LOGGED_IN_USER_ID = 'user1'; // João Silva
const MOCK_LOGGED_IN_USER_NAME = 'João Silva';


// Mock All Assets (same as in assets/page.tsx for consistency, with responsibleUserId)
const allAssetsMockData = [
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

async function fetchPendingTransfersToUser(userId: string): Promise<TransferRequest[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockTransferRequests.filter(req => req.toUserId === userId && req.status === 'pending');
}


// Mock Action Functions (replace with actual API calls and logic)
async function reportAssetLost(assetId: string, assetName: string): Promise<{ success: boolean }> {
    console.log(`Reporting asset ${assetName} (ID: ${assetId}) as lost.`);
    await new Promise(resolve => setTimeout(resolve, 700));
    // In a real app, update asset status in Firestore
    const assetIndex = allAssetsMockData.findIndex(a => a.id === assetId);
    if (assetIndex !== -1) {
        allAssetsMockData[assetIndex].status = 'lost';
    }
    return { success: true };
}

async function acceptTransferRequest(transferId: string, assetId: string, newResponsibleUserId: string): Promise<{ success: boolean }> {
    console.log(`Accepting transfer ${transferId} for asset ${assetId} to user ${newResponsibleUserId}`);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const transferIndex = mockTransferRequests.findIndex(t => t.id === transferId);
    if (transferIndex !== -1) {
        mockTransferRequests[transferIndex].status = 'accepted';
    }

    const assetIndex = allAssetsMockData.findIndex(a => a.id === assetId);
    if (assetIndex !== -1) {
        allAssetsMockData[assetIndex].responsibleUserId = newResponsibleUserId;
        // Potentially update asset status if needed, e.g., from 'transfer_pending' to 'active'
    }
    return { success: true };
}

async function rejectTransferRequest(transferId: string): Promise<{ success: boolean }> {
    console.log(`Rejecting transfer ${transferId}`);
    await new Promise(resolve => setTimeout(resolve, 600));
    const transferIndex = mockTransferRequests.findIndex(t => t.id === transferId);
    if (transferIndex !== -1) {
        mockTransferRequests[transferIndex].status = 'rejected';
    }
    return { success: true };
}


export default function MyDashboardPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [myAssets, setMyAssets] = useState<AssetForMyDashboard[]>([]);
  const [pendingTransfers, setPendingTransfers] = useState<TransferRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTransfers, setIsLoadingTransfers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [assetToAction, setAssetToAction] = useState<AssetForMyDashboard | null>(null);
  const [isLostConfirmOpen, setIsLostConfirmOpen] = useState(false);
  const [isProcessingTransfer, setIsProcessingTransfer] = useState(false);

  const loadMyAssets = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedAssets = await fetchMyAssets(MOCK_LOGGED_IN_USER_ID);
        setMyAssets(fetchedAssets);
      } catch (err) {
        console.error("Error fetching my assets:", err);
        setError("Falha ao carregar seus ativos.");
      } finally {
        setIsLoading(false);
      }
  };

  const loadPendingTransfers = async () => {
    setIsLoadingTransfers(true);
    try {
        const transfers = await fetchPendingTransfersToUser(MOCK_LOGGED_IN_USER_ID);
        setPendingTransfers(transfers);
    } catch (err) {
        console.error("Error fetching pending transfers:", err);
        toast({ title: "Erro", description: "Falha ao carregar solicitações de transferência.", variant: "destructive"});
    } finally {
        setIsLoadingTransfers(false);
    }
  };

  useEffect(() => {
    loadMyAssets();
    loadPendingTransfers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      setMyAssets(prev => prev.map(a => a.id === assetToAction.id ? { ...a, status: 'lost' } : a));
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

  const handleAcceptTransfer = async (transfer: TransferRequest) => {
    setIsProcessingTransfer(true);
    const result = await acceptTransferRequest(transfer.id, transfer.assetId, MOCK_LOGGED_IN_USER_ID);
    if (result.success) {
        toast({ title: "Transferência Aceita", description: `O ativo ${transfer.assetName} está agora sob sua responsabilidade.`});
        // Refetch both lists
        loadMyAssets();
        loadPendingTransfers();
    } else {
        toast({ title: "Erro", description: "Falha ao aceitar a transferência.", variant: "destructive"});
    }
    setIsProcessingTransfer(false);
  };

  const handleRejectTransfer = async (transfer: TransferRequest) => {
    setIsProcessingTransfer(true);
    const result = await rejectTransferRequest(transfer.id);
    if (result.success) {
        toast({ title: "Transferência Rejeitada", description: `A solicitação para ${transfer.assetName} foi rejeitada.`});
        loadPendingTransfers(); // Refetch transfers list
    } else {
        toast({ title: "Erro", description: "Falha ao rejeitar a transferência.", variant: "destructive"});
    }
    setIsProcessingTransfer(false);
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
                <CardTitle className="flex items-center gap-2"><Inbox className="h-5 w-5 text-primary"/> Solicitações de Transferência Pendentes</CardTitle>
                <CardDescription>Ativos aguardando sua aprovação para transferência de responsabilidade.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoadingTransfers ? (
                     Array.from({length: 2}).map((_,i) => (
                        <div key={`skel-transfer-${i}`} className="flex items-center justify-between p-3 border rounded-md mb-2">
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                            <div className="flex gap-2">
                                <Skeleton className="h-8 w-20" />
                                <Skeleton className="h-8 w-20" />
                            </div>
                        </div>
                     ))
                ) : pendingTransfers.length > 0 ? (
                    <div className="space-y-3">
                        {pendingTransfers.map(transfer => (
                            <div key={transfer.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border rounded-md gap-3">
                                <div className="flex-1">
                                    <p className="font-medium">{transfer.assetName} <span className="text-muted-foreground">({transfer.assetTag})</span></p>
                                    <p className="text-xs text-muted-foreground">Solicitante: {transfer.fromUserName}</p>
                                    <p className="text-xs text-muted-foreground">Data: {format(transfer.requestDate, 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                                </div>
                                <div className="flex gap-2 mt-2 sm:mt-0">
                                    <Button size="sm" variant="outline" onClick={() => handleRejectTransfer(transfer)} disabled={isProcessingTransfer}>
                                        {isProcessingTransfer ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                                        Rejeitar
                                    </Button>
                                    <Button size="sm" onClick={() => handleAcceptTransfer(transfer)} disabled={isProcessingTransfer} className="bg-green-600 hover:bg-green-700">
                                        {isProcessingTransfer ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                                        Aceitar
                                    </Button>
                                </div>
                            </div>
                        ))}
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
                {isLoading && Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={`skel-myasset-${i}`}>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
                  </TableRow>
                ))}
                {!isLoading && filteredAssets.map((asset) => (
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
                {!isLoading && filteredAssets.length === 0 && (
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
