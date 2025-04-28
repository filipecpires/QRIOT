
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Search, Edit, Trash2, UserCog, UserCheck, User, Wrench, KeyRound, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
} from "@/components/ui/alert-dialog"
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Mock data - replace with actual data fetching later (filtered by company)
const initialUsers = [
  { id: 'user1', name: 'João Silva', email: 'joao.silva@example.com', role: 'Administrador', managerId: null, managerName: null, status: 'active', createdAt: new Date(2023, 10, 1) },
  { id: 'user2', name: 'Maria Oliveira', email: 'maria.oliveira@example.com', role: 'Gerente', managerId: 'user1', managerName: 'João Silva', status: 'active', createdAt: new Date(2023, 10, 5) },
  { id: 'user3', name: 'Carlos Pereira', email: 'carlos.pereira@example.com', role: 'Técnico', managerId: 'user2', managerName: 'Maria Oliveira', status: 'active', createdAt: new Date(2023, 11, 10) },
  { id: 'user4', name: 'Ana Costa', email: 'ana.costa@example.com', role: 'Inventariante', managerId: 'user2', managerName: 'Maria Oliveira', status: 'inactive', createdAt: new Date(2024, 0, 15) },
  { id: 'user5', name: 'Pedro Santos', email: 'pedro.santos@example.com', role: 'Técnico', managerId: 'user2', managerName: 'Maria Oliveira', status: 'active', createdAt: new Date(2024, 1, 20) },
];

type User = typeof initialUsers[0];

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

const roles = ['Administrador', 'Gerente', 'Técnico', 'Inventariante'];

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]); // Initialize empty, fetch later
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('__all__'); // Default to __all__
  const [statusFilter, setStatusFilter] = useState('__all__'); // Default to __all__
  // TODO: Add pagination state
  // const [currentPage, setCurrentPage] = useState(1);
  // const [itemsPerPage, setItemsPerPage] = useState(10);

  // TODO: Assume companyId is available from context or props
  const companyId = 'COMPANY_XYZ';

  // Fetch users for the specific company
  useEffect(() => {
    const fetchCompanyUsers = async (companyId: string) => {
      setLoading(true);
      console.log("Fetching users for company:", companyId);
      // Replace with actual API call to fetch users filtered by companyId
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Filter mock data for demo purposes
      const companyUsers = initialUsers; // In real app, this would be the API response
      setUsers(companyUsers);
      setLoading(false);
    };
    fetchCompanyUsers(companyId);
  }, [companyId]);

  const filteredUsers = users.filter(user => {
    const searchMatch = searchTerm === '' ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const roleMatch = roleFilter === '__all__' || user.role === roleFilter; // Check against __all__
    const statusMatch = statusFilter === '__all__' || user.status === statusFilter; // Check against __all__
    return searchMatch && roleMatch && statusMatch;
  });

  // Placeholder for pagination logic
  // const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleUserStatus = (userId: string) => {
    // TODO: Implement actual API call based on logged-in user permissions and company context
    const userToToggle = users.find(u => u.id === userId);
    if (!userToToggle) return;

    // Example: Assume only Admins can toggle status (replace with actual permission check)
    const currentUserRole = 'Administrador'; // Replace with actual logged-in user role
    if (currentUserRole !== 'Administrador' && userToToggle.role === 'Administrador') {
         toast({ title: "Permissão Negada", description: "Você não pode alterar o status de um Administrador.", variant: "destructive" });
         return;
    }

    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId
          ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
          : user
      )
    );
    toast({
      title: `Usuário ${userToToggle.status === 'active' ? 'Inativado' : 'Ativado'}`,
      description: `O status de ${userToToggle.name} foi alterado.`,
    });
  };

  const deleteUser = (userId: string) => {
     // TODO: Implement actual API call based on logged-in user permissions and company context
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;

     // Example: Assume only Admins can delete (replace with actual permission check)
     const currentUserRole = 'Administrador'; // Replace with actual logged-in user role
     if (currentUserRole !== 'Administrador') {
         toast({ title: "Permissão Negada", description: "Você não tem permissão para excluir usuários.", variant: "destructive" });
         return;
     }
      if (userToDelete.role === 'Administrador') {
         toast({ title: "Ação Inválida", description: "Não é possível excluir um Administrador.", variant: "destructive" });
         return;
     }

    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    toast({
      title: "Usuário Excluído",
      description: `O usuário ${userToDelete.name} foi excluído com sucesso.`,
      variant: "default", // Use default variant for success
    });
  };

  const resetPassword = (userId: string) => {
     // TODO: Implement actual API call based on logged-in user permissions
     const userToReset = users.find(u => u.id === userId);
     if (!userToReset) return;

      // Example: Assume only Admins/Managers can reset (replace with actual permission check)
      const currentUserRole = 'Administrador'; // Replace with actual logged-in user role
     if (currentUserRole !== 'Administrador' && currentUserRole !== 'Gerente') {
         toast({ title: "Permissão Negada", description: "Você não tem permissão para resetar senhas.", variant: "destructive" });
         return;
     }
      // Add further checks if needed (e.g., manager can only reset subordinates)

    console.log(`Initiating password reset for ${userToReset.email}`);
    // Simulate API call to send reset email
    toast({
      title: "Email de Redefinição Enviado",
      description: `Um email foi enviado para ${userToReset.email} com instruções para redefinir a senha.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gerenciar Usuários da Empresa</h1>
        <Button asChild>
          {/* Ensure the 'new' link points to the correct admin path */}
          <Link href="/settings/admin/users/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Novo Usuário
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>Visualize e gerencie todos os usuários vinculados a esta empresa.</CardDescription>
          <div className="pt-4 flex flex-col md:flex-row gap-2">
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filtrar por Perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos Perfis</SelectItem> {/* Changed value */}
                {roles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filtrar por Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Todos Status</SelectItem> {/* Changed value */}
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
            {/* <Button variant="outline"><Search className="h-4 w-4 mr-2"/> Buscar</Button> */}
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
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
             {loading && Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skel-${i}`}>
                    <TableCell><div className="flex items-center gap-3"><Avatar className="h-8 w-8 bg-muted" /><div className="h-4 w-24 bg-muted rounded"></div></div></TableCell>
                    <TableCell><div className="h-4 w-40 bg-muted rounded"></div></TableCell>
                    <TableCell><div className="h-4 w-20 bg-muted rounded"></div></TableCell>
                    <TableCell><div className="h-4 w-24 bg-muted rounded"></div></TableCell>
                    <TableCell><div className="h-4 w-16 bg-muted rounded"></div></TableCell>
                    <TableCell><div className="h-4 w-20 bg-muted rounded"></div></TableCell>
                    <TableCell className="text-right"><div className="h-8 w-8 bg-muted rounded"></div></TableCell>
                </TableRow>
             ))}
              {!loading && filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://i.pravatar.cc/32?u=${user.email}`} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    {user.name}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="flex items-center gap-1 w-fit text-xs">
                      {getRoleIcon(user.role)}
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.managerName ?? 'N/A'}</TableCell>
                  <TableCell>
                    {user.status === 'active' ? (
                      <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200 text-xs">Ativo</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">Inativo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                     {format(user.createdAt, "dd/MM/yyyy", { locale: ptBR })}
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
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          {/* Ensure the 'edit' link points to the correct admin path */}
                           <Link href={`/settings/admin/users/${user.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" /> Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleUserStatus(user.id)}>
                          {user.status === 'active' ? (
                            <><XCircle className="mr-2 h-4 w-4 text-orange-600" /> Inativar</>
                          ) : (
                            <><CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Ativar</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => resetPassword(user.id)}>
                          <KeyRound className="mr-2 h-4 w-4" /> Resetar Senha
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                         <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()} // Prevent closing dropdown immediately
                                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                disabled={user.role === 'Administrador'} // Example: disable delete for admin
                              >
                               <Trash2 className="mr-2 h-4 w-4" /> Excluir
                             </DropdownMenuItem>
                           </AlertDialogTrigger>
                           <AlertDialogContent>
                             <AlertDialogHeader>
                               <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                               <AlertDialogDescription>
                                 Tem certeza que deseja excluir o usuário "{user.name}"? Esta ação não pode ser desfeita.
                               </AlertDialogDescription>
                             </AlertDialogHeader>
                             <AlertDialogFooter>
                               <AlertDialogCancel>Cancelar</AlertDialogCancel>
                               <AlertDialogAction
                                 onClick={() => deleteUser(user.id)}
                                 className="bg-destructive hover:bg-destructive/90"
                               >
                                 Excluir
                               </AlertDialogAction>
                             </AlertDialogFooter>
                           </AlertDialogContent>
                         </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Nenhum usuário encontrado para esta empresa.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
             Mostrando <strong>{filteredUsers.length}</strong> de <strong>{users.length}</strong> usuários. {/* Update when pagination is added */}
          </div>
           {/* Add Pagination Controls Here Later */}
           {/* <div className="flex items-center justify-end space-x-2">
               <Button variant="outline" size="sm" disabled>Anterior</Button>
               <Button variant="outline" size="sm" disabled>Próxima</Button>
           </div> */}
        </CardFooter>
      </Card>
    </div>
  );
}

