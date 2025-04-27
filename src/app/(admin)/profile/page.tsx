
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Edit, KeyRound, UserCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge'; // Import Badge component

// Mock User Data Structure
interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string; // Optional avatar URL
}

// Mock function to fetch logged-in user data
// Replace with actual authentication context/API call later
async function fetchLoggedInUserData(): Promise<UserProfile | null> {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
  // Assume user 'user1' is logged in for now
  return {
    id: 'user1',
    name: 'João Silva',
    email: 'joao.silva@example.com',
    role: 'Administrador',
    avatarUrl: 'https://i.pravatar.cc/150?u=user1', // Example avatar
  };
}

function getInitials(name: string): string {
    if (!name) return '?';
    const names = name.split(' ');
    const firstInitial = names[0]?.[0] ?? '';
    const lastInitial = names.length > 1 ? names[names.length - 1]?.[0] ?? '' : '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
}

export default function ProfilePage() {
  const { toast } = useToast();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // State to toggle edit mode
  const [nameInput, setNameInput] = useState(''); // State for editable name
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      try {
        const userData = await fetchLoggedInUserData();
        setUser(userData);
        if (userData) {
          setNameInput(userData.name); // Initialize name input
        }
      } catch (error) {
        console.error("Failed to load user profile:", error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados do perfil.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [toast]);

  const handleEditToggle = () => {
    if (isEditing && user) {
      // Reset name input if canceling edit
      setNameInput(user.name);
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    if (!user || !nameInput.trim()) {
        toast({ title: "Erro", description: "O nome não pode estar vazio.", variant: "destructive" });
        return;
    }
    setIsSaving(true);
    console.log("Saving profile with name:", nameInput);
    // Simulate API call to update profile
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      // Replace with actual API call
      // await updateUserProfile(user.id, { name: nameInput });
      setUser(prev => prev ? { ...prev, name: nameInput } : null); // Update local state
      toast({ title: "Sucesso", description: "Perfil atualizado." });
      setIsEditing(false); // Exit edit mode
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast({ title: "Erro", description: "Falha ao salvar o perfil.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = () => {
     if (!user) return;
     // TODO: Implement password change flow (e.g., open modal, call API)
     console.log(`Requesting password change for ${user.email}`);
      toast({
          title: "Funcionalidade Pendente",
          description: "A alteração de senha será implementada.",
          variant: "default"
      });
      // Example using Firebase Auth reset email:
      // try {
      //   await sendPasswordResetEmail(auth, user.email);
      //   toast({ title: "Verifique seu Email", description: "Instruções para redefinir a senha foram enviadas." });
      // } catch (error) {
      //   toast({ title: "Erro", description: "Falha ao enviar email de redefinição.", variant: "destructive" });
      // }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32 mb-6" />
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="items-center text-center">
             <Skeleton className="h-24 w-24 rounded-full mb-4" />
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
          <CardFooter className="justify-end gap-2">
             <Skeleton className="h-10 w-32" />
             <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!user) {
    return <div className="text-center text-destructive">Erro ao carregar o perfil.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Meu Perfil</h1>

      <Card className="max-w-2xl mx-auto">
        <CardHeader className="items-center text-center">
          <Avatar className="h-24 w-24 mb-4 text-4xl">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl">{isEditing ? 'Editar Perfil' : user.name}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
          <Badge variant="secondary" className="mt-1">{user.role}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                disabled={isSaving}
              />
            </div>
          ) : (
             <div className="space-y-2">
              <Label>Nome Completo</Label>
              <p className="text-sm font-medium p-2 border rounded-md bg-muted">{user.name}</p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={user.email} readOnly disabled className="bg-muted/50 cursor-not-allowed"/>
             <p className="text-xs text-muted-foreground">O email não pode ser alterado.</p>
          </div>
           <div className="space-y-2">
            <Label htmlFor="role">Perfil</Label>
            <Input id="role" value={user.role} readOnly disabled className="bg-muted/50 cursor-not-allowed"/>
          </div>

          <Button variant="outline" onClick={handleChangePassword} className="w-full">
             <KeyRound className="mr-2 h-4 w-4" /> Alterar Senha
          </Button>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button variant="outline" onClick={handleEditToggle} disabled={isSaving}>
            {isEditing ? 'Cancelar' : <><Edit className="mr-2 h-4 w-4" /> Editar Nome</>}
          </Button>
          {isEditing && (
            <Button onClick={handleSave} disabled={isSaving || nameInput === user.name}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
