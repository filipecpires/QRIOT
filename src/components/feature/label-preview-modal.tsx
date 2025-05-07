
'use client';

import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
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
import type { LabelConfig } from '@/app/(admin)/labels/print/page';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea'; // For custom text
import { ImageIcon, Trash2, ArrowDown, ArrowUp } from 'lucide-react';
import { Separator } from '../ui/separator';
import { cn } from '@/lib/utils';

interface AssetForLabel {
    id: string;
    name: string;
    tag: string;
    category: string; // Kept for potential future use in suggestions
    location: string; // Kept for potential future use in suggestions
}

// Define the structure for individual elements on the label
export interface LabelElementConfig {
    id: string; // e.g., 'assetName', 'assetTag', 'qrCode', 'logo', 'customText1'
    type: 'text' | 'qr' | 'logo' | 'custom';
    content: string; // For text elements (asset name, tag, custom text) or QR value
    dataUrl?: string; // For logo image
    fontSizePx: number; // For text elements
    widthPx: number; // For QR and Logo
    heightPx: number; // For Logo (QR is square)
    visible: boolean;
    fontFamily?: string; // Default to Arial or system font
    textAlign?: 'left' | 'center' | 'right';
}

interface LabelPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: AssetForLabel;
  labelConfig: LabelConfig;
  initialQrSizeMm: number; // Keep for initial default QR size calculation
  qrValue: string;
  onSave: (elements: LabelElementConfig[]) => void;
}

const DEFAULT_FONT_SIZE_PX = 12; // Approx 9pt
const DEFAULT_QR_SIZE_PX = 60;   // Approx 16mm at 96dpi
const DEFAULT_LOGO_HEIGHT_PX = 40; // Approx 10mm

export function LabelPreviewModal({
  isOpen,
  onClose,
  asset,
  labelConfig,
  initialQrSizeMm,
  qrValue,
  onSave,
}: LabelPreviewModalProps) {
  const scale = 3.78; // Approx pixels per mm (for 96 DPI display simulation)
  const defaultQrSizePx = Math.min(DEFAULT_QR_SIZE_PX, Math.floor(initialQrSizeMm * scale));

  const initialElements: LabelElementConfig[] = [
    { id: 'logo', type: 'logo', content: 'Company Logo', dataUrl: undefined, widthPx: Math.floor(15 * scale), heightPx: DEFAULT_LOGO_HEIGHT_PX, visible: false, fontSizePx: 0, textAlign: 'center' },
    { id: 'assetName', type: 'text', content: asset.name, fontSizePx: DEFAULT_FONT_SIZE_PX + 2, visible: true, widthPx: 0, heightPx: 0, textAlign: 'center', fontFamily: 'Arial, sans-serif' },
    { id: 'assetTag', type: 'text', content: `TAG: ${asset.tag}`, fontSizePx: DEFAULT_FONT_SIZE_PX - 2, visible: true, widthPx: 0, heightPx: 0, textAlign: 'center', fontFamily: 'Arial, sans-serif' },
    { id: 'customText1', type: 'custom', content: '', fontSizePx: DEFAULT_FONT_SIZE_PX - 2, visible: false, widthPx: 0, heightPx: 0, textAlign: 'center', fontFamily: 'Arial, sans-serif' },
    { id: 'qrCode', type: 'qr', content: qrValue, widthPx: defaultQrSizePx, heightPx: defaultQrSizePx, visible: true, fontSizePx: 0, textAlign: 'center' },
  ];

  const [elements, setElements] = useState<LabelElementConfig[]>(initialElements);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Reset elements when asset or modal visibility changes (if needed, or on save)
  useEffect(() => {
    // Re-initialize elements if asset changes, preserving some user changes might be complex
    const defaultQrSizePx = Math.min(DEFAULT_QR_SIZE_PX, Math.floor(initialQrSizeMm * scale));
    setElements([
        { id: 'logo', type: 'logo', content: 'Company Logo', dataUrl: elements.find(e=>e.id === 'logo')?.dataUrl, widthPx: elements.find(e=>e.id === 'logo')?.widthPx || Math.floor(15*scale), heightPx: elements.find(e=>e.id === 'logo')?.heightPx || DEFAULT_LOGO_HEIGHT_PX, visible: elements.find(e=>e.id === 'logo')?.visible || false, fontSizePx: 0, textAlign: 'center' },
        { id: 'assetName', type: 'text', content: asset.name, fontSizePx: DEFAULT_FONT_SIZE_PX + 2, visible: true, widthPx: 0, heightPx: 0, textAlign: 'center', fontFamily: 'Arial, sans-serif' },
        { id: 'assetTag', type: 'text', content: `TAG: ${asset.tag}`, fontSizePx: DEFAULT_FONT_SIZE_PX - 2, visible: true, widthPx: 0, heightPx: 0, textAlign: 'center', fontFamily: 'Arial, sans-serif' },
        { id: 'customText1', type: 'custom', content: '', fontSizePx: DEFAULT_FONT_SIZE_PX - 2, visible: false, widthPx: 0, heightPx: 0, textAlign: 'center', fontFamily: 'Arial, sans-serif' },
        { id: 'qrCode', type: 'qr', content: qrValue, widthPx: defaultQrSizePx, heightPx: defaultQrSizePx, visible: true, fontSizePx: 0, textAlign: 'center' },
    ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset, isOpen, initialQrSizeMm, qrValue]); // Assuming elements are reset when modal reopens for a new asset or config

  const updateElement = (id: string, updates: Partial<LabelElementConfig>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            updateElement('logo', { dataUrl: reader.result as string, visible: true });
        };
        reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    updateElement('logo', { dataUrl: undefined, visible: false });
    if (logoInputRef.current) {
        logoInputRef.current.value = '';
    }
  };

  const handleSaveAndClose = () => {
    onSave(elements); // Pass the current state of elements back
    onClose();
  };

  const moveElement = (index: number, direction: 'up' | 'down') => {
    const newElements = [...elements];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newElements.length) return;
    [newElements[index], newElements[targetIndex]] = [newElements[targetIndex], newElements[index]];
    setElements(newElements);
  };

  const labelW_mm = labelConfig.width;
  const labelH_mm = labelConfig.height;
  const labelW_px = labelW_mm * scale;
  const labelH_px = labelH_mm * scale;
  const mainPaddingMm = 1;
  const mainPaddingPx = mainPaddingMm * scale;
  const contentWidthPx = labelW_px - 2 * mainPaddingPx;
  const contentHeightPx = labelH_px - 2 * mainPaddingPx;


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl md:max-w-5xl lg:max-w-6xl">
        <DialogHeader>
          <DialogTitle>Editar Layout da Etiqueta</DialogTitle>
          <DialogDescription>
            Personalize os elementos da etiqueta para "{asset.name}" ({asset.tag}).
            Dimensões da etiqueta: {labelConfig.width.toFixed(1)}mm x {labelConfig.height.toFixed(1)}mm.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4 max-h-[75vh]">
          {/* Preview Area */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center p-4 border rounded-md bg-gray-100 dark:bg-gray-800 overflow-auto">
            <Label className="mb-2 text-sm font-medium text-center">Pré-visualização da Etiqueta</Label>
            <div
              style={{
                width: `${labelW_px}px`,
                height: `${labelH_px}px`,
                backgroundColor: 'white',
                border: '1px dashed #999',
                padding: `${mainPaddingPx}px`,
                boxSizing: 'border-box',
                overflow: 'hidden', // Clip content outside label boundaries
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center', // Default center alignment for stacked items
              }}
            >
              {elements.filter(el => el.visible).map(el => (
                <div key={el.id} style={{ 
                    textAlign: el.textAlign, 
                    width: '100%',
                    marginBottom: `${0.5 * scale}px` // Small gap between elements
                    }}
                    className="flex-shrink-0" // Prevent items from shrinking if content overflows
                >
                  {el.type === 'text' && el.content && (
                    <span style={{ fontSize: `${el.fontSizePx}px`, fontFamily: el.fontFamily || 'Arial, sans-serif', color: 'black', wordBreak: 'break-word' }}>
                      {el.content}
                    </span>
                  )}
                  {el.type === 'custom' && el.content && (
                     <span style={{ fontSize: `${el.fontSizePx}px`, fontFamily: el.fontFamily || 'Arial, sans-serif', color: 'black', wordBreak: 'break-word' }}>
                      {el.content}
                    </span>
                  )}
                  {el.type === 'qr' && el.content && (
                    <div className="flex justify-center"> {/* Center QR code if textAlign is center for QR */}
                        <QRCodeStyling value={el.content} size={Math.min(el.widthPx, contentWidthPx, contentHeightPx * 0.9)} level="H" includeMargin={false} />
                    </div>
                  )}
                  {el.type === 'logo' && el.dataUrl && (
                    <div className="flex justify-center"> {/* Center logo */}
                        <img src={el.dataUrl} alt="Logo" style={{ 
                            height: `${Math.min(el.heightPx, contentHeightPx * 0.8)}px`, 
                            maxWidth: `${Math.min(el.widthPx, contentWidthPx)}px`,
                            objectFit: 'contain' 
                            }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Controls Area */}
          <div className="space-y-3 overflow-y-auto pr-2 lg:max-h-[calc(75vh-3rem)]">
            <Label className="text-base font-semibold">Configurar Elementos</Label>
            {elements.map((el, index) => (
              <Card key={el.id} className="p-3">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                        id={`visible-${el.id}`}
                        checked={el.visible}
                        onCheckedChange={(checked) => updateElement(el.id, { visible: !!checked })}
                    />
                    <Label htmlFor={`visible-${el.id}`} className="text-sm font-medium">
                      {el.type === 'text' && el.id === 'assetName' ? 'Nome do Ativo' :
                       el.type === 'text' && el.id === 'assetTag' ? 'TAG do Ativo' :
                       el.type === 'custom' ? 'Texto Personalizado' :
                       el.type === 'qr' ? 'QR Code' :
                       el.type === 'logo' ? 'Logo da Empresa' : 'Elemento'}
                    </Label>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => moveElement(index, 'up')} disabled={index === 0} className="h-6 w-6">
                        <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => moveElement(index, 'down')} disabled={index === elements.length - 1} className="h-6 w-6">
                        <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {el.visible && (
                  <div className="space-y-2 pl-6">
                    {(el.type === 'text' || el.type === 'custom') && (
                      <>
                        {el.type === 'custom' && (
                           <Textarea
                            value={el.content}
                            onChange={(e) => updateElement(el.id, { content: e.target.value })}
                            placeholder="Digite seu texto"
                            className="text-xs h-16"
                          />
                        )}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label htmlFor={`fontSize-${el.id}`} className="text-xs">Fonte (px)</Label>
                                <Input
                                    id={`fontSize-${el.id}`}
                                    type="number"
                                    value={el.fontSizePx}
                                    onChange={(e) => updateElement(el.id, { fontSizePx: parseInt(e.target.value, 10) || DEFAULT_FONT_SIZE_PX })}
                                    className="text-xs h-8 mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor={`textAlign-${el.id}`} className="text-xs">Alinhar Texto</Label>
                                <Select value={el.textAlign || 'left'} onValueChange={(v: 'left' | 'center' | 'right') => updateElement(el.id, { textAlign: v })}>
                                    <SelectTrigger className="text-xs h-8 mt-1"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="left">Esquerda</SelectItem>
                                        <SelectItem value="center">Centro</SelectItem>
                                        <SelectItem value="right">Direita</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                      </>
                    )}
                    {el.type === 'qr' && (
                      <div>
                        <Label htmlFor={`qrSize-${el.id}`} className="text-xs">Tam. QR (px)</Label>
                        <Input
                          id={`qrSize-${el.id}`}
                          type="number"
                          value={el.widthPx} // QR is square, use widthPx
                          onChange={(e) => {
                            const size = parseInt(e.target.value, 10) || DEFAULT_QR_SIZE_PX;
                            updateElement(el.id, { widthPx: size, heightPx: size });
                          }}
                          className="text-xs h-8 mt-1"
                        />
                      </div>
                    )}
                    {el.type === 'logo' && (
                      <div className="space-y-2">
                        <div>
                            <Label htmlFor={`logoUpload-${el.id}`} className="text-xs">Arquivo (PNG, JPG)</Label>
                            <div className="flex items-center gap-2 mt-1">
                                <Input id={`logoUpload-${el.id}`} type="file" accept="image/png, image/jpeg" onChange={handleLogoChange} ref={logoInputRef} className="text-xs h-8 flex-grow" />
                                {el.dataUrl && (
                                    <Button variant="ghost" size="icon" onClick={handleRemoveLogo} className="h-8 w-8">
                                        <Trash2 className="h-4 w-4 text-destructive"/>
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label htmlFor={`logoHeight-${el.id}`} className="text-xs">Altura (px)</Label>
                                <Input
                                id={`logoHeight-${el.id}`}
                                type="number"
                                value={el.heightPx}
                                onChange={(e) => updateElement(el.id, { heightPx: parseInt(e.target.value, 10) || DEFAULT_LOGO_HEIGHT_PX })}
                                className="text-xs h-8 mt-1"
                                />
                            </div>
                             <div>
                                <Label htmlFor={`logoWidth-${el.id}`} className="text-xs">Largura (px)</Label>
                                <Input
                                id={`logoWidth-${el.id}`}
                                type="number"
                                value={el.widthPx}
                                onChange={(e) => updateElement(el.id, { widthPx: parseInt(e.target.value, 10) || Math.floor(15 * scale) })}
                                className="text-xs h-8 mt-1"
                                />
                            </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}> Cancelar </Button>
          <Button onClick={handleSaveAndClose}>Aplicar e Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
