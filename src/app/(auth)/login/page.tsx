
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { QrCode, LogIn, Loader2, Mail, KeyRound, UserCheck, Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const loginSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
  password: z.string().min(1, { message: 'A senha é obrigatória.' }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // State for login errors

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true);
    setError(null); // Clear previous errors
    console.log('Login attempt:', data);

    // --- TODO: Implement Firebase Authentication ---
    // try {
    //   const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
    //   console.log('Login successful:', userCredential.user);
    //   toast({ title: 'Login realizado com sucesso!' });
    //   router.push('/dashboard'); // Redirect to dashboard after successful login
    // } catch (error: any) {
    //   console.error('Login failed:', error);
    //   let errorMessage = 'Falha no login. Verifique suas credenciais.';
    //   if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
    //     errorMessage = 'Email ou senha inválidos.';
    //   } else if (error.code === 'auth/too-many-requests') {
    //     errorMessage = 'Muitas tentativas de login falharam. Tente novamente mais tarde.';
    //   }
    //   setError(errorMessage);
    //   toast({
    //     title: 'Erro no Login',
    //     description: errorMessage,
    //     variant: 'destructive',
    //   });
    // } finally {
    //   setIsLoading(false);
    // }
    // --- End Firebase Authentication ---

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (data.email === 'demo@qriot.app' && data.password === 'demopass') {
        toast({ title: 'Login realizado com sucesso! (Demo)' });
        router.push('/dashboard');
    } else if (data.email.includes('fail')) {
         setError('Email ou senha inválidos.');
         toast({ title: 'Erro no Login', description: 'Email ou senha inválidos.', variant: 'destructive'});
    } else {
        toast({ title: 'Login realizado com sucesso!' });
        router.push('/dashboard'); // Simulate success for other emails for now
    }
    setIsLoading(false);
  }

   const handleDemoLogin = async () => {
        // Directly call onSubmit with demo credentials
        await onSubmit({ email: 'demo@qriot.app', password: 'demopass' });
    };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <Link href="/" className="flex items-center justify-center gap-2 font-bold text-xl text-primary mb-2">
          <QrCode className="h-7 w-7" />
          QRIoT.app
        </Link>
        <CardTitle className="text-2xl">Acessar Sistema</CardTitle>
        <CardDescription>Entre com seu email e senha para gerenciar seus ativos.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <Info className="h-4 w-4" />
                <AlertTitle>Erro de Login</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                      <FormLabel>Senha</FormLabel>
                      <Link href="/forgot-password" // TODO: Create forgot password page
                         className="text-xs text-muted-foreground hover:text-primary underline">
                        Esqueceu a senha?
                      </Link>
                  </div>
                   <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <FormControl>
                        <Input type="password" placeholder="********" className="pl-10" {...field} />
                      </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entrando...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" /> Entrar
                </>
              )}
            </Button>
             <Button type="button" variant="secondary" className="w-full" onClick={handleDemoLogin} disabled={isLoading}>
                <UserCheck className="mr-2 h-4 w-4" /> Acessar com Conta Demo
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Não tem uma conta?{' '}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Registre-se gratuitamente
              </Link>
            </p>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
