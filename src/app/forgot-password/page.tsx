
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { QrCode, Mail, KeyRound, Loader2, ArrowLeft, Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Por favor, insira um email válido.' }),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    console.log('Forgot password attempt:', data);

    // --- TODO: Implement Firebase Password Reset ---
    // try {
    //   await sendPasswordResetEmail(auth, data.email);
    //   setSuccessMessage(`Um email de redefinição de senha foi enviado para ${data.email}, caso exista uma conta associada.`);
    //   toast({ title: 'Verifique seu Email', description: 'Instruções para redefinir a senha foram enviadas.' });
    //   form.reset(); // Clear the form
    // } catch (error: any) {
    //   console.error('Password reset failed:', error);
    //   // Don't reveal if email exists or not for security, show generic message.
    //   // Firebase error codes like 'auth/user-not-found' could be handled silently.
    //   setSuccessMessage(`Se ${data.email} estiver associado a uma conta, um email de redefinição foi enviado.`);
    //   toast({ title: 'Email Enviado (se aplicável)', description: 'Verifique sua caixa de entrada para redefinir a senha.' });
    //   // setError('Falha ao enviar email de redefinição. Tente novamente.');
    //   // toast({
    //   //   title: 'Erro',
    //   //   description: 'Falha ao enviar email de redefinição.',
    //   //   variant: 'destructive',
    //   // });
    // } finally {
    //   setIsLoading(false);
    // }
    // --- End Firebase Password Reset ---

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSuccessMessage(`Se ${data.email} estiver associado a uma conta QRIoT.app, um email com instruções para redefinir sua senha foi enviado.`);
    toast({ title: 'Verifique seu Email (Simulado)', description: 'Instruções para redefinir a senha foram enviadas.' });
    form.reset();
    setIsLoading(false);
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <Link href="/" className="flex items-center justify-center gap-2 font-bold text-xl text-primary mb-2">
          <QrCode className="h-7 w-7" />
          QRIoT.app
        </Link>
        <CardTitle className="text-2xl">Recuperar Senha</CardTitle>
        <CardDescription>Insira seu email para receber instruções de como redefinir sua senha.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <Info className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {successMessage && (
              <Alert variant="default" className="bg-green-100 border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300">
                <Info className="h-4 w-4" />
                <AlertTitle>Instruções Enviadas</AlertTitle>
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}
            {!successMessage && (
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Cadastrado</FormLabel>
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
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            {!successMessage && (
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
                  </>
                ) : (
                  <>
                    <KeyRound className="mr-2 h-4 w-4" /> Enviar Instruções
                  </>
                )}
              </Button>
            )}
            <Button variant="link" asChild className="text-muted-foreground hover:text-primary">
                <Link href="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Login
                </Link>
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
