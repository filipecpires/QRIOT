
'use client'; // Needed for animations or client-side interactions

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QrCode, CheckCircle, BarChart, Users, Phone, Zap, ArrowRight, ShieldCheck, Printer } from 'lucide-react';
import Image from 'next/image'; // For potential hero image or screenshots

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-secondary/20">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
                        <QrCode className="h-6 w-6" />
                        QRIoT.app
                    </Link>
                    {/* Removed "Acessar Sistema" button from header nav */}
                    {/* <nav className="flex items-center gap-4">
                        <Button size="sm" asChild>
                            <Link href="/dashboard">Acessar Sistema</Link>
                         </Button>
                    </nav> */}
                </div>
            </header>

            {/* Hero Section */}
            <section className="container flex flex-col items-center justify-center gap-6 py-16 md:py-24 text-center">
                 <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl xl:text-6xl">
                    Gerencie seus Ativos com <span className="text-primary">Inteligência</span> e <span className="text-accent">Praticidade</span>.
                 </h1>
                 <p className="max-w-2xl text-lg text-muted-foreground">
                    O QRIoT.app simplifica o controle do seu patrimônio. Cadastre, localize, inventarie e monitore tudo com a facilidade dos QR Codes.
                 </p>
                 <div className="flex gap-4">
                    <Button size="lg" asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                        <Link href="mailto:contato@qriot.app?subject=Demonstração QRIoT.app">
                             {/* Wrap text in a single element */}
                            <span>Solicitar Demonstração</span>
                        </Link>
                    </Button>
                    {/* Removed "Acessar Sistema" button from hero */}
                    {/* <Button size="lg" variant="outline" asChild>
                        <Link href="/dashboard">Acessar Sistema <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button> */}
                 </div>
                  <div className="mt-8 h-64 w-full max-w-3xl bg-muted rounded-lg shadow-lg flex items-center justify-center text-muted-foreground">
                    [ Placeholder para Imagem/Vídeo Ilustrativo ]
                  </div>
            </section>

            {/* Features Section */}
            <section id="features" className="container py-16 md:py-24 bg-secondary/10 rounded-t-lg">
                <h2 className="text-3xl font-bold text-center mb-12">Por que escolher o QRIoT.app?</h2>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                         <CardContent className="p-6 flex flex-col items-center text-center">
                            <div className="p-3 rounded-full bg-primary/10 mb-4">
                                <QrCode className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Identificação Rápida com QR Code</h3>
                            <p className="text-sm text-muted-foreground">Cada ativo recebe um QR Code único para acesso instantâneo a informações detalhadas, mesmo offline.</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex flex-col items-center text-center">
                             <div className="p-3 rounded-full bg-accent/10 mb-4">
                                <CheckCircle className="h-8 w-8 text-accent" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Inventário Simplificado</h3>
                            <p className="text-sm text-muted-foreground">Realize inventários completos apenas escaneando os QR Codes. Rápido, fácil e sem planilhas complicadas.</p>
                        </CardContent>
                    </Card>
                     <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex flex-col items-center text-center">
                             <div className="p-3 rounded-full bg-green-500/10 mb-4">
                                <BarChart className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Controle Total e Histórico</h3>
                            <p className="text-sm text-muted-foreground">Monitore localização (GPS), responsável, características, status (perdido, alugado) e histórico de alterações.</p>
                        </CardContent>
                    </Card>
                     <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex flex-col items-center text-center">
                            <div className="p-3 rounded-full bg-blue-500/10 mb-4">
                                <Users className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Hierarquia e Permissões</h3>
                            <p className="text-sm text-muted-foreground">Gerencie usuários com diferentes níveis de acesso e controle a visibilidade de ativos por hierarquia.</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex flex-col items-center text-center">
                             <div className="p-3 rounded-full bg-purple-500/10 mb-4">
                                <ShieldCheck className="h-8 w-8 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Auditoria Completa</h3>
                            <p className="text-sm text-muted-foreground">Rastreie todas as modificações em ativos e características, garantindo segurança e conformidade.</p>
                        </CardContent>
                    </Card>
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex flex-col items-center text-center">
                            <div className="p-3 rounded-full bg-orange-500/10 mb-4">
                                <Printer className="h-8 w-8 text-orange-600" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Impressão de Etiquetas</h3>
                            <p className="text-sm text-muted-foreground">Gere e imprima etiquetas com QR Code em diversos tamanhos, compatíveis com impressoras comuns e térmicas.</p>
                        </CardContent>
                    </Card>
                </div>
            </section>

             {/* How it Works Section (Simplified) */}
             <section id="how-it-works" className="container py-16 md:py-24">
                 <h2 className="text-3xl font-bold text-center mb-12">Como Funciona?</h2>
                 <div className="grid gap-8 md:grid-cols-3">
                     <div className="flex flex-col items-center text-center">
                        <div className="text-4xl font-bold text-primary mb-4">1</div>
                        <h3 className="text-lg font-semibold mb-2">Cadastre</h3>
                        <p className="text-sm text-muted-foreground">Registre seus ativos com detalhes: nome, categoria, local, responsável, fotos e características.</p>
                     </div>
                      <div className="flex flex-col items-center text-center">
                        <div className="text-4xl font-bold text-primary mb-4">2</div>
                        <h3 className="text-lg font-semibold mb-2">Etiquete</h3>
                        <p className="text-sm text-muted-foreground">Gere e imprima etiquetas com QR Code exclusivo para cada ativo.</p>
                     </div>
                      <div className="flex flex-col items-center text-center">
                        <div className="text-4xl font-bold text-primary mb-4">3</div>
                        <h3 className="text-lg font-semibold mb-2">Gerencie</h3>
                        <p className="text-sm text-muted-foreground">Escaneie o QR Code para visualizar informações, fazer inventário, atualizar status e muito mais.</p>
                     </div>
                 </div>
             </section>


            {/* Call to Action Section */}
            <section id="contact" className="bg-primary text-primary-foreground py-16 md:py-24">
                <div className="container text-center">
                    <Zap className="h-12 w-12 mx-auto mb-4 text-accent" />
                    <h2 className="text-3xl font-bold mb-4">Pronto para Simplificar sua Gestão de Ativos?</h2>
                    <p className="max-w-xl mx-auto mb-8 text-primary-foreground/80">
                        Solicite uma demonstração personalizada e veja como o QRIoT.app pode transformar o controle do seu patrimônio.
                    </p>
                    <Button size="lg" variant="secondary" asChild>
                        <Link href="mailto:contato@qriot.app?subject=Demonstração QRIoT.app">
                            {/* Wrap icon and text in a single element */}
                            <span>
                                <Phone className="mr-2 h-5 w-5" /> Quero uma Demonstração
                            </span>
                        </Link>
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-6 border-t">
                <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
                    <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} QRIoT.app. Todos os direitos reservados.</p>
                    {/* Optional: Add social links or privacy policy link */}
                </div>
            </footer>
        </div>
    );
}
