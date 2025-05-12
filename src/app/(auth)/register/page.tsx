
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { QrCode, UserPlus, Loader2, Mail, KeyRound, User, Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
// import { doc, setDoc, serverTimestamp } from "firebase/firestore";
// import { auth, db } from "@/lib/firebase";

const registerSchema = z.object({
  name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres.' }),
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  password: z.string().min(8, { message: 'A senha deve ter pelo menos 8 caracteres.' }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem.',
  path: ['confirmPassword'], 
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(data: RegisterFormData) {
    setIsLoading(true);
    setError(null);
    console.log('Registration attempt:', data);

    // --- Firebase Registration Example ---
    // try {
    //   // 1. Create user in Firebase Auth
    //   const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    //   const fbUser = userCredential.user;
    //   console.log('User created in Auth:', fbUser);
    //
    //   // 2. Update user profile in Auth (add display name)
    //   if (fbUser) { // Check if fbUser is not null
    //     await updateProfile(fbUser, { displayName: data.name });
    //   }
    //
    //   // 3. Create company document in Firestore for the new user
    //   // For simplicity, using user UID as company ID, and admin of their own company
    //   const companyId = fbUser.uid; 
    //   const companyRef = doc(db, 'companies', companyId); 
    //   await setDoc(companyRef, {
    //       name: `${data.name}'s Company`, // Or prompt for company name during onboarding
    //       ownerId: fbUser.uid,
    //       planName: 'Gratuito', 
    //       assetLimit: 5, 
    //       status: 'active',
    //       createdAt: serverTimestamp(),
    //   });
    //   console.log('Company document created for user:', fbUser.uid);
    //
    //   // 4. Create user document in Firestore (within the company subcollection or a top-level users collection)
    //   const userDocRef = doc(db, `users`, fbUser.uid); // Example: top-level users collection
    //   await setDoc(userDocRef, {
    //       name: data.name,
    //       email: data.email,
    //       role: 'Administrador', // First user is admin of their company
    //       isActive: true,
    //       createdAt: serverTimestamp(),
    //       companyId: companyId, // Link user to their company
    //   });
    //   console.log('User document created in Firestore for:', fbUser.uid);
    //
    //   toast({ title: 'Registro realizado com sucesso!' });
    //   router.push('/my-dashboard'); 
    //
    // } catch (fbError: any) {
    //   console.error('Registration failed:', fbError);
    //   let errorMessage = 'Falha no registro. Tente novamente.';
    //   if (fbError.code === 'auth/email-already-in-use') {
    //     errorMessage = 'Este email já está em uso. Tente fazer login.';
    //   } else if (fbError.code === 'auth/weak-password') {
    //     errorMessage = 'A senha é muito fraca. Use pelo menos 8 caracteres.';
    //   }
    //   setError(errorMessage);
    //   toast({
    //     title: 'Erro no Registro',
    //     description: errorMessage,
    //     variant: 'destructive',
    //   });
    // } finally {
    //   setIsLoading(false);
    // }
    // --- End Firebase Registration ---

    // Simulate API call (Remove this block after Firebase integration)
    await new Promise((resolve) => setTimeout(resolve, 1000));
     if (data.email.includes('exists')) {
         setError('Este email já está em uso. Tente fazer login.');
         toast({ title: 'Erro no Registro', description: 'Este email já está em uso.', variant: 'destructive'});
     } else {
         toast({ title: 'Registro realizado com sucesso! (Simulado)' });
         router.push('/my-dashboard');
     }
    setIsLoading(false);
  }

  return (
    <Card className="w-full max-w-lg shadow-xl">
      <CardHeader className="text-center">
         <Link href="/" className="flex items-center justify-center gap-2 font-bold text-xl text-primary mb-2">
          <QrCode className="h-7 w-7" />
          QRIoT.app
        </Link>
        <CardTitle className="text-2xl">Criar Conta Gratuita</CardTitle>
        <CardDescription>Gerencie até 5 ativos sem custo. Perfeito para começar!</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
                <Alert variant="destructive">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Erro no Registro</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <div className="relative">
                     <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                     <FormControl>
                        <Input placeholder="Seu nome" className="pl-10" {...field} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                   <div className="relative">
                     <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <FormControl>
                      <Input type="email" placeholder="seu@email.com" className="pl-10" {...field} />
                    </FormControl>
                   </div>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <FormControl>
                            <Input type="password" placeholder="Mínimo 8 caracteres" className="pl-10" {...field} />
                        </FormControl>
                    </div>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Confirmar Senha</FormLabel>
                     <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <FormControl>
                            <Input type="password" placeholder="Repita a senha" className="pl-10" {...field} />
                        </FormControl>
                    </div>
                    <FormMessage />
                    </FormItem>
                )}
                />
             </div>
             <p className="text-xs text-muted-foreground px-1">
                Ao se registrar, você concorda com nossos <Link href="/terms" className="underline hover:text-primary">Termos de Uso</Link> e <Link href="/privacy" className="underline hover:text-primary">Política de Privacidade</Link>.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registrando...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" /> Criar Conta Gratuita
                </>
              )}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Faça login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
