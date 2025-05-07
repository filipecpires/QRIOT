
'use client';

import React, { useState, useRef, ChangeEvent, useEffect, useCallback } from 'react';
import QRCodeStyling from 'qrcode.react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { LabelConfig } from '@/app/(admin)/labels/print/page'; // Ensure correct path
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ImageIcon, Trash2, ArrowDown, ArrowUp, GripVertical, PlusCircle, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Printer, Save } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Command as CommandPrimitive } from 'cmdk';
import { Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


interface AssetForLabel {
    id: string;
    name: string;
    tag: string;
    category: string;
    location: string;
    characteristics?: { key: string, value: string }[];
}

export interface LabelElementConfig {
    id: string;
    type: 'text' | 'qr' | 'logo' | 'custom' | 'characteristic';
    content: string; // For text, custom text, QR value, characteristic key
    characteristicValue?: string; // For characteristic type, stores the actual value from asset
    dataUrl?: string; // For logo image
    fontSizePx: number;
    widthPx: number;
    heightPx: number;
    visible: boolean;
    fontFamily?: string;
    textAlign?: 'left' | 'center' | 'right';
    x: number; // Position X (pixels) relative to label container
    y: number; // Position Y (pixels) relative to label container
}

interface LabelPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAsset: AssetForLabel; // The first asset to show
  selectedAssetsData: AssetForLabel[]; // All selected assets for preview switching
  labelConfig: LabelConfig;
  onSave: (elements: LabelElementConfig[]) => void; // Renamed from onApplyLayout
  onGenerateRequest: (layout: LabelElementConfig[]) => void; // Callback to trigger PDF generation
  initialLayout?: LabelElementConfig[]; // Pass initial/saved layout from parent
}

const DEFAULT_FONT_SIZE_PX = 12;
const DEFAULT_QR_SIZE_PX = 50;
const DEFAULT_LOGO_HEIGHT_PX = 30;
const DEFAULT_LOGO_WIDTH_PX = 50;
const MM_TO_PX_SCALE = 3.78; // Approx pixels per mm for display preview
const MAX_ZOOM = 3;
const MIN_ZOOM = 0.5;
const ZOOM_STEP = 0.2;


// Helper to generate default layout
const generateDefaultLayout = (asset: AssetForLabel, labelConfig: LabelConfig): LabelElementConfig[] => {
    const qrValue = typeof window !== 'undefined' ? `${window.location.origin}/public/asset/${asset.tag}` : '';
    const initialLayoutBase = [
        { id: 'assetName', type: 'text' as const, content: asset.name, fontSizePx: DEFAULT_FONT_SIZE_PX + 2, visible: true, widthPx: Math.max(50, asset.name.length * 7), heightPx: (DEFAULT_FONT_SIZE_PX + 2) * 1.2, textAlign: 'center' as const, fontFamily: 'Arial, sans-serif' },
        { id: 'assetTag', type: 'text' as const, content: `TAG: ${asset.tag}`, fontSizePx: DEFAULT_FONT_SIZE_PX -2, visible: true, widthPx: Math.max(50, `TAG: ${asset.tag}`.length * 6), heightPx: (DEFAULT_FONT_SIZE_PX - 2) * 1.2, textAlign: 'center' as const, fontFamily: 'Arial, sans-serif' },
        { id: 'qrCode', type: 'qr' as const, content: qrValue, widthPx: DEFAULT_QR_SIZE_PX, heightPx: DEFAULT_QR_SIZE_PX, visible: true, fontSizePx: 0, textAlign: 'center' as const },
    ];

    const labelWidthPx = labelConfig.width * MM_TO_PX_SCALE;
    const labelHeightPx = labelConfig.height * MM_TO_PX_SCALE;

    return initialLayoutBase.map((el, index) => {
        const elWidth = el.widthPx;
        const elHeight = el.type === 'qr' ? el.widthPx : el.heightPx || el.fontSizePx * 1.2;
        return {
            ...el,
            x: Math.max(0, (labelWidthPx / 2) - (elWidth / 2)), // Ensure x >= 0
            y: Math.max(0, (labelHeightPx / 3) * (index + 0.5) - (elHeight / 2)) // Ensure y >= 0
        };
    });
};

export function LabelPreviewModal({
  isOpen,
  onClose,
  initialAsset,
  selectedAssetsData,
  labelConfig,
  onSave,
  onGenerateRequest,
  initialLayout, // Receive initial layout from parent
}: LabelPreviewModalProps) {
  const { toast } = useToast();
  const [elements, setElements] = useState<LabelElementConfig[]>(initialLayout || []); // Use initialLayout if provided
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const previewAreaRef = useRef<HTMLDivElement>(null);
  const scaledPreviewRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef<{ x: number; y: number, elX: number, elY: number, scale: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);

  const currentAsset = selectedAssetsData[currentPreviewIndex] || initialAsset;
  const qrValue = typeof window !== 'undefined' ? `${window.location.origin}/public/asset/${currentAsset.tag}` : '';

  // --- Load/Initialize Layout ---
    useEffect(() => {
         if (isOpen) {
            // If initialLayout is provided (e.g., from localStorage), use it directly.
            // Otherwise, generate the default layout based on the *initial* asset.
            const layoutToUse = initialLayout && initialLayout.length > 0
                ? initialLayout
                : generateDefaultLayout(initialAsset, labelConfig);

             // Update content for the currently displayed asset
            const updatedLayout = layoutToUse.map(el => updateElementContent(el, currentAsset, qrValue));
            setElements(updatedLayout);

            setSelectedElementId(null); // Reset selection when modal opens/layout changes
             // Find index of initialAsset to start preview correctly
            const initialIndex = selectedAssetsData.findIndex(a => a.id === initialAsset.id);
            setCurrentPreviewIndex(initialIndex >= 0 ? initialIndex : 0);
            setZoomLevel(1); // Reset zoom
        }
    }, [isOpen, initialAsset, labelConfig, initialLayout]); // Rerun when these change


    // Helper function to update element content based on the asset
    const updateElementContent = (element: LabelElementConfig, asset: AssetForLabel, currentQrValue: string): LabelElementConfig => {
        if (element.id === 'assetName') return { ...element, content: asset.name };
        if (element.id === 'assetTag') return { ...element, content: `TAG: ${asset.tag}` };
        if (element.id === 'qrCode') return { ...element, content: currentQrValue };
        if (element.type === 'characteristic') {
            const char = asset.characteristics?.find(c => c.key === element.content);
            return { ...element, characteristicValue: char?.value || '' };
        }
        return element;
    };

     // Effect to update element content when the previewed asset changes
     useEffect(() => {
         setElements(prevElements =>
            prevElements.map(el => updateElementContent(el, currentAsset, qrValue))
         );
         setSelectedElementId(null); // Deselect element when changing preview
     }, [currentAsset, qrValue]);


  const updateElement = (id: string, updates: Partial<LabelElementConfig>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  };

 const addElement = (type: 'text' | 'custom' | 'logo' | 'qr' | 'characteristic', content?: string, characteristicKey?: string) => {
    const newId = `${type}-${Date.now()}`;
    let newElementBase: Omit<LabelElementConfig, 'x' | 'y'>;

    const labelWidthPx = labelConfig.width * MM_TO_PX_SCALE;
    const labelHeightPx = labelConfig.height * MM_TO_PX_SCALE;
    let elWidthPx: number;
    let elHeightPx: number;

    switch (type) {
      case 'logo':
        elWidthPx = DEFAULT_LOGO_WIDTH_PX;
        elHeightPx = DEFAULT_LOGO_HEIGHT_PX;
        newElementBase = { id: newId, type, content: 'Logo', dataUrl: undefined, widthPx: elWidthPx, heightPx: elHeightPx, visible: true, fontSizePx: 0, textAlign: 'center' };
        break;
      case 'qr':
        // Check if QR already exists
         if (elements.some(el => el.type === 'qr')) {
             toast({ title: "QR Code já existe", description: "Só é possível adicionar um QR Code por etiqueta.", variant: "default" });
             return;
         }
        elWidthPx = DEFAULT_QR_SIZE_PX;
        elHeightPx = DEFAULT_QR_SIZE_PX; // QR is square
        newElementBase = { id: newId, type, content: qrValue, widthPx: elWidthPx, heightPx: elHeightPx, visible: true, fontSizePx: 0, textAlign: 'center' };
        break;
      case 'characteristic':
        const char = currentAsset.characteristics?.find(c => c.key === characteristicKey);
        elWidthPx = 100; // Default width for text
        elHeightPx = DEFAULT_FONT_SIZE_PX * 1.2; // Approximate height
        newElementBase = { id: newId, type, content: characteristicKey || 'Característica', characteristicValue: char?.value || '', fontSizePx: DEFAULT_FONT_SIZE_PX, visible: true, widthPx: elWidthPx, heightPx: elHeightPx, textAlign: 'left', fontFamily: 'Arial, sans-serif' };
        break;
      case 'custom':
      default:
        elWidthPx = 100; // Default width for text
        elHeightPx = DEFAULT_FONT_SIZE_PX * 1.2; // Approximate height
        newElementBase = { id: newId, type: type === 'text' ? 'text': 'custom' , content: content || 'Novo Texto', fontSizePx: DEFAULT_FONT_SIZE_PX, visible: true, widthPx: elWidthPx, heightPx: elHeightPx, textAlign: 'left', fontFamily: 'Arial, sans-serif' };
        break;
    }

     // Center the new element initially
     const x_centered = Math.max(0, (labelWidthPx / 2) - (elWidthPx / 2));
     const y_centered = Math.max(0, (labelHeightPx / 2) - (elHeightPx / 2));

    const newElement: LabelElementConfig = {
        ...newElementBase,
        x: x_centered,
        y: y_centered,
    };

    setElements(prev => [...prev, newElement]);
    setSelectedElementId(newId);
  };

  const removeElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedElementId === id) setSelectedElementId(null);
  };


  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const logoElement = elements.find(el => el.type === 'logo' && el.id === selectedElementId);
    if (file && logoElement) {
        const reader = new FileReader();
        reader.onloadend = () => {
            updateElement(logoElement.id, { dataUrl: reader.result as string, visible: true });
        };
        reader.readAsDataURL(file);
    } else if (file && !elements.find(el => el.type === 'logo')) {
         // If adding a new logo element via file input
        const newId = `logo-${Date.now()}`;
        const reader = new FileReader();
        reader.onloadend = () => {
            const labelWidthPx = labelConfig.width * MM_TO_PX_SCALE;
            const labelHeightPx = labelConfig.height * MM_TO_PX_SCALE;
            const elWidthPx = DEFAULT_LOGO_WIDTH_PX;
            const elHeightPx = DEFAULT_LOGO_HEIGHT_PX;
             const x_centered = Math.max(0, (labelWidthPx / 2) - (elWidthPx / 2));
             const y_centered = Math.max(0, (labelHeightPx / 2) - (elHeightPx / 2));

            const newLogo: LabelElementConfig = {
                id: newId, type: 'logo', content: 'Logo', dataUrl: reader.result as string,
                widthPx: elWidthPx, heightPx: elHeightPx,
                visible: true, fontSizePx: 0, textAlign: 'center', x: x_centered, y: y_centered
            };
            setElements(prev => [newLogo, ...prev]); // Add new logo element
            setSelectedElementId(newId);
        };
        reader.readAsDataURL(file);
    }
    if (event.target) {
        event.target.value = ''; // Reset file input
    }
  };

   const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    setSelectedElementId(id);
    const el = elements.find(elem => elem.id === id);
     if (!el || !previewAreaRef.current || !scaledPreviewRef.current) return;

    const previewRect = scaledPreviewRef.current.getBoundingClientRect();
    const initialMouseX = e.clientX;
    const initialMouseY = e.clientY;
    const initialElementX = el.x;
    const initialElementY = el.y;

    dragStartPos.current = {
      x: initialMouseX,
      y: initialMouseY,
      elX: initialElementX,
      elY: initialElementY,
      scale: zoomLevel, // Store current zoom level
    };


    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStartPos.current) return;

      const dx = moveEvent.clientX - dragStartPos.current.x;
      const dy = moveEvent.clientY - dragStartPos.current.y;

       // Adjust movement based on zoom level
       const adjustedDx = dx / dragStartPos.current.scale;
       const adjustedDy = dy / dragStartPos.current.scale;

      let newX = dragStartPos.current.elX + adjustedDx;
      let newY = dragStartPos.current.elY + adjustedDy;

       // Remove boundary limits
       // const labelWidthPx = labelConfig.width * MM_TO_PX_SCALE;
       // const labelHeightPx = labelConfig.height * MM_TO_PX_SCALE;
       // const elWidth = el.widthPx;
       // const elHeight = el.heightPx;
       // newX = Math.max(0, Math.min(newX, labelWidthPx - elWidth));
       // newY = Math.max(0, Math.min(newY, labelHeightPx - elHeight));

      updateElement(id, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
      dragStartPos.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
    };

    const handleZoomOut = () => {
        setZoomLevel(prev => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
    };

    const handleNextPreview = () => {
         setCurrentPreviewIndex(prev => (prev + 1) % selectedAssetsData.length);
    };

     const handlePrevPreview = () => {
         setCurrentPreviewIndex(prev => (prev - 1 + selectedAssetsData.length) % selectedAssetsData.length);
    };

    const handleGenerateClick = () => {
         if (elements.length === 0) {
            toast({ title: "Layout Vazio", description: "Adicione elementos à etiqueta antes de gerar.", variant: "destructive" });
            return;
        }
         // Pass the current layout state to the generation function
         onGenerateRequest(elements);
    };


    // --- Save Layout to Local Storage ---
    const saveLayoutToLocalStorage = (layout: LabelElementConfig[]) => {
        try {
            localStorage.setItem(`labelLayout_${labelConfig.id}`, JSON.stringify(layout));
            toast({ title: "Layout Salvo", description: `Layout para ${labelConfig.name} salvo localmente.` });
        } catch (error) {
            console.error("Error saving layout to localStorage:", error);
            toast({ title: "Erro ao Salvar Layout", description: "Não foi possível salvar o layout localmente.", variant: "destructive" });
        }
    };

    // Use onSave prop which should call saveLayoutToLocalStorage in parent
    const handleSaveAndClose = () => {
        onSave(elements);
        onClose();
    };

    // Trigger save explicitly
    const handleSaveChanges = () => {
        onSave(elements); // Calls the function passed from parent which saves to localstorage
    };


  const selectedElement = elements.find(el => el.id === selectedElementId);
  const availableCharacteristics = currentAsset.characteristics?.filter(ac => !elements.some(el => el.type === 'characteristic' && el.content === ac.key)) || [];


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl md:max-w-5xl lg:max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Editor de Layout da Etiqueta</DialogTitle>
           <DialogDescription>
             {`Pré-visualizando: ${currentAsset.name} (${currentAsset.tag}) - Etiqueta ${currentPreviewIndex + 1} de ${selectedAssetsData.length}. `}
             Dimensões base: {labelConfig.width.toFixed(1)}mm x {labelConfig.height.toFixed(1)}mm. Arraste os elementos para posicionar.
           </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-grow min-h-0">
          {/* Preview Area */}
          <div
             ref={previewAreaRef}
             className="lg:col-span-2 flex items-center justify-center p-4 border rounded-md bg-gray-200 dark:bg-gray-700 relative overflow-auto"
          >
            {/* Scaled container for zoom */}
            <div
              ref={scaledPreviewRef}
              style={{
                width: `${labelConfig.width * MM_TO_PX_SCALE}px`,
                height: `${labelConfig.height * MM_TO_PX_SCALE}px`,
                backgroundColor: 'white',
                border: '1px dashed #ccc',
                position: 'relative',
                overflow: 'visible', // Allow elements to go outside bounds visually
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center center',
                 transition: 'transform 0.1s ease-out',
              }}
            >
              {/* Render elements */}
              {elements.filter(el => el.visible).map(el => (
                <div
                  key={el.id}
                  onMouseDown={(e) => handleMouseDown(e, el.id)}
                  onClick={(e) => {e.stopPropagation(); setSelectedElementId(el.id)}}
                  className={cn(
                    "absolute cursor-grab select-none p-0.5 border border-transparent", // Transparent border initially
                    "hover:border-blue-400 hover:border-dashed", // Dashed blue border on hover
                    selectedElementId === el.id && "border-primary border-solid border-2 outline-none" // Solid primary border when selected
                  )}
                   style={{
                    left: `${el.x}px`,
                    top: `${el.y}px`,
                    fontSize: `${el.fontSizePx}px`,
                    fontFamily: el.fontFamily || 'Arial, sans-serif',
                    color: 'black',
                    textAlign: el.textAlign,
                    width: el.type === 'qr' || el.type === 'logo' ? `${el.widthPx}px` : 'auto', // Width auto for text
                    minWidth: '10px', // Prevent text collapsing completely
                    height: el.type === 'qr' ? `${el.widthPx}px` : el.type === 'logo' ? `${el.heightPx}px` : 'auto', // Height auto for text/logo
                    lineHeight: '1.1',
                    zIndex: selectedElementId === el.id ? 10 : 1, // Bring selected to front
                  }}
                >
                  {el.type === 'text' && <span className="block whitespace-nowrap">{el.content}</span>}
                  {el.type === 'custom' && <span className="block whitespace-nowrap">{el.content}</span>}
                  {el.type === 'characteristic' && <span className="block whitespace-nowrap">{`${el.content}: ${el.characteristicValue}`}</span>}
                  {el.type === 'qr' && (
                      <div style={{ width: el.widthPx, height: el.widthPx }}> {/* Ensure container matches size */}
                          <QRCodeStyling value={el.content || 'no-data'} size={el.widthPx} level="H" includeMargin={false} />
                      </div>
                  )}
                   {el.type === 'logo' && el.dataUrl && (
                        <img src={el.dataUrl} alt="Logo" style={{ width: `${el.widthPx}px`, height: `${el.heightPx}px`, objectFit: 'contain' }} />
                    )}
                    {el.type === 'logo' && !el.dataUrl && (
                         <div style={{ width: `${el.widthPx}px`, height: `${el.heightPx}px` }} className="bg-muted border border-dashed flex items-center justify-center text-xs text-muted-foreground">Logo</div>
                    )}
                </div>
              ))}
            </div>
          </div>

          {/* Control Panel */}
          <div className="space-y-3 overflow-y-auto pr-2 flex flex-col">
             {/* Zoom and Preview Controls */}
             <div className="flex justify-between items-center border-b pb-2 mb-2">
                 <div className="flex items-center gap-1">
                     <Button variant="outline" size="icon" onClick={handleZoomOut} disabled={zoomLevel <= MIN_ZOOM} className="h-8 w-8">
                         <ZoomOut className="h-4 w-4" />
                     </Button>
                     <span className="text-xs w-10 text-center">{Math.round(zoomLevel * 100)}%</span>
                     <Button variant="outline" size="icon" onClick={handleZoomIn} disabled={zoomLevel >= MAX_ZOOM} className="h-8 w-8">
                         <ZoomIn className="h-4 w-4" />
                     </Button>
                 </div>
                  {selectedAssetsData.length > 1 && (
                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" onClick={handlePrevPreview} className="h-8 w-8">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                         <span className="text-xs text-muted-foreground">{currentPreviewIndex + 1}/{selectedAssetsData.length}</span>
                        <Button variant="outline" size="icon" onClick={handleNextPreview} className="h-8 w-8">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                 )}
             </div>

            {/* Add Elements Section */}
            <div className="flex-shrink-0 space-y-2">
                <Label className="text-base font-semibold">Adicionar Elemento</Label>
                <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={() => addElement('custom')}><PlusCircle className="mr-2 h-4 w-4" />Texto</Button>
                    <Button variant="outline" size="sm" onClick={() => addElement('qr')} disabled={elements.some(el => el.type === 'qr')}><PlusCircle className="mr-2 h-4 w-4" />QR Code</Button>
                    <Button variant="outline" size="sm" onClick={() => addElement('logo')}><PlusCircle className="mr-2 h-4 w-4" />Logo</Button>
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" disabled={!currentAsset.characteristics || availableCharacteristics.length === 0}><PlusCircle className="mr-2 h-4 w-4" />Característica</Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-0" side="bottom" align="start">
                            <Command>
                                <CommandInput placeholder="Buscar característica..." />
                                <CommandEmpty>Nenhuma característica disponível.</CommandEmpty>
                                <CommandGroup>
                                    {availableCharacteristics.map((char) => (
                                    <CommandItem
                                        key={char.key}
                                        value={char.key}
                                        onSelect={() => addElement('characteristic', undefined, char.key)}
                                    >
                                        {char.key}
                                    </CommandItem>
                                    ))}
                                </CommandGroup>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <Separator />

            {/* Edit Selected Element Section */}
            <div className="flex-grow overflow-y-auto pr-1 space-y-3">
                <Label className="text-base font-semibold">Configurar Elemento Selecionado</Label>
                {selectedElement ? (
                <Card className="p-3">
                    <div className="flex justify-between items-center mb-2">
                        <Label className="text-sm font-medium truncate" title={selectedElement.content}>
                            Editando: {
                            selectedElement.id === 'assetName' ? 'Nome do Ativo' :
                            selectedElement.id === 'assetTag' ? 'TAG do Ativo' :
                            selectedElement.type === 'custom' ? `Texto: "${selectedElement.content.substring(0,15)}..."` :
                            selectedElement.type === 'characteristic' ? `Caract.: ${selectedElement.content}` :
                            selectedElement.type === 'qr' ? 'QR Code' : 'Logo'
                            }
                        </Label>
                        {['custom', 'logo', 'qr', 'characteristic'].includes(selectedElement.type) && (
                            <Button variant="ghost" size="icon" onClick={() => removeElement(selectedElement.id)} className="h-6 w-6">
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        )}
                    </div>
                    <Separator className="my-2"/>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Label htmlFor={`visible-${selectedElement.id}`} className="text-xs whitespace-nowrap">Visível:</Label>
                            <Checkbox
                                id={`visible-${selectedElement.id}`}
                                checked={selectedElement.visible}
                                onCheckedChange={(checked) => updateElement(selectedElement.id, { visible: !!checked })}
                            />
                        </div>
                    {(selectedElement.type === 'text' || selectedElement.type === 'custom' || selectedElement.type === 'characteristic') && (
                        <>
                        {selectedElement.type === 'custom' && (
                            <div>
                                <Label htmlFor={`content-${selectedElement.id}`} className="text-xs">Conteúdo</Label>
                                <Textarea id={`content-${selectedElement.id}`} value={selectedElement.content} onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })} className="text-xs h-16 mt-1" />
                            </div>
                        )}
                        {selectedElement.type === 'characteristic' && (
                                <div>
                                    <Label htmlFor={`content-${selectedElement.id}`} className="text-xs">Exibir Chave + Valor</Label>
                                    <Input id={`content-${selectedElement.id}`} value={`${selectedElement.content}: ${selectedElement.characteristicValue}`} readOnly className="text-xs h-8 mt-1 bg-muted" />
                                </div>
                            )}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label htmlFor={`fontSize-${selectedElement.id}`} className="text-xs">Fonte (px)</Label>
                                <Input id={`fontSize-${selectedElement.id}`} type="number" value={selectedElement.fontSizePx} onChange={(e) => updateElement(selectedElement.id, { fontSizePx: parseInt(e.target.value) || DEFAULT_FONT_SIZE_PX })} className="text-xs h-8 mt-1" />
                            </div>
                            <div>
                                <Label htmlFor={`textAlign-${selectedElement.id}`} className="text-xs">Alinhar</Label>
                                <Select value={selectedElement.textAlign || 'left'} onValueChange={(v: 'left' | 'center' | 'right') => updateElement(selectedElement.id, { textAlign: v })}>
                                    <SelectTrigger className="text-xs h-8 mt-1"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="left">Esquerda</SelectItem>
                                        <SelectItem value="center">Centro</SelectItem>
                                        <SelectItem value="right">Direita</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             {/* Optional Width Control for Text */}
                            {/* <div>
                                <Label htmlFor={`width-${selectedElement.id}`} className="text-xs">Largura (px)</Label>
                                <Input id={`width-${selectedElement.id}`} type="number" value={selectedElement.widthPx} onChange={(e) => updateElement(selectedElement.id, { widthPx: parseInt(e.target.value) || 100 })} className="text-xs h-8 mt-1" />
                            </div> */}
                        </div>
                        </>
                    )}
                    {selectedElement.type === 'qr' && (
                        <div className="grid grid-cols-1 gap-2">
                            <div>
                            <Label htmlFor={`qrSize-${selectedElement.id}`} className="text-xs">Tamanho (px)</Label>
                            <Input id={`qrSize-${selectedElement.id}`} type="number" value={selectedElement.widthPx} onChange={(e) => { const s = parseInt(e.target.value) || DEFAULT_QR_SIZE_PX; updateElement(selectedElement.id, { widthPx: s, heightPx: s });}} className="text-xs h-8 mt-1" />
                            </div>
                             {/* QR Alignment might not be needed if positioned manually */}
                            {/* <div>
                                <Label htmlFor={`qrAlign-${selectedElement.id}`} className="text-xs">Alinhar</Label>
                                <Select value={selectedElement.textAlign || 'center'} onValueChange={(v: 'left' | 'center' | 'right') => updateElement(selectedElement.id, { textAlign: v })}>
                                    <SelectTrigger className="text-xs h-8 mt-1"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="left">Esquerda</SelectItem>
                                        <SelectItem value="center">Centro</SelectItem>
                                        <SelectItem value="right">Direita</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div> */}
                        </div>
                    )}
                    {selectedElement.type === 'logo' && (
                        <div className="space-y-2">
                            <div>
                                <Label htmlFor={`logoUpload-${selectedElement.id}`} className="text-xs">Arquivo (PNG, JPG)</Label>
                                <Input id={`logoUpload-${selectedElement.id}`} type="file" accept="image/png, image/jpeg" onChange={handleLogoChange} ref={logoInputRef} className="text-xs h-8 mt-1" />
                            </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label htmlFor={`logoWidth-${selectedElement.id}`} className="text-xs">Largura (px)</Label>
                                <Input id={`logoWidth-${selectedElement.id}`} type="number" value={selectedElement.widthPx} onChange={(e) => updateElement(selectedElement.id, { widthPx: parseInt(e.target.value) || DEFAULT_LOGO_WIDTH_PX })} className="text-xs h-8 mt-1" />
                            </div>
                            <div>
                                <Label htmlFor={`logoHeight-${selectedElement.id}`} className="text-xs">Altura (px)</Label>
                                <Input id={`logoHeight-${selectedElement.id}`} type="number" value={selectedElement.heightPx} onChange={(e) => updateElement(selectedElement.id, { heightPx: parseInt(e.target.value) || DEFAULT_LOGO_HEIGHT_PX })} className="text-xs h-8 mt-1" />
                            </div>
                        </div>
                        {/* Logo Alignment might not be needed if positioned manually */}
                        {/* <div>
                                <Label htmlFor={`logoAlign-${selectedElement.id}`} className="text-xs">Alinhar</Label>
                                <Select value={selectedElement.textAlign || 'center'} onValueChange={(v: 'left' | 'center' | 'right') => updateElement(selectedElement.id, { textAlign: v })}>
                                    <SelectTrigger className="text-xs h-8 mt-1"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="left">Esquerda</SelectItem>
                                        <SelectItem value="center">Centro</SelectItem>
                                        <SelectItem value="right">Direita</SelectItem>
                                    </SelectContent>
                                </Select>
                        </div> */}
                        </div>
                    )}
                    </div>
                </Card>
                ) : (
                <p className="text-xs text-muted-foreground text-center py-4">Selecione um elemento na pré-visualização para editar suas propriedades ou adicione novos elementos.</p>
                )}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-auto pt-4 border-t flex flex-col sm:flex-row sm:justify-between gap-2 flex-shrink-0">
             {/* Button to trigger PDF generation */}
             <Button variant="secondary" onClick={handleGenerateClick} disabled={elements.length === 0}>
                 <Printer className="mr-2 h-4 w-4" /> Gerar PDF ({selectedAssetsData.length})
             </Button>
            <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}> Cancelar </Button>
                 {/* Explicit Save button */}
                 <Button variant="outline" onClick={handleSaveChanges}>
                     <Save className="mr-2 h-4 w-4" /> Salvar Layout
                 </Button>
                <Button onClick={handleSaveAndClose}>Aplicar e Fechar</Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


// Helper components for Popover and Command (shadcn/ui structure)
const Command = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
    <CommandPrimitive
        ref={ref}
        className={cn("flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground", className)}
        {...props} />
));
Command.displayName = CommandPrimitive.displayName || 'Command';

const CommandInput = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.Input>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
    <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <CommandPrimitive.Input
            ref={ref}
            className={cn("flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50", className)}
            {...props} />
    </div>
));
CommandInput.displayName = CommandPrimitive.Input.displayName || 'CommandInput';

const CommandGroup = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.Group>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
    <CommandPrimitive.Group
        ref={ref}
        className={cn("overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground", className)}
        {...props} />
));
CommandGroup.displayName = CommandPrimitive.Group.displayName || 'CommandGroup';

const CommandItem = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
    <CommandPrimitive.Item
        ref={ref}
        className={cn("relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled='true']:pointer-events-none data-[disabled='true']:opacity-50", className)}
        {...props} />
));
CommandItem.displayName = CommandPrimitive.Item.displayName || 'CommandItem';

const CommandEmpty = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.Empty>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
    <CommandPrimitive.Empty ref={ref} className="py-6 text-center text-sm" {...props} />
));
CommandEmpty.displayName = CommandPrimitive.Empty.displayName || 'CommandEmpty';

    