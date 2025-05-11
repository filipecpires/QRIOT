
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Printer, Search, Settings, Check, QrCode, Tag, X, Loader2, Edit } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { jsPDF } from "jspdf";
// import autoTable from 'jspdf-autotable'; // Currently unused
import { LabelPreviewModal, type LabelElementConfig } from '@/components/feature/label-preview-modal';
import { HiddenQrCanvasWithDataUrl } from '@/components/feature/hidden-qr-canvas';

// Mock data - replace with actual data fetching
interface AssetForLabel {
    id: string;
    name: string;
    tag: string;
    category: string;
    location: string;
    characteristics?: { key: string, value: string }[];
}

async function fetchAssetsForLabeling(filters: any): Promise<{ assets: AssetForLabel[], total: number }> {
    console.log("Fetching assets with filters:", filters);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const allAssets: AssetForLabel[] = [
        { id: 'ASSET001', name: 'Notebook Dell Latitude 7400', tag: 'AB12C', category: 'Eletrônicos', location: 'Escritório 1', characteristics: [{key:'Serial', value:'SN123'}, {key:'RAM', value:'16GB'}] },
        { id: 'ASSET002', name: 'Monitor LG 27"', tag: 'DE34F', category: 'Eletrônicos', location: 'Escritório 2' },
        { id: 'ASSET003', name: 'Cadeira de Escritório', tag: 'GH56I', category: 'Mobiliário', location: 'Sala de Reuniões', characteristics: [{key:'Cor', value:'Preta'}] },
        { id: 'ASSET004', name: 'Projetor Epson PowerLite', tag: 'JK78L', category: 'Eletrônicos', location: 'Sala de Treinamento' },
        { id: 'ASSET005', name: 'Teclado Dell', tag: 'MN90P', category: 'Eletrônicos', location: 'Escritório 1' },
        { id: 'ASSET006', name: 'Mouse Logitech', tag: 'QR12S', category: 'Eletrônicos', location: 'Escritório 1' },
        { id: 'ASSET007', name: 'Mesa Escritório', tag: 'TU34V', category: 'Mobiliário', location: 'Sala de Reuniões' },
        { id: 'ASSET008', name: 'Gaveteiro', tag: 'WX56Y', category: 'Mobiliário', location: 'Sala de Reuniões' },
        { id: 'ASSET009', name: 'Paleteira Manual', tag: 'ZA78B', category: 'Ferramentas', location: 'Almoxarifado' },
    ];

    const filteredAssets = allAssets.filter(asset => {
        let match = true;
        if (filters.search && !(asset.name.toLowerCase().includes(filters.search.toLowerCase()) || asset.tag.toLowerCase().includes(filters.search.toLowerCase()))) {
            match = false;
        }
        if (filters.category && filters.category !== '__all__' && asset.category !== filters.category) match = false;
        if (filters.location && filters.location !== '__all__' && asset.location !== filters.location) match = false;
        return match;
    });

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const startIndex = (page - 1) * limit;
    const paginatedAssets = filteredAssets.slice(startIndex, startIndex + limit);

    return { assets: paginatedAssets, total: filteredAssets.length };
}

export interface LabelConfig {
    id: string;
    name: string;
    width: number; // mm
    height: number; // mm
    cols: number;
    rows: number;
    gapX: number; // mm
    gapY: number; // mm
    pageFormat: 'a4' | 'custom';
    marginTop?: number; // mm
    marginLeft?: number; // mm
    marginRight?: number; // mm
    marginBottom?: number; // mm
}

const labelSizes: LabelConfig[] = [
    { id: 'size1', name: 'Pimaco 6080 (38.1 x 21.2 mm)', width: 38.1, height: 21.2, cols: 5, rows: 13, gapX: 2.5, gapY: 0, pageFormat: 'a4', marginTop: 15.7, marginLeft: 4.7, marginRight: 4.7, marginBottom: 15.7 },
    { id: 'size2', name: 'Pimaco 6082 (63.5 x 38.1 mm)', width: 63.5, height: 38.1, cols: 3, rows: 7, gapX: 2.5, gapY: 0, pageFormat: 'a4', marginTop: 10.7, marginLeft: 4.7, marginRight: 4.7, marginBottom: 10.7 },
    { id: 'size3', name: 'Térmica Pequena (50 x 30 mm)', width: 50, height: 30, cols: 1, rows: 1, gapX: 2, gapY: 2, pageFormat: 'custom' },
    { id: 'size4', name: 'Térmica Média (70 x 40 mm)', width: 70, height: 40, cols: 1, rows: 1, gapX: 2, gapY: 2, pageFormat: 'custom' },
];

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const PX_TO_MM_SCALE = 0.264583; 
const PX_TO_PT_SCALE = 0.75; 


export default function PrintLabelsPage() {
    const { toast } = useToast();
    const [assets, setAssets] = useState<AssetForLabel[]>([]);
    const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        search: '',
        category: '__all__',
        location: '__all__',
        page: 1,
        limit: 10,
    });
    const [totalAssets, setTotalAssets] = useState(0);
    const [labelSizeId, setLabelSizeId] = useState<string>(labelSizes[0].id);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [currentLabelLayout, setCurrentLabelLayout] = useState<LabelElementConfig[]>([]);
    const [qrCodeDataUrls, setQrCodeDataUrls] = useState<Record<string, string | null>>({});
    const [areQrCodesReady, setAreQrCodesReady] = useState(false);


    const categories = ['Eletrônicos', 'Mobiliário', 'Ferramentas', 'Veículos', 'Outros'];
    const locations = ['Escritório 1', 'Escritório 2', 'Sala de Reuniões', 'Sala de Treinamento', 'Almoxarifado'];

    useEffect(() => {
         if (typeof window !== 'undefined') {
             const savedLayoutJson = localStorage.getItem(`labelLayout_${labelSizeId}`);
             if (savedLayoutJson) {
                 try {
                     const savedLayout = JSON.parse(savedLayoutJson);
                     if (Array.isArray(savedLayout)) {
                         setCurrentLabelLayout(savedLayout);
                     } else {
                         setCurrentLabelLayout([]);
                     }
                 } catch (e) {
                     setCurrentLabelLayout([]);
                 }
             } else {
                 setCurrentLabelLayout([]); // Initialize if no saved layout
             }
         }
     }, [labelSizeId]);

     useEffect(() => {
        const selectedAssetIds = Array.from(selectedAssets);
        if (selectedAssetIds.length === 0) {
            setAreQrCodesReady(true); 
            return;
        }
        const allReady = selectedAssetIds.every(id => qrCodeDataUrls[id] && qrCodeDataUrls[id]!.length > 'data:image/png;base64,'.length);
        setAreQrCodesReady(allReady);
    }, [selectedAssets, qrCodeDataUrls]);


    const fetchData = useCallback(async (currentFilters: typeof filters) => {
        setLoading(true);
        setError(null);
        try {
             const apiFilters = {
                ...currentFilters,
                category: currentFilters.category === '__all__' ? '' : currentFilters.category,
                location: currentFilters.location === '__all__' ? '' : currentFilters.location,
            };
            const { assets: fetchedAssets, total } = await fetchAssetsForLabeling(apiFilters);
            setAssets(fetchedAssets);
            setTotalAssets(total);
        } catch (err) {
            console.error("Error fetching assets:", err);
            setError("Falha ao carregar os ativos.");
            setAssets([]);
            setTotalAssets(0);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(filters);
    }, [filters, fetchData]);

    const handleFilterChange = (key: keyof typeof filters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const handleSelectAll = (checked: boolean | 'indeterminate') => {
        if (checked === true) {
            const newSelected = new Set(assets.map(a => a.id));
            setSelectedAssets(newSelected);
        } else {
            setSelectedAssets(new Set());
        }
    };

    const handleSelectRow = (assetId: string, checked: boolean | 'indeterminate') => {
        setSelectedAssets(prev => {
            const newSelected = new Set(prev);
            if (checked === true) {
                newSelected.add(assetId);
            } else {
                newSelected.delete(assetId);
            }
            return newSelected;
        });
    };

    const totalPages = Math.ceil(totalAssets / filters.limit);
    const isAllSelected = assets.length > 0 && selectedAssets.size === assets.length;
    const isIndeterminate = selectedAssets.size > 0 && selectedAssets.size < assets.length;

    const handleOpenPreview = () => {
        if (selectedAssets.size === 0) {
             toast({ title: "Nenhum ativo selecionado", description: "Selecione pelo menos um ativo para visualizar a etiqueta.", variant: "destructive" });
             return;
        }
        setIsPreviewOpen(true);
    };

    const handleSaveLayout = (elements: LabelElementConfig[]) => {
        setCurrentLabelLayout(elements);
        if (typeof window !== 'undefined') {
            try {
                 const selectedLabelConfig = labelSizes.find(s => s.id === labelSizeId);
                 if (!selectedLabelConfig) return;
                 localStorage.setItem(`labelLayout_${selectedLabelConfig.id}`, JSON.stringify(elements));
                 toast({ title: "Layout Salvo", description: "O layout foi salvo localmente para este tamanho de etiqueta." });
            } catch (error) {
                 console.error("Error saving layout to localStorage:", error);
                 toast({ title: "Erro ao Salvar Layout", description: "Não foi possível salvar o layout localmente.", variant: "destructive" });
            }
         }
    };

    const escapeCsvField = (field: string | number | undefined | null): string => {
        if (field === null || field === undefined) {
          return '';
        }
        const stringField = String(field);
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
          const escapedField = stringField.replace(/"/g, '""');
          return `"${escapedField}"`;
        }
        return stringField;
    };


    const generatePdf = async (layoutToUse: LabelElementConfig[]) => {
        if (selectedAssets.size === 0) {
            toast({ title: "Nenhum ativo selecionado", description: "Selecione pelo menos um ativo para gerar etiquetas.", variant: "destructive" });
            return;
        }
         if (layoutToUse.length === 0) {
             toast({ title: "Layout Vazio", description: "O layout da etiqueta está vazio. Edite o layout para adicionar elementos.", variant: "destructive" });
             return;
         }
        
        const selectedAssetIds = Array.from(selectedAssets);
        const allSelectedQrsReady = selectedAssetIds.every(id => {
            const asset = assets.find(a => a.id === id);
            if (!asset) return false; 
            return qrCodeDataUrls[id] && qrCodeDataUrls[id]!.length > 'data:image/png;base64,'.length;
        });

        if (!allSelectedQrsReady) {
            toast({ title: "QR Codes Não Prontos", description: "Alguns QR codes ainda estão sendo gerados. Tente novamente em alguns segundos.", variant: "destructive" });
            setIsGenerating(false);
            return;
        }

        setIsGenerating(true);
        toast({ title: "Gerando PDF...", description: "Preparando etiquetas, aguarde." });
        

        const selectedLabelConfig = labelSizes.find(s => s.id === labelSizeId);
        if (!selectedLabelConfig) {
            toast({ title: "Erro", description: "Configuração de etiqueta inválida.", variant: "destructive" });
            setIsGenerating(false);
            return;
        }

        const assetsToPrint = assets.filter(a => selectedAssets.has(a.id));
        const doc = new jsPDF({
            orientation: selectedLabelConfig.pageFormat === 'a4' ? 'p' : 'l',
            unit: 'mm',
            format: selectedLabelConfig.pageFormat === 'a4' ? 'a4' : [selectedLabelConfig.width, selectedLabelConfig.height]
        });

        const { width: labelW_mm, height: labelH_mm, cols, rows, gapX, gapY, pageFormat } = selectedLabelConfig;
        const marginTop_mm = selectedLabelConfig.marginTop ?? (pageFormat === 'a4' ? 10 : 0);
        const marginLeft_mm = selectedLabelConfig.marginLeft ?? (pageFormat === 'a4' ? 10 : 0);
        const pageH_mm = pageFormat === 'a4' ? A4_HEIGHT_MM : labelH_mm;

        let assetIndex = 0;

        const addLabelContent = async (asset: AssetForLabel, x_offset_mm: number, y_offset_mm: number) => {
            for (const element of layoutToUse.filter(el => el.visible)) {
                const el_x_mm = x_offset_mm + (element.x * PX_TO_MM_SCALE);
                const el_y_mm = y_offset_mm + (element.y * PX_TO_MM_SCALE);
                const el_w_mm = element.widthPx * PX_TO_MM_SCALE;
                const el_h_mm = element.heightPx * PX_TO_MM_SCALE;
                const el_font_size_pt = element.fontSizePx * PX_TO_PT_SCALE;

                const contentToRender =
                    element.id === 'assetName' ? asset.name :
                    element.id === 'assetTag' ? `TAG: ${asset.tag}` :
                    element.type === 'characteristic' ? `${element.content}: ${asset.characteristics?.find(c => c.key === element.content)?.value || ''}` :
                    element.type === 'custom' ? element.content : '';

                let textAlignJsPdf: 'left' | 'center' | 'right' = element.textAlign || 'left';

                if (element.type === 'text' || element.type === 'custom' || element.type === 'characteristic') {
                    if (contentToRender) {
                        doc.setFontSize(el_font_size_pt);
                        doc.setFont(element.fontFamily || 'helvetica', 'normal'); 
                        const maxTextWidthMm = el_w_mm > 1 ? el_w_mm : (labelW_mm - (el_x_mm - x_offset_mm)) * 0.95;
                        const textLines = doc.splitTextToSize(contentToRender, maxTextWidthMm);
                        let textXPosMm = el_x_mm;
                        if (textAlignJsPdf === 'center') textXPosMm += el_w_mm / 2;
                        else if (textAlignJsPdf === 'right') textXPosMm += el_w_mm;
                        doc.text(textLines, textXPosMm, el_y_mm + (el_font_size_pt * 0.35), { 
                            align: textAlignJsPdf,
                            baseline: 'top'
                        });
                    }
                } else if (element.type === 'qr') {
                    const qrDataUrl = qrCodeDataUrls[asset.id];
                    if (qrDataUrl) {
                        try {
                            const minQrSizeMm = 5; // Minimum 5mm QR code in PDF
                            const requestedQrSizeMm = el_w_mm; // el_w_mm is widthPx * PX_TO_MM_SCALE
                            const qrSizeMm = Math.max(minQrSizeMm, Math.max(1, requestedQrSizeMm)); // Ensure at least 1mm, prefer minQrSizeMm

                            doc.addImage(qrDataUrl, 'PNG', el_x_mm, el_y_mm, qrSizeMm, qrSizeMm);
                        } catch (e) {
                            console.error(`Error adding QR image to PDF for asset ${asset.id}:`, e);
                            doc.setFillColor(230, 230, 230);
                            doc.rect(el_x_mm, el_y_mm, Math.max(5, el_w_mm), Math.max(5, el_w_mm), 'F');
                            doc.setTextColor(100, 100, 100);
                            doc.setFontSize(6);
                            doc.text("QR Erro", el_x_mm + Math.max(5, el_w_mm)/2, el_y_mm + Math.max(5, el_w_mm)/2, {align: 'center', baseline:'middle'});
                        }
                    } else {
                        console.warn(`QR data URL not ready or invalid for asset ${asset.id}`);
                        doc.setFillColor(230, 230, 230);
                        doc.rect(el_x_mm, el_y_mm, Math.max(5, el_w_mm), Math.max(5, el_w_mm), 'F');
                        doc.setTextColor(100, 100, 100);
                        doc.setFontSize(6);
                        doc.text("QR Indisp.", el_x_mm + Math.max(5, el_w_mm) / 2, el_y_mm + Math.max(5, el_w_mm) / 2, { align: 'center', baseline: 'middle' });
                    }
                } else if (element.type === 'logo' && element.dataUrl) {
                    try {
                        const logoW_mm = Math.max(1, el_w_mm);
                        const logoH_mm = Math.max(1, el_h_mm);
                        doc.addImage(element.dataUrl, 'PNG', el_x_mm, el_y_mm, logoW_mm, logoH_mm);
                    } catch (e) { console.error("Error adding logo image to PDF:", e); }
                }
            }
        };

         if (pageFormat === 'a4') {
             for (assetIndex = 0; assetIndex < assetsToPrint.length; ) {
                 if (assetIndex > 0 && assetIndex % (cols * rows) === 0) {
                     doc.addPage();
                 }
                 let currentY_mm = marginTop_mm;
                 for (let r = 0; r < rows; r++) {
                     let currentX_mm = marginLeft_mm;
                     for (let c = 0; c < cols; c++) {
                         if (assetIndex >= assetsToPrint.length) break;
                         await addLabelContent(assetsToPrint[assetIndex], currentX_mm, currentY_mm);
                         currentX_mm += labelW_mm + gapX;
                         assetIndex++;
                     }
                     currentY_mm += labelH_mm + gapY;
                     if (assetIndex >= assetsToPrint.length) break;
                     if (currentY_mm + labelH_mm > pageH_mm - (selectedLabelConfig.marginBottom ?? marginTop_mm)) {
                           break;
                     }
                 }
             }
         } else { // Custom page format (likely thermal printer)
             for (assetIndex = 0; assetIndex < assetsToPrint.length; assetIndex++) {
                 if (assetIndex > 0) {
                     doc.addPage([labelW_mm + gapX, labelH_mm + gapY], 'l'); // Add page with label dimensions + gaps
                 }
                 // Apply margins for custom format too, if specified or default to 0
                 const customMarginX = selectedLabelConfig.marginLeft ?? 0;
                 const customMarginY = selectedLabelConfig.marginTop ?? 0;
                 await addLabelContent(assetsToPrint[assetIndex], customMarginX, customMarginY);
             }
         }


        try {
            doc.save(`etiquetas_qriot_${new Date().toISOString().slice(0,10)}.pdf`);
            setIsGenerating(false);
            toast({ title: "PDF Gerado", description: `${assetsToPrint.length} etiquetas geradas com sucesso.` });
        } catch (e) {
             console.error("Error saving PDF:", e);
             setIsGenerating(false);
             toast({ title: "Erro ao Salvar PDF", description: "Não foi possível salvar o arquivo PDF.", variant: "destructive" });
        }
    };

    const handleQrDataUrlReady = useCallback((assetId: string, dataUrl: string | null) => {
        setQrCodeDataUrls(prev => ({ ...prev, [assetId]: dataUrl }));
    }, []);

    const renderHiddenQrCodes = () => {
        const assetsForQR = assets.filter(a => selectedAssets.has(a.id));
        if (assetsForQR.length === 0) return null;

        return (
            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
                {assetsForQR.map((asset) => {
                    const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/public/asset/${asset.tag}` : asset.tag;
                    return (
                        <HiddenQrCanvasWithDataUrl
                            key={`qr-hidden-${asset.id}`}
                            assetId={asset.id}
                            value={publicUrl}
                            onDataUrlReady={handleQrDataUrlReady}
                        />
                    );
                })}
            </div>
        );
    };

    const selectedAssetsData = assets.filter(a => selectedAssets.has(a.id));


    return (
        <div className="space-y-6">
            {renderHiddenQrCodes()}
            <h1 className="text-3xl font-bold">Imprimir Etiquetas</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Selecionar Ativos</CardTitle>
                    <CardDescription>Escolha os ativos para os quais deseja gerar etiquetas.</CardDescription>
                    <div className="pt-4 flex flex-col sm:flex-row flex-wrap gap-2">
                        <Input
                            placeholder="Buscar por nome ou tag..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="max-w-xs w-full sm:w-auto flex-grow sm:flex-grow-0"
                        />
                         <Select value={filters.category} onValueChange={(v) => handleFilterChange('category', v)}>
                            <SelectTrigger className="w-full sm:w-[180px] flex-grow sm:flex-grow-0">
                                <SelectValue placeholder="Categoria" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__all__">Todas Categorias</SelectItem>
                                {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                            </SelectContent>
                        </Select>
                         <Select value={filters.location} onValueChange={(v) => handleFilterChange('location', v)}>
                            <SelectTrigger className="w-full sm:w-[180px] flex-grow sm:flex-grow-0">
                                <SelectValue placeholder="Localização" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__all__">Todas Localizações</SelectItem>
                                {locations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={() => fetchData(filters)} disabled={loading} className="w-full sm:w-auto">
                            <Search className="mr-2 h-4 w-4" /> Buscar
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead padding="checkbox" className="w-[50px]">
                                    <Checkbox
                                        checked={isAllSelected || (isIndeterminate ? "indeterminate" : false)}
                                        onCheckedChange={handleSelectAll}
                                        aria-label="Selecionar todos"
                                    />
                                </TableHead>
                                <TableHead>Tag</TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead className="hidden md:table-cell">Categoria</TableHead>
                                <TableHead className="hidden md:table-cell">Localização</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={`skel-${i}`}>
                                    <TableCell><Checkbox disabled /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-32" /></TableCell>
                                </TableRow>
                            ))}
                            {!loading && assets.map((asset) => (
                                <TableRow key={asset.id} data-state={selectedAssets.has(asset.id) ? "selected" : ""}>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selectedAssets.has(asset.id)}
                                            onCheckedChange={(checked) => handleSelectRow(asset.id, checked)}
                                            aria-label={`Selecionar ${asset.name}`}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{asset.tag}</TableCell>
                                    <TableCell>{asset.name}</TableCell>
                                    <TableCell className="hidden md:table-cell">{asset.category}</TableCell>
                                    <TableCell className="hidden md:table-cell">{asset.location}</TableCell>
                                </TableRow>
                            ))}
                            {!loading && assets.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        {error || "Nenhum ativo encontrado para os filtros selecionados."}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                     <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 sm:space-x-2 py-4">
                         <div className="text-sm text-muted-foreground">
                            {selectedAssets.size} de {totalAssets} ativo(s) selecionado(s).
                        </div>
                         <div className="flex items-center gap-2">
                             <span className="text-sm text-muted-foreground hidden sm:inline">
                                Página {filters.page} de {totalPages}
                             </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleFilterChange('page', filters.page - 1)}
                                disabled={filters.page <= 1 || loading}
                            >
                                Anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleFilterChange('page', filters.page + 1)}
                                disabled={filters.page >= totalPages || loading}
                            >
                                Próxima
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Configurações de Impressão</CardTitle>
                    <CardDescription>Ajuste o modelo da etiqueta e edite o layout.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="label-size">Tamanho da Etiqueta (Modelo)</Label>
                        <Select value={labelSizeId} onValueChange={setLabelSizeId}>
                            <SelectTrigger id="label-size">
                                <SelectValue placeholder="Selecione o tamanho" />
                            </SelectTrigger>
                            <SelectContent>
                                {labelSizes.map(size => (
                                    <SelectItem key={size.id} value={size.id}>{size.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">Define o layout e dimensões das etiquetas no PDF.</p>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
                    <Button variant="outline" onClick={handleOpenPreview} disabled={selectedAssets.size === 0} className="w-full sm:w-auto">
                         <Edit className="mr-2 h-4 w-4" /> Editar Layout da Etiqueta
                    </Button>
                     <Button 
                        onClick={() => generatePdf(currentLabelLayout)} 
                        disabled={selectedAssets.size === 0 || isGenerating || !areQrCodesReady} 
                        className="w-full sm:w-auto"
                    >
                        {isGenerating ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                         ) : (
                            <Printer className="mr-2 h-4 w-4" />
                         )}
                        Gerar PDF ({selectedAssets.size})
                        {!isGenerating && !areQrCodesReady && selectedAssets.size > 0 && (
                            <Loader2 className="ml-2 h-4 w-4 animate-spin" title="Preparando QR Codes..." />
                        )}
                    </Button>
                </CardFooter>
            </Card>

             {isPreviewOpen && selectedAssetsData.length > 0 && (
                <LabelPreviewModal
                    isOpen={isPreviewOpen}
                    onClose={() => setIsPreviewOpen(false)}
                    initialAsset={selectedAssetsData[0]}
                    selectedAssetsData={selectedAssetsData}
                    labelConfig={labelSizes.find(s => s.id === labelSizeId) || labelSizes[0]}
                    onSave={handleSaveLayout}
                    initialLayout={currentLabelLayout}
                />
             )}
        </div>
    );
}

