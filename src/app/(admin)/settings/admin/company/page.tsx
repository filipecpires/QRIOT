
'use client';

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2, Building, Upload, FileText, ShoppingCart, Hash, Users as UserIcon, CalendarDays, AlertCircle, DollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { 
    fetchCompanyDetails, 
    fetchCompanyLicenseInfo,
    fetchBillingDetails,
    fetchPaymentHistory,
    saveCompanyDetails,
    MOCK_COMPANY_ID // Using this for now, should come from context
} from '@/lib/mock-data';

import type { CompanyDetails, LicenseInfo, BillingInfo, PaymentHistoryEntry } from '@/types';
import { useAdminLayoutContext } from '@/components/layout/admin-layout-context';


function getInitials(name: string = ''): string {
    const names = name.split(' ');
    const firstInitial = names[0]?.[0] ?? '';
    const lastInitial = names.length > 1 ? names[names.length - 1]?.[0] ?? '' : '';
    return `${firstInitial}${lastInitial}`.toUpperCase() || '?';
}

export default function CompanySettingsPage() {
    const { toast } = useToast();
    const { currentCompanyId: contextCompanyId, currentDemoProfileName } = useAdminLayoutContext();
    const companyId = contextCompanyId || MOCK_COMPANY_ID; // Fallback if context not ready or not in demo

    const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null);
    const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);
    const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
    const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryEntry[]>([]);
    
    const [companyNameInput, setCompanyNameInput] = useState('');
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const logoFileRef = useRef<HTMLInputElement>(null);

    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isSavingName, setIsSavingName] = useState(false);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);

    useEffect(() => {
        const loadAllData = async () => {
            setIsLoadingData(true);
            try {
                const [details, license, billing, history] = await Promise.all([
                    fetchCompanyDetails(companyId),
                    fetchCompanyLicenseInfo(companyId),
                    fetchBillingDetails(companyId),
                    fetchPaymentHistory(companyId)
                ]);
                setCompanyDetails(details);
                setLicenseInfo(license);
                setBillingInfo(billing);
                setPaymentHistory(history);

                if (details) {
                    setCompanyNameInput(details.name);
                    setLogoPreview(details.logoUrl || null);
                }

            } catch (error) {
                console.error("Error loading company settings data:", error);
                toast({ title: "Erro", description: "Não foi possível carregar os dados da empresa.", variant: "destructive" });
            } finally {
                setIsLoadingData(false);
            }
        };
        if (companyId) {
            loadAllData();
        }
    }, [companyId, toast]);

    const handleSaveName = async () => {
        if (!companyNameInput.trim()) {
            toast({ title: "Erro", description: "O nome da empresa não pode estar vazio.", variant: "destructive" });
            return;
        }
        if (!companyDetails) return;

        setIsSavingName(true);
        const success = await saveCompanyDetails(companyId, { name: companyNameInput });
        setIsSavingName(false);

        if (success) {
            setCompanyDetails(prev => prev ? { ...prev, name: companyNameInput } : null);
            toast({ title: "Sucesso", description: "Nome da empresa atualizado." });
        } else {
            toast({ title: "Erro", description: "Falha ao salvar o nome da empresa.", variant: "destructive" });
        }
    };

    const handleLogoFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                setLogoPreview(reader.result as string);
                setIsUploadingLogo(true);
                // Simulate upload and save
                await new Promise(resolve => setTimeout(resolve, 1500)); 
                const success = await saveCompanyDetails(companyId, { name: companyNameInput, logoUrl: reader.result as string });
                setIsUploadingLogo(false);
                if (success) {
                     setCompanyDetails(prev => prev ? { ...prev, logoUrl: reader.result as string } : null);
                    toast({ title: "Logo Atualizado", description: "O logo da empresa foi salvo." });
                } else {
                    // Revert preview if save failed
                    setLogoPreview(companyDetails?.logoUrl || null);
                    toast({ title: "Erro no Upload", description: "Falha ao salvar o novo logo.", variant: "destructive" });
                }
            };
            reader.readAsDataURL(file);
        }
    };

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
    };

    const assetUsagePercentage = licenseInfo ? (licenseInfo.currentAssetCount / licenseInfo.assetLimit) * 100 : 0;
    const userUsagePercentage = licenseInfo ? (licenseInfo.currentUserCount / licenseInfo.userLimit) * 100 : 0;


    return (
        <div className="space-y-6">
            <Button variant="outline" size="sm" asChild>
                <Link href="/settings/admin">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Administração
                </Link>
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Building /> Dados da Empresa</CardTitle>
                    <CardDescription>Gerencie as informações básicas e a identidade visual da sua empresa.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isLoadingData ? (
                        <>
                            <Skeleton className="h-10 w-full" />
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-20 w-20 rounded-full" />
                                <Skeleton className="h-10 w-32" />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="company-name">Nome da Empresa</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="company-name"
                                        placeholder="Nome visível no sistema"
                                        value={companyNameInput}
                                        onChange={(e) => setCompanyNameInput(e.target.value)}
                                        disabled={isSavingName}
                                        className="flex-grow"
                                    />
                                    <Button onClick={handleSaveName} disabled={isSavingName || companyNameInput === companyDetails?.name} className="flex-shrink-0">
                                        {isSavingName ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                        Salvar Nome
                                    </Button>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Este nome pode aparecer em relatórios ou páginas públicas.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Logo da Empresa</Label>
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-20 w-20 border">
                                        <AvatarImage src={logoPreview || undefined} alt={companyDetails?.name || "Logo"} />
                                        <AvatarFallback className="text-2xl">{getInitials(companyDetails?.name || "Empresa")}</AvatarFallback>
                                    </Avatar>
                                    <Button variant="outline" onClick={() => logoFileRef.current?.click()} disabled={isUploadingLogo}>
                                        {isUploadingLogo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                        Alterar Logo
                                    </Button>
                                    <Input type="file" accept="image/png, image/jpeg, image/svg+xml" ref={logoFileRef} onChange={handleLogoFileChange} className="hidden" />
                                </div>
                                <p className="text-xs text-muted-foreground">Recomendado: PNG ou SVG, máximo 2MB.</p>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText /> Detalhes da Licença</CardTitle>
                    <CardDescription>Informações sobre seu plano atual e limites de uso.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isLoadingData || !licenseInfo ? (
                         <div className="space-y-4">
                            <Skeleton className="h-6 w-1/2" /> <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-3 w-full" /> <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-full" /> <Skeleton className="h-4 w-2/3" />
                         </div>
                    ) : (
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
                                     <Alert variant={licenseInfo.currentAssetCount >= licenseInfo.assetLimit ? 'destructive' : 'default'} className={cn(licenseInfo.currentAssetCount < licenseInfo.assetLimit && assetUsagePercentage > 90 && 'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300')}>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>{licenseInfo.currentAssetCount >= licenseInfo.assetLimit ? 'Limite de Ativos Atingido!' : 'Limite de Ativos Próximo!'}</AlertTitle>
                                        <AlertDescription>
                                            {licenseInfo.currentAssetCount >= licenseInfo.assetLimit
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
                 <CardFooter className="flex justify-end">
                     {isLoadingData || !licenseInfo ? (
                        <Skeleton className="h-10 w-48" />
                     ) : (
                        <Button>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            {licenseInfo.isTrial ? 'Ver Planos Pagos' : 'Gerenciar Assinatura / Upgrade'}
                         </Button>
                     )}
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><DollarSign /> Faturamento e Pagamentos</CardTitle>
                    <CardDescription>Informações sobre sua assinatura e histórico de pagamentos.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isLoadingData || !billingInfo ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1 rounded-md border p-3">
                                <p className="text-muted-foreground">Próximo Faturamento</p>
                                <p className="font-semibold text-lg">{format(billingInfo.nextPaymentDate, "dd/MM/yyyy", {locale: ptBR})}</p>
                            </div>
                            <div className="space-y-1 rounded-md border p-3">
                                <p className="text-muted-foreground">Valor da Próxima Fatura</p>
                                <p className="font-semibold text-lg">R$ {billingInfo.nextPaymentAmount.toFixed(2).replace('.', ',')}</p>
                            </div>
                            <div className="space-y-1 rounded-md border p-3 md:col-span-2">
                                <p className="text-muted-foreground">Método de Pagamento</p>
                                <p className="font-semibold">{billingInfo.paymentMethod || 'Nenhum configurado'}</p>
                            </div>
                        </div>
                    )}
                    
                    <div className="space-y-2">
                        <h4 className="font-medium">Histórico de Pagamentos</h4>
                        {isLoadingData ? (
                             <Table>
                                <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Descrição</TableHead><TableHead>Valor</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {Array.from({length:3}).map((_, i) => (
                                        <TableRow key={`skel-pay-${i}`}><TableCell><Skeleton className="h-4 w-20"/></TableCell><TableCell><Skeleton className="h-4 w-48"/></TableCell><TableCell><Skeleton className="h-4 w-16"/></TableCell><TableCell><Skeleton className="h-6 w-20 rounded-full"/></TableCell></TableRow>
                                    ))}
                                </TableBody>
                             </Table>
                        ) : paymentHistory.length > 0 ? (
                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Data</TableHead>
                                            <TableHead>Descrição</TableHead>
                                            <TableHead className="text-right">Valor (R$)</TableHead>
                                            <TableHead className="text-center">Status</TableHead>
                                            <TableHead className="text-right">Fatura</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paymentHistory.map((payment) => (
                                            <TableRow key={payment.id}>
                                                <TableCell>{format(payment.date, "dd/MM/yy", {locale: ptBR})}</TableCell>
                                                <TableCell>{payment.description}</TableCell>
                                                <TableCell className="text-right">{payment.amount.toFixed(2).replace('.', ',')}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant={payment.status === 'Paid' ? 'default' : payment.status === 'Failed' ? 'destructive' : 'secondary'} className={cn(payment.status === 'Paid' && "bg-green-500 hover:bg-green-600")}>
                                                        {payment.status === 'Paid' ? 'Pago' : payment.status === 'Failed' ? 'Falhou' : 'Pendente'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {payment.invoiceUrl ? (
                                                        <Button variant="link" size="sm" asChild><Link href={payment.invoiceUrl} target="_blank">Ver</Link></Button>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">Nenhum histórico de pagamento encontrado.</p>
                        )}
                    </div>
                </CardContent>
                 <CardFooter className="flex justify-end">
                     {isLoadingData || !billingInfo ? (
                        <Skeleton className="h-10 w-48" />
                     ) : (
                        <Button variant="outline">
                           Gerenciar Assinatura e Pagamentos
                         </Button>
                     )}
                </CardFooter>
            </Card>
        </div>
    );
}

