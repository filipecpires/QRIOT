import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { PlusCircle, Search, Edit, Trash2, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Mock data - replace with actual data fetching later
const locations = [
  { id: 'loc1', name: 'Escritório 1', lat: -23.5505, lng: -46.6333, assetCount: 15 },
  { id: 'loc2', name: 'Escritório 2', lat: -23.5510, lng: -46.6340, assetCount: 8 },
  { id: 'loc3', name: 'Sala de Reuniões', lat: -23.5500, lng: -46.6330, assetCount: 5 },
  { id: 'loc4', name: 'Sala de Treinamento', lat: -23.5495, lng: -46.6325, assetCount: 10 },
  { id: 'loc5', name: 'Almoxarifado', lat: -23.5520, lng: -46.6350, assetCount: 32 },
];

export default function LocationsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gerenciar Locais</h1>
        <Button asChild>
          <Link href="/locations/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Novo Local
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Locais</CardTitle>
          <CardDescription>Visualize e gerencie todos os locais de instalação cadastrados.</CardDescription>
           <div className="pt-4 flex gap-2">
             <Input placeholder="Buscar por nome..." className="max-w-sm" />
             <Button variant="outline"><Search className="h-4 w-4 mr-2"/> Buscar</Button>
           </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Local</TableHead>
                <TableHead>Latitude</TableHead>
                <TableHead>Longitude</TableHead>
                <TableHead>Ativos no Local</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.map((location) => (
                <TableRow key={location.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground"/> {location.name}
                  </TableCell>
                  <TableCell>{location.lat.toFixed(4)}</TableCell>
                  <TableCell>{location.lng.toFixed(4)}</TableCell>
                  <TableCell>{location.assetCount}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                       <Link href={`/locations/${location.id}/edit`} title="Editar">
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" title="Excluir"> {/* Add confirmation dialog later */}
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                     {/* Add View on Map button here later */}
                  </TableCell>
                </TableRow>
              ))}
               {locations.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        Nenhum local encontrado.
                    </TableCell>
                </TableRow>
               )}
            </TableBody>
          </Table>
           {/* Add Pagination Controls Here Later */}
        </CardContent>
      </Card>
    </div>
  );
}
