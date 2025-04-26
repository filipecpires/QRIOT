'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Search, Edit, Trash2, AlertTriangle, QrCode } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { QrCodeModal } from '@/components/feature/qr-code-modal'; // Import the QR Code modal

// Mock data - replace with actual data fetching later
const assets = [
  { id: 'ASSET001', name: 'Notebook Dell Latitude 7400', category: 'Eletrônicos', tag: 'TI-NB-001', location: 'Escritório 1', responsible: 'João Silva', status: 'active' },
  { id: 'ASSET002', name: 'Monitor LG 27"', category: 'Eletrônicos', tag: 'TI-MN-005', location: 'Escritório 2', responsible: 'Maria Oliveira', status: 'active' },
  { id: 'ASSET003', name: 'Cadeira de Escritório', category: 'Mobiliário', tag: 'MOB-CAD-012', location: 'Sala de Reuniões', responsible: 'Carlos Pereira', status: 'lost' },
  { id: 'ASSET004', name: 'Projetor Epson PowerLite', category: 'Eletrônicos', tag: 'TI-PROJ-002', location: 'Sala de Treinamento', responsible: 'Ana Costa', status: 'inactive' }, // Example inactive
];

type Asset = typeof assets[0];

export default function AssetsPage() {
   const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
   const [isQrModalOpen, setIsQrModalOpen] = useState(false);

   const openQrModal = (asset: Asset) => {
        setSelectedAsset(asset);
        setIsQrModalOpen(true);
   };

   const closeQrModal = () => {
        setSelectedAsset(null);
        setIsQrModalOpen(false);
   };

   // Construct the public URL based on the asset tag
    const getPublicUrl = (tag: string) => {
        // Ensure this runs only on the client-side where window is available
        if (typeof window !== 'undefined') {
            return `${window.location.origin}/public/asset/${tag}`;
        }
        return ''; // Return empty string or a placeholder during SSR/build
    };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
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
           <div className="pt-4 flex gap-2">
             <Input placeholder="Buscar por nome, tag ou responsável..." className="max-w-sm" />
             <Button variant="outline"><Search className="h-4 w-4 mr-2"/> Buscar</Button>
           </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tag Única</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium">{asset.tag}</TableCell>
                  <TableCell>{asset.name}</TableCell>
                  <TableCell>{asset.category}</TableCell>
                  <TableCell>{asset.location}</TableCell>
                  <TableCell>{asset.responsible}</TableCell>
                  <TableCell>
                    {asset.status === 'lost' ? (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Perdido
                      </Badge>
                    ) : asset.status === 'inactive' ? (
                       <Badge variant="secondary">Inativo</Badge>
                    ): (
                       <Badge variant="default">Ativo</Badge> // Assuming 'default' is the active state style
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                     <Button variant="ghost" size="icon" onClick={() => openQrModal(asset)} title="Ver QR Code">
                        <QrCode className="h-4 w-4" />
                      </Button>
                    <Button variant="ghost" size="icon" asChild>
                       <Link href={`/assets/${asset.id}/edit`} title="Editar">
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" title="Excluir"> {/* Add confirmation dialog later */}
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
               {assets.length === 0 && (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        Nenhum ativo encontrado.
                    </TableCell>
                </TableRow>
               )}
            </TableBody>
          </Table>
           {/* Add Pagination Controls Here Later */}
        </CardContent>
      </Card>

      {selectedAsset && (
           <QrCodeModal
             isOpen={isQrModalOpen}
             onClose={closeQrModal}
             qrValue={getPublicUrl(selectedAsset.tag)}
             assetName={selectedAsset.name}
             assetTag={selectedAsset.tag}
           />
        )}
    </div>
  );
}
