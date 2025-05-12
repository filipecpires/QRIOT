
'use client'; 

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Removed CardFooter as it's not used
import { QrCode, CheckCircle, BarChart, Users, Phone, Zap, ShieldCheck, Printer, ArrowRight, Package, MapPin, History, Edit, FileText, BadgeCheck, Star, Building } from 'lucide-react'; 
import Image from 'next/image';
import { useRouter } from 'next/navigation'; 
import { useToast } from '@/hooks/use-toast'; 
import { Badge } from '@/components/ui/badge'; 
import { cn } from '@/lib/utils';

export default function LandingPage() {
    const router = useRouter();
    const { toast } = useToast();

    const handleDemoLogin = async () => {
        toast({
            title: 'Acesso Demo',
            description: 'Você será redirecionado para o painel de demonstração.',
        });
        // Simulate redirection after a short delay
        setTimeout(() => {
            router.push('/my-dashboard'); 
        }, 1500);
    };

    const features = [
        {
            icon: QrCode,
            title: "Identificação Rápida com QR Code",
            description: "Acesse informações detalhadas de cada ativo instantaneamente escaneando um QR Code único. Simples e eficiente.",
        },
        {
            icon: CheckCircle,
            title: "Inventário Simplificado e Ágil",
            description: "Realize inventários completos de forma rápida, escaneando QR Codes. Diga adeus às planilhas complexas!",
        },
        {
            icon: MapPin,
            title: "Controle Total de Localização",
            description: "Monitore a localização exata dos seus ativos com GPS, saiba quem é o responsável e o histórico de movimentações.",
        },
        {
            icon: Users,
            title: "Hierarquia e Permissões Detalhadas",
            description: "Gerencie usuários com diferentes níveis de acesso e controle a visibilidade dos ativos conforme a estrutura da sua empresa.",
        },
        {
            icon: ShieldCheck,
            title: "Auditoria Completa e Segura",
            description: "Rastreie todas as alterações em ativos e características. Garanta segurança, conformidade e transparência.",
        },
        {
            icon: Printer,
            title: "Impressão Flexível de Etiquetas",
            description: "Gere e imprima etiquetas personalizadas com QR Code em diversos tamanhos, compatíveis com impressoras comuns e térmicas.",
        },
        {
            icon: Package,
            title: "Gestão de Ativos Próprios e Alugados",
            description: "Diferencie e gerencie ativos próprios e alugados, controlando contratos, datas de vencimento e custos.",
        },
        {
            icon: FileText,
            title: "Registro Detalhado de Características",
            description: "Cadastre todas as especificações importantes de cada ativo, como voltagem, capacidade, ano de fabricação e mais.",
        },
         {
            icon: Edit,
            title: "Página Pública Personalizável",
            description: "Decida quais informações de cada ativo são visíveis publicamente ao escanear o QR Code.",
        }
    ];

    const featureStyles = [
        { container: "bg-primary", icon: "text-primary-foreground" },
        { container: "bg-accent", icon: "text-accent-foreground" },
        { container: "bg-secondary", icon: "text-secondary-foreground" },
        { container: "bg-primary/80", icon: "text-primary-foreground" }, // Variation
        { container: "bg-accent/80", icon: "text-accent-foreground" },   // Variation
        { container: "bg-muted", icon: "text-muted-foreground" },
        { container: "bg-primary", icon: "text-primary-foreground" },
        { container: "bg-accent", icon: "text-accent-foreground" },
        { container: "bg-secondary", icon: "text-secondary-foreground" },
    ];


    const howItWorksSteps = [
        {
            step: 1,
            title: "Cadastre seus Ativos",
            description: "Insira informações detalhadas, como nome, categoria, local, responsável, fotos e características únicas.",
            icon: Package
        },
        {
            step: 2,
            title: "Gere e Aplique QR Codes",
            description: "O sistema gera automaticamente QR Codes exclusivos. Imprima e fixe nos seus ativos para fácil identificação.",
            icon: QrCode
        },
        {
            step: 3,
            title: "Monitore e Gerencie",
            description: "Escaneie para visualizar dados, realizar inventários, atualizar status, solicitar manutenções e muito mais, tudo na palma da sua mão.",
            icon: BarChart
        }
    ];

    const plans = [
        {
            name: "Gratuito",
            price: "R$0",
            frequency: "/ mês",
            description: "Perfeito para começar e testar os recursos essenciais.",
            features: [
                "Até 5 Ativos",
                "Usuários Ilimitados",
                "Funcionalidades Essenciais de Gestão",
                "Suporte Comunitário"
            ],
            cta: "Crie sua Conta",
            href: "/register",
            popular: false,
            badgeText: null,
        },
        {
            name: "Profissional",
            price: "R$49",
            frequency: "/ mês",
            description: "Ideal para pequenas e médias empresas que buscam controle total.",
            features: [
                "Até 500 Ativos",
                "Usuários Ilimitados",
                "Todas as Funcionalidades Avançadas",
                "Relatórios Personalizados",
                "Suporte Prioritário por Email"
            ],
            cta: "Experimente Grátis",
            href: "/register", // Or specific trial link
            popular: true,
            badgeText: "Mais Popular",
        },
        {
            name: "Empresarial",
            price: "Personalizado",
            frequency: "",
            description: "Solução sob medida para grandes corporações com necessidades específicas.",
            features: [
                "Ativos Ilimitados",
                "Usuários Ilimitados",
                "Recursos Dedicados e SLAs",
                "Integrações Customizadas",
                "Suporte Premium e Consultoria"
            ],
            cta: "Entre em Contato",
            href: "mailto:contato@qriot.app?subject=Consulta%20Plano%20Empresarial%20QRIoT.app",
            popular: false,
            badgeText: null,
        }
    ];


    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-secondary/5 to-background">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary transition-transform hover:scale-105">
                        <QrCode className="h-7 w-7" />
                        QRIoT.app
                    </Link>
                    <nav className="flex items-center gap-2 sm:gap-4">
                         <Button size="sm" variant="ghost" onClick={handleDemoLogin} className="text-primary hover:bg-primary/10">
                             <BadgeCheck className="mr-1 sm:mr-2 h-4 w-4" />
                            Acesso Demo
                         </Button>
                         <Button asChild size="sm" className="shadow-md hover:shadow-lg transition-shadow">
                           <Link href="/login">Entrar</Link>
                         </Button>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="container flex flex-col items-center justify-center gap-6 py-16 md:py-24 text-center px-4">
                 <Badge variant="outline" className="border-primary/50 text-primary py-1 px-3 text-sm animate-fade-in-up">Gestão Inteligente de Ativos</Badge>
                 <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl leading-tight animate-fade-in-up animation-delay-200">
                    Transforme a Gestão dos Seus Ativos com <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">QRIoT.app</span>
                 </h1>
                 <p className="max-w-3xl text-base sm:text-lg text-muted-foreground animate-fade-in-up animation-delay-400">
                    Simplifique o controle, rastreamento e inventário do seu patrimônio. O QRIoT.app oferece uma solução completa e intuitiva, utilizando a tecnologia de QR Codes para otimizar seus processos e reduzir perdas.
                 </p>
                 <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full max-w-md sm:max-w-none justify-center animate-fade-in-up animation-delay-600">
                    <Button asChild size="lg" className="shadow-lg hover:bg-primary/90 transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-auto">
                        <Link href="/register" className="flex items-center justify-center">
                            Comece Gratuitamente
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                     <Button size="lg" variant="outline" onClick={handleDemoLogin} className="border-primary text-primary hover:bg-primary/5 hover:text-primary/90 transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-auto">
                         <BadgeCheck className="mr-2 h-5 w-5" />
                         Ver Demonstração
                    </Button>
                 </div>
                  <div className="mt-12 w-full max-w-4xl aspect-video bg-muted rounded-xl shadow-2xl p-2 sm:p-4 border border-primary/20 animate-fade-in-up animation-delay-800">
                    <Image 
                        src="https://picsum.photos/seed/qriot-dashboard/1200/675" 
                        alt="Dashboard do QRIoT.app em um notebook e celular" 
                        width={1200} 
                        height={675} 
                        className="rounded-lg object-cover w-full h-full" 
                        data-ai-hint="app dashboard"
                        priority
                    />
                  </div>
            </section>

            {/* Features Section */}
            <section id="features" className="container py-16 md:py-24 px-4">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Tudo o que você precisa para uma gestão eficiente</h2>
                    <p className="mt-3 text-md sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                        Descubra como o QRIoT.app pode revolucionar o controle do seu patrimônio.
                    </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => {
                        const style = featureStyles[index % featureStyles.length];
                        return (
                            <Card key={index} className="shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 bg-card/80 backdrop-blur-sm border-primary/10 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                                 <CardContent className="p-6 flex flex-col items-start text-left">
                                    <div className={cn(`p-3 rounded-lg mb-4 shadow-md`, style.container)}>
                                        <feature.icon className={cn(`h-7 w-7`, style.icon)} />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2 text-card-foreground">{feature.title}</h3>
                                    <p className="text-sm text-muted-foreground flex-grow">{feature.description}</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </section>

             {/* How it Works Section */}
             <section id="how-it-works" className="bg-muted/50 py-16 md:py-24 px-4">
                 <div className="container">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Simples, Rápido e Poderoso</h2>
                        <p className="mt-3 text-md sm:text-lg text-muted-foreground max-w-xl mx-auto">
                            Comece a usar o QRIoT.app em apenas 3 passos.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 items-start">
                        {howItWorksSteps.map((step, index) => (
                            <div key={step.step} className="flex flex-col items-center text-center p-4 rounded-lg transition-all hover:bg-card hover:shadow-lg animate-fade-in-up" style={{ animationDelay: `${index * 200}ms` }}>
                                <div className="relative mb-6">
                                    <div className="absolute -inset-2 bg-primary/10 rounded-full blur-md opacity-50 animate-pulse_slow" style={{animationDelay: `${index * 0.2}s`}}></div>
                                    <div className="relative flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-lg">
                                        <step.icon className="h-8 w-8" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold mb-2 text-foreground">{step.title}</h3>
                                <p className="text-sm text-muted-foreground">{step.description}</p>
                            </div>
                        ))}
                    </div>
                 </div>
             </section>

            {/* Pricing Section */}
            <section id="pricing" className="container py-16 md:py-24 px-4">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Planos Flexíveis para Todos os Tamanhos</h2>
                    <p className="mt-3 text-md sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                        Escolha o plano que melhor se adapta às necessidades da sua empresa. Cancele quando quiser.
                    </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                    {plans.map((plan, index) => (
                        <Card 
                            key={plan.name} 
                            className={cn(
                                "flex flex-col shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 animate-fade-in-up",
                                plan.popular ? "border-2 border-primary ring-2 ring-primary/30" : "border-border",
                                "bg-card/80 backdrop-blur-sm"
                            )}
                            style={{ animationDelay: `${200 + index * 150}ms` }}
                        >
                            {plan.popular && (
                                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground py-1 px-3 text-xs">
                                    {plan.badgeText || "Mais Popular"}
                                </Badge>
                            )}
                            <CardHeader className="pt-8">
                                <CardTitle className="text-2xl font-semibold text-center text-card-foreground">{plan.name}</CardTitle>
                                <CardDescription className="text-center text-muted-foreground h-10">{plan.description}</CardDescription>
                                <div className="text-center mt-4">
                                    <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                                    {plan.frequency && <span className="text-sm text-muted-foreground">{plan.frequency}</span>}
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-3 pt-2 pb-6 px-6">
                                <ul className="space-y-2">
                                    {plan.features.map((feature, fIndex) => (
                                        <li key={fIndex} className="flex items-start gap-2 text-sm">
                                            <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                            <span className="text-muted-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <div className="mt-auto p-6"> {/* Changed CardFooter to div to avoid import error if CardFooter is not exported from ui/card */}
                                <Button asChild size="lg" className={cn("w-full shadow-md transition-colors", plan.popular ? "bg-primary hover:bg-primary/90" : "bg-accent text-accent-foreground hover:bg-accent/90")}>
                                    {plan.href.startsWith('mailto:') ? (
                                        <a href={plan.href} className="flex items-center justify-center w-full h-full">{plan.cta}</a>
                                    ) : (
                                        <Link href={plan.href} className="flex items-center justify-center w-full h-full">{plan.cta}</Link>
                                    )}
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
                 <p className="text-center text-sm text-muted-foreground mt-12">
                    Todos os planos incluem usuários ilimitados. Precisa de algo diferente? <a href="mailto:contato@qriot.app?subject=Consulta%20Plano%20Personalizado" className="text-primary hover:underline">Fale conosco</a>.
                 </p>
            </section>


            {/* Call to Action Section */}
            <section id="cta" className="py-16 md:py-24 bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground">
                <div className="container text-center px-4">
                    <Zap className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-6 text-background animate-pulse" />
                    <h2 className="text-3xl sm:text-4xl font-bold mb-6">Pronto para Modernizar a Gestão dos Seus Ativos?</h2>
                    <p className="max-w-2xl mx-auto mb-10 text-primary-foreground/90 text-md sm:text-lg">
                         Experimente o QRIoT.app gratuitamente com até 5 ativos ou entre em contato para uma demonstração personalizada e descubra o plano ideal para sua empresa.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 w-full max-w-lg mx-auto">
                         <Button asChild size="lg" variant="secondary" className="text-primary bg-secondary hover:bg-secondary/90 shadow-lg transition-all duration-300 transform hover:scale-105 w-full sm:w-auto">
                            <Link href="/register" className="flex items-center justify-center">
                                Criar Conta Gratuita
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                         <Button asChild size="lg" variant="outline" className="text-background border-background/50 hover:bg-background/10 hover:text-background transition-all duration-300 transform hover:scale-105 w-full sm:w-auto">
                             <a href="mailto:contato@qriot.app?subject=Demonstração%20QRIoT.app" className="flex items-center justify-center">
                                <Phone className="mr-2 h-5 w-5" /> Solicitar Demonstração
                             </a>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t bg-background">
                <div className="container flex flex-col items-center justify-between gap-4 md:flex-row px-4 text-center md:text-left">
                    <div className="flex items-center gap-2 text-primary font-semibold">
                        <QrCode className="h-5 w-5" /> QRIoT.app
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">&copy; {new Date().getFullYear()} QRIoT.app. Todos os direitos reservados.</p>
                    <div className="flex gap-3">
                        <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary">Termos de Uso</Link>
                        <Link href="/privacy" className="text-xs text-muted-foreground hover:text-primary">Política de Privacidade</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
