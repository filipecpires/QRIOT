
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Search, Edit, Trash2, AlertTriangle, Eye, Home, Building, MoreHorizontal, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Asset } from '@/types/asset'; // Import the Asset type
import { getAssets, deleteAsset } from '@/services/assetService'; // Import service functions
import { Skeleton } from '@/components/ui/skeleton';
import { MOCK_COMPANY_ID } from '@/lib/mock-data';


export default function AssetsPage() {
    const { toast } = useToast();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // MOCK: Assume companyId is available (e.g., from user context)
    const companyId = MOCK_COMPANY_ID;

    const loadAssets = useCallback(async () => {
        setIsLoading(true);
        try {
            const fetchedAssets = await getAssets(companyId);
            setAssets(fetchedAssets);
        } catch (error) {
            console.error("Error fetching assets:", error);
            toast({ title: "Erro", description: "Não foi possível carregar os ativos.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [companyId, toast]);

    useEffect(() => {
        loadAssets();
    }, [loadAssets]);


    const getPublicUrl = (tag: string) => {
        if (typeof window !== 'undefined') {
            return `${window.location.origin}/public/asset/${tag}`;
        }
        return '#'; 
    };

    const handleDeleteRequest = (asset: Asset) => {
        setAssetToDelete(asset);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!assetToDelete) return;
        setIsDeleting(true);
        try {
            await deleteAsset(assetToDelete.id, companyId);
            setAssets(prev => prev.filter(a => a.id !== assetToDelete.id));
            toast({ title: "Sucesso", description: `Ativo ${assetToDelete.name} excluído.` });
        } catch (error: any) {
            console.error("Error deleting asset:", error);
            toast({ title: "Erro", description: error.message || "Falha ao excluir o ativo.", variant: "destructive" });
        } finally {
            setAssetToDelete(null);
            setIsDeleteDialogOpen(false);
            setIsDeleting(false);
        }
    };

    const filteredAssets = assets.filter(asset =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (asset.locationName && asset.locationName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        asset.category.toLowerCase().includes(searchTerm.toLowerCase())
    );


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Gerenciar Ativos</h1>
        <Button asChild>
          <Link href="/assets/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Novo Ativo
          </Link>
        </Button>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Lista de Ativos</CardTitle>
          <CardDescription>Visualize e gerencie todos os ativos cadastrados.</CardDescription>
           <div className="pt-4 flex flex-col md:flex-row gap-2">
             <Input 
                placeholder="Buscar por nome, tag ou responsável..." 
                className="w-full sm:max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
             {/* <Button variant="outline"><Search className="h-4 w-4 mr-2"/> Buscar</Button> */}
           </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden sm:table-cell">Tag Única</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">Categoria</TableHead>
                  <TableHead className="hidden sm:table-cell">Local</TableHead>
                  <TableHead className="hidden sm:table-cell">Responsável</TableHead>
                  <TableHead className="hidden sm:table-cell">Propriedade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right w-[50px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`skel-${i}`}>
                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
                    </TableRow>
                ))}
                {!isLoading && filteredAssets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-mono text-xs hidden sm:table-cell">{asset.tag}</TableCell>
                    <TableCell>
                      <div className="font-medium">{asset.name}</div>
                      <div className="text-xs text-muted-foreground sm:hidden">Tag: {asset.tag}</div>
                      <div className="text-xs text-muted-foreground sm:hidden">Local: {asset.locationName || asset.locationId}</div>
                      <div className="text-xs text-muted-foreground md:hidden">Cat: {asset.category}</div>
                      <div className="text-xs text-muted-foreground sm:hidden">Resp: {asset.responsibleUserName || asset.responsibleUserId}</div>
                      <div className="text-xs text-muted-foreground sm:hidden">
                          Prop: {asset.ownershipType === 'rented' ? 'Alugado' : 'Próprio'}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{asset.category}</TableCell>
                    <TableCell className="hidden sm:table-cell">{asset.locationName || asset.locationId}</TableCell>
                    <TableCell className="hidden sm:table-cell">{asset.responsibleUserName || asset.responsibleUserId}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {asset.ownershipType === 'rented' ? (
                        <div className="flex items-center gap-1 text-orange-600" title="Alugado">
                          <Building className="h-4 w-4" />
                          <span>Alugado</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-green-600" title="Próprio">
                          <Home className="h-4 w-4" />
                          <span>Próprio</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {asset.status === 'lost' ? (
                        <Badge variant="destructive" className="flex items-center gap-1 text-xs">
                          <AlertTriangle className="h-3 w-3" /> Perdido
                        </Badge>
                      ) : asset.status === 'inactive' ? (
                        <Badge variant="secondary" className="text-xs">Inativo</Badge>
                      ): (
                        <Badge variant="default" className={cn("text-xs bg-green-500 hover:bg-green-600")}>Ativo</Badge>
                      )}
                    </TableCell>
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
                          <DropdownMenuItem asChild>
                            <Link href={getPublicUrl(asset.tag)} target="_blank">
                              <Eye className="mr-2 h-4 w-4" /> Ver Página Pública
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/assets/${asset.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" /> Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                              className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                              onSelect={(e) => {
                                  e.preventDefault(); 
                                  handleDeleteRequest(asset);
                              }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && filteredAssets.length === 0 && (
                  <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                          Nenhum ativo encontrado.
                      </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
         <CardFooter>
            <div className="text-xs text-muted-foreground">
                Mostrando <strong>{filteredAssets.length}</strong> de <strong>{assets.length}</strong> ativos.
            </div>
        </CardFooter>
      </Card>

       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
           <AlertDialogContent>
               <AlertDialogHeader>
                 <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                 <AlertDialogDescription>
                   Tem certeza que deseja excluir o ativo "{assetToDelete?.name}" ({ assetToDelete?.tag })? Esta ação não pode ser desfeita.
                 </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                 <AlertDialogCancel onClick={() => setAssetToDelete(null)} disabled={isDeleting}>Cancelar</AlertDialogCancel>
                 <AlertDialogAction
                   onClick={handleDeleteConfirm}
                   className="bg-destructive hover:bg-destructive/90"
                   disabled={isDeleting}
                 >
                   {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                   Confirmar Exclusão
                 </AlertDialogAction>
               </AlertDialogFooter>
           </AlertDialogContent>
       </AlertDialog>

    </div>
  );
}
