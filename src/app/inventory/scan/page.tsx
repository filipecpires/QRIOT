
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Loader2, ScanLine, ScanSearch, CheckSquare, XSquare, ListChecks } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface ScannedAssetInfo {
    tag: string;
    name: string; // Fetched after scan
    status: 'pending' | 'success' | 'error' | 'duplicate';
    message?: string;
    timestamp: Date;
}

// Mock fetch functions
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

// Mock function to mark asset as inventoried
async function markAssetAsInventoried(tag: string, inventoryYear: number): Promise<{ success: boolean; message?: string }> {
    console.log(`Marking asset ${tag} as inventoried for year ${inventoryYear}`);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call

    // Replace with actual API call:
    // 1. Find asset by tag in Firestore.
    // 2. Check if characteristic "Inventário [Year]" already exists. If so, maybe update timestamp? Or just confirm.
    // 3. If not, add/update characteristic "Inventário [Year]" with the current date as the value.
    // 4. Set isPublic to false (or based on settings).
    // 5. Set isActive to true.

    const shouldFail = Math.random() < 0.05; // Simulate occasional failure
    if (shouldFail) {
        return { success: false, message: 'Falha simulada ao salvar.' };
    }
    return { success: true };
}


export default function InventoryScanPage() {
    const { toast } = useToast();
    const [scannedAssets, setScannedAssets] = useState<ScannedAssetInfo[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [isLoadingAsset, setIsLoadingAsset] = useState(false); // Loading state for individual asset processing
    const [showCameraFeed, setShowCameraFeed] = useState(false); // Control camera display
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    // QR Scanner library state would go here
    const scannedTagsThisSession = useRef<Set<string>>(new Set()); // Track tags scanned in this session to avoid duplicates
    const lastScannedTag = useRef<string | null>(null);
    const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const currentInventoryYear = new Date().getFullYear();

    // Camera Permission Effect
     useEffect(() => {
        const getCameraPermission = async () => {
            if (!showCameraFeed) {
                if (videoRef.current?.srcObject) {
                    const stream = videoRef.current.srcObject as MediaStream;
                    stream.getTracks().forEach(track => track.stop());
                    videoRef.current.srcObject = null;
                }
                setHasCameraPermission(null);
                return;
            }

            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
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
                setShowCameraFeed(false);
            }
        };

        getCameraPermission();

        return () => {
            if (videoRef.current?.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [showCameraFeed, toast]);


    const startScanSession = () => {
        setScannedAssets([]); // Clear previous session results
        scannedTagsThisSession.current.clear(); // Clear tracked tags
        lastScannedTag.current = null; // Reset last scanned tag
        if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current); // Clear any pending timeout
        setIsScanning(true);
        setShowCameraFeed(true); // Show camera when scanning starts
        // Initialize QR Scanner library here
        console.log("Starting inventory scan session for year:", currentInventoryYear);
         // TODO: Add QR scanner initialization logic
    };

    const stopScanSession = () => {
        setIsScanning(false);
        setShowCameraFeed(false); // Hide camera when scanning stops
        // Deinitialize QR Scanner library here
        console.log("Stopping inventory scan session");
         // TODO: Add QR scanner deinitialization logic

        // Generate report or summary (optional)
        const successCount = scannedAssets.filter(a => a.status === 'success').length;
        const duplicateCount = scannedAssets.filter(a => a.status === 'duplicate').length;
        const errorCount = scannedAssets.filter(a => a.status === 'error').length;
        toast({
            title: "Sessão de Inventário Finalizada",
            description: `${successCount} ativos marcados. ${duplicateCount} duplicados. ${errorCount} erros.`,
            duration: 5000,
        });
    };

    // --- MOCK QR CODE SCANNING ---
    // Replace this with your actual QR code scanning library integration
    const simulateScan = (tag: string) => {
        if (!isScanning) return;
        console.log("Simulating inventory scan:", tag);
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


        // Check if already scanned in this session
        if (scannedTagsThisSession.current.has(tag)) {
             // Find the existing entry to show the name correctly
             const existingAsset = scannedAssets.find(a => a.tag === tag);
             const nameToShow = existingAsset ? existingAsset.name : tag;
             setScannedAssets(prev => [{ tag, name: nameToShow, status: 'duplicate', message: 'Já escaneado nesta sessão', timestamp: new Date() }, ...prev]);
             toast({ title: 'Ativo Duplicado', description: `O ativo ${tag} já foi escaneado nesta sessão.` });
              // Play a distinct sound/vibration for duplicates
             return;
        }

        setIsLoadingAsset(true); // Indicate loading for this specific asset

        const assetName = await fetchAssetNameByTag(tag);

        if (!assetName) {
            setScannedAssets(prev => [{ tag, name: 'Desconhecido', status: 'error', message: 'Ativo não encontrado no sistema', timestamp: new Date() }, ...prev]);
             // Play error sound
            setIsLoadingAsset(false);
            return;
        }

        // Add to UI optimistically with pending status
        const newAssetInfo: ScannedAssetInfo = { tag, name: assetName, status: 'pending', timestamp: new Date() };
        setScannedAssets(prev => [newAssetInfo, ...prev]); // Add to top
        scannedTagsThisSession.current.add(tag); // Track as scanned

        // Attempt to mark as inventoried
        try {
            const result = await markAssetAsInventoried(tag, currentInventoryYear);
            setScannedAssets(prev => prev.map(asset =>
                asset.tag === tag
                    ? { ...asset, status: result.success ? 'success' : 'error', message: result.message }
                    : asset
            ));
            if (result.success) {
                // Play success sound
            } else {
                scannedTagsThisSession.current.delete(tag); // Allow rescanning on error
                 // Play error sound
            }
        } catch (error) {
            console.error("Error marking asset as inventoried:", error);
            setScannedAssets(prev => prev.map(asset =>
                asset.tag === tag
                    ? { ...asset, status: 'error', message: 'Erro inesperado ao salvar.' }
                    : asset
            ));
             scannedTagsThisSession.current.delete(tag); // Allow rescanning on error
             // Play error sound
        } finally {
            setIsLoadingAsset(false);
        }

    }, [isScanning, isLoadingAsset, currentInventoryYear, scannedAssets]); // Dependencies


    const successCount = scannedAssets.filter(a => a.status === 'success').length;
    const duplicateCount = scannedAssets.filter(a => a.status === 'duplicate').length;
    const errorCount = scannedAssets.filter(a => a.status === 'error').length;
    const totalScanned = scannedAssets.length; // Includes pending

    return (
        <div className="container mx-auto py-10 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ScanSearch className="h-6 w-6"/> Inventário Contínuo via Scan</CardTitle>
                    <CardDescription>
                        Ative a câmera e escaneie os QR Codes dos ativos sequencialmente para marcá-los como inventariados em {currentInventoryYear}.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <Button
                            size="lg"
                            onClick={isScanning ? stopScanSession : startScanSession}
                            className={isScanning ? 'bg-destructive hover:bg-destructive/90 w-full sm:w-auto' : 'w-full sm:w-auto'}
                        >
                            {isScanning ? (
                                <>
                                    <XSquare className="mr-2 h-5 w-5" /> Parar Inventário
                                </>
                            ) : (
                                <>
                                    <CheckSquare className="mr-2 h-5 w-5" /> Iniciar Inventário ({currentInventoryYear})
                                </>
                            )}
                        </Button>
                        {isScanning && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
                         <div className="flex-grow text-center sm:text-right space-x-4">
                            <Badge variant="success" className="bg-green-100 text-green-800">{successCount} Sucesso</Badge>
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{duplicateCount} Duplicados</Badge>
                            <Badge variant="destructive">{errorCount} Erros</Badge>
                        </div>
                    </div>

                    {/* Camera Feed Area */}
                    {isScanning && (
                        <Card className="mt-4 border-primary border-2">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <ScanLine className="h-5 w-5 text-primary"/> Câmera Ativa - Escaneie os QR Codes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
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
                                    <Button size="sm" variant="outline" onClick={() => simulateScan('TI-NB-001')}>Scan Notebook (Dup)</Button>
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
                        <CardTitle className="flex items-center gap-2"><ListChecks /> Resultados do Inventário</CardTitle>
                        <CardDescription>Ativos escaneados nesta sessão.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Progress value={(successCount / (totalScanned - duplicateCount - errorCount) * 100) || 0} className="mb-4 h-2" />
                         <ScrollArea className="h-72">
                            <div className="space-y-2 pr-3">
                                {scannedAssets.map((asset, index) => (
                                    <div key={`${asset.tag}-${index}`} className="flex items-center justify-between p-2 border rounded-md gap-2">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            {asset.status === 'pending' && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground flex-shrink-0" />}
                                            {asset.status === 'success' && <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />}
                                            {asset.status === 'duplicate' && <CheckCircle className="h-4 w-4 text-yellow-600 flex-shrink-0" />}
                                            {asset.status === 'error' && <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate" title={asset.name}>{asset.name}</p>
                                                <p className="text-xs text-muted-foreground">{asset.tag}</p>
                                                {asset.message && <p className={`text-xs ${asset.status === 'error' ? 'text-destructive' : 'text-yellow-700'}`}>{asset.message}</p>}
                                            </div>
                                        </div>
                                        <span className="text-xs text-muted-foreground flex-shrink-0">{format(asset.timestamp, "HH:mm:ss")}</span>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        <div className="mt-4 flex justify-end">
                             {/* TODO: Add button to generate report */}
                             <Button variant="outline" disabled>Gerar Relatório (PDF)</Button>
                         </div>
                    </CardContent>
                 </Card>
             )}

        </div>
    );
}
