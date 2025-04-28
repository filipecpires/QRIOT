
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2, Building } from 'lucide-react';

// Mock function to get company data (replace with actual API/DB call)
async function fetchCompanyData(companyId: string): Promise<{ name: string } | null> {
    console.log("Fetching data for company:", companyId);
    await new Promise(resolve => setTimeout(resolve, 800));
    // Simulate fetching data for a specific company ID (e.g., from user context)
    if (companyId === "COMPANY_XYZ") {
        return { name: 'Minha Empresa Exemplo' };
    }
    return { name: '' }; // Default if not found or new
}

// Mock function to save company data
async function saveCompanyData(companyId: string, data: { name: string }): Promise<boolean> {
    console.log("Saving data for company:", companyId, data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Simulate saving
    return true;
}


export default function CompanySettingsPage() {
    const { toast } = useToast();
    const [companyName, setCompanyName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const companyId = "COMPANY_XYZ"; // Assume this is obtained from user context

    useState(() => {
        const loadData = async () => {
            setIsDataLoading(true);
            const data = await fetchCompanyData(companyId);
            if (data) {
                setCompanyName(data.name);
            }
             setIsDataLoading(false);
        };
        loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Fetch only once on mount

    const handleSave = async () => {
        if (!companyName.trim()) {
            toast({ title: "Erro", description: "O nome da empresa não pode estar vazio.", variant: "destructive" });
            return;
        }
        setIsLoading(true);
        const success = await saveCompanyData(companyId, { name: companyName });
        setIsLoading(false);

        if (success) {
            toast({ title: "Sucesso", description: "Dados da empresa atualizados." });
        } else {
            toast({ title: "Erro", description: "Falha ao salvar os dados da empresa.", variant: "destructive" });
        }
    };

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
                    <CardDescription>Gerencie as informações básicas da sua empresa.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isDataLoading ? (
                         <div className="space-y-2">
                            <Label htmlFor="company-name">Nome da Empresa</Label>
                            <Input id="company-name" placeholder="Carregando..." disabled />
                         </div>
                    ) : (
                        <div className="space-y-2">
                            <Label htmlFor="company-name">Nome da Empresa</Label>
                            <Input
                                id="company-name"
                                placeholder="Nome visível no sistema"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                disabled={isLoading}
                            />
                            <p className="text-sm text-muted-foreground">
                                Este nome pode aparecer em relatórios ou páginas públicas.
                             </p>
                        </div>
                    )}

                    {/* Add other company fields here later if needed (e.g., address, logo upload) */}

                </CardContent>
                <CardFooter className="flex justify-end">
                     <Button onClick={handleSave} disabled={isLoading || isDataLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Salvar Alterações
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
