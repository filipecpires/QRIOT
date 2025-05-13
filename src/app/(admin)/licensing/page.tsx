
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge, badgeVariants } from '@/components/ui/badge'; // Import badgeVariants
import type { VariantProps } from 'class-variance-authority'; // Correct import path
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, AlertCircle, CheckCircle, ShoppingCart, CalendarDays, Hash, Users as UserIcon } from 'lucide-react'; // Added UserIcon
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils'; // Import cn
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Import Alert components

// Define License Data Structure
interface LicenseInfo {
    planName: string;
    assetLimit: number;
    currentAssetCount: number;
    expirationDate: Date | null; // Null if perpetual or no expiration
    status: 'active' | 'expired' | 'exceeded' | 'trial';
    isTrial: boolean;
    userLimit: number; // Added user limit
    currentUserCount: number; // Added current user count
}

// Mock function to fetch license info - Replace with actual API call
async function fetchLicenseInfo(): Promise<LicenseInfo | null> {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    // --- MOCK DATA ---
    // Scenario 1: Active Plan within limits
    // return {
    //     planName: 'Plano Profissional',
    //     assetLimit: 1000,
    //     currentAssetCount: 750,
    //     expirationDate: new Date(2025, 11, 31), // Dec 31, 2025
    //     status: 'active',
    //     isTrial: false,
    //     userLimit: 50,
    //     currentUserCount: 25,
    // };

    // Scenario 2: Trial Plan approaching limit
     return {
         planName: 'Teste Gratuito (15 dias)',
         assetLimit: 50,
         currentAssetCount: 45,
         expirationDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // Expires in 10 days
         status: 'trial',
         isTrial: true,
         userLimit: 5,
         currentUserCount: 3,
     };

    // Scenario 3: Expired Plan
    // return {
    //     planName: 'Plano Básico',
    //     assetLimit: 100,
    //     currentAssetCount: 80,
    //     expirationDate: new Date(2024, 2, 15), // Mar 15, 2024
    //     status: 'expired',
    //     isTrial: false,
    //     userLimit: 10,
    //     currentUserCount: 8,
    // };

     // Scenario 4: Exceeded Limit
    // return {
    //     planName: 'Plano Avançado',
    //     assetLimit: 500,
    //     currentAssetCount: 512,
    //     expirationDate: new Date(2026, 5, 30), // Jun 30, 2026
    //     status: 'exceeded',
    //     isTrial: false,
    //     userLimit: 20,
    //     currentUserCount: 21, // Example user limit exceeded
    // };

    // return null; // Simulate error fetching license
}

export default function LicensingPage() {
    const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadLicense = async () => {
            setLoading(true);
            setError(null);
            try {
                const info = await fetchLicenseInfo();
                if (info) {
                    setLicenseInfo(info);
                } else {
                    setError("Não foi possível carregar as informações da licença.");
                }
            } catch (err) {
                console.error("Error fetching license info:", err);
                setError("Ocorreu um erro ao buscar os dados da licença.");
            } finally {
                setLoading(false);
            }
        };
        loadLicense();
    }, []);

    const getStatusBadgeVariant = (status: LicenseInfo['status']): VariantProps<typeof badgeVariants>["variant"] => {
        switch (status) {
            case 'active': return 'default'; 
            case 'trial': return 'secondary'; 
            case 'expired': return 'destructive';
            case 'exceeded': return 'destructive'; 
            default: return 'outline';
        }
    };

    const getStatusText = (status: LicenseInfo['status']): string => {
         switch (status) {
            case 'active': return 'Ativa';
            case 'trial': return 'Período de Teste';
            case 'expired': return 'Expirada';
            case 'exceeded': return 'Limite Excedido';
            default: return 'Desconhecido';
        }
    }

    const assetUsagePercentage = licenseInfo ? (licenseInfo.currentAssetCount / licenseInfo.assetLimit) * 100 : 0;
    const userUsagePercentage = licenseInfo ? (licenseInfo.currentUserCount / licenseInfo.userLimit) * 100 : 0;

    return (
        <div className="space-y-6"> 
            <h1 className="text-2xl sm:text-3xl font-bold mb-6">Licença de Uso</h1>

            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText /> Informações da Sua Licença</CardTitle>
                    <CardDescription>Detalhes sobre o seu plano atual e limites de uso.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {loading && (
                        <div className="space-y-4">
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-8 w-3/4 mt-2" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-1/4" />
                        </div>
                    )}
                    {error && (
                        <div className="text-destructive flex items-center gap-2">
                            <AlertCircle /> {error}
                        </div>
                    )}
                    {!loading && !error && licenseInfo && (
                        <>
                            <div className="flex justify-between items-center border-b pb-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Plano Atual</p>
                                    <p className="text-xl font-semibold">{licenseInfo.planName}</p>
                                </div>
                                <Badge variant={getStatusBadgeVariant(licenseInfo.status)} className={cn(licenseInfo.status === 'active' && 'bg-green-500 text-white')}>
                                    {getStatusText(licenseInfo.status)}
                                </Badge>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold flex items-center gap-1"><Hash className="h-4 w-4 text-muted-foreground"/> Uso de Ativos</h3>
                                <Progress value={assetUsagePercentage} aria-label={`${assetUsagePercentage.toFixed(0)}% de uso de ativos`} className="h-3" />
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>{licenseInfo.currentAssetCount.toLocaleString()} ativos cadastrados</span>
                                    <span>Limite: {licenseInfo.assetLimit.toLocaleString()} ativos</span>
                                </div>
                                {(licenseInfo.status === 'exceeded' || (assetUsagePercentage > 90 && licenseInfo.status !== 'expired')) && (
                                     <Alert variant={licenseInfo.status === 'exceeded' ? 'destructive' : 'default'} className={cn(licenseInfo.status !== 'exceeded' && assetUsagePercentage > 90 && 'bg-yellow-100 border-yellow-300 text-yellow-800')}>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>{licenseInfo.status === 'exceeded' ? 'Limite de Ativos Atingido!' : 'Limite de Ativos Próximo!'}</AlertTitle>
                                        <AlertDescription>
                                            {licenseInfo.status === 'exceeded'
                                             ? 'Você atingiu o limite de ativos do seu plano. Não é possível cadastrar novos ativos. Considere fazer um upgrade.'
                                             : 'Você está próximo de atingir o limite de ativos do seu plano. Considere fazer um upgrade em breve.'
                                            }
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold flex items-center gap-1"><UserIcon className="h-4 w-4 text-muted-foreground"/> Uso de Usuários</h3>
                                <Progress value={userUsagePercentage} aria-label={`${userUsagePercentage.toFixed(0)}% de uso de usuários`} className="h-3" />
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>{licenseInfo.currentUserCount.toLocaleString()} usuários cadastrados</span>
                                    <span>Limite: {licenseInfo.userLimit.toLocaleString()} usuários</span>
                                </div>
                                {(licenseInfo.currentUserCount >= licenseInfo.userLimit && licenseInfo.status !== 'expired') && (
                                     <Alert variant={'destructive'}>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>{'Limite de Usuários Atingido!'}</AlertTitle>
                                        <AlertDescription>
                                             {'Você atingiu o limite de usuários do seu plano. Não é possível cadastrar novos usuários. Considere fazer um upgrade.'}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>


                             <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Data de Expiração:</span>
                                     <span className="font-medium">
                                        {licenseInfo.expirationDate
                                            ? format(licenseInfo.expirationDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                                            : 'Não expira'}
                                    </span>
                                </div>
                               
                             </div>

                            {licenseInfo.status === 'expired' && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Licença Expirada!</AlertTitle>
                                    <AlertDescription>
                                        Sua licença expirou em {licenseInfo.expirationDate ? format(licenseInfo.expirationDate, "dd/MM/yyyy") : 'data desconhecida'}. Renove seu plano para continuar usando todas as funcionalidades.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </>
                    )}
                </CardContent>
                {!loading && !error && licenseInfo && (
                     <CardFooter className="flex justify-end">
                        {/* Link should go to actual pricing/upgrade page */}
                        <Button>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            {licenseInfo.isTrial ? 'Ver Planos Pagos' : 'Gerenciar Assinatura / Upgrade'}
                         </Button>
                    </CardFooter>
                 )}
             </Card>
             {/* Add FAQ or contact info about licensing here */}
             <div className="text-center mt-6 text-sm text-muted-foreground">
                Precisa de mais ativos ou tem dúvidas sobre sua licença? <a href="mailto:contato@qriot.app" className="text-primary hover:underline">Entre em contato</a>.
            </div>
        </div>
    );
}

