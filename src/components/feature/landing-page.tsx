
'use client'; // Needed for animations or client-side interactions

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QrCode, CheckCircle, BarChart, Users, Phone, Zap, ShieldCheck, Printer, UserCheck } from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
    const handleDemoLogin = async () => {
        // Simulate demo login (replace with actual logic if needed)
        console.log("Attempting demo login...");
        // Example: redirect to dashboard or show a demo state
        // In a real app, you would use router.push('/dashboard') after successful auth.
        // For this static example, direct navigation is fine.
        if (typeof window !== 'undefined') {
            window.location.href = '/my-dashboard'; // Redirect to my-dashboard for demo user
        }
    };
    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-secondary/20">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
                        <QrCode className="h-6 w-6" />
                        QRIoT.app
                    </Link>
                    <nav className="flex items-center gap-2 sm:gap-4">
                         <Button size="sm" variant="secondary" onClick={handleDemoLogin}> {/* Removed asChild */}
                             <UserCheck className="mr-1 sm:mr-2 h-4 w-4" />
                            Demo
                         </Button>
                         <Button asChild size="sm">
                           <Link href="/login">
                             Acessar
                           </Link>
                         </Button>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="container flex flex-col items-center justify-center gap-6 py-12 md:py-20 text-center px-4">
                 <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl">
                    Gerencie seus Ativos com <span className="text-primary">Inteligência</span> e <span className="text-accent">Praticidade</span>.
                 </h1>
                 <p className="max-w-2xl text-md sm:text-lg text-muted-foreground">
                    O QRIoT.app simplifica o controle do seu patrimônio. Cadastre, localize, inventarie e monitore tudo com a facilidade dos QR Codes.
                 </p>
                 <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full max-w-md sm:max-w-none">
                     <Button size="lg" variant="secondary" onClick={handleDemoLogin} className="w-full sm:w-auto"> {/* Removed asChild */}
                         <UserCheck className="mr-2 h-5 w-5" /> Acessar Conta Demo
                    </Button>
                    <Button asChild size="lg" variant="default" className="w-full sm:w-auto">
                          <Link href="/login">
                            Acessar Sistema
                          </Link>
                    </Button>
                 </div>
                  <div className="mt-8 h-48 sm:h-64 md:h-80 lg:h-96 w-full max-w-3xl bg-muted rounded-lg shadow-lg flex items-center justify-center text-muted-foreground p-2 sm:p-4">
                    <Image src="https://picsum.photos/seed/qriot-hero/800/450" alt="Demonstração do QRIoT.app" width={800} height={450} className="rounded-md object-contain w-full h-full" data-ai-hint="app dashboard"/>
                  </div>
            </section>

            {/* Features Section */}
            <section id="features" className="container py-12 md:py-20 bg-secondary/10 rounded-t-lg px-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10 sm:mb-12">Por que escolher o QRIoT.app?</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                         <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center">
                            <div className="p-3 rounded-full bg-primary/10 mb-3 sm:mb-4">
                                <QrCode className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                            </div>
                            <h3 className="text-md sm:text-lg font-semibold mb-2">Identificação Rápida com QR Code</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">Cada ativo recebe um QR Code único para acesso instantâneo a informações detalhadas, mesmo offline.</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center">
                             <div className="p-3 rounded-full bg-accent/10 mb-3 sm:mb-4">
                                <CheckCircle className="h-7 w-7 sm:h-8 sm:w-8 text-accent" />
                            </div>
                            <h3 className="text-md sm:text-lg font-semibold mb-2">Inventário Simplificado</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">Realize inventários completos apenas escaneando os QR Codes. Rápido, fácil e sem planilhas complicadas.</p>
                        </CardContent>
                    </Card>
                     <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center">
                             <div className="p-3 rounded-full bg-green-500/10 mb-3 sm:mb-4">
                                <BarChart className="h-7 w-7 sm:h-8 sm:w-8 text-green-600" />
                            </div>
                            <h3 className="text-md sm:text-lg font-semibold mb-2">Controle Total e Histórico</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">Monitore localização (GPS), responsável, características, status (perdido, alugado) e histórico de alterações.</p>
                        </CardContent>
                    </Card>
                     <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center">
                            <div className="p-3 rounded-full bg-blue-500/10 mb-3 sm:mb-4">
                                <Users className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600" />
                            </div>
                            <h3 className="text-md sm:text-lg font-semibold mb-2">Hierarquia e Permissões</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">Gerencie usuários com diferentes níveis de acesso e controle a visibilidade de ativos por hierarquia.</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center">
                             <div className="p-3 rounded-full bg-purple-500/10 mb-3 sm:mb-4">
                                <ShieldCheck className="h-7 w-7 sm:h-8 sm:w-8 text-purple-600" />
                            </div>
                            <h3 className="text-md sm:text-lg font-semibold mb-2">Auditoria Completa</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">Rastreie todas as modificações em ativos e características, garantindo segurança e conformidade.</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center">
                            <div className="p-3 rounded-full bg-orange-500/10 mb-3 sm:mb-4">
                                <Printer className="h-7 w-7 sm:h-8 sm:w-8 text-orange-600" />
                            </div>
                            <h3 className="text-md sm:text-lg font-semibold mb-2">Impressão de Etiquetas</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">Gere e imprima etiquetas com QR Code em diversos tamanhos, compatíveis com impressoras comuns e térmicas.</p>
                        </CardContent>
                    </Card>
                </div>
            </section>

             {/* How it Works Section (Simplified) */}
             <section id="how-it-works" className="container py-12 md:py-20 px-4">
                 <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10 sm:mb-12">Como Funciona?</h2>
                 <div className="grid gap-6 md:grid-cols-3">
                     <div className="flex flex-col items-center text-center p-2">
                        <div className="text-3xl sm:text-4xl font-bold text-primary mb-3 sm:mb-4">1</div>
                        <h3 className="text-md sm:text-lg font-semibold mb-2">Cadastre</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">Registre seus ativos com detalhes: nome, categoria, local, responsável, fotos e características.</p>
                     </div>
                      <div className="flex flex-col items-center text-center p-2">
                        <div className="text-3xl sm:text-4xl font-bold text-primary mb-3 sm:mb-4">2</div>
                        <h3 className="text-md sm:text-lg font-semibold mb-2">Etiquete</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">Gere e imprima etiquetas com QR Code exclusivo para cada ativo.</p>
                     </div>
                      <div className="flex flex-col items-center text-center p-2">
                        <div className="text-3xl sm:text-4xl font-bold text-primary mb-3 sm:mb-4">3</div>
                        <h3 className="text-md sm:text-lg font-semibold mb-2">Gerencie</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">Escaneie o QR Code para visualizar informações, fazer inventário, atualizar status e muito mais.</p>
                     </div>
                 </div>
             </section>


            {/* Call to Action Section */}
            <section id="contact" className="bg-primary text-primary-foreground py-12 md:py-20">
                <div className="container text-center px-4">
                    <Zap className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-accent" />
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">Pronto para Simplificar sua Gestão de Ativos?</h2>
                    <p className="max-w-xl mx-auto mb-8 text-primary-foreground/80 text-sm sm:text-base">
                         Registre-se gratuitamente e comece a usar agora mesmo ou solicite uma demonstração personalizada.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 w-full max-w-md sm:max-w-lg mx-auto">
                         <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
                            <Link href="/register">
                                Registrar Grátis
                            </Link>
                        </Button>
                         <Button asChild size="lg" variant="outline" className="border-secondary text-secondary hover:bg-secondary/10 hover:text-secondary w-full sm:w-auto">
                             <Link href="mailto:contato@qriot.app?subject=Demonstração QRIoT.app" className="flex items-center justify-center">
                                     <Phone className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Solicitar Demonstração
                             </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-6 border-t">
                <div className="container flex flex-col items-center justify-between gap-2 md:flex-row px-4">
                    <p className="text-xs sm:text-sm text-muted-foreground text-center md:text-left">&copy; {new Date().getFullYear()} QRIoT.app. Todos os direitos reservados.</p>
                    {/* Optional: Add social links or privacy policy link */}
                </div>
            </footer>
        </div>
    );
}

