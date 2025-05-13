
'use client';

import { useState, ChangeEvent, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Save, Upload, Download, Loader2 } from 'lucide-react';

// --- Mock Data Structures and Functions ---

// Assume a more complete Asset structure for export/import
interface FullAssetData {
    id: string;
    name: string;
    category: string;
    tag: string;
    locationId: string;
    locationName?: string; // Denormalized for easier export/import?
    responsibleUserId: string;
    responsibleUserName?: string; // Denormalized?
    parentId?: string;
    parentTag?: string; // Denormalized?
    ownershipType: 'own' | 'rented';
    rentalCompany?: string;
    rentalStartDate?: string; // Use ISO string format (YYYY-MM-DD)
    rentalEndDate?: string;
    rentalCost?: number;
    description?: string;
    status: 'active' | 'lost' | 'inactive';
    // Flatten characteristics for CSV? e.g., characteristics_key1=value1;characteristics_key2=value2
    // Or handle them as separate rows/files? For simplicity, maybe exclude complex characteristics for now.
    // For this example, we'll export basic fields only.
}

// Mock function to fetch ALL assets (replace with actual API call)
async function fetchAllAssets(): Promise<FullAssetData[]> {
    console.log("Fetching all assets for export...");
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
    // Return a sample list based on existing mock data, add more fields
    return [
      { id: 'ASSET001', name: 'Notebook Dell Latitude 7400', category: 'Eletrônicos', tag: 'TI-NB-001', locationId: 'loc1', locationName: 'Escritório 1', responsibleUserId: 'user1', responsibleUserName: 'João Silva', ownershipType: 'own', status: 'active', description: 'Notebook corporativo.' },
      { id: 'ASSET002', name: 'Monitor LG 27"', category: 'Eletrônicos', tag: 'TI-MN-005', locationId: 'loc2', locationName: 'Escritório 2', responsibleUserId: 'user2', responsibleUserName: 'Maria Oliveira', ownershipType: 'own', status: 'active' },
      { id: 'ASSET003', name: 'Cadeira de Escritório', category: 'Mobiliário', tag: 'MOB-CAD-012', locationId: 'loc3', locationName: 'Sala de Reuniões', responsibleUserId: 'user3', responsibleUserName: 'Carlos Pereira', ownershipType: 'rented', rentalCompany: 'LocaTudo Móveis', rentalStartDate: '2024-01-15', rentalEndDate: '2025-01-14', rentalCost: 50.00, status: 'lost', parentId: 'ASSET007', parentTag: 'MOB-MES-001' },
      { id: 'ASSET004', name: 'Projetor Epson PowerLite', category: 'Eletrônicos', tag: 'TI-PROJ-002', locationId: 'loc4', locationName: 'Sala de Treinamento', responsibleUserId: 'user4', responsibleUserName: 'Ana Costa', ownershipType: 'own', status: 'inactive' },
      { id: 'ASSET007', name: 'Mesa Escritório', tag: 'MOB-MES-001', category: 'Mobiliário', locationId: 'loc3', locationName: 'Sala de Reuniões', responsibleUserId: 'user3', responsibleUserName: 'Carlos Pereira', ownershipType: 'own', status: 'active' },
    ];
}

// Mock function to import assets (replace with actual API call)
// This would involve complex logic: check existing tags, validate data, handle relationships (location, user, parent), create/update assets.
// For simplicity, this mock just logs the data.
async function importAssets(assets: Partial<FullAssetData>[]): Promise<{ successCount: number, errorCount: number, errors: string[] }> {
    console.log("Importing assets:", assets);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing delay

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Basic validation example (check for tag and name)
    assets.forEach((asset, index) => {
        if (!asset.tag || !asset.name) {
            errorCount++;
            errors.push(`Linha ${index + 2}: Tag ou Nome ausente.`); // +2 for header and 0-based index
        } else {
            // Simulate potential DB errors or conflicts
             if (Math.random() < 0.1) { // Simulate 10% error rate
                 errorCount++;
                 errors.push(`Linha ${index + 2}: Erro simulado ao salvar ${asset.tag}.`);
             } else {
                successCount++;
                // TODO: In real app, perform Firestore create/update here
                // Handle finding/creating related documents (location, user, parent)
             }
        }
    });

    return { successCount, errorCount, errors };
}

// --- End Mock Data ---


export default function SettingsPage() {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to escape CSV fields
  const escapeCsvField = (field: string | number | undefined | null): string => {
    if (field === null || field === undefined) {
      return '';
    }
    const stringField = String(field);
    // If the field contains a comma, double quote, or newline, enclose it in double quotes
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
      // Escape existing double quotes by doubling them
      const escapedField = stringField.replace(/"/g, '""');
      return `"${escapedField}"`;
    }
    return stringField;
  };

  const handleExportAssets = async () => {
    setIsExporting(true);
    toast({ title: "Exportando Ativos...", description: "Aguarde enquanto preparamos o arquivo CSV." });

    try {
      const assets = await fetchAllAssets();

      if (!assets || assets.length === 0) {
        toast({ title: "Nenhum Ativo", description: "Não há ativos para exportar.", variant: "default" });
        setIsExporting(false);
        return;
      }

      // Define CSV Headers (adjust fields as needed)
      const headers = [
        'id', 'tag', 'name', 'category', 'locationId', 'responsibleUserId',
        'parentId', 'ownershipType', 'rentalCompany', 'rentalStartDate', 'rentalEndDate',
        'rentalCost', 'status', 'description'
      ];
      const csvRows = [headers.join(',')]; // Header row

      // Format data rows
      assets.forEach(asset => {
        const row = headers.map(header => {
            // Handle optional fields and provide default empty string
             return escapeCsvField((asset as any)[header]); // Use escapeCsvField
        });
        csvRows.push(row.join(','));
      });

      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `qriot_assets_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({ title: "Exportação Concluída", description: `${assets.length} ativos exportados com sucesso.` });

    } catch (error) {
      console.error("Error exporting assets:", error);
      toast({ title: "Erro na Exportação", description: "Não foi possível exportar os ativos.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsImporting(true);
    toast({ title: "Importando Ativos...", description: "Processando o arquivo CSV." });

    const reader = new FileReader();

    reader.onload = async (e) => {
      const text = e.target?.result as string;
      if (!text) {
         toast({ title: "Erro de Leitura", description: "Não foi possível ler o arquivo.", variant: "destructive" });
         setIsImporting(false);
         return;
      }

      try {
        // Simple CSV parsing (split by newline, then comma) - consider a library for robustness
        const lines = text.trim().split('\n');
        if (lines.length < 2) {
            throw new Error("Arquivo CSV vazio ou sem dados.");
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '')); // Trim and remove potential quotes
        const assetsToImport: Partial<FullAssetData>[] = [];

        for (let i = 1; i < lines.length; i++) {
           const values = lines[i].split(','); // Basic split, won't handle commas within quotes
           // TODO: Implement more robust CSV parsing if needed
           const assetData: Partial<FullAssetData> = {};
           headers.forEach((header, index) => {
               const value = values[index]?.trim().replace(/^"|"$/g, ''); // Trim and remove potential quotes
               if (value !== undefined && value !== '') {
                    // Basic type conversion attempt (refine as needed)
                    if (header === 'rentalCost' || header === 'latitude' || header === 'longitude') {
                        (assetData as any)[header] = parseFloat(value) || undefined;
                    } else {
                        (assetData as any)[header] = value;
                    }
               }
           });
           if (Object.keys(assetData).length > 0) { // Only add if some data was parsed
                assetsToImport.push(assetData);
           }
        }

         if (assetsToImport.length === 0) {
            throw new Error("Nenhum dado de ativo válido encontrado no arquivo CSV.");
        }

        const result = await importAssets(assetsToImport);

        let description = `${result.successCount} ativos importados com sucesso.`;
        if (result.errorCount > 0) {
            description += ` ${result.errorCount} falharam.`;
             // Optionally list first few errors
             if (result.errors.length > 0) {
                 description += ` Erros: ${result.errors.slice(0, 3).join('; ')}${result.errors.length > 3 ? '...' : ''}`;
             }
        }

        toast({
            title: "Importação Concluída",
            description: description,
            variant: result.errorCount > 0 ? "default" : "default", // Keep default, description shows errors
            duration: result.errorCount > 0 ? 10000 : 5000, // Longer duration if errors
        });

      } catch (error: any) {
        console.error("Error importing assets:", error);
        toast({ title: "Erro na Importação", description: error.message || "Falha ao processar o arquivo CSV.", variant: "destructive" });
      } finally {
        setIsImporting(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.onerror = () => {
        toast({ title: "Erro de Leitura", description: "Não foi possível ler o arquivo.", variant: "destructive" });
        setIsImporting(false);
         if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
    };

    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };


  return (
    <div className="space-y-6"> {/* Use simple div instead of container */}
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Configurações</h1>

      <div className="space-y-8">
        {/* Public Page Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Página Pública do Ativo</CardTitle>
            <CardDescription>Controle as informações exibidas na página pública acessada pelo QR Code.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between space-x-2 border p-3 rounded-md">
                 <Label htmlFor="show-category" className="flex flex-col space-y-1">
                    <span>Exibir Categoria</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                      Mostrar a categoria do ativo na página pública.
                    </span>
                 </Label>
                <Switch id="show-category" defaultChecked />
             </div>
             <div className="flex items-center justify-between space-x-2 border p-3 rounded-md">
                 <Label htmlFor="show-location" className="flex flex-col space-y-1">
                    <span>Exibir Localização</span>
                    <span className="font-normal leading-snug text-muted-foreground">
                      Mostrar o nome do local de instalação.
                    </span>
                 </Label>
                <Switch id="show-location" defaultChecked />
             </div>
             <div className="flex items-center justify-between space-x-2 border p-3 rounded-md">
                 <Label htmlFor="show-responsible" className="flex flex-col space-y-1">
                    <span>Exibir Responsável</span>
                     <span className="font-normal leading-snug text-muted-foreground">
                      Mostrar o nome do responsável pelo ativo.
                    </span>
                 </Label>
                <Switch id="show-responsible" />
             </div>
              <div className="flex items-center justify-between space-x-2 border p-3 rounded-md">
                 <Label htmlFor="show-inventory-date" className="flex flex-col space-y-1">
                    <span>Exibir Data do Último Inventário</span>
                     <span className="font-normal leading-snug text-muted-foreground">
                      Mostrar quando o ativo foi inventariado pela última vez.
                    </span>
                 </Label>
                <Switch id="show-inventory-date" defaultChecked />
             </div>
             {/* Note: Individual characteristic visibility is managed per asset */}
             <p className="text-sm text-muted-foreground pt-2">
                A visibilidade de características específicas (como Voltagem, Capacidade) é definida individualmente no cadastro de cada ativo.
            </p>
          </CardContent>
           <CardFooter className="flex justify-end">
                <Button disabled> {/* Enable after implementing save logic */}
                    <Save className="mr-2 h-4 w-4" /> Salvar Config. Pública
                </Button>
           </CardFooter>
        </Card>

        {/* Data Management Settings */}
        <Card>
            <CardHeader>
                <CardTitle>Gerenciamento de Dados</CardTitle>
                <CardDescription>Opções para exportação e importação de dados de ativos.</CardDescription>
            </CardHeader>
             <CardContent className="space-y-4">
                 {/* Export Button */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                     <Button
                         variant="outline"
                         onClick={handleExportAssets}
                         disabled={isExporting || isImporting}
                     >
                         {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                         Exportar Ativos (CSV)
                     </Button>
                      <p className="text-xs text-muted-foreground sm:ml-4">
                         Baixe um arquivo CSV com todos os dados dos ativos cadastrados.
                      </p>
                 </div>

                 {/* Import Section */}
                 <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 border-t pt-4 mt-4">
                     <Button
                         variant="outline"
                         onClick={triggerFileInput}
                         disabled={isImporting || isExporting}
                     >
                         {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                         Importar Ativos (CSV)
                     </Button>
                     <Input
                         type="file"
                         ref={fileInputRef}
                         accept=".csv"
                         onChange={handleImportFileChange}
                         className="hidden" // Hide the default input appearance
                         disabled={isImporting || isExporting}
                     />
                      <p className="text-xs text-muted-foreground sm:ml-4">
                         Envie um arquivo CSV para cadastrar ou atualizar ativos em massa. <a href="/qriot_import_template.csv" download className="text-primary hover:underline">Baixar modelo</a>.
                      </p>
                 </div>

             </CardContent>
        </Card>

      </div>
    </div>
  );
}

