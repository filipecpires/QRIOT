
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Loader2, ListPlus, ScanLine, Info, Tag, Edit, CalendarDays, Plus, Trash2, Settings } from 'lucide-react'; 
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'; 
import { cn } from '@/lib/utils'; 

interface AppliedCharacteristic {
    key: string;
    value: any;
}

interface NewCharacteristicCategory {
    id: string; 
    key: string; 
    defaultValue?: string | number | boolean | Date; 
    valueType: 'text' | 'number' | 'boolean' | 'date'; 
}

interface CharacteristicTemplate {
    id: string;
    key: string; 
    valueType: 'text' | 'number' | 'boolean' | 'date' | 'predefined'; 
    predefinedValues?: string[]; 
    defaultValue?: string | number | boolean | Date; 
}

interface ScannedAssetInfo {
    tag: string;
    name: string; 
    status: 'pending' | 'success' | 'error';
    message?: string;
    appliedCharacteristics?: AppliedCharacteristic[]; 
}

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
        'AB12C': 'Notebook Dell Latitude 7400',
        'DE34F': 'Monitor LG 27"',
        'GH56I': 'Cadeira de Escritório',
        'JK78L': 'Projetor Epson PowerLite',
        'MN90P': 'Teclado Mecânico Gamer',
        'QR12S': 'Mouse Sem Fio Ergonômico',
        'TU34V': 'Impressora Multifuncional',
    };
    return mockAssets[tag] || null;
}

async function applyCharacteristicsToAsset(tag: string, characteristics: AppliedCharacteristic[]): Promise<{ success: boolean; message?: string }> {
    console.log(`Applying characteristics to ${tag}:`, characteristics);
    await new Promise(resolve => setTimeout(resolve, 600)); 

    const shouldFail = Math.random() < 0.1; 
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
    const [newCategories, setNewCategories] = useState<NewCharacteristicCategory[]>([]); 
    const [scannedAssets, setScannedAssets] = useState<ScannedAssetInfo[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
    const [isLoadingAsset, setIsLoadingAsset] = useState(false);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null); 
    const [showConfirmationModal, setShowConfirmationModal] = useState(false); 
    const [lastScannedDataForModal, setLastScannedDataForModal] = useState<{tag: string, name: string, characteristics: AppliedCharacteristic[]} | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
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

    useEffect(() => {
        let stream: MediaStream | null = null;

        const getCameraPermission = async () => {
            console.log("Attempting to get camera permission...");
            setHasCameraPermission(null); 
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); 
                console.log("Camera permission granted.");
                setHasCameraPermission(true);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => { // Ensure metadata is loaded before playing
                        videoRef.current?.play().catch(playErr => console.error("Video play error:", playErr));
                    }
                } else {
                    console.warn("videoRef not available when stream was ready.");
                }
            } catch (error) {
                console.error('Error accessing camera:', error);
                setHasCameraPermission(false);
                 if (isScanning) { // Only show toast if user actually tried to scan
                    toast({
                        variant: 'destructive',
                        title: 'Acesso à Câmera Negado',
                        description: 'Permita o acesso à câmera nas configurações do navegador para escanear.',
                        duration: 5000,
                    });
                }
                setIsScanning(false); 
            }
        };

        if (isScanning) {
            getCameraPermission();
        } else {
            if (videoRef.current?.srcObject) {
                const currentStream = videoRef.current.srcObject as MediaStream;
                currentStream.getTracks().forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
            setHasCameraPermission(null); 
        }
        return () => {
            console.log("Cleaning up camera effect for CharacteristicScanPage");
            if (videoRef.current?.srcObject) {
                const currentStream = videoRef.current.srcObject as MediaStream;
                currentStream.getTracks().forEach(track => track.stop());
                 videoRef.current.srcObject = null;
            }
        };
    }, [isScanning, toast]); 


    const handleTemplateSelection = (template: CharacteristicTemplate) => {
        setSelectedTemplates(prev =>
            prev.some(t => t.id === template.id)
                ? prev.filter(t => t.id !== template.id)
                : [...prev, template]
        );
        if (!characteristicValues[template.id] && template.defaultValue !== undefined) {
             handleValueChange(template.id, template.defaultValue);
        }
    };

    const handleValueChange = (templateId: string, value: any) => {
        const processedValue = value instanceof Date ? value.toISOString() : value;
        setCharacteristicValues(prev => ({ ...prev, [templateId]: processedValue }));
    };

    const addNewCategory = () => {
        setNewCategories(prev => [
            ...prev,
            { id: `new-${Date.now()}`, key: '', valueType: 'text', defaultValue: '' }
        ]);
    };

    const removeNewCategory = (id: string) => {
        setNewCategories(prev => prev.filter(cat => cat.id !== id));
    };

    const handleNewCategoryChange = (id: string, field: keyof Omit<NewCharacteristicCategory, 'id'>, value: any) => {
        setNewCategories(prev => prev.map(cat =>
            cat.id === id ? { ...cat, [field]: value } : cat
        ));
    };

    const startScanSession = () => {
        if (selectedTemplates.length === 0 && newCategories.length === 0) {
            toast({ title: 'Atenção', description: 'Selecione ou adicione pelo menos uma característica para aplicar.', variant: 'destructive' });
            return;
        }
        if (newCategories.some(cat => !cat.key.trim())) {
             toast({ title: 'Atenção', description: 'Todas as novas características adicionadas devem ter um nome.', variant: 'destructive' });
             return;
        }
        setScannedAssets([]); 
        setIsScanning(true);
        console.log("Starting scan session with existing characteristics:", selectedTemplates.map(t => ({ key: t.key, value: characteristicValues[t.id] })));
        console.log("Starting scan session with NEW characteristics:", newCategories);
    };

    const stopScanSession = () => {
        setIsScanning(false);
        lastScannedTag.current = null; 
        if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current); 
        console.log("Stopping scan session");
    };

    const handleQrCodeResult = useCallback(async (tag: string) => {
        if (!isScanning || isLoadingAsset) return;

        if (tag === lastScannedTag.current) {
            console.log("Debounced repeated scan:", tag);
            return;
        }
        lastScannedTag.current = tag;
        if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
        scanTimeoutRef.current = setTimeout(() => { lastScannedTag.current = null; }, 1500); 


        setIsLoadingAsset(true); 

        const existingAssetIndex = scannedAssets.findIndex(a => a.tag === tag);
        if (existingAssetIndex !== -1) {
             toast({ title: 'Ativo Já Escaneado', description: `O ativo ${tag} já está na lista.`, variant: 'default' });
             setIsLoadingAsset(false);
             return; 
        }


        const assetName = await fetchAssetNameByTag(tag);
        if (!assetName) {
            setScannedAssets(prev => [{ tag, name: 'Desconhecido', status: 'error', message: 'Ativo não encontrado' }, ...prev]);
            setIsLoadingAsset(false);
            return;
        }

        const characteristicsFromTemplates = selectedTemplates.map(template => ({
            key: template.key,
            value: characteristicValues[template.id] ?? template.defaultValue ?? (template.valueType === 'boolean' ? false : ''),
        }));

        const characteristicsFromNew = newCategories.map(cat => ({
            key: cat.key,
            value: cat.defaultValue ?? (cat.valueType === 'boolean' ? false : ''), 
        }));

        const allCharacteristicsToApply = [...characteristicsFromTemplates, ...characteristicsFromNew];

        setLastScannedDataForModal({ tag, name: assetName, characteristics: allCharacteristicsToApply });
        setShowConfirmationModal(true);
        setIsLoadingAsset(false); 


    }, [isScanning, isLoadingAsset, scannedAssets, selectedTemplates, characteristicValues, newCategories, toast]); 


    const confirmApplyCharacteristics = async () => {
        if (!lastScannedDataForModal) return;

        const { tag, name, characteristics } = lastScannedDataForModal;
        setShowConfirmationModal(false); 
        setIsLoadingAsset(true); 

         const newAssetInfo: ScannedAssetInfo = { tag, name, status: 'pending', appliedCharacteristics: characteristics };
         setScannedAssets(prev => [newAssetInfo, ...prev]); 

        try {
            const result = await applyCharacteristicsToAsset(tag, characteristics);
            setScannedAssets(prev => prev.map(asset =>
                asset.tag === tag
                    ? { ...asset, status: result.success ? 'success' : 'error', message: result.message }
                    : asset
            ));
            if (result.success) {
                 toast({title: "Sucesso", description: `Características aplicadas a ${tag}.`, variant: "default"});
            } else {
                toast({title: "Erro", description: `Falha ao aplicar características a ${tag}: ${result.message}`, variant: "destructive"});
            }
        } catch (error) {
            console.error("Error applying characteristics:", error);
            toast({title: "Erro Inesperado", description: `Ocorreu um erro ao salvar para ${tag}.`, variant: "destructive"});
            setScannedAssets(prev => prev.map(asset =>
                asset.tag === tag
                    ? { ...asset, status: 'error', message: 'Erro inesperado ao salvar.' }
                    : asset
            ));
        } finally {
            setIsLoadingAsset(false);
            setLastScannedDataForModal(null); 
        }
     };

     const cancelApplyCharacteristics = () => {
        setShowConfirmationModal(false);
        setLastScannedDataForModal(null);
        toast({ title: "Cancelado", description: `Aplicação de características para ${lastScannedDataForModal?.tag} cancelada.`, variant: "default"});
         lastScannedTag.current = null; 
        if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
    };

    return (
        <div className="space-y-6"> 
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Tag className="h-6 w-6"/> Registrar Características via Scan</CardTitle>
                    <CardDescription>Selecione características existentes ou adicione novas, defina valores e escaneie QR Codes para aplicá-las em massa.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <Label className="text-lg font-semibold">1. Configure as Características</Label>
                         <p className="text-sm text-muted-foreground">Selecione características existentes da lista ou adicione novas categorias que serão aplicadas aos ativos escaneados.</p>

                         <div className="space-y-2 border p-4 rounded-md">
                            <Label className="font-medium">Características Existentes</Label>
                            {isLoadingTemplates ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-8 w-full" />
                                    <Skeleton className="h-8 w-2/3" />
                                </div>
                            ) : (
                                <ScrollArea className="h-32">
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

                         <div className="space-y-3 border p-4 rounded-md">
                             <Label className="font-medium">Adicionar Novas Características</Label>
                             {newCategories.map((cat) => (
                                 <div key={cat.id} className="flex flex-col sm:flex-row sm:items-end gap-2 p-2 border rounded bg-muted/30">
                                    <div className="flex-1 space-y-1 w-full sm:w-auto">
                                         <Label htmlFor={`new-cat-key-${cat.id}`} className="text-xs">Nome da Característica</Label>
                                         <Input
                                             id={`new-cat-key-${cat.id}`}
                                             placeholder="Ex: Número Patrimônio Antigo"
                                             value={cat.key}
                                             onChange={(e) => handleNewCategoryChange(cat.id, 'key', e.target.value)}
                                          />
                                    </div>
                                     <div className="w-full sm:w-32 space-y-1">
                                         <Label htmlFor={`new-cat-valtype-${cat.id}`} className="text-xs">Tipo Valor</Label>
                                         <Select
                                             value={cat.valueType}
                                             onValueChange={(v: 'text' | 'number' | 'boolean' | 'date') => handleNewCategoryChange(cat.id, 'valueType', v)}
                                         >
                                            <SelectTrigger id={`new-cat-valtype-${cat.id}`}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="text">Texto</SelectItem>
                                                <SelectItem value="number">Número</SelectItem>
                                                <SelectItem value="boolean">Sim/Não</SelectItem>
                                                <SelectItem value="date">Data</SelectItem>
                                            </SelectContent>
                                         </Select>
                                     </div>
                                     <div className="flex-1 space-y-1 w-full sm:w-auto">
                                         <Label htmlFor={`new-cat-default-${cat.id}`} className="text-xs">Valor Padrão (Opcional)</Label>
                                          {cat.valueType === 'boolean' ? (
                                             <Switch
                                                 id={`new-cat-default-${cat.id}`}
                                                 checked={!!cat.defaultValue}
                                                 onCheckedChange={(checked) => handleNewCategoryChange(cat.id, 'defaultValue', checked)}
                                              />
                                         ) : cat.valueType === 'date' ? (
                                             <Popover>
                                                 <PopoverTrigger asChild>
                                                    <Button variant="outline" size="sm" className="w-full justify-start text-left font-normal">
                                                        <CalendarDays className="mr-2 h-4 w-4"/>
                                                        {cat.defaultValue instanceof Date ? format(cat.defaultValue, 'P', { locale: ptBR }) : <span>Selecione</span>}
                                                    </Button>
                                                 </PopoverTrigger>
                                                 <PopoverContent className="w-auto p-0">
                                                     <Calendar mode="single" selected={cat.defaultValue as Date | undefined} onSelect={(d) => handleNewCategoryChange(cat.id, 'defaultValue', d)} locale={ptBR} />
                                                 </PopoverContent>
                                             </Popover>
                                         ) : (
                                             <Input
                                                 id={`new-cat-default-${cat.id}`}
                                                 type={cat.valueType === 'number' ? 'number' : 'text'}
                                                 placeholder="Valor inicial"
                                                 value={cat.defaultValue as string | number || ''}
                                                 onChange={(e) => handleNewCategoryChange(cat.id, 'defaultValue', e.target.value)}
                                              />
                                         )}
                                     </div>
                                     <Button variant="ghost" size="icon" onClick={() => removeNewCategory(cat.id)} title="Remover Nova Característica" className="mt-auto sm:mt-0 flex-shrink-0">
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                     </Button>
                                </div>
                             ))}
                             <Button type="button" variant="outline" size="sm" onClick={addNewCategory}>
                                <Plus className="mr-2 h-4 w-4"/> Adicionar Nova
                            </Button>
                         </div>
                    </div>

                    {selectedTemplates.length > 0 && (
                        <div className="space-y-3 border p-4 rounded-md">
                            <Label className="text-lg font-semibold">2. Defina os Valores (para Características Existentes Selecionadas)</Label>
                            <p className="text-sm text-muted-foreground">Preencha os valores que serão aplicados para as características selecionadas da lista acima. Estes valores serão usados para *todos* os ativos escaneados nesta sessão.</p>
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
                                                        onSelect={(date) => handleValueChange(template.id, date)} 
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

                    <div className="space-y-3">
                         <Label className="text-lg font-semibold">3. Escanear Ativos</Label>
                         <p className="text-sm text-muted-foreground">Clique em "Iniciar" para ativar a câmera e começar a escanear os QR Codes dos ativos. As características configuradas serão aplicadas após confirmação.</p>
                         <div className="flex flex-col sm:flex-row gap-4 items-center">
                             <Button
                                size="lg"
                                onClick={isScanning ? stopScanSession : startScanSession}
                                disabled={isLoadingTemplates || (selectedTemplates.length === 0 && newCategories.length === 0)}
                                className={cn(isScanning && 'bg-destructive hover:bg-destructive/90', 'w-full sm:w-auto')}
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
                             {isScanning && !isLoadingAsset && hasCameraPermission && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
                             {isLoadingAsset && <span className="text-sm text-muted-foreground">Processando...</span>}
                         </div>
                    </div>

                    <div className={cn(!isScanning && 'hidden')}> 
                        <Card className="mt-4 border-primary border-2">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <ScanLine className="h-5 w-5 text-primary"/> Câmera Ativa
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex justify-center">
                                <video
                                    ref={videoRef}
                                    className={cn(
                                        "w-full max-w-md aspect-square rounded-md bg-muted object-cover", // aspect-square and object-cover for 1:1 crop
                                        hasCameraPermission === false && "hidden", 
                                        hasCameraPermission === null && "hidden" 
                                     )}
                                    autoPlay
                                    muted
                                    playsInline 
                                />

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
                                            Por favor, habilite a permissão da câmera nas configurações do seu navegador para usar o scanner. A página pode precisar ser recarregada.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>

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

             <Dialog open={showConfirmationModal} onOpenChange={(open) => !open && cancelApplyCharacteristics()}>
                <DialogContent>
                    <DialogHeader>
                    <DialogTitle>Confirmar Aplicação de Características</DialogTitle>
                    <DialogDescription>
                        Aplicar as seguintes características ao ativo: <span className="font-semibold">{lastScannedDataForModal?.name} ({lastScannedDataForModal?.tag})</span>?
                    </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-60 mt-4 border rounded-md p-3">
                        <ul className="space-y-1 text-sm">
                        {lastScannedDataForModal?.characteristics.map((char, i) => (
                            <li key={i}>
                                <span className="font-medium">{char.key}:</span>{' '}
                                <span className="text-muted-foreground">{String(char.value)}</span>
                            </li>
                         ))}
                        </ul>
                    </ScrollArea>
                    <DialogFooter>
                    <Button variant="outline" onClick={cancelApplyCharacteristics}>Cancelar</Button>
                    <Button onClick={confirmApplyCharacteristics} disabled={isLoadingAsset}>
                         {isLoadingAsset ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                         Confirmar e Aplicar
                    </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

    
