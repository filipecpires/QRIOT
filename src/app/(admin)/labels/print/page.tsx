
'use client';

import { useState, useEffect, useRef } from 'react';
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
import QRCodeStyling from 'qrcode.react';
import { jsPDF } from "jspdf";
// import autoTable from 'jspdf-autotable'; // Not used for now with simple stacking
import { LabelPreviewModal, type LabelElementConfig } from '@/components/feature/label-preview-modal';

// Mock data - replace with actual data fetching
interface AssetForLabel {
    id: string;
    name: string;
    tag: string;
    category: string;
    location: string;
}

async function fetchAssetsForLabeling(filters: any): Promise<{ assets: AssetForLabel[], total: number }> {
    console.log("Fetching assets with filters:", filters);
    await new Promise(resolve => setTimeout(resolve, 1000)); 

    const allAssets: AssetForLabel[] = [
        { id: 'ASSET001', name: 'Notebook Dell Latitude 7400', tag: 'TI-NB-001', category: 'Eletrônicos', location: 'Escritório 1' },
        { id: 'ASSET002', name: 'Monitor LG 27"', tag: 'TI-MN-005', category: 'Eletrônicos', location: 'Escritório 2' },
        { id: 'ASSET003', name: 'Cadeira de Escritório', tag: 'MOB-CAD-012', category: 'Mobiliário', location: 'Sala de Reuniões' },
        { id: 'ASSET004', name: 'Projetor Epson PowerLite', tag: 'TI-PROJ-002', category: 'Eletrônicos', location: 'Sala de Treinamento' },
        { id: 'ASSET005', name: 'Teclado Dell', tag: 'TI-TEC-010', category: 'Eletrônicos', location: 'Escritório 1' },
        { id: 'ASSET006', name: 'Mouse Logitech', tag: 'TI-MOU-015', category: 'Eletrônicos', location: 'Escritório 1' },
        { id: 'ASSET007', name: 'Mesa Escritório', tag: 'MOB-MES-001', category: 'Mobiliário', location: 'Sala de Reuniões' },
        { id: 'ASSET008', name: 'Gaveteiro', tag: 'MOB-GAV-002', category: 'Mobiliário', location: 'Sala de Reuniões' },
        { id: 'ASSET009', name: 'Paleteira Manual', tag: 'ALM-PAL-001', category: 'Ferramentas', location: 'Almoxarifado' },
    ];

    const filteredAssets = allAssets.filter(asset => {
        let match = true;
        if (filters.search && !(asset.name.toLowerCase().includes(filters.search.toLowerCase()) || asset.tag.toLowerCase().includes(filters.search.toLowerCase()))) {
            match = false;
        }
        if (filters.category && asset.category !== filters.category) match = false;
        if (filters.location && asset.location !== filters.location) match = false;
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
    width: number;
    height: number;
    cols: number;
    rows: number;
    gapX: number;
    gapY: number;
    pageFormat: 'a4' | 'custom';
    marginTop?: number;
    marginLeft?: number;
    marginRight?: number;
    marginBottom?: number;
}

const labelSizes: LabelConfig[] = [
    { id: 'size1', name: 'Pimaco 6080 (38.1 x 21.2 mm)', width: 38.1, height: 21.2, cols: 5, rows: 13, gapX: 2.5, gapY: 0, pageFormat: 'a4', marginTop: 15.7, marginLeft: 4.7, marginRight: 4.7, marginBottom: 15.7 },
    { id: 'size2', name: 'Pimaco 6082 (63.5 x 38.1 mm)', width: 63.5, height: 38.1, cols: 3, rows: 7, gapX: 2.5, gapY: 0, pageFormat: 'a4', marginTop: 10.7, marginLeft: 4.7, marginRight: 4.7, marginBottom: 10.7 },
    { id: 'size3', name: 'Térmica Pequena (50 x 30 mm)', width: 50, height: 30, cols: 1, rows: 1, gapX: 2, gapY: 2, pageFormat: 'custom' },
    { id: 'size4', name: 'Térmica Média (70 x 40 mm)', width: 70, height: 40, cols: 1, rows: 1, gapX: 2, gapY: 2, pageFormat: 'custom' },
];

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const MM_TO_PT_SCALE = 2.83465; // 1mm = 2.83465 points (approx)
const PX_TO_PT_SCALE = 0.75; // 1px approx 0.75pt (for web display font sizes)


export default function PrintLabelsPage() {
    const { toast } = useToast();
    const [assets, setAssets] = useState<AssetForLabel[]>([]);
    const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        location: '',
        page: 1,
        limit: 10,
    });
    const [totalAssets, setTotalAssets] = useState(0);
    const [labelSizeId, setLabelSizeId] = useState<string>(labelSizes[0].id);
    const [isGenerating, setIsGenerating] = useState(false);
    const qrCanvasRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [assetToPreview, setAssetToPreview] = useState<AssetForLabel | null>(null);
    const [currentLabelLayout, setCurrentLabelLayout] = useState<LabelElementConfig[]>([]);


    const categories = ['Eletrônicos', 'Mobiliário', 'Ferramentas', 'Veículos', 'Outros'];
    const locations = ['Escritório 1', 'Escritório 2', 'Sala de Reuniões', 'Sala de Treinamento', 'Almoxarifado'];

    const fetchData = async (currentFilters: typeof filters) => {
        setLoading(true);
        setError(null);
        try {
            const { assets: fetchedAssets, total } = await fetchAssetsForLabeling(currentFilters);
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
    };

    useEffect(() => {
        fetchData(filters);
    }, [filters]);

    const handleFilterChange = (key: keyof typeof filters, value: any) => {
        const actualValue = value === '__all__' ? '' : value;
        setFilters(prev => ({ ...prev, [key]: actualValue, page: 1 }));
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
             toast({ title: "Nenhum ativo selecionado", description: "Selecione um ativo para visualizar a etiqueta.", variant: "destructive" });
             return;
        }
        const firstSelectedId = selectedAssets.values().next().value;
        const asset = assets.find(a => a.id === firstSelectedId);
        if (asset) {
            setAssetToPreview(asset);
            setIsPreviewOpen(true);
        }
    };
    
    const handleSaveLayout = (elements: LabelElementConfig[]) => {
        console.log("Layout salvo (aplicado para próxima geração de PDF):", elements);
        setCurrentLabelLayout(elements);
        // Here you would typically save these settings to user preferences or backend
        toast({ title: "Layout Aplicado", description: "O novo layout será usado para gerar as etiquetas."});
    };


    const generatePdf = async () => {
        if (selectedAssets.size === 0) {
            toast({ title: "Nenhum ativo selecionado", description: "Selecione pelo menos um ativo para gerar etiquetas.", variant: "destructive" });
            return;
        }
        if (currentLabelLayout.length === 0) {
            toast({ title: "Layout Não Configurado", description: "Por favor, edite o layout da etiqueta antes de gerar o PDF.", variant: "destructive" });
            return;
        }
        setIsGenerating(true);

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
            format: selectedLabelConfig.pageFormat === 'a4' ? 'a4' : [selectedLabelConfig.width + (selectedLabelConfig.gapX || 0) * 2, selectedLabelConfig.height + (selectedLabelConfig.gapY || 0) * 2]
        });

        const { width: labelW_mm, height: labelH_mm, cols, rows, gapX, gapY, pageFormat } = selectedLabelConfig;
        const marginTop = selectedLabelConfig.marginTop ?? (pageFormat === 'a4' ? 10 : (gapY / 2 || 1));
        const marginLeft = selectedLabelConfig.marginLeft ?? (pageFormat === 'a4' ? 10 : (gapX / 2 || 1));
        const pageW = pageFormat === 'a4' ? A4_WIDTH_MM : labelW_mm + (gapX || 0) * 2;
        const pageH = pageFormat === 'a4' ? A4_HEIGHT_MM : labelH_mm + (gapY || 0) * 2;
        
        const mainPaddingMm = 1; // Internal padding within each label in mm

        let currentX_mm = marginLeft;
        let currentY_mm = marginTop;
        let assetIndex = 0;

        const addLabelContent = async (asset: AssetForLabel, x_mm: number, y_mm: number) => {
            const labelContentWidthMm = labelW_mm - 2 * mainPaddingMm;
            let currentElementY_mm = y_mm + mainPaddingMm; // Start after top padding

            for (const element of currentLabelLayout.filter(el => el.visible)) {
                const contentToRender = element.id === 'assetName' ? asset.name :
                                      element.id === 'assetTag' ? `TAG: ${asset.tag}` :
                                      element.content;
                const textAlign = element.textAlign || 'left';
                
                let textX_mm = x_mm + mainPaddingMm;
                if (textAlign === 'center') {
                    textX_mm = x_mm + labelW_mm / 2;
                } else if (textAlign === 'right') {
                    textX_mm = x_mm + labelW_mm - mainPaddingMm;
                }


                if (element.type === 'text' || element.type === 'custom') {
                    if (contentToRender) {
                        doc.setFontSize(element.fontSizePx * PX_TO_PT_SCALE); // Convert px to pt for PDF
                        doc.setFont(element.fontFamily || 'helvetica', 'normal'); // jsPDF uses helvetica, times, courier
                        const textLines = doc.splitTextToSize(contentToRender, labelContentWidthMm);
                        
                        // Check if text fits, if not, reduce font size (simple approach)
                        let currentFontSizePt = element.fontSizePx * PX_TO_PT_SCALE;
                        let lines = textLines;
                        while (lines.length * (currentFontSizePt / MM_TO_PT_SCALE) > (labelH_mm * 0.25) && currentFontSizePt > 4) { // Max 25% of label height for this text, min 4pt
                            currentFontSizePt -= 0.5;
                            doc.setFontSize(currentFontSizePt);
                            lines = doc.splitTextToSize(contentToRender, labelContentWidthMm);
                        }

                        doc.text(lines, textX_mm, currentElementY_mm, { align: textAlign, baseline: 'top' });
                        currentElementY_mm += lines.length * (currentFontSizePt / MM_TO_PT_SCALE) + (0.5); // Add small gap
                    }
                } else if (element.type === 'qr') {
                    const qrCanvas = qrCanvasRefs.current[asset.id]; // Ensure this is populated correctly for each asset
                    if (qrCanvas) {
                        try {
                            const qrDataUrl = qrCanvas.toDataURL('image/png');
                            const qrSizeMm = Math.min(element.widthPx / MM_TO_PT_SCALE, labelContentWidthMm * 0.8, (labelH_mm - (currentElementY_mm - y_mm)) * 0.8);
                            
                            let qrPosX_mm = x_mm + mainPaddingMm;
                            if (textAlign === 'center') qrPosX_mm = x_mm + (labelW_mm - qrSizeMm) / 2;
                            else if (textAlign === 'right') qrPosX_mm = x_mm + labelW_mm - mainPaddingMm - qrSizeMm;

                            if (currentElementY_mm + qrSizeMm <= y_mm + labelH_mm - mainPaddingMm) {
                                doc.addImage(qrDataUrl, 'PNG', qrPosX_mm, currentElementY_mm, qrSizeMm, qrSizeMm);
                                currentElementY_mm += qrSizeMm + (0.5);
                            }
                        } catch (e) { console.error("Error adding QR image to PDF:", e); }
                    }
                } else if (element.type === 'logo' && element.dataUrl) {
                     try {
                        const img = new Image();
                        img.src = element.dataUrl;
                        // Wait for image to load to get natural dimensions
                        await new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });

                        const aspectRatio = img.naturalWidth / img.naturalHeight;
                        let logoHeightMm = element.heightPx / MM_TO_PT_SCALE;
                        let logoWidthMm = element.widthPx / MM_TO_PT_SCALE;

                        // Adjust based on aspect ratio, fitting within constraints
                        if (logoWidthMm / logoHeightMm > aspectRatio) { // Constrained by height
                            logoWidthMm = logoHeightMm * aspectRatio;
                        } else { // Constrained by width
                            logoHeightMm = logoWidthMm / aspectRatio;
                        }
                        
                        logoHeightMm = Math.min(logoHeightMm, (labelH_mm - (currentElementY_mm - y_mm)) * 0.7); // Max 70% of remaining height
                        logoWidthMm = logoHeightMm * aspectRatio;
                        logoWidthMm = Math.min(logoWidthMm, labelContentWidthMm * 0.8); // Max 80% of content width
                        logoHeightMm = logoWidthMm / aspectRatio;


                        let logoPosX_mm = x_mm + mainPaddingMm;
                        if (textAlign === 'center') logoPosX_mm = x_mm + (labelW_mm - logoWidthMm) / 2;
                        else if (textAlign === 'right') logoPosX_mm = x_mm + labelW_mm - mainPaddingMm - logoWidthMm;

                        if (currentElementY_mm + logoHeightMm <= y_mm + labelH_mm - mainPaddingMm) {
                            doc.addImage(element.dataUrl, 'PNG', logoPosX_mm, currentElementY_mm, logoWidthMm, logoHeightMm);
                            currentElementY_mm += logoHeightMm + (0.5);
                        }
                    } catch (e) { console.error("Error adding logo image to PDF:", e); }
                }
                 // Optional: Draw border for debugging each label content area
                // doc.setDrawColor(220, 220, 220);
                // doc.rect(x_mm, y_mm, labelW_mm, labelH_mm);
            }
        };

        while (assetIndex < assetsToPrint.length) {
             for (let r = 0; r < rows; r++) {
                currentX_mm = marginLeft;
                for (let c = 0; c < cols; c++) {
                    if (assetIndex >= assetsToPrint.length) break;
                    await addLabelContent(assetsToPrint[assetIndex], currentX_mm, currentY_mm);
                    currentX_mm += labelW_mm + gapX;
                    assetIndex++;
                }
                currentY_mm += labelH_mm + gapY;
                if (assetIndex < assetsToPrint.length && currentY_mm + labelH_mm > pageH - (selectedLabelConfig.marginBottom ?? marginTop)) {
                     if (pageFormat === 'a4') {
                         doc.addPage();
                         currentY_mm = marginTop;
                         break; 
                    }
                }
                 if (assetIndex >= assetsToPrint.length) break;
            }
            if (assetIndex >= assetsToPrint.length) break;
             if (pageFormat !== 'a4' && assetIndex < assetsToPrint.length) {
                 doc.addPage();
                 currentY_mm = marginTop;
             }
        }

        doc.save(`etiquetas_qriot_${new Date().toISOString().slice(0,10)}.pdf`);
        setIsGenerating(false);
        toast({ title: "PDF Gerado", description: `${assetsToPrint.length} etiquetas geradas com sucesso.` });
    };

    const renderHiddenQrCodes = () => {
        const assetsForQR = assets.filter(a => selectedAssets.has(a.id));
        return (
            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                {assetsForQR.map((asset) => {
                    const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/public/asset/${asset.tag}` : '';
                    return (
                        <div key={`qr-hidden-${asset.id}`}>
                            <QRCodeStyling
                                value={publicUrl || asset.tag}
                                size={150} 
                                level="H"
                                includeMargin={false}
                                ref={(el) => {
                                    if (el) {
                                        const canvas = el.querySelector('canvas');
                                        if (canvas) {
                                            qrCanvasRefs.current[asset.id] = canvas;
                                        }
                                    }
                                }}
                            />
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {renderHiddenQrCodes()}
            <h1 className="text-3xl font-bold">Imprimir Etiquetas</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Selecionar Ativos</CardTitle>
                    <CardDescription>Escolha os ativos para os quais deseja gerar etiquetas.</CardDescription>
                    <div className="pt-4 flex flex-wrap gap-4">
                        <Input
                            placeholder="Buscar por nome ou tag..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="max-w-sm"
                        />
                         <Select value={filters.category || '__all__'} onValueChange={(v) => handleFilterChange('category', v)}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Categoria" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__all__">Todas Categorias</SelectItem>
                                {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                            </SelectContent>
                        </Select>
                         <Select value={filters.location || '__all__'} onValueChange={(v) => handleFilterChange('location', v)}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Localização" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__all__">Todas Localizações</SelectItem>
                                {locations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={() => fetchData(filters)} disabled={loading}>
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
                                <TableHead>Categoria</TableHead>
                                <TableHead>Localização</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={`skel-${i}`}>
                                    <TableCell><Checkbox disabled /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
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
                                    <TableCell>{asset.category}</TableCell>
                                    <TableCell>{asset.location}</TableCell>
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
                     <div className="flex items-center justify-between space-x-2 py-4">
                         <div className="text-sm text-muted-foreground">
                            {selectedAssets.size} de {totalAssets} ativo(s) selecionado(s).
                        </div>
                         <div className="flex items-center gap-2">
                             <span className="text-sm text-muted-foreground">
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
                    <CardDescription>Ajuste o modelo da etiqueta. O layout detalhado é configurado no editor.</CardDescription>
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
                    {/* QR Size input removed, handled in editor */}
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={handleOpenPreview} disabled={selectedAssets.size === 0}>
                         <Edit className="mr-2 h-4 w-4" /> Editar Layout da Etiqueta
                    </Button>
                     <Button onClick={generatePdf} disabled={selectedAssets.size === 0 || isGenerating || currentLabelLayout.length === 0}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
                        Gerar PDF ({selectedAssets.size})
                    </Button>
                </CardFooter>
            </Card>

            {assetToPreview && (
                <LabelPreviewModal
                    isOpen={isPreviewOpen}
                    onClose={() => setIsPreviewOpen(false)}
                    asset={assetToPreview}
                    labelConfig={labelSizes.find(s => s.id === labelSizeId) || labelSizes[0]}
                    initialQrSizeMm={15} // Initial QR size in mm, editor uses pixels
                    qrValue={typeof window !== 'undefined' ? `${window.location.origin}/public/asset/${assetToPreview.tag}` : ''}
                    onSave={handleSaveLayout}
                />
             )}
        </div>
    );
}

