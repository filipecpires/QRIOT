
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { QrCode, CheckCircle, XCircle, Loader2, ListPlus, ScanLine, Info, Tag, Edit, CalendarDays } from 'lucide-react'; // Added CalendarDays
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'; // Import Popover components
import { Calendar } from '@/components/ui/calendar'; // Import Calendar
import { format } from 'date-fns'; // Import date-fns format
import { ptBR } from 'date-fns/locale'; // Import ptBR locale

// Mock data (replace with actual data fetching)
interface CharacteristicTemplate {
    id: string;
    key: string; // Name of the characteristic (e.g., 'Voltagem', 'Localização Prateleira')
    valueType: 'text' | 'number' | 'boolean' | 'date' | 'predefined'; // Type of value expected
    predefinedValues?: string[]; // Options if valueType is 'predefined'
    defaultValue?: string | number | boolean | Date; // Updated to include Date
}

interface ScannedAssetInfo {
    tag: string;
    name: string; // Fetched after scan
    status: 'pending' | 'success' | 'error';
    message?: string;
    appliedCharacteristics?: { key: string; value: any }[]; // Store applied values temporarily
}

// Mock fetch functions
async function fetchCharacteristicTemplates(): Promise<CharacteristicTemplate[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
        { id: 'charTpl1', key: 'Setor', valueType: 'predefined', predefinedValues: ['TI', 'RH', 'Financeiro', 'Marketing'] },
        { id: 'charTpl2', key: 'Revisado em', valueType: 'date' },
        { id: 'charTpl3', key: 'Condição', valueType: 'predefined', predefinedValues: ['Novo', 'Bom', 'Regular', 'Ruim'] },
        { id: 'charTpl4', key: 'Número OS', valueType: 'text' },
        { id: 'charTpl5', key: 'Verificado', valueType: 'boolean', defaultValue: false },
    ];
}

async function fetchAssetNameByTag(tag: string): Promise<string | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const mockAssets: { [tag: string]: string } = {
        'TI-NB-001': 'Notebook Dell Latitude 7400',
        'TI-MN-005': 'Monitor LG 27"',
        'MOB-CAD-012': 'Cadeira de Escritório',
        'TI-PROJ-002': 'Projetor Epson PowerLite',
        'ALM-PAL-001': 'Paleteira Manual',
    };
    return mockAssets[tag] || null;
}

async function applyCharacteristicsToAsset(tag: string, characteristics: { key: string; value: any }[]): Promise<{ success: boolean; message?: string }> {
    console.log(`Applying characteristics to ${tag}:`, characteristics);
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate API call
    // Replace with actual API call (e.g., update Firestore document)
    // Handle potential errors (e.g., asset not found, invalid data)
    const shouldFail = Math.random() < 0.1; // Simulate occasional failure
    if (shouldFail) {
        return { success: false, message: 'Erro simulado ao salvar.' };
    }
    return { success: true };
}

export default function CharacteristicScanPage() {
    const { toast } = useToast();
    const [templates, setTemplates] = useState<CharacteristicTemplate[]>([]);
    const [selectedTemplates, setSelectedTemplates] = useState<CharacteristicTemplate[]>([]);
    const [characteristicValues, setCharacteristicValues] = useState<{ [templateId: string]: any }>({});
    const [scannedAssets, setScannedAssets] = useState<ScannedAssetInfo[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
    const [isLoadingAsset, setIsLoadingAsset] = useState(false);
    const [showCameraFeed, setShowCameraFeed] = useState(false); // Control camera display
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    // QR Scanner library state would go here (e.g., react-qr-scanner or custom logic)
    const lastScannedTag = useRef<string | null>(null);
    const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const loadTemplates = async () => {
            setIsLoadingTemplates(true);
            try {
                const fetchedTemplates = await fetchCharacteristicTemplates();
                setTemplates(fetchedTemplates);
            } catch (error) {
                toast({ title: 'Erro', description: 'Falha ao carregar modelos de características.', variant: 'destructive' });
            } finally {
                setIsLoadingTemplates(false);
            }
        };
        loadTemplates();
    }, [toast]);

    // Camera Permission Effect
    useEffect(() => {
        const getCameraPermission = async () => {
            if (!showCameraFeed) {
                // If camera feed is hidden, stop any existing stream
                if (videoRef.current?.srcObject) {
                    const stream = videoRef.current.srcObject as MediaStream;
                    stream.getTracks().forEach(track => track.stop());
                    videoRef.current.srcObject = null;
                }
                setHasCameraPermission(null); // Reset permission status
                return;
            }

            // Only request permission if showing camera feed
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); // Prefer back camera
                setHasCameraPermission(true);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error('Error accessing camera:', error);
                setHasCameraPermission(false);
                toast({
                    variant: 'destructive',
                    title: 'Acesso à Câmera Negado',
                    description: 'Permita o acesso à câmera nas configurações do navegador para escanear.',
                });
                setShowCameraFeed(false); // Hide camera feed if permission denied
            }
        };

        getCameraPermission();

        // Cleanup function to stop camera when component unmounts or showCameraFeed becomes false
        return () => {
            if (videoRef.current?.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [showCameraFeed, toast]);


    const handleTemplateSelection = (template: CharacteristicTemplate) => {
        setSelectedTemplates(prev =>
            prev.some(t => t.id === template.id)
                ? prev.filter(t => t.id !== template.id)
                : [...prev, template]
        );
        // Initialize default value if selected and has default
        if (!characteristicValues[template.id] && template.defaultValue !== undefined) {
             handleValueChange(template.id, template.defaultValue);
        }
    };

    const handleValueChange = (templateId: string, value: any) => {
        // Convert date to ISO string if it's a Date object for consistent storage/handling
        const processedValue = value instanceof Date ? value.toISOString() : value;
        setCharacteristicValues(prev => ({ ...prev, [templateId]: processedValue }));
    };

    const startScanSession = () => {
        if (selectedTemplates.length === 0) {
            toast({ title: 'Atenção', description: 'Selecione pelo menos uma característica para aplicar.', variant: 'destructive' });
            return;
        }
        setScannedAssets([]); // Clear previous session
        setIsScanning(true);
        setShowCameraFeed(true); // Show camera when scanning starts
        // Initialize QR Scanner library here
        console.log("Starting scan session with characteristics:", selectedTemplates.map(t => ({ key: t.key, value: characteristicValues[t.id] })));
         // TODO: Add QR scanner initialization logic
    };

    const stopScanSession = () => {
        setIsScanning(false);
        setShowCameraFeed(false); // Hide camera when scanning stops
        lastScannedTag.current = null; // Reset last scanned tag
        if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current); // Clear any pending timeout
        // Deinitialize QR Scanner library here
        console.log("Stopping scan session");
        // TODO: Add QR scanner deinitialization logic
    };

    // --- MOCK QR CODE SCANNING ---
    // Replace this with your actual QR code scanning library integration
    const simulateScan = (tag: string) => {
        if (!isScanning) return;
        console.log("Simulating scan:", tag);
        handleQrCodeResult(tag);
    };
    // --- END MOCK QR CODE SCANNING ---

    const handleQrCodeResult = useCallback(async (tag: string) => {
        if (!isScanning || isLoadingAsset) return;

        // Debounce: Prevent processing the same tag multiple times in quick succession
        if (tag === lastScannedTag.current) {
            console.log("Debounced repeated scan:", tag);
            return;
        }
        lastScannedTag.current = tag;
        if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
        scanTimeoutRef.current = setTimeout(() => { lastScannedTag.current = null; }, 1500); // Reset after 1.5 seconds


        setIsLoadingAsset(true); // Indicate loading for this specific asset

        const existingAssetIndex = scannedAssets.findIndex(a => a.tag === tag);
        if (existingAssetIndex !== -1) {
             toast({ title: 'Ativo Já Escaneado', description: `O ativo ${tag} já está na lista.`, variant: 'default' });
             setIsLoadingAsset(false);
             return; // Don't re-process if already in the list for this session
        }


        const assetName = await fetchAssetNameByTag(tag);
        if (!assetName) {
            setScannedAssets(prev => [{ tag, name: 'Desconhecido', status: 'error', message: 'Ativo não encontrado' }, ...prev]);
            setIsLoadingAsset(false);
            return;
        }

        // Prepare characteristics to apply based on current form values
        const characteristicsToApply = selectedTemplates.map(template => ({
            key: template.key,
            // Use the processed value (could be ISO date string or other types)
            value: characteristicValues[template.id] ?? template.defaultValue ?? (template.valueType === 'boolean' ? false : ''),
        }));


        const newAssetInfo: ScannedAssetInfo = { tag, name: assetName, status: 'pending', appliedCharacteristics: characteristicsToApply };
        setScannedAssets(prev => [newAssetInfo, ...prev]); // Add to top with pending status

        try {
            const result = await applyCharacteristicsToAsset(tag, characteristicsToApply);
            setScannedAssets(prev => prev.map(asset =>
                asset.tag === tag
                    ? { ...asset, status: result.success ? 'success' : 'error', message: result.message }
                    : asset
            ));
            if (result.success) {
                // Optional: Play a success sound/vibration
            } else {
                // Optional: Play an error sound/vibration
            }
        } catch (error) {
            console.error("Error applying characteristics:", error);
            setScannedAssets(prev => prev.map(asset =>
                asset.tag === tag
                    ? { ...asset, status: 'error', message: 'Erro inesperado ao salvar.' }
                    : asset
            ));
             // Optional: Play an error sound/vibration
        } finally {
            setIsLoadingAsset(false);
        }

    }, [isScanning, isLoadingAsset, scannedAssets, selectedTemplates, characteristicValues]); // Dependencies for the callback


    return (
        <div className="container mx-auto py-10 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Tag className="h-6 w-6"/> Registrar Características via Scan</CardTitle>
                    <CardDescription>Selecione as características e seus valores padrão, depois escaneie os QR Codes dos ativos para aplicá-las em massa.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* 1. Select Characteristics */}
                    <div className="space-y-3">
                        <Label className="text-lg font-semibold">1. Selecione as Características</Label>
                        <p className="text-sm text-muted-foreground">Marque as características que deseja aplicar aos ativos escaneados.</p>
                        {isLoadingTemplates ? (
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-2/3" />
                            </div>
                        ) : (
                            <ScrollArea className="h-40 rounded-md border p-3">
                                <div className="space-y-2">
                                {templates.map((template) => (
                                    <div key={template.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`tpl-${template.id}`}
                                            checked={selectedTemplates.some(t => t.id === template.id)}
                                            onCheckedChange={() => handleTemplateSelection(template)}
                                        />
                                        <label
                                            htmlFor={`tpl-${template.id}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {template.key} <span className="text-xs text-muted-foreground">({template.valueType})</span>
                                        </label>
                                    </div>
                                ))}
                                </div>
                             </ScrollArea>
                        )}
                    </div>

                    {/* 2. Define Values (if templates selected) */}
                    {selectedTemplates.length > 0 && (
                        <div className="space-y-3">
                            <Label className="text-lg font-semibold">2. Defina os Valores</Label>
                            <p className="text-sm text-muted-foreground">Preencha os valores que serão aplicados para as características selecionadas. Estes valores serão usados para *todos* os ativos escaneados nesta sessão.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedTemplates.map((template) => (
                                    <div key={`val-${template.id}`} className="space-y-1">
                                        <Label htmlFor={`val-input-${template.id}`}>{template.key}</Label>
                                        {template.valueType === 'text' && (
                                            <Input id={`val-input-${template.id}`} value={characteristicValues[template.id] || ''} onChange={(e) => handleValueChange(template.id, e.target.value)} />
                                        )}
                                        {template.valueType === 'number' && (
                                            <Input type="number" id={`val-input-${template.id}`} value={characteristicValues[template.id] || ''} onChange={(e) => handleValueChange(template.id, e.target.value)} />
                                        )}
                                        {template.valueType === 'boolean' && (
                                            <div className="flex items-center space-x-2 pt-2">
                                            <Switch
                                                id={`val-input-${template.id}`}
                                                checked={characteristicValues[template.id] ?? template.defaultValue ?? false}
                                                onCheckedChange={(checked) => handleValueChange(template.id, checked)}
                                            />
                                             <Label htmlFor={`val-input-${template.id}`}>{characteristicValues[template.id] ? 'Sim' : 'Não'}</Label>
                                             </div>
                                        )}
                                         {template.valueType === 'date' && (
                                             <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                        <CalendarDays className="mr-2 h-4 w-4" />
                                                         {characteristicValues[template.id] ? format(new Date(characteristicValues[template.id]), 'PPP', { locale: ptBR }) : <span>Selecione data</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={characteristicValues[template.id] ? new Date(characteristicValues[template.id]) : undefined}
                                                        onSelect={(date) => handleValueChange(template.id, date)} // Pass Date object directly
                                                        initialFocus
                                                        locale={ptBR}/>
                                                </PopoverContent>
                                            </Popover>
                                        )}
                                        {template.valueType === 'predefined' && template.predefinedValues && (
                                            <Select value={characteristicValues[template.id] || ''} onValueChange={(value) => handleValueChange(template.id, value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={`Selecione ${template.key}`} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {template.predefinedValues.map((val) => (
                                                        <SelectItem key={val} value={val}>{val}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 3. Start Scanning */}
                    <div className="space-y-3">
                         <Label className="text-lg font-semibold">3. Escanear Ativos</Label>
                         <p className="text-sm text-muted-foreground">Clique em "Iniciar" para ativar a câmera e começar a escanear os QR Codes dos ativos. As características e valores definidos acima serão aplicados.</p>
                         <div className="flex gap-4 items-center">
                             <Button
                                size="lg"
                                onClick={isScanning ? stopScanSession : startScanSession}
                                disabled={isLoadingTemplates || selectedTemplates.length === 0}
                                className={isScanning ? 'bg-destructive hover:bg-destructive/90' : ''}
                             >
                                {isScanning ? (
                                    <>
                                        <XCircle className="mr-2 h-5 w-5" /> Parar Sessão
                                    </>
                                ) : (
                                    <>
                                        <ScanLine className="mr-2 h-5 w-5" /> Iniciar Sessão de Scan
                                    </>
                                )}
                             </Button>
                             {isScanning && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
                         </div>
                    </div>

                     {/* Camera Feed Area */}
                     {isScanning && (
                        <Card className="mt-4 border-primary border-2">
                             <CardHeader className="pb-2">
                                 <CardTitle className="text-lg flex items-center gap-2">
                                    <ScanLine className="h-5 w-5 text-primary"/> Câmera Ativa
                                 </CardTitle>
                             </CardHeader>
                            <CardContent>
                                {/* Always render video tag, but hide if no permission */}
                                <video ref={videoRef} className={`w-full aspect-video rounded-md bg-muted ${hasCameraPermission === false ? 'hidden' : ''}`} autoPlay muted playsInline />

                                {hasCameraPermission === null && (
                                     <div className="flex items-center justify-center h-40">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                        <p className="ml-2 text-muted-foreground">Aguardando permissão da câmera...</p>
                                    </div>
                                )}
                                {hasCameraPermission === false && (
                                    <Alert variant="destructive">
                                        <AlertTitle>Acesso à Câmera Negado</AlertTitle>
                                        <AlertDescription>
                                            Por favor, habilite a permissão da câmera nas configurações do seu navegador para usar o scanner.
                                        </AlertDescription>
                                    </Alert>
                                )}
                                  {/* MOCK SCAN BUTTONS - REMOVE IN PRODUCTION */}
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Button size="sm" variant="outline" onClick={() => simulateScan('TI-NB-001')}>Scan Notebook</Button>
                                    <Button size="sm" variant="outline" onClick={() => simulateScan('MOB-CAD-012')}>Scan Cadeira</Button>
                                    <Button size="sm" variant="outline" onClick={() => simulateScan('INVALID-TAG')}>Scan Inválido</Button>
                                    <Button size="sm" variant="outline" onClick={() => simulateScan('ALM-PAL-001')}>Scan Paleteira</Button>
                                </div>
                                {/* END MOCK SCAN BUTTONS */}
                            </CardContent>
                        </Card>
                    )}


                </CardContent>
            </Card>


             {/* Scanned Assets List */}
            {scannedAssets.length > 0 && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Resultados do Escaneamento</CardTitle>
                        <CardDescription>Lista de ativos escaneados nesta sessão.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-60">
                        <div className="space-y-3">
                             {scannedAssets.map((asset, index) => (
                                 <div key={`${asset.tag}-${index}`} className="flex items-center justify-between p-3 border rounded-md">
                                    <div className="flex items-center gap-3">
                                         {asset.status === 'pending' && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
                                         {asset.status === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
                                         {asset.status === 'error' && <XCircle className="h-5 w-5 text-destructive" />}
                                        <div>
                                            <p className="font-medium">{asset.name}</p>
                                            <p className="text-sm text-muted-foreground">{asset.tag}</p>
                                            {asset.status === 'error' && asset.message && <p className="text-xs text-destructive">{asset.message}</p>}
                                        </div>
                                    </div>
                                    {/* Optional: Show applied values */}
                                     <div className="text-xs text-muted-foreground max-w-xs truncate">
                                        {asset.appliedCharacteristics?.map(c => `${c.key}: ${c.value}`).join(', ')}
                                    </div>
                                </div>
                            ))}
                        </div>
                        </ScrollArea>
                    </CardContent>
                 </Card>
            )}


        </div>
    );
}


    