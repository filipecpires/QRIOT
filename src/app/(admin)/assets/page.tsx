
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Search, Edit, Trash2, AlertTriangle, Eye, Home, Building, MoreHorizontal } from 'lucide-react'; // Added MoreHorizontal
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import DropdownMenu components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog" // Import AlertDialog for delete confirmation
import { useToast } from '@/hooks/use-toast'; // For delete feedback

// Mock data - replace with actual data fetching later
const initialAssets = [
  { id: 'ASSET001', name: 'Notebook Dell Latitude 7400', category: 'Eletrônicos', tag: 'AB12C', location: 'Escritório 1', responsible: 'João Silva', status: 'active', ownership: 'own' }, // Added ownership, updated tag
  { id: 'ASSET002', name: 'Monitor LG 27"', category: 'Eletrônicos', tag: 'DE34F', location: 'Escritório 2', responsible: 'Maria Oliveira', status: 'active', ownership: 'own' }, // Updated tag
  { id: 'ASSET003', name: 'Cadeira de Escritório', category: 'Mobiliário', tag: 'GH56I', location: 'Sala de Reuniões', responsible: 'Carlos Pereira', status: 'lost', ownership: 'rented' }, // Example rented, updated tag
  { id: 'ASSET004', name: 'Projetor Epson PowerLite', category: 'Eletrônicos', tag: 'JK78L', location: 'Sala de Treinamento', responsible: 'Ana Costa', status: 'inactive', ownership: 'own' }, // Example inactive, updated tag
];

type Asset = typeof initialAssets[0];

// Mock Delete Function (replace with actual API call)
async function deleteAssetAction(assetId: string): Promise<{ success: boolean }> {
    console.log(`Attempting to delete asset ${assetId}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    // In a real app, perform the deletion and handle errors
    return { success: true };
}


export default function AssetsPage() {
    const { toast } = useToast();
    const [assets, setAssets] = useState<Asset[]>(initialAssets); // State to manage assets for deletion
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);

    // Construct the public URL based on the asset tag
    const getPublicUrl = (tag: string) => {
        if (typeof window !== 'undefined') {
            // Use the tag directly in the URL path
            return `${window.location.origin}/public/asset/${tag}`;
        }
        return '#'; // Fallback URL
    };

    const handleDeleteRequest = (asset: Asset) => {
        setAssetToDelete(asset);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!assetToDelete) return;
        const result = await deleteAssetAction(assetToDelete.id);
        if (result.success) {
            setAssets(prev => prev.filter(a => a.id !== assetToDelete.id)); // Remove from state
            toast({ title: "Sucesso", description: `Ativo ${assetToDelete.name} excluído.` });
        } else {
            toast({ title: "Erro", description: "Falha ao excluir o ativo.", variant: "destructive" });
        }
        setAssetToDelete(null);
        setIsDeleteDialogOpen(false);
    };


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
             <Input placeholder="Buscar por nome, tag ou responsável..." className="max-w-sm" />
             {/* TODO: Add filters for status, ownership, category, etc. */}
             <Button variant="outline"><Search className="h-4 w-4 mr-2"/> Buscar</Button>
           </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {/* Hidden on mobile */}
                <TableHead className="hidden md:table-cell">Tag Única</TableHead><TableHead>Nome</TableHead><TableHead className="hidden lg:table-cell">Categoria</TableHead><TableHead>Local</TableHead><TableHead className="hidden md:table-cell">Responsável</TableHead><TableHead className="hidden md:table-cell">Propriedade</TableHead><TableHead>Status</TableHead><TableHead className="text-right w-[50px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <TableRow key={asset.id}>
                   <TableCell className="font-medium hidden md:table-cell">{asset.tag}</TableCell>
                  <TableCell>
                     <div className="font-medium">{asset.name}</div>
                     <div className="text-xs text-muted-foreground md:hidden">{asset.tag}</div>
                  </TableCell>
                   <TableCell className="hidden lg:table-cell">{asset.category}</TableCell>
                  <TableCell>{asset.location}</TableCell>
                   <TableCell className="hidden md:table-cell">{asset.responsible}</TableCell>
                   <TableCell className="hidden md:table-cell">
                     {asset.ownership === 'rented' ? (
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
                       <Badge variant="default" className="text-xs">Ativo</Badge>
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
                                e.preventDefault(); // Prevent closing menu
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
               {assets.length === 0 && (
                <TableRow>
                     {/* Adjust colSpan based on visible columns */}
                     <TableCell colSpan={6} className="h-24 text-center text-muted-foreground md:colSpan={7} lg:colSpan={8}">
                        Nenhum ativo encontrado.
                    </TableCell>
                </TableRow>
               )}
            </TableBody>
          </Table>
           {/* Add Pagination Controls Here Later */}
        </CardContent>
      </Card>

       {/* Delete Confirmation Dialog */}
       <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
           <AlertDialogContent>
               <AlertDialogHeader>
                 <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                 <AlertDialogDescription>
                   Tem certeza que deseja excluir o ativo "{assetToDelete?.name}" ({ assetToDelete?.tag })? Esta ação não pode ser desfeita.
                 </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                 <AlertDialogCancel onClick={() => setAssetToDelete(null)}>Cancelar</AlertDialogCancel>
                 <AlertDialogAction
                   onClick={handleDeleteConfirm}
                   className="bg-destructive hover:bg-destructive/90"
                 >
                   Confirmar Exclusão
                 </AlertDialogAction>
               </AlertDialogFooter>
           </AlertDialogContent>
       </AlertDialog>

    </div>
  );
}

