
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
import { Printer, Search, AlertTriangle, Settings, Check, QrCode, Tag, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import QRCodeStyling from 'qrcode.react'; // Using qrcode.react for consistency
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable'; // For better table/layout control if needed

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
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

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
        // Add more assets...
    ];

    // Apply basic filtering
    const filteredAssets = allAssets.filter(asset => {
        let match = true;
        if (filters.search && !(asset.name.toLowerCase().includes(filters.search.toLowerCase()) || asset.tag.toLowerCase().includes(filters.search.toLowerCase()))) {
            match = false;
        }
        if (filters.category && asset.category !== filters.category) match = false;
        if (filters.location && asset.location !== filters.location) match = false; // Assuming location is fetched/matched by name for simplicity
        return match;
    });

    // Simulate pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const startIndex = (page - 1) * limit;
    const paginatedAssets = filteredAssets.slice(startIndex, startIndex + limit);

    return { assets: paginatedAssets, total: filteredAssets.length };
}

// Mock label sizes (in mm)
const labelSizes = [
    { id: 'size1', name: 'Pimaco 6080 (38.1 x 21.2 mm)', width: 38.1, height: 21.2, cols: 5, rows: 13, gapX: 2.5, gapY: 0, pageFormat: 'a4' },
    { id: 'size2', name: 'Pimaco 6082 (63.5 x 38.1 mm)', width: 63.5, height: 38.1, cols: 3, rows: 7, gapX: 2.5, gapY: 0, pageFormat: 'a4' },
    { id: 'size3', name: 'Térmica Pequena (50 x 30 mm)', width: 50, height: 30, cols: 1, rows: 1, gapX: 2, gapY: 2, pageFormat: 'custom' }, // Example thermal
    { id: 'size4', name: 'Térmica Média (70 x 40 mm)', width: 70, height: 40, cols: 1, rows: 1, gapX: 2, gapY: 2, pageFormat: 'custom' }, // Example thermal
];

// Constants for A4 page size in mm
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const DEFAULT_MARGIN_MM = 10; // Default margin for A4 layouts

export default function PrintLabelsPage() {
    const { toast } = useToast();
    const [assets, setAssets] = useState<AssetForLabel[]>([]);
    const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        location: '', // Add location filter
        page: 1,
        limit: 10,
    });
    const [totalAssets, setTotalAssets] = useState(0);
    const [labelSizeId, setLabelSizeId] = useState<string>(labelSizes[0].id); // Default label size
    const [qrSize, setQrSize] = useState(15); // QR code size in mm (adjust based on label size)
    const [isGenerating, setIsGenerating] = useState(false);
    const qrCanvasRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});

    // Mock data for filters (replace with actual fetches if needed)
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

    // Function to generate PDF
    const generatePdf = async () => {
        if (selectedAssets.size === 0) {
            toast({ title: "Nenhum ativo selecionado", description: "Selecione pelo menos um ativo para gerar etiquetas.", variant: "destructive" });
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
            orientation: selectedLabelConfig.pageFormat === 'a4' ? 'p' : 'l', // Portrait for A4, landscape might be needed for wide thermal rolls
            unit: 'mm',
            format: selectedLabelConfig.pageFormat === 'a4' ? 'a4' : [selectedLabelConfig.width + selectedLabelConfig.gapX * 2, selectedLabelConfig.height + selectedLabelConfig.gapY * 2] // Custom format for thermal rolls
        });

        const { width: labelW, height: labelH, cols, rows, gapX, gapY, pageFormat } = selectedLabelConfig;
        const pageW = pageFormat === 'a4' ? A4_WIDTH_MM : labelW + gapX * 2;
        const pageH = pageFormat === 'a4' ? A4_HEIGHT_MM : labelH + gapY * 2;
        const margin = pageFormat === 'a4' ? DEFAULT_MARGIN_MM : gapX; // Use gap as margin for single labels

        let currentX = margin;
        let currentY = margin;
        let assetIndex = 0;

        const addLabelContent = (asset: AssetForLabel, x: number, y: number) => {
            const qrCanvas = qrCanvasRefs.current[asset.id];
            if (qrCanvas) {
                try {
                    const qrDataUrl = qrCanvas.toDataURL('image/png');
                    const qrActualSize = Math.min(qrSize, labelH * 0.6, labelW * 0.6); // Limit QR size by label dimensions
                    const qrX = x + (labelW - qrActualSize) / 2; // Center QR horizontally
                    const qrY = y + 5; // Position QR near top
                    doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrActualSize, qrActualSize);

                     // Calculate remaining space for text
                    const textYStart = qrY + qrActualSize + 2; // Start text below QR code + gap
                    const availableTextHeight = labelH - (textYStart - y) - 2; // Height available for text
                    const textMaxWidth = labelW - 4; // Max width for text with padding

                     // Asset Name (larger font, potentially wraps)
                    doc.setFontSize(7);
                    doc.setFont('helvetica', 'bold');
                    const nameLines = doc.splitTextToSize(asset.name, textMaxWidth);
                     let textY = textYStart;
                    doc.text(nameLines, x + labelW / 2, textY, { align: 'center', baseline: 'top' });
                     textY += nameLines.length * 2.5; // Adjust based on font size/line height

                    // Asset Tag (smaller font)
                    if (textY < y + labelH - 4) { // Check if space remains
                         doc.setFontSize(6);
                         doc.setFont('helvetica', 'normal');
                        const tagText = `TAG: ${asset.tag}`;
                         doc.text(tagText, x + labelW / 2, textY, { align: 'center', baseline: 'top' });
                    }

                    // Optional: Draw border for debugging
                     // doc.setDrawColor(200, 200, 200);
                     // doc.rect(x, y, labelW, labelH);

                } catch (e) {
                    console.error("Error adding QR code image:", e);
                    doc.setFontSize(6);
                    doc.setTextColor(255, 0, 0); // Red color for error
                    doc.text("Erro QR", x + 5, y + 5);
                    doc.setTextColor(0, 0, 0); // Reset text color
                }
            } else {
                 console.warn(`QR Canvas not found for asset ${asset.id}`);
                 doc.setFontSize(6);
                 doc.setTextColor(255, 0, 0);
                 doc.text("QR N/D", x + 5, y + 5);
                 doc.setTextColor(0, 0, 0);
            }
        };

        while (assetIndex < assetsToPrint.length) {
            for (let r = 0; r < rows; r++) {
                currentX = margin; // Reset X for new row
                for (let c = 0; c < cols; c++) {
                    if (assetIndex >= assetsToPrint.length) break;
                    addLabelContent(assetsToPrint[assetIndex], currentX, currentY);
                    currentX += labelW + gapX;
                    assetIndex++;
                }
                currentY += labelH + gapY;
                if (currentY + labelH > pageH - margin && assetIndex < assetsToPrint.length) {
                    // Check if next row exceeds page height (only for A4)
                    if (pageFormat === 'a4') {
                         doc.addPage();
                         currentY = margin; // Reset Y for new page
                         break; // Exit inner loops to start new page
                    }
                }
            }
            if (assetIndex >= assetsToPrint.length) break; // Exit outer loop if all assets printed
            // If not A4 and not finished, add a new page (for continuous thermal)
            if (pageFormat !== 'a4' && assetIndex < assetsToPrint.length) {
                doc.addPage();
                currentY = margin;
            }
        }


        doc.save(`etiquetas_qrot_${new Date().toISOString().slice(0,10)}.pdf`);
        setIsGenerating(false);
        toast({ title: "PDF Gerado", description: `${assetsToPrint.length} etiquetas geradas com sucesso.` });
    };

    // Pre-render QR codes in hidden canvases
    const renderHiddenQrCodes = () => {
        return (
            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                {assets.map((asset) => {
                    // Construct public URL - ensure this runs client-side or pass origin
                    const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/public/asset/${asset.tag}` : '';
                    return (
                        <div key={`qr-hidden-${asset.id}`}>
                            <QRCodeStyling
                                value={publicUrl || asset.tag} // Fallback to tag if URL fails
                                size={100} // Render at a reasonable fixed size for canvas capture
                                level="M" // Medium error correction
                                includeMargin={false}
                                // Use canvas ref to store the canvas element
                                ref={(el) => {
                                    // The ref might give the wrapper div first, find the canvas inside
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
        <div className="container mx-auto py-10 space-y-6">
            {/* Hidden QR codes for canvas generation */}
            {renderHiddenQrCodes()}

            <h1 className="text-3xl font-bold">Imprimir Etiquetas</h1>

            {/* Asset Selection Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Selecionar Ativos</CardTitle>
                    <CardDescription>Escolha os ativos para os quais deseja gerar etiquetas.</CardDescription>
                    {/* Filters */}
                    <div className="pt-4 flex flex-wrap gap-4">
                        <Input
                            placeholder="Buscar por nome ou tag..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="max-w-sm"
                        />
                         <Select value={filters.category} onValueChange={(v) => handleFilterChange('category', v)}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Categoria" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Todas</SelectItem>
                                {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                            </SelectContent>
                        </Select>
                         <Select value={filters.location} onValueChange={(v) => handleFilterChange('location', v)}>
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Localização" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Todas</SelectItem>
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
                    {/* Pagination */}
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

            {/* Print Settings Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Configurações de Impressão</CardTitle>
                    <CardDescription>Ajuste o tamanho da etiqueta e do QR Code.</CardDescription>
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
                     <div className="space-y-2">
                        <Label htmlFor="qr-size">Tamanho do QR Code (mm)</Label>
                         <Input
                             id="qr-size"
                             type="number"
                             min="5"
                             max="50" // Sensible max
                             value={qrSize}
                             onChange={(e) => setQrSize(Math.max(5, parseInt(e.target.value) || 15))} // Ensure minimum size
                             className="w-24"
                         />
                        <p className="text-xs text-muted-foreground">Tamanho do QR Code dentro da etiqueta. Ajuste conforme necessário.</p>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                     <Button onClick={generatePdf} disabled={selectedAssets.size === 0 || isGenerating}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
                        Gerar PDF ({selectedAssets.size})
                    </Button>
                </CardFooter>
            </Card>

        </div>
    );
}
