
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Printer, Search, Settings, Check, QrCode, Tag, X, Loader2, Edit, Save as SaveIcon, FolderOpen, Trash2 as DeleteIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { jsPDF } from "jspdf";
// import autoTable from 'jspdf-autotable'; // Currently unused
import { LabelPreviewModal, type LabelElementConfig, generateDefaultLabelLayout } from '@/components/feature/label-preview-modal';
import { HiddenQrCanvasWithDataUrl } from '@/components/feature/hidden-qr-canvas';
import { useAdminLayoutContext } from '@/components/layout/admin-layout-context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


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

// Define a type for saved user templates
export interface SavedUserLabelTemplate {
    id: string; // Unique ID for the template (e.g., timestamp or UUID)
    name: string; // User-defined name for the template
    companyId: string; // Company this template belongs to
    labelConfigId: string; // ID of the base LabelConfig used (e.g., 'size1', 'size2')
    layout: LabelElementConfig[]; // The actual layout configuration
    tileOnA4: boolean; // Whether this template (if custom format) should be tiled on A4
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
    const { currentCompanyId } = useAdminLayoutContext();
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
    const [tileOnA4, setTileOnA4] = useState(false);
    
    const [qrCodeDataUrls, setQrCodeDataUrls] = useState<Record<string, string | null>>({});
    const [areQrCodesReady, setAreQrCodesReady] = useState(false);

    const [savedUserTemplates, setSavedUserTemplates] = useState<SavedUserLabelTemplate[]>([]);
    const [selectedUserTemplateId, setSelectedUserTemplateId] = useState<string | null>(null);
    // const [newTemplateName, setNewTemplateName] = useState(''); // Moved to modal
    const [templateToDelete, setTemplateToDelete] = useState<SavedUserLabelTemplate | null>(null);


    const categories = ['Eletrônicos', 'Mobiliário', 'Ferramentas', 'Veículos', 'Outros'];
    const locations = ['Escritório 1', 'Escritório 2', 'Sala de Reuniões', 'Sala de Treinamento', 'Almoxarifado'];

    // Load saved templates and last layout for the selected base size on mount and when companyId changes
    useEffect(() => {
        if (!currentCompanyId) return;

        // Load user-defined templates
        const storedUserTemplatesJson = localStorage.getItem(`qriot_user_label_templates_${currentCompanyId}`);
        if (storedUserTemplatesJson) {
            try {
                const parsedTemplates = JSON.parse(storedUserTemplatesJson) as SavedUserLabelTemplate[];
                setSavedUserTemplates(parsedTemplates);
            } catch (e) {
                console.error("Error parsing saved user templates from localStorage:", e);
                setSavedUserTemplates([]);
            }
        } else {
            setSavedUserTemplates([]);
        }
    }, [currentCompanyId]);
    
    // Effect to load default/last-edited layout when labelSizeId changes OR when a user template is NOT selected
    useEffect(() => {
      if (!currentCompanyId || !labelSizeId) return;
  
      // If a user template is currently selected, don't override its layout
      if (selectedUserTemplateId) return;
  
      const lastEditedLayoutJson = localStorage.getItem(`labelLayout_${labelSizeId}_${currentCompanyId}`);
      const selectedLabelConfig = labelSizes.find(s => s.id === labelSizeId);
      const firstAsset = assets.length > 0 ? assets[0] : { id: 'preview', name: 'Nome Ativo', tag: 'PREVW', category: 'Categoria', location: 'Local' };
      
      if (lastEditedLayoutJson) {
          try {
              const parsedLayout = JSON.parse(lastEditedLayoutJson);
              if (Array.isArray(parsedLayout) && parsedLayout.length > 0) {
                  setCurrentLabelLayout(parsedLayout);
              } else {
                  setCurrentLabelLayout(selectedLabelConfig ? generateDefaultLabelLayout(firstAsset, selectedLabelConfig) : []);
              }
          } catch (e) {
              console.error(`Error parsing last edited layout for ${labelSizeId}:`, e);
              setCurrentLabelLayout(selectedLabelConfig ? generateDefaultLabelLayout(firstAsset, selectedLabelConfig) : []);
          }
      } else {
          setCurrentLabelLayout(selectedLabelConfig ? generateDefaultLabelLayout(firstAsset, selectedLabelConfig) : []);
      }
   }, [labelSizeId, currentCompanyId, assets, selectedUserTemplateId]); 

    // Effect to check if all selected QR codes are ready
    useEffect(() => {
        if (selectedAssets.size === 0) {
            setAreQrCodesReady(true); 
            return;
        }
        const selectedAssetIds = Array.from(selectedAssets);
        const allSelectedQrsGenerated = selectedAssetIds.every(id => {
            const dataUrl = qrCodeDataUrls[id];
            return typeof dataUrl === 'string' && dataUrl.startsWith('data:image/png;base64,') && dataUrl.length > 'data:image/png;base64,'.length;
        });
        setAreQrCodesReady(allSelectedQrsGenerated);
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

    const handleOpenPreviewModal = () => {
        if (selectedAssets.size === 0 && assets.length === 0) {
             toast({ title: "Nenhum ativo disponível", description: "Não há ativos para visualizar ou selecionar.", variant: "destructive" });
             return;
        }
         if (selectedAssets.size === 0 && assets.length > 0) {
             toast({ title: "Nenhum ativo selecionado", description: "Selecione pelo menos um ativo para editar o layout da etiqueta, ou o primeiro ativo da lista será usado como exemplo.", variant: "default" });
        }
        setIsPreviewOpen(true);
    };
    
    const handleApplyLayoutAndCloseModal = (elements: LabelElementConfig[]) => {
        setCurrentLabelLayout(elements);
        if (typeof window !== 'undefined' && currentCompanyId && labelSizeId) {
            try {
                 localStorage.setItem(`labelLayout_${labelSizeId}_${currentCompanyId}`, JSON.stringify(elements));
                 toast({ title: "Layout Aplicado", description: "O layout foi aplicado para a impressão atual." });
            } catch (error) {
                 console.error("Error saving layout to localStorage:", error);
                 toast({ title: "Erro ao Salvar Layout", description: "Não foi possível salvar o layout localmente.", variant: "destructive" });
            }
         }
        setIsPreviewOpen(false);
    };

    const handleSaveNewTemplate = (templateName: string, layout: LabelElementConfig[], baseLabelConfigId: string, tileOnA4ForTemplate: boolean) => {
        if (!currentCompanyId) {
            toast({ title: "Erro", description: "ID da empresa não encontrado.", variant: "destructive" });
            return;
        }
        // templateName and layout validation is handled inside the modal before calling this
        const newTemplate: SavedUserLabelTemplate = {
            id: `tpl-${Date.now()}`,
            name: templateName,
            companyId: currentCompanyId,
            labelConfigId: baseLabelConfigId,
            layout: layout,
            tileOnA4: tileOnA4ForTemplate,
        };

        const updatedTemplates = [...savedUserTemplates, newTemplate];
        localStorage.setItem(`qriot_user_label_templates_${currentCompanyId}`, JSON.stringify(updatedTemplates));
        setSavedUserTemplates(updatedTemplates);
        setSelectedUserTemplateId(newTemplate.id); 
        toast({ title: "Modelo Salvo", description: `Modelo "${newTemplate.name}" salvo com sucesso!` });
    };


    const handleLoadUserTemplate = (templateId: string) => {
        if (templateId === '__none__') {
            setSelectedUserTemplateId(null);
            const currentLabelConfig = labelSizes.find(s => s.id === labelSizeId);
            const firstAsset = assets.length > 0 ? assets[0] : { id: 'preview', name: 'Nome Ativo', tag: 'PREVW', category: 'Categoria', location: 'Local' };
            const lastEditedLayoutJson = localStorage.getItem(`labelLayout_${labelSizeId}_${currentCompanyId}`);
            if (lastEditedLayoutJson) {
                try {
                    setCurrentLabelLayout(JSON.parse(lastEditedLayoutJson));
                } catch {
                     setCurrentLabelLayout(currentLabelConfig ? generateDefaultLabelLayout(firstAsset, currentLabelConfig) : []);
                }
            } else {
                setCurrentLabelLayout(currentLabelConfig ? generateDefaultLabelLayout(firstAsset, currentLabelConfig) : []);
            }
            setTileOnA4(false);
            return;
        }

        const template = savedUserTemplates.find(t => t.id === templateId);
        if (template && currentCompanyId) {
            setLabelSizeId(template.labelConfigId); 
            setCurrentLabelLayout(template.layout);
            setTileOnA4(template.tileOnA4);
            setSelectedUserTemplateId(template.id);
            toast({ title: "Modelo Carregado", description: `Modelo "${template.name}" carregado.` });
        }
    };
    
    const handleDeleteTemplate = () => {
        if (!templateToDelete || !currentCompanyId) return;
        const updatedTemplates = savedUserTemplates.filter(t => t.id !== templateToDelete.id);
        localStorage.setItem(`qriot_user_label_templates_${currentCompanyId}`, JSON.stringify(updatedTemplates));
        setSavedUserTemplates(updatedTemplates);
        if (selectedUserTemplateId === templateToDelete.id) {
            setSelectedUserTemplateId(null); 
             const currentLabelConfig = labelSizes.find(s => s.id === labelSizeId);
             const firstAsset = assets.length > 0 ? assets[0] : { id: 'preview', name: 'Nome Ativo', tag: 'PREVW', category: 'Categoria', location: 'Local' };
             const lastEditedLayoutJson = localStorage.getItem(`labelLayout_${labelSizeId}_${currentCompanyId}`);
             if (lastEditedLayoutJson) {
                try { setCurrentLabelLayout(JSON.parse(lastEditedLayoutJson)); } catch { setCurrentLabelLayout(currentLabelConfig ? generateDefaultLabelLayout(firstAsset, currentLabelConfig) : []);}
             } else {
                 setCurrentLabelLayout(currentLabelConfig ? generateDefaultLabelLayout(firstAsset, currentLabelConfig) : []);
             }
        }
        setTemplateToDelete(null);
        toast({ title: "Modelo Excluído", description: `Modelo "${templateToDelete.name}" foi excluído.` });
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
        if (!areQrCodesReady) {
            toast({ title: "QR Codes Não Prontos", description: "Aguardando a geração de todos os QR codes selecionados. Tente novamente em alguns segundos.", variant: "destructive" });
            console.warn("[PDF Gen] Attempted to generate PDF before all selected QR codes were ready.");
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
        
        const effectivePageFormat = tileOnA4 && selectedLabelConfig.pageFormat === 'custom' ? 'a4' : selectedLabelConfig.pageFormat;
        const isA4Layout = effectivePageFormat === 'a4';

        const doc = new jsPDF({
            orientation: isA4Layout ? 'p' : 'l',
            unit: 'mm',
            format: isA4Layout ? 'a4' : [selectedLabelConfig.width + (selectedLabelConfig.gapX * 2) , selectedLabelConfig.height + (selectedLabelConfig.gapY * 2)]
        });
        doc.addFont("Helvetica", "Helvetica", "normal"); 
        doc.addFont("Times-Roman", "Times-Roman", "normal");
        doc.addFont("Courier", "Courier", "normal");


        const { width: labelW_mm, height: labelH_mm } = selectedLabelConfig;
        let { cols, rows, gapX, gapY, marginTop: marginTop_mm_cfg, marginLeft: marginLeft_mm_cfg } = selectedLabelConfig;

        if (isA4Layout && tileOnA4 && selectedLabelConfig.pageFormat === 'custom') {
            const pageMargin = 10; 
            marginLeft_mm_cfg = pageMargin;
            marginTop_mm_cfg = pageMargin;
            const effectivePrintableWidth = A4_WIDTH_MM - (2 * pageMargin);
            const effectivePrintableHeight = A4_HEIGHT_MM - (2 * pageMargin);
            gapX = gapX || 2; 
            gapY = gapY || 2;

            cols = Math.floor((effectivePrintableWidth + gapX) / (labelW_mm + gapX));
            rows = Math.floor((effectivePrintableHeight + gapY) / (labelH_mm + gapY));
        }
        
        const marginTop_mm = marginTop_mm_cfg ?? (isA4Layout ? 10 : gapY); 
        const marginLeft_mm = marginLeft_mm_cfg ?? (isA4Layout ? 10 : gapX); 
        const pageH_mm = isA4Layout ? A4_HEIGHT_MM : labelH_mm + (gapY * 2);

        let assetIndex = 0;


        const addLabelContent = async (asset: AssetForLabel, x_offset_mm: number, y_offset_mm: number) => {
            for (const element of layoutToUse.filter(el => el.visible)) {
                const el_x_mm = Math.max(0, x_offset_mm + (element.x * PX_TO_MM_SCALE));
                const el_y_mm = Math.max(0, y_offset_mm + (element.y * PX_TO_MM_SCALE));
                const el_w_mm = Math.max(0.1, element.widthPx * PX_TO_MM_SCALE); 
                const el_h_mm = (element.type === 'text' || element.type === 'custom' || element.type === 'characteristic') && element.heightPx === 0 ? 0 : Math.max(0.1, element.heightPx * PX_TO_MM_SCALE);
                const el_font_size_pt = Math.max(1, element.fontSizePx * PX_TO_PT_SCALE); 

                const contentToRender =
                    element.id === 'assetName' ? asset.name :
                    element.id === 'assetTag' ? `TAG: ${asset.tag}` :
                    element.type === 'characteristic' ? `${element.content}: ${asset.characteristics?.find(c => c.key === element.content)?.value || ''}` :
                    element.type === 'custom' ? String(element.content || '') : '';

                let textAlignJsPdf: 'left' | 'center' | 'right' = element.textAlign || 'left';

                if (element.type === 'text' || element.type === 'custom' || element.type === 'characteristic') {
                    if (contentToRender) {
                        let pdfFont = "helvetica"; 
                        if (element.fontFamily) {
                            const lowerFontFamily = element.fontFamily.toLowerCase();
                            if (lowerFontFamily.includes("arial") || lowerFontFamily.includes("verdana") || lowerFontFamily.includes("sans-serif")) pdfFont = "helvetica";
                            else if (lowerFontFamily.includes("times")) pdfFont = "times";
                            else if (lowerFontFamily.includes("courier")) pdfFont = "courier";
                        }
                        doc.setFont(pdfFont, 'normal');
                        doc.setFontSize(el_font_size_pt);
                        
                        const maxTextWidthMm = el_w_mm; 
                        const textLines = doc.splitTextToSize(contentToRender, maxTextWidthMm);
                        let textXPosMm = el_x_mm;
                        if (textAlignJsPdf === 'center') textXPosMm += el_w_mm / 2;
                        else if (textAlignJsPdf === 'right') textXPosMm += el_w_mm;
                        
                        const textYPosMm = el_y_mm + (el_font_size_pt * PX_TO_PT_SCALE * 0.352778); 
                        doc.text(textLines, textXPosMm, textYPosMm, { 
                            align: textAlignJsPdf,
                            baseline: 'top'
                        });
                    }
                } else if (element.type === 'qr') {
                    const qrDataUrl = qrCodeDataUrls[asset.id];
                     console.log(`[PDF QR] Asset ID: ${asset.id}, Tag: ${asset.tag}. Data URL available: ${!!qrDataUrl}, Length: ${qrDataUrl?.length || 0}`);
                    if (qrDataUrl && qrDataUrl.startsWith('data:image/png;base64,') && qrDataUrl.length > 'data:image/png;base64,'.length) {
                        try {
                            const qrSizeMm = Math.max(5, Math.min(el_w_mm, el_h_mm)); 
                            console.log(`[PDF QR] Adding QR for ${asset.id}. Coords: (${el_x_mm.toFixed(1)}, ${el_y_mm.toFixed(1)}). Size: ${qrSizeMm.toFixed(1)}mm.`);
                            doc.addImage(qrDataUrl, 'PNG', el_x_mm, el_y_mm, qrSizeMm, qrSizeMm, undefined, 'FAST'); // Added FAST compression
                        } catch (e) {
                            console.error(`[PDF QR] Error adding QR image for asset ${asset.id}:`, e);
                            doc.setFillColor(230, 230, 230);
                            doc.rect(el_x_mm, el_y_mm, Math.max(5, el_w_mm), Math.max(5, el_h_mm), 'F');
                            doc.setTextColor(100, 100, 100); doc.setFontSize(6);
                            doc.text("QR Erro", el_x_mm + el_w_mm / 2, el_y_mm + el_h_mm / 2, {align: 'center', baseline:'middle'});
                        }
                    } else {
                        console.warn(`[PDF QR] Invalid or missing QR data URL for asset ${asset.id}. URL: "${qrDataUrl ? qrDataUrl.substring(0,30) + "..." : "null"}"`);
                        doc.setFillColor(230, 230, 230);
                        doc.rect(el_x_mm, el_y_mm, Math.max(5, el_w_mm), Math.max(5, el_h_mm), 'F');
                        doc.setTextColor(100,100,100); doc.setFontSize(6);
                        doc.text("QR Indisp.", el_x_mm + el_w_mm/2, el_y_mm + el_h_mm/2, {align: 'center', baseline:'middle'});
                    }
                } else if (element.type === 'logo' && element.dataUrl) {
                    try {
                        const logoW_mm = Math.max(1, el_w_mm);
                        const logoH_mm = Math.max(1, el_h_mm);
                        doc.addImage(element.dataUrl, 'PNG', el_x_mm, el_y_mm, logoW_mm, logoH_mm, undefined, 'FAST'); // Added FAST
                    } catch (e) { console.error("[PDF Gen] Error adding logo image:", e); }
                }
            }
        };

         if (isA4Layout) {
             for (assetIndex = 0; assetIndex < assetsToPrint.length; ) {
                 if (assetIndex > 0 && assetIndex % (cols * rows) === 0) {
                     doc.addPage();
                 }
                 let currentY_mm = marginTop_mm;
                 for (let r = 0; r < rows && assetIndex < assetsToPrint.length; r++) {
                     let currentX_mm = marginLeft_mm;
                     for (let c = 0; c < cols && assetIndex < assetsToPrint.length; c++) {
                         await addLabelContent(assetsToPrint[assetIndex], currentX_mm, currentY_mm);
                         currentX_mm += labelW_mm + gapX;
                         assetIndex++;
                     }
                     currentY_mm += labelH_mm + gapY;
                     if (currentY_mm + labelH_mm > pageH_mm - (selectedLabelConfig.marginBottom ?? marginTop_mm)) {
                           break; 
                     }
                 }
             }
         } else { 
             for (assetIndex = 0; assetIndex < assetsToPrint.length; assetIndex++) {
                 if (assetIndex > 0) {
                     doc.addPage([labelW_mm + gapX * 2, labelH_mm + gapY * 2], 'l'); 
                 }
                 const customMarginX = marginLeft_mm;
                 const customMarginY = marginTop_mm;
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

    const assetsToRenderQrFor = useMemo(() => {
        return assets
            .filter(asset => selectedAssets.has(asset.id) && (!qrCodeDataUrls[asset.id] || qrCodeDataUrls[asset.id] === null))
            .map(asset => ({
                id: asset.id,
                tag: asset.tag,
                publicUrl: typeof window !== 'undefined' ? `${window.location.origin}/public/asset/${asset.tag}` : asset.tag,
            }));
    }, [assets, selectedAssets, qrCodeDataUrls]);


    const selectedAssetsData = assets.filter(a => selectedAssets.has(a.id));
    const selectedLabelConfig = labelSizes.find(s => s.id === labelSizeId) || labelSizes[0];


    return (
        <div className="space-y-6">
            <div style={{ position: 'fixed', left: '-9999px', top: '-9999px', width: 1, height: 1, overflow: 'hidden', zIndex: -100 }}>
                {assetsToRenderQrFor.map((asset) => (
                    <HiddenQrCanvasWithDataUrl
                        key={`qr-hidden-${asset.id}`}
                        assetId={asset.id}
                        value={asset.publicUrl}
                        onDataUrlReady={handleQrDataUrlReady}
                        size={256} 
                    />
                ))}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Imprimir Etiquetas</h1>
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
                    <CardTitle>Configurações de Impressão e Layout</CardTitle>
                    <CardDescription>Ajuste o modelo base da etiqueta, carregue ou salve layouts personalizados e configure a impressão.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="label-size">Modelo Base de Etiqueta</Label>
                            <Select 
                                value={labelSizeId} 
                                onValueChange={(value) => {
                                    setLabelSizeId(value);
                                    setSelectedUserTemplateId(null);
                                }}
                            >
                                <SelectTrigger id="label-size"><SelectValue placeholder="Selecione o tamanho" /></SelectTrigger>
                                <SelectContent>
                                    {labelSizes.map(size => (
                                        <SelectItem key={size.id} value={size.id}>{size.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">Define as dimensões e formato da página base.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="load-template">Carregar Modelo de Layout Salvo</Label>
                            <div className="flex gap-2">
                                <Select value={selectedUserTemplateId || '__none__'} onValueChange={handleLoadUserTemplate} disabled={savedUserTemplates.length === 0}>
                                    <SelectTrigger id="load-template" className="flex-grow">
                                        <SelectValue placeholder={savedUserTemplates.length === 0 ? "Nenhum modelo salvo" : "Selecione um modelo"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__none__">-- Usar Layout Padrão/Editado --</SelectItem>
                                        {savedUserTemplates.map(template => (
                                            <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {selectedUserTemplateId && savedUserTemplates.find(t=>t.id === selectedUserTemplateId) && (
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" title="Excluir Modelo Salvo" className="text-destructive hover:bg-destructive/10 flex-shrink-0">
                                                <DeleteIcon className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Tem certeza que deseja excluir o modelo de etiqueta "{savedUserTemplates.find(t=>t.id === selectedUserTemplateId)?.name}"? Esta ação não pode ser desfeita.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel onClick={() => setTemplateToDelete(null)}>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => {
                                                    const template = savedUserTemplates.find(t=>t.id === selectedUserTemplateId);
                                                    if (template) {
                                                        setTemplateToDelete(template);
                                                        handleDeleteTemplate(); 
                                                    }
                                                }} className="bg-destructive hover:bg-destructive/90">
                                                    Confirmar Exclusão
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">Carregue um layout previamente salvo para esta empresa.</p>
                        </div>
                    </div>
                    
                    {/* Moved Save Template UI to Modal */}

                    {selectedLabelConfig.pageFormat === 'custom' && (
                        <div className="flex items-center space-x-2 pt-2">
                             <Checkbox
                                id="tile-on-a4"
                                checked={tileOnA4}
                                onCheckedChange={(checked) => setTileOnA4(!!checked)}
                            />
                            <Label htmlFor="tile-on-a4" className="text-sm font-normal">
                                Organizar em grade em folha A4?
                            </Label>
                            <p className="text-xs text-muted-foreground">(Para modelos de etiqueta individual)</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
                    <Button variant="outline" onClick={handleOpenPreviewModal} className="w-full sm:w-auto">
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

             {isPreviewOpen && (selectedAssetsData.length > 0 || assets.length > 0) && (
                <LabelPreviewModal
                    isOpen={isPreviewOpen}
                    onClose={() => setIsPreviewOpen(false)}
                    initialAsset={selectedAssetsData.length > 0 ? selectedAssetsData[0] : assets[0]}
                    selectedAssetsData={selectedAssetsData.length > 0 ? selectedAssetsData : assets.slice(0,1)}
                    labelConfig={selectedLabelConfig}
                    onApplyLayoutAndClose={handleApplyLayoutAndCloseModal}
                    initialLayout={currentLabelLayout}
                    qrCodeDataUrls={qrCodeDataUrls}
                    onSaveAsNewTemplate={handleSaveNewTemplate}
                    currentTileOnA4={tileOnA4}
                />
             )}
        </div>
    );
}

