
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
import { format } from 'date-fns';
import { cn } from '@/lib/utils'; 
import jsQR from 'jsqr';

interface ScannedAssetInfo {
    tag: string;
    name: string; 
    status: 'pending' | 'success' | 'error' | 'duplicate';
    message?: string;
    timestamp: Date;
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

async function markAssetAsInventoried(tag: string, inventoryYear: number): Promise<{ success: boolean; message?: string }> {
    console.log(`Marking asset ${tag} as inventoried for year ${inventoryYear}`);
    await new Promise(resolve => setTimeout(resolve, 500)); 
    const shouldFail = Math.random() < 0.05; 
    if (shouldFail) {
        return { success: false, message: 'Falha simulada ao salvar.' };
    }
    return { success: true };
}


export default function InventoryScanPage() {
    const { toast } = useToast();
    const [scannedAssets, setScannedAssets] = useState<ScannedAssetInfo[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [isLoadingAsset, setIsLoadingAsset] = useState(false); 
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null); 
    const videoRef = useRef<HTMLVideoElement>(null);
    const scannedTagsThisSession = useRef<Set<string>>(new Set()); 
    const lastScannedTag = useRef<string | null>(null);
    const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const currentInventoryYear = new Date().getFullYear();

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
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current?.play().catch(playErr => console.error("Video play error:", playErr));
                    }
                } else {
                    console.warn("videoRef not available when stream was ready.");
                }
            } catch (error) {
                console.error('Error accessing camera:', error);
                setHasCameraPermission(false);
                if (isScanning) { 
                    toast({
                        variant: 'destructive',
                        title: 'Acesso à Câmera Negado',
                        description: 'Permita o acesso à câmera nas configurações do seu navegador para escanear.',
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
            console.log("Cleaning up camera effect for InventoryScanPage");
            if (videoRef.current?.srcObject) {
                const currentStream = videoRef.current.srcObject as MediaStream;
                currentStream.getTracks().forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
        };
    }, [isScanning, toast]); 


    const startScanSession = () => {
        setScannedAssets([]); 
        scannedTagsThisSession.current.clear(); 
        lastScannedTag.current = null; 
        if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current); 
        setIsScanning(true);
        console.log("Starting inventory scan session for year:", currentInventoryYear);
    };

    const stopScanSession = () => {
        setIsScanning(false);
        console.log("Stopping inventory scan session");

        const successCount = scannedAssets.filter(a => a.status === 'success').length;
        const duplicateCount = scannedAssets.filter(a => a.status === 'duplicate').length;
        const errorCount = scannedAssets.filter(a => a.status === 'error').length;
        toast({
            title: "Sessão de Inventário Finalizada",
            description: `${successCount} ativos marcados. ${duplicateCount} duplicados. ${errorCount} erros.`,
            duration: 5000,
        });
    };


    const handleQrCodeResult = useCallback(async (tag: string) => {
        if (!isScanning || isLoadingAsset) return;

        if (tag === lastScannedTag.current) {
            console.log("Debounced repeated scan:", tag);
            return;
        }
        lastScannedTag.current = tag;
        if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
        scanTimeoutRef.current = setTimeout(() => { lastScannedTag.current = null; }, 2500); // Increased debounce time


        if (scannedTagsThisSession.current.has(tag)) {
             const existingAsset = scannedAssets.find(a => a.tag === tag);
             const nameToShow = existingAsset ? existingAsset.name : tag;
             setScannedAssets(prev => [{ tag, name: nameToShow, status: 'duplicate', message: 'Já escaneado nesta sessão', timestamp: new Date() }, ...prev]);
             toast({ title: 'Ativo Duplicado', description: `O ativo ${tag} já foi escaneado nesta sessão.` });
             return;
        }

        setIsLoadingAsset(true); 

        const assetName = await fetchAssetNameByTag(tag);

        if (!assetName) {
            setScannedAssets(prev => [{ tag, name: 'Desconhecido', status: 'error', message: 'Ativo não encontrado no sistema', timestamp: new Date() }, ...prev]);
            setIsLoadingAsset(false);
            return;
        }

        const newAssetInfo: ScannedAssetInfo = { tag, name: assetName, status: 'pending', timestamp: new Date() };
        setScannedAssets(prev => [newAssetInfo, ...prev]); 
        scannedTagsThisSession.current.add(tag); 

        try {
            const result = await markAssetAsInventoried(tag, currentInventoryYear);
            setScannedAssets(prev => prev.map(asset =>
                asset.tag === tag
                    ? { ...asset, status: result.success ? 'success' : 'error', message: result.message }
                    : asset
            ));
            if (!result.success) {
                scannedTagsThisSession.current.delete(tag); 
            }
        } catch (error) {
            console.error("Error marking asset as inventoried:", error);
            setScannedAssets(prev => prev.map(asset =>
                asset.tag === tag
                    ? { ...asset, status: 'error', message: 'Erro inesperado ao salvar.' }
                    : asset
            ));
             scannedTagsThisSession.current.delete(tag); 
        } finally {
            setIsLoadingAsset(false);
        }

    }, [isScanning, isLoadingAsset, currentInventoryYear, scannedAssets, toast]); 

     // QR Scanning useEffect
    useEffect(() => {
        let animationFrameId: number;
        const videoElement = videoRef.current;
        const canvasElement = document.createElement('canvas');

        if (isScanning && hasCameraPermission && videoElement && videoElement.readyState >= videoElement.HAVE_ENOUGH_DATA) {
            const ctx = canvasElement.getContext('2d', { willReadFrequently: true });
            console.log("[InventoryScan] Starting QR scan loop...");

            const scanLoop = () => {
                if (!isScanning || !ctx || !videoElement || videoElement.paused || videoElement.ended) {
                    console.log("[InventoryScan] Stopping QR scan loop condition met.");
                    if (animationFrameId) cancelAnimationFrame(animationFrameId);
                    return;
                }

                if (videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
                    animationFrameId = requestAnimationFrame(scanLoop); // Wait for video dimensions
                    return;
                }

                if (canvasElement.width !== videoElement.videoWidth) canvasElement.width = videoElement.videoWidth;
                if (canvasElement.height !== videoElement.videoHeight) canvasElement.height = videoElement.videoHeight;
                
                ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
                try {
                    const imageData = ctx.getImageData(0, 0, canvasElement.width, canvasElement.height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height, {
                        inversionAttempts: "dontInvert",
                    });

                    if (code && code.data) {
                        if (!isLoadingAsset) {
                            handleQrCodeResult(code.data);
                        }
                    }
                } catch (error) {
                    console.error("[InventoryScan] Error during QR decoding:", error);
                }
                animationFrameId = requestAnimationFrame(scanLoop);
            };
            animationFrameId = requestAnimationFrame(scanLoop);
        } else if (isScanning && hasCameraPermission && videoElement && videoElement.readyState < videoElement.HAVE_ENOUGH_DATA) {
             console.log("[InventoryScan] Video not ready, waiting...");
        }

        return () => {
            console.log("[InventoryScan] Cleaning up QR scan loop.");
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [isScanning, hasCameraPermission, handleQrCodeResult, isLoadingAsset]);


    const successCount = scannedAssets.filter(a => a.status === 'success').length;
    const duplicateCount = scannedAssets.filter(a => a.status === 'duplicate').length;
    const errorCount = scannedAssets.filter(a => a.status === 'error').length;
    const totalScannedThisSession = scannedTagsThisSession.current.size;
    const progressPercentage = totalScannedThisSession > 0 ? (successCount / totalScannedThisSession) * 100 : 0;


    return (
        <div className="space-y-6"> 
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ScanSearch className="h-6 w-6"/> Inventário Contínuo via Scan</CardTitle>
                    <CardDescription>
                        Ative a câmera e escaneie os QR Codes dos ativos sequencialmente para marcá-los como inventariados em {currentInventoryYear}.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <Button
                            size="lg"
                            onClick={isScanning ? stopScanSession : startScanSession}
                            className={cn("w-full sm:w-auto", isScanning && 'bg-destructive hover:bg-destructive/90')}
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
                        {isScanning && hasCameraPermission === true && !isLoadingAsset && <Loader2 className="h-6 w-6 animate-spin text-primary" title="Escaneando..." />}
                        {isLoadingAsset && <span className="text-sm text-muted-foreground">Processando ativo...</span>}
                         <div className="flex-grow text-center sm:text-right space-x-4">
                            <Badge variant="default" className="bg-green-100 text-green-800">{successCount} Sucesso</Badge>
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{duplicateCount} Duplicados</Badge>
                            <Badge variant="destructive">{errorCount} Erros</Badge>
                        </div>
                    </div>

                    <div className={cn(!isScanning && 'hidden')}> 
                        <Card className="mt-4 border-primary border-2">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <ScanLine className="h-5 w-5 text-primary"/> Câmera Ativa - Escaneie os QR Codes
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex justify-center">
                                <video
                                    ref={videoRef}
                                    className={cn(
                                        "w-full max-w-md aspect-[1/1] rounded-md bg-muted object-cover", 
                                        hasCameraPermission === false && "hidden", 
                                        hasCameraPermission === null && "hidden" 
                                     )}
                                    autoPlay
                                    muted
                                    playsInline 
                                />

                                {hasCameraPermission === null && isScanning && (
                                     <div className="flex flex-col items-center justify-center h-40 p-4 text-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
                                        <p className="text-muted-foreground">Aguardando permissão da câmera...</p>
                                    </div>
                                )}
                                {hasCameraPermission === false && isScanning && (
                                     <Alert variant="destructive" className="w-full max-w-md">
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
                        <CardTitle className="flex items-center gap-2"><ListChecks /> Resultados do Inventário</CardTitle>
                        <CardDescription>Ativos escaneados nesta sessão.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Progress value={progressPercentage} className="mb-4 h-2" />
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
                             <Button variant="outline" disabled>Gerar Relatório (PDF)</Button>
                         </div>
                    </CardContent>
                 </Card>
             )}
        </div>
    );
}
