
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
import QRCodeStyling from 'qrcode.react';
import { jsPDF } from "jspdf";
// import autoTable from 'jspdf-autotable'; // Keep commented unless complex layout needed
import { LabelPreviewModal, type LabelElementConfig } from '@/components/feature/label-preview-modal';

// Mock data - replace with actual data fetching
interface AssetForLabel {
    id: string;
    name: string;
    tag: string;
    category: string;
    location: string;
    characteristics?: { key: string, value: string }[]; // Add characteristics for editor
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
             toast({ title: "Nenhum ativo selecionado", description: "Selecione pelo menos um ativo para visualizar a etiqueta.", variant: "destructive" });
             return;
        }
        setIsPreviewOpen(true);
    };

    const handleSaveLayout = (elements: LabelElementConfig[]) => {
        console.log("Layout salvo (aplicado para próxima geração de PDF):", elements);
        setCurrentLabelLayout(elements);
        toast({ title: "Layout Aplicado", description: "O novo layout será usado para gerar as etiquetas."});
    };

    // Function to escape CSV fields
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
            toast({ title: "Layout Não Configurado", description: "Por favor, edite o layout da etiqueta antes de gerar o PDF.", variant: "destructive" });
            return;
        }
        setIsGenerating(true);
        // Close preview modal if it's open when generating PDF
        setIsPreviewOpen(false);

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

        let currentX_mm = marginLeft;
        let currentY_mm = marginTop;
        let assetIndex = 0;

        // Helper to convert px from layout to mm for PDF
        const pxToMm = (px: number) => px / MM_TO_PX_SCALE;

        const addLabelContent = async (asset: AssetForLabel, x_offset_mm: number, y_offset_mm: number) => {
             // Iterate through the saved layout elements
            for (const element of layoutToUse.filter(el => el.visible)) {
                // Calculate element position in mm based on px layout and current label offset
                const el_x_mm = x_offset_mm + pxToMm(element.x);
                const el_y_mm = y_offset_mm + pxToMm(element.y);
                const el_w_mm = pxToMm(element.widthPx);
                const el_h_mm = pxToMm(element.heightPx);
                const el_font_size_pt = element.fontSizePx * PX_TO_PT_SCALE;

                const contentToRender =
                    element.id === 'assetName' ? asset.name :
                    element.id === 'assetTag' ? `TAG: ${asset.tag}` :
                    element.type === 'characteristic' ? `${element.content}: ${element.characteristicValue || asset.characteristics?.find(c => c.key === element.content)?.value || ''}` :
                    element.type === 'custom' ? element.content : '';

                 let textAlignJsPdf: 'left' | 'center' | 'right' = element.textAlign || 'left';


                if (element.type === 'text' || element.type === 'custom' || element.type === 'characteristic') {
                    if (contentToRender) {
                        doc.setFontSize(el_font_size_pt);
                        doc.setFont(element.fontFamily || 'helvetica', 'normal');
                        // Note: jsPDF's splitTextToSize doesn't work well with auto width,
                        // we assume the widthPx in the editor defines the wrap width
                         const maxTextWidthMm = pxToMm(element.widthPx) > 5 ? pxToMm(element.widthPx) : labelW_mm * 0.9; // Use element width or fallback
                        const textLines = doc.splitTextToSize(contentToRender, maxTextWidthMm);

                        // jsPDF text alignment needs careful x positioning
                        let textXPosMm = el_x_mm;
                        if (textAlignJsPdf === 'center') textXPosMm += maxTextWidthMm / 2;
                        else if (textAlignJsPdf === 'right') textXPosMm += maxTextWidthMm;

                        doc.text(textLines, textXPosMm, el_y_mm, { align: textAlignJsPdf, baseline: 'top' });
                    }
                } else if (element.type === 'qr') {
                    const qrCanvas = qrCanvasRefs.current[asset.id];
                    if (qrCanvas) {
                        try {
                            const qrDataUrl = qrCanvas.toDataURL('image/png');
                            doc.addImage(qrDataUrl, 'PNG', el_x_mm, el_y_mm, el_w_mm, el_w_mm); // QR is square
                        } catch (e) { console.error("Error adding QR image to PDF:", e); }
                    }
                } else if (element.type === 'logo' && element.dataUrl) {
                     try {
                        doc.addImage(element.dataUrl, 'PNG', el_x_mm, el_y_mm, el_w_mm, el_h_mm);
                    } catch (e) { console.error("Error adding logo image to PDF:", e); }
                }
            }
             // Optional: Draw border for debugging each label boundary
             // doc.setDrawColor(200, 200, 200);
             // doc.rect(x_offset_mm, y_offset_mm, labelW_mm, labelH_mm);
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
                         break; // Go to next page
                    }
                    // For custom/thermal, assume one label per "page" for simplicity in this logic block
                }
                 if (assetIndex >= assetsToPrint.length) break;
            }
             if (assetIndex >= assetsToPrint.length) break;

             // Add new page if needed (mostly for A4)
              if (pageFormat === 'a4' && assetIndex < assetsToPrint.length) {
                 doc.addPage();
                 currentY_mm = marginTop;
              } else if (pageFormat !== 'a4' && assetIndex < assetsToPrint.length) {
                  // For thermal, add new page for each label
                  doc.addPage();
                  currentY_mm = marginTop; // Reset Y for the single label on the new page
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
                    // Find the QR element in the current layout to get its size
                    const qrElement = currentLabelLayout.find(el => el.type === 'qr');
                    const qrSize = qrElement ? qrElement.widthPx : 150; // Default size if not found
                    return (
                        <div key={`qr-hidden-${asset.id}`}>
                            <QRCodeStyling
                                value={publicUrl || asset.tag}
                                size={qrSize}
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

    // Callback function for the modal to trigger PDF generation
    const handleGenerateRequest = (layout: LabelElementConfig) => {
        generatePdf(layout);
    };

    const selectedAssetsData = assets.filter(a => selectedAssets.has(a.id)); // Data for modal preview


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
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={handleOpenPreview} disabled={selectedAssets.size === 0}>
                         <Edit className="mr-2 h-4 w-4" /> Editar Layout da Etiqueta
                    </Button>
                     {/* Button inside the modal now triggers generation */}
                     <Button onClick={() => generatePdf(currentLabelLayout)} disabled={selectedAssets.size === 0 || isGenerating || currentLabelLayout.length === 0}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
                        Gerar PDF ({selectedAssets.size})
                    </Button>
                </CardFooter>
            </Card>

            {/* Pass all selected assets data and generation request handler */}
             {isPreviewOpen && selectedAssetsData.length > 0 && (
                <LabelPreviewModal
                    isOpen={isPreviewOpen}
                    onClose={() => setIsPreviewOpen(false)}
                    initialAsset={selectedAssetsData[0]} // Pass the first selected asset initially
                    selectedAssetsData={selectedAssetsData} // Pass all selected assets data
                    labelConfig={labelSizes.find(s => s.id === labelSizeId) || labelSizes[0]}
                    onSave={handleSaveLayout}
                    onGenerateRequest={handleGenerateRequest} // Pass the generation handler
                />
             )}
        </div>
    );
}
