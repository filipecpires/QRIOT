
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ImageIcon, Trash2 } from 'lucide-react'; // For logo placeholder
import { Separator } from '../ui/separator';

interface AssetForLabel {
    id: string;
    name: string;
    tag: string;
    category: string;
    location: string;
}

interface LabelPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: AssetForLabel;
  labelConfig: LabelConfig;
  qrSize: number; // This is the initial QR size from parent
  qrValue: string;
  // onSave: (newConfig: LabelLayoutSettings) => void; // Optional: For saving settings
}

// Optional: Define a type for editable settings to be saved
export interface LabelLayoutSettings {
    includeName: boolean;
    includeTag: boolean;
    customText: string;
    qrSizeMm: number;
    nameFontSizePt: number;
    tagFontSizePt: number;
    customTextFontSizePt: number;
    textAlignment: 'left' | 'center' | 'right';
    qrPosition: 'left' | 'right' | 'center';
    includeLogo: boolean;
    companyLogoDataUrl: string | null;
    logoHeightMm: number;
    logoPosition: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center';
}


export function LabelPreviewModal({
  isOpen,
  onClose,
  asset,
  labelConfig,
  qrSize: initialQrSizeMm,
  qrValue,
}: LabelPreviewModalProps) {
  // General Content
  const [includeName, setIncludeName] = useState(true);
  const [includeTag, setIncludeTag] = useState(true);
  const [customText, setCustomText] = useState('');

  // QR Code
  const [currentQrSizeMm, setCurrentQrSizeMm] = useState(initialQrSizeMm);
  const [qrPosition, setQrPosition] = useState<'left' | 'right' | 'center'>('left');

  // Text Styling
  const [nameFontSizePt, setNameFontSizePt] = useState(7);
  const [tagFontSizePt, setTagFontSizePt] = useState(6);
  const [customTextFontSizePt, setCustomTextFontSizePt] = useState(6);
  const [textAlignment, setTextAlignment] = useState<'left' | 'center' | 'right'>('left');

  // Logo
  const [includeLogo, setIncludeLogo] = useState(false);
  const [companyLogoDataUrl, setCompanyLogoDataUrl] = useState<string | null>(null);
  const [logoHeightMm, setLogoHeightMm] = useState(5); // Default logo height 5mm
  const [logoPosition, setLogoPosition] = useState<'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center'>('top-right');
  const logoInputRef = useRef<HTMLInputElement>(null);
  const logoImageRef = useRef<HTMLImageElement>(null); // Ref for the actual image element to get its dimensions

  const [actualLogoWidthPx, setActualLogoWidthPx] = useState(0);
  const [actualLogoHeightPx, setActualLogoHeightPx] = useState(0);


  const scale = 3.78; // Approx pixels per mm (for 96 DPI display simulation)
  const labelW_mm = labelConfig.width;
  const labelH_mm = labelConfig.height;
  const labelW_px = labelW_mm * scale;
  const labelH_px = labelH_mm * scale;
  
  const currentQrSize_px = Math.min(currentQrSizeMm * scale, labelH_px * 0.95, labelW_px * 0.95); // QR size in pixels

  useEffect(() => {
    if (companyLogoDataUrl && logoImageRef.current) {
        const img = logoImageRef.current;
        const desiredHeightPx = logoHeightMm * scale;
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        setActualLogoHeightPx(desiredHeightPx);
        setActualLogoWidthPx(desiredHeightPx * aspectRatio);
    } else {
        setActualLogoHeightPx(0);
        setActualLogoWidthPx(0);
    }
  }, [companyLogoDataUrl, logoHeightMm, scale]);


  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setCompanyLogoDataUrl(reader.result as string);
            setIncludeLogo(true); 
        };
        reader.readAsDataURL(file);
    } else {
        setCompanyLogoDataUrl(null);
    }
  };

  const handleRemoveLogo = () => {
    setCompanyLogoDataUrl(null);
    setIncludeLogo(false);
    if (logoInputRef.current) {
        logoInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    const currentLayoutSettings: LabelLayoutSettings = {
        includeName,
        includeTag,
        customText,
        qrSizeMm: currentQrSizeMm,
        nameFontSizePt,
        tagFontSizePt,
        customTextFontSizePt,
        textAlignment,
        qrPosition,
        includeLogo,
        companyLogoDataUrl,
        logoHeightMm,
        logoPosition,
    };
    console.log("Saving label layout settings (simulated):", currentLayoutSettings);
    // TODO: Implement saving these settings (e.g., to localStorage or pass to parent for global state)
    onClose();
  };

  // --- Preview Layout Logic ---
  // Simplified, assumes elements flow and might overlap without complex collision detection
  const padding = 1 * scale; // 1mm padding
  let qrX = padding;
  let qrY = padding;
  let textX = padding;
  let textY = padding;
  let textBlockWidth = labelW_px - 2 * padding;
  let logoX = padding;
  let logoY = padding;

  const logoSpaceWidth = includeLogo && companyLogoDataUrl ? actualLogoWidthPx + padding : 0;
  const logoSpaceHeight = includeLogo && companyLogoDataUrl ? actualLogoHeightPx + padding : 0;

  // Logo Positioning
  if (includeLogo && companyLogoDataUrl) {
    switch (logoPosition) {
        case 'top-left': logoX = padding; logoY = padding; break;
        case 'top-right': logoX = labelW_px - actualLogoWidthPx - padding; logoY = padding; break;
        case 'top-center': logoX = (labelW_px - actualLogoWidthPx) / 2; logoY = padding; break;
        case 'bottom-left': logoX = padding; logoY = labelH_px - actualLogoHeightPx - padding; break;
        case 'bottom-right': logoX = labelW_px - actualLogoWidthPx - padding; logoY = labelH_px - actualLogoHeightPx - padding; break;
        case 'bottom-center': logoX = (labelW_px - actualLogoWidthPx) / 2; logoY = labelH_px - actualLogoHeightPx - padding; break;
    }
  }
  
  // QR Code Positioning (relative to logo or edges)
  switch (qrPosition) {
    case 'left':
      qrX = padding;
      // If logo is top-left, position QR below it, otherwise align top
      qrY = (includeLogo && (logoPosition === 'top-left' || logoPosition === 'top-center')) ? logoY + logoSpaceHeight : padding;
      textX = qrX + currentQrSize_px + padding;
      textY = qrY; // Align text top with QR generally
      textBlockWidth = labelW_px - textX - padding;
      break;
    case 'right':
      qrX = labelW_px - currentQrSize_px - padding;
      qrY = (includeLogo && (logoPosition === 'top-right' || logoPosition === 'top-center')) ? logoY + logoSpaceHeight : padding;
      textX = padding;
      textY = qrY;
      textBlockWidth = qrX - textX - padding;
      break;
    case 'center': // QR centered, text usually below
      qrX = (labelW_px - currentQrSize_px) / 2;
      qrY = (includeLogo && (logoPosition === 'top-left' || logoPosition === 'top-center' || logoPosition === 'top-right')) ? logoY + logoSpaceHeight : padding;
      textX = padding;
      textY = qrY + currentQrSize_px + padding;
      textBlockWidth = labelW_px - 2 * padding;
      break;
  }
  // Ensure QR is not placed over a bottom-aligned logo if QR is also somewhat bottom
  if (includeLogo && (logoPosition.startsWith('bottom-')) && (qrY + currentQrSize_px > logoY)) {
    qrY = Math.max(padding, logoY - currentQrSize_px - padding);
  }
   // Ensure text is not placed over a bottom-aligned logo
  if (includeLogo && (logoPosition.startsWith('bottom-')) && (textY + (nameFontSizePt * scale / 2) > logoY)) { // Approximate text height
    textY = Math.max(padding, logoY - (nameFontSizePt * scale / 2) - padding);
  }


  // --- End Preview Layout Logic ---

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl md:max-w-5xl lg:max-w-6xl"> {/* Wider dialog */}
        <DialogHeader>
          <DialogTitle>Editar Layout da Etiqueta</DialogTitle>
          <DialogDescription>
            Personalize os elementos da etiqueta para "{asset.name}" ({asset.tag}).
            As dimensões da etiqueta são {labelConfig.width}mm x {labelConfig.height}mm.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4 max-h-[75vh] ">
          {/* Left Side: Preview Area (takes 2/3 on large screens) */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center p-4 border rounded-md bg-gray-100 dark:bg-gray-800 overflow-auto">
              <Label className="mb-2 text-sm font-medium text-center">Pré-visualização da Etiqueta</Label>
               <div className="flex justify-center items-center my-2 w-full h-full">
                  <div
                    style={{
                      width: `${labelW_px}px`,
                      height: `${labelH_px}px`,
                      position: 'relative',
                      overflow: 'hidden',
                      fontFamily: 'Arial, sans-serif', // Generic font for preview
                      backgroundColor: 'white',
                      border: '1px dashed #999',
                      boxShadow: '0 0 5px rgba(0,0,0,0.1)',
                    }}
                  >
                    {/* Hidden image for aspect ratio calculation */}
                    {companyLogoDataUrl && <img ref={logoImageRef} src={companyLogoDataUrl} alt="logo loaded" style={{position: 'absolute', opacity: 0, pointerEvents: 'none'}}/> }

                    {/* Logo */}
                    {includeLogo && companyLogoDataUrl && actualLogoWidthPx > 0 && actualLogoHeightPx > 0 && (
                        <div style={{
                            position: 'absolute',
                            left: `${logoX}px`,
                            top: `${logoY}px`,
                            width: `${actualLogoWidthPx}px`,
                            height: `${actualLogoHeightPx}px`,
                        }}>
                            <img src={companyLogoDataUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                    )}

                    {/* QR Code */}
                    <div
                      style={{
                        position: 'absolute',
                        left: `${qrX}px`,
                        top: `${qrY}px`,
                      }}
                    >
                      <QRCodeStyling
                        value={qrValue || asset.tag}
                        size={currentQrSize_px}
                        level={"H"}
                        includeMargin={false} // Margin handled by padding constants
                      />
                    </div>

                    {/* Text Content Block */}
                    <div
                      style={{
                        position: 'absolute',
                        left: `${textX}px`,
                        top: `${textY}px`,
                        width: `${textBlockWidth}px`,
                        maxHeight: `${labelH_px - textY - padding}px`, // Ensure text fits
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start', // Align items to top
                        lineHeight: '1.1', // Tighter line height
                        color: 'black',
                        textAlign: textAlignment,
                        overflow: 'hidden',
                      }}
                    >
                         {includeName && (
                           <div
                             style={{
                               fontWeight: 'bold',
                               fontSize: `${nameFontSizePt * 0.8 * scale / 3.78}px`, // Adjusted scaling for pt
                               marginBottom: '0.5mm',
                               wordBreak: 'break-word',
                             }}
                           >
                             {asset.name}
                           </div>
                         )}
                         {customText && (
                           <div
                             style={{
                               fontSize: `${customTextFontSizePt * 0.8 * scale / 3.78}px`,
                               marginBottom: '0.5mm',
                               wordBreak: 'break-word',
                             }}
                           >
                             {customText}
                           </div>
                         )}
                       {includeTag && (
                         <div
                           style={{
                             fontSize: `${tagFontSizePt * 0.8 * scale / 3.78}px`,
                             marginTop: 'auto', // Pushes tag to bottom if other elements allow
                             paddingTop: '0.5mm', // Space before tag if it's at bottom
                             wordBreak: 'break-word',
                           }}
                         >
                           TAG: {asset.tag}
                         </div>
                       )}
                    </div>
                  </div>
                </div>
            </div>

            {/* Right Side: Editor Controls (takes 1/3 on large screens) */}
            <div className="space-y-4 overflow-y-auto pr-2 lg:max-h-[calc(75vh-3rem)]"> {/* Adjust max height */}
                {/* General Content Section */}
                <div className="space-y-3 border p-3 rounded-md bg-muted/30">
                    <Label className="text-sm font-semibold">Conteúdo Geral</Label>
                     <div className="flex items-center space-x-2">
                        <Checkbox id="includeName" checked={includeName} onCheckedChange={(checked) => setIncludeName(!!checked)} />
                         <Label htmlFor="includeName" className="text-xs font-normal">Nome do Ativo</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="includeTag" checked={includeTag} onCheckedChange={(checked) => setIncludeTag(!!checked)} />
                         <Label htmlFor="includeTag" className="text-xs font-normal">TAG do Ativo</Label>
                    </div>
                    <div>
                        <Label htmlFor="customText" className="text-xs font-normal">Texto Adicional</Label>
                        <Input id="customText" value={customText} onChange={(e) => setCustomText(e.target.value)} placeholder="Ex: Depto. TI" className="text-xs h-8 mt-1" />
                    </div>
                </div>
                <Separator />
                {/* QR Code Settings Section */}
                <div className="space-y-3 border p-3 rounded-md bg-muted/30">
                    <Label className="text-sm font-semibold">QR Code</Label>
                    <div>
                        <Label htmlFor="qrSizeEdit" className="text-xs font-normal">Tamanho (mm) [{currentQrSizeMm}]</Label>
                         <Slider id="qrSizeEdit" min={5} max={Math.min(50, labelW_mm * 0.9, labelH_mm * 0.9)} step={1} value={[currentQrSizeMm]} onValueChange={(value) => setCurrentQrSizeMm(value[0])} className="my-1" />
                    </div>
                    <div>
                        <Label htmlFor="qrPosition" className="text-xs font-normal">Posição</Label>
                        <Select value={qrPosition} onValueChange={(v: 'left' | 'right' | 'center') => setQrPosition(v)}>
                            <SelectTrigger id="qrPosition" className="text-xs h-8 mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="left">Esquerda</SelectItem>
                                <SelectItem value="right">Direita</SelectItem>
                                <SelectItem value="center">Centralizado (Texto abaixo)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Separator />
                {/* Text Styling Section */}
                <div className="space-y-3 border p-3 rounded-md bg-muted/30">
                    <Label className="text-sm font-semibold">Estilo do Texto</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                             <Label htmlFor="nameFontSize" className="text-xs font-normal">Nome [{nameFontSizePt}pt]</Label>
                             <Slider id="nameFontSize" min={4} max={12} step={0.5} value={[nameFontSizePt]} onValueChange={v => setNameFontSizePt(v[0])} className="my-1" />
                        </div>
                         <div>
                             <Label htmlFor="tagFontSize" className="text-xs font-normal">TAG [{tagFontSizePt}pt]</Label>
                            <Slider id="tagFontSize" min={4} max={10} step={0.5} value={[tagFontSizePt]} onValueChange={v => setTagFontSizePt(v[0])} className="my-1"/>
                        </div>
                        <div>
                            <Label htmlFor="customTextFontSize" className="text-xs font-normal">Adicional [{customTextFontSizePt}pt]</Label>
                            <Slider id="customTextFontSize" min={4} max={10} step={0.5} value={[customTextFontSizePt]} onValueChange={v => setCustomTextFontSizePt(v[0])} className="my-1"/>
                        </div>
                     </div>
                    <div>
                        <Label htmlFor="textAlignment" className="text-xs font-normal">Alinhamento Geral</Label>
                        <Select value={textAlignment} onValueChange={(v: 'left' | 'center' | 'right') => setTextAlignment(v)}>
                            <SelectTrigger id="textAlignment" className="text-xs h-8 mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="left">Esquerda</SelectItem>
                                <SelectItem value="center">Centro</SelectItem>
                                <SelectItem value="right">Direita</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Separator />
                {/* Logo Options Section */}
                <div className="space-y-3 border p-3 rounded-md bg-muted/30">
                    <Label className="text-sm font-semibold">Logo da Empresa</Label>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="includeLogo" checked={includeLogo} onCheckedChange={(checked) => setIncludeLogo(!!checked)} />
                        <Label htmlFor="includeLogo" className="text-xs font-normal">Incluir Logo</Label>
                    </div>
                    {includeLogo && (
                        <>
                            <div className="space-y-1">
                                <Label htmlFor="companyLogoUpload" className="text-xs font-normal">Arquivo (PNG, JPG, SVG)</Label>
                                <div className="flex items-center gap-2">
                                    <Input id="companyLogoUpload" type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={handleLogoChange} ref={logoInputRef} className="text-xs h-8 flex-grow" />
                                    {companyLogoDataUrl && (
                                        <Button variant="ghost" size="icon" onClick={handleRemoveLogo} className="h-8 w-8">
                                            <Trash2 className="h-4 w-4 text-destructive"/>
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="logoHeightMm" className="text-xs font-normal">Altura do Logo (mm) [{logoHeightMm}]</Label>
                                <Slider id="logoHeightMm" min={2} max={Math.min(20, labelH_mm * 0.5)} step={0.5} value={[logoHeightMm]} onValueChange={(value) => setLogoHeightMm(value[0])} className="my-1" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="logoPosition" className="text-xs font-normal">Posição do Logo</Label>
                                <Select value={logoPosition} onValueChange={(v: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center') => setLogoPosition(v)}>
                                    <SelectTrigger id="logoPosition" className="text-xs h-8 mt-1"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="top-left">Superior Esquerda</SelectItem>
                                        <SelectItem value="top-right">Superior Direita</SelectItem>
                                        <SelectItem value="top-center">Superior Centro</SelectItem>
                                        <SelectItem value="bottom-left">Inferior Esquerda</SelectItem>
                                        <SelectItem value="bottom-right">Inferior Direita</SelectItem>
                                        <SelectItem value="bottom-center">Inferior Centro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
           <Button onClick={handleSave}>Aplicar e Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    