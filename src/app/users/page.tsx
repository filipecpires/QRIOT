import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Search, Edit, Trash2, UserCog, UserCheck, User, Wrench } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock data - replace with actual data fetching later
const users = [
  { id: 'user1', name: 'João Silva', email: 'joao.silva@example.com', role: 'Administrador', manager: null, status: 'active' },
  { id: 'user2', name: 'Maria Oliveira', email: 'maria.oliveira@example.com', role: 'Gerente', manager: 'João Silva', status: 'active' },
  { id: 'user3', name: 'Carlos Pereira', email: 'carlos.pereira@example.com', role: 'Técnico', manager: 'Maria Oliveira', status: 'active' },
  { id: 'user4', name: 'Ana Costa', email: 'ana.costa@example.com', role: 'Inventariante', manager: 'Maria Oliveira', status: 'inactive' },
  { id: 'user5', name: 'Pedro Santos', email: 'pedro.santos@example.com', role: 'Técnico', manager: 'Maria Oliveira', status: 'active' },
];

function getRoleIcon(role: string) {
    switch (role.toLowerCase()) {
        case 'administrador': return <UserCog className="h-4 w-4 text-red-600" />;
        case 'gerente': return <UserCheck className="h-4 w-4 text-blue-600" />;
        case 'técnico': return <Wrench className="h-4 w-4 text-green-600" />;
        case 'inventariante': return <User className="h-4 w-4 text-orange-600" />;
        default: return <User className="h-4 w-4 text-muted-foreground" />;
    }
}

function getInitials(name: string): string {
    if (!name) return '';
    const names = name.split(' ');
    const firstInitial = names[0]?.[0] ?? '';
    const lastInitial = names.length > 1 ? names[names.length - 1]?.[0] ?? '' : '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
}


export default function UsersPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
        <Button asChild>
          <Link href="/users/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Novo Usuário
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>Visualize e gerencie todos os usuários do sistema.</CardDescription>
           <div className="pt-4 flex gap-2">
             <Input placeholder="Buscar por nome ou email..." className="max-w-sm" />
             <Button variant="outline"><Search className="h-4 w-4 mr-2"/> Buscar</Button>
           </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Gerente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium flex items-center gap-3">
                     <Avatar>
                        <AvatarImage src={`https://i.pravatar.cc/40?u=${user.email}`} alt={user.name} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                     </Avatar>
                     {user.name}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                        {getRoleIcon(user.role)}
                        {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.manager ?? 'N/A'}</TableCell>
                  <TableCell>
                     {user.status === 'active' ? (
                       <Badge variant="default">Ativo</Badge>
                    ) : (
                       <Badge variant="outline">Inativo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                       <Link href={`/users/${user.id}/edit`} title="Editar">
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" title="Excluir"> {/* Add confirmation dialog later */}
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
               {users.length === 0 && (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        Nenhum usuário encontrado.
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
