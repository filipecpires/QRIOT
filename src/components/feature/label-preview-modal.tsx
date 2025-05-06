
'use client';

import React, { useState, useRef, ChangeEvent } from 'react'; // Added useRef, ChangeEvent
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
import { ImageIcon } from 'lucide-react'; // For logo placeholder

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
  // onSave: (newConfig: LabelEditConfig) => void; // Optional: For saving settings
}

// Optional: Define a type for editable settings to be saved
export interface LabelLayoutSettings {
    includeName: boolean;
    includeTag: boolean;
    customText: string;
    qrSize: number;
    nameFontSize: number;
    tagFontSize: number;
    customTextFontSize: number;
    textAlignment: 'left' | 'center' | 'right';
    qrPosition: 'left' | 'right' | 'center';
    includeLogo: boolean;
    companyLogo: string | null;
    logoSizeRatio: number; // Ratio of label height
    logoPosition: 'top-left' | 'top-right' | 'top-center';
}


export function LabelPreviewModal({
  isOpen,
  onClose,
  asset,
  labelConfig,
  qrSize: initialQrSize, // Rename prop to avoid conflict with state
  qrValue,
}: LabelPreviewModalProps) {
  const [includeName, setIncludeName] = useState(true);
  const [includeTag, setIncludeTag] = useState(true);
  const [customText, setCustomText] = useState('');
  const [currentQrSize, setCurrentQrSize] = useState(initialQrSize);
  const [nameFontSize, setNameFontSize] = useState(7);
  const [tagFontSize, setTagFontSize] = useState(6);
  const [customTextFontSize, setCustomTextFontSize] = useState(6);
  const [textAlignment, setTextAlignment] = useState<'left' | 'center' | 'right'>('left');
  const [qrPosition, setQrPosition] = useState<'left' | 'right' | 'center'>('left');

  // New states for logo
  const [includeLogo, setIncludeLogo] = useState(false);
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [logoSizeRatio, setLogoSizeRatio] = useState(0.2); // Logo height as 20% of label height
  const [logoPosition, setLogoPosition] = useState<'top-left' | 'top-right' | 'top-center'>('top-right');
  const logoInputRef = useRef<HTMLInputElement>(null);


  const labelW_mm = labelConfig.width;
  const labelH_mm = labelConfig.height;
  const scale = 3.78; // Approx pixels per mm (for 96 DPI)

  const labelW_px = labelW_mm * scale;
  const labelH_px = labelH_mm * scale;
  
  // QR Code dimensions
  const actualQrSize_px = Math.min(currentQrSize * scale, labelH_px * 0.9, labelW_px * 0.9);

  // Logo dimensions
  const actualLogoSize_px = labelH_px * logoSizeRatio;


  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setCompanyLogo(reader.result as string);
            setIncludeLogo(true); // Automatically check include when logo is selected
        };
        reader.readAsDataURL(file);
    } else {
        setCompanyLogo(null);
        // setIncludeLogo(false); // Optional: uncheck if file is cleared
    }
  };

  const handleSave = () => {
    const currentLayoutSettings: LabelLayoutSettings = {
        includeName,
        includeTag,
        customText,
        qrSize: currentQrSize,
        nameFontSize,
        tagFontSize,
        customTextFontSize,
        textAlignment,
        qrPosition,
        includeLogo,
        companyLogo,
        logoSizeRatio,
        logoPosition,
    };
    // TODO: Implement saving these settings, e.g., to localStorage or pass to parent
    console.log("Saving label layout settings (not implemented yet):", currentLayoutSettings);
    onClose();
  };

  // --- Simplified Preview Layout Logic ---
  // This is a basic representation. Complex layouts would require a more robust rendering approach.
  let qrX_preview = 2 * scale;
  let textX_preview = qrX_preview + actualQrSize_px + 2 * scale;
  let textWidth_preview = labelW_px - textX_preview - (2 * scale);
  let qrY_preview = (labelH_px - actualQrSize_px) / 2;
  let textY_preview = 3 * scale;
  let logoX_preview = 0;
  let logoY_preview = 2 * scale;


  if (qrPosition === 'right') {
    textX_preview = 2 * scale;
    qrX_preview = textX_preview + textWidth_preview + 2 * scale; // Text width needs to be defined first or QR X
    // This is tricky, let's assume text takes up to a certain point if QR is right
    textWidth_preview = labelW_px * 0.55; // Example: text takes 55% width
    qrX_preview = textX_preview + textWidth_preview + (2 * scale);
  } else if (qrPosition === 'center') {
    qrX_preview = (labelW_px - actualQrSize_px) / 2;
    textX_preview = 2 * scale;
    textWidth_preview = labelW_px - (4 * scale);
    textY_preview = qrY_preview + actualQrSize_px + (2 * scale); // Text below QR
  }
  
  if (includeLogo && companyLogo) {
    switch (logoPosition) {
        case 'top-left':
            logoX_preview = 2 * scale;
            // Naive push: if QR is also left, it might get pushed by logo
            if (qrPosition === 'left') qrX_preview = Math.max(qrX_preview, logoX_preview + actualLogoSize_px + 2*scale);
            break;
        case 'top-right':
            logoX_preview = labelW_px - actualLogoSize_px - (2*scale);
             // Naive push: if QR is also right, it might get pushed by logo
            if (qrPosition === 'right') qrX_preview = Math.min(qrX_preview, logoX_preview - actualLogoSize_px - 2*scale);
            break;
        case 'top-center':
            logoX_preview = (labelW_px - actualLogoSize_px) / 2;
            // Push QR and text down
            const logoBottomY = logoY_preview + actualLogoSize_px + 2*scale;
            qrY_preview = Math.max(qrY_preview, logoBottomY);
            textY_preview = Math.max(textY_preview, logoBottomY);
             if (qrPosition === 'center') textY_preview = qrY_preview + actualQrSize_px + (2 * scale); // if QR is center, text is below QR
            break;
    }
  }
  // --- End Simplified Preview Layout Logic ---


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Editar Etiqueta</DialogTitle>
          <DialogDescription>
            Ajuste os elementos e o tamanho do QR Code para a etiqueta de "{asset.name}" ({asset.tag}).
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Left Side: Preview */}
          <div className="flex flex-col items-center">
              <Label className="mb-2 text-sm font-medium">Pré-visualização</Label>
               <div className="flex justify-center items-center p-4 my-4 border rounded-md overflow-hidden bg-white shadow-inner w-fit">
                  <div
                    style={{
                      width: `${labelW_px}px`,
                      height: `${labelH_px}px`,
                      position: 'relative',
                      overflow: 'hidden',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      backgroundColor: 'white',
                      border: '1px dashed #ccc',
                    }}
                  >
                    {/* Logo */}
                    {includeLogo && companyLogo && (
                        <div style={{
                            position: 'absolute',
                            left: `${logoX_preview}px`,
                            top: `${logoY_preview}px`,
                            width: `${actualLogoSize_px}px`,
                            height: `${actualLogoSize_px}px`,
                        }}>
                            <img src={companyLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                    )}

                    {/* QR Code */}
                    <div
                      style={{
                        position: 'absolute',
                        left: `${qrX_preview}px`,
                        top: `${qrY_preview}px`,
                      }}
                    >
                      <QRCodeStyling
                        value={qrValue || asset.tag}
                        size={actualQrSize_px}
                        level={"H"}
                        includeMargin={false}
                      />
                    </div>

                    {/* Text Content */}
                    <div
                      style={{
                        position: 'absolute',
                        left: `${textX_preview}px`,
                        top: `${textY_preview}px`,
                        width: `${textWidth_preview}px`,
                        height: `${labelH_px - textY_preview - (2*scale)}px`, // Approximate height
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        lineHeight: '1.2',
                        color: 'black',
                        textAlign: textAlignment,
                        overflow: 'hidden', // Prevent text overflow
                      }}
                    >
                       <div>
                         {includeName && (
                           <div
                             style={{
                               fontWeight: 'bold',
                               wordBreak: 'break-word',
                               fontSize: `${nameFontSize * (scale / 3.78)}px`,
                             }}
                           >
                             {asset.name}
                           </div>
                         )}
                         {customText && (
                           <div
                             style={{
                               wordBreak: 'break-word',
                               marginTop: includeName ? `${1 * scale}px` : '0',
                               fontSize: `${customTextFontSize * (scale / 3.78)}px`,
                             }}
                           >
                             {customText}
                           </div>
                         )}
                       </div>
                       {includeTag && (
                         <div
                           style={{
                             marginTop: 'auto',
                             fontSize: `${tagFontSize * (scale / 3.78)}px`,
                           }}
                         >
                           TAG: {asset.tag}
                         </div>
                       )}
                    </div>
                  </div>
                </div>
            </div>

            {/* Right Side: Editor Controls */}
            <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-2">
                <Label className="text-sm font-medium">Opções da Etiqueta</Label>
                <div className="space-y-3 border p-4 rounded-md bg-muted/50">
                     <div className="flex items-center space-x-2">
                        <Checkbox
                             id="includeName"
                             checked={includeName}
                             onCheckedChange={(checked) => setIncludeName(!!checked)}
                        />
                         <Label htmlFor="includeName" className="text-sm font-normal">Incluir Nome do Ativo</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                             id="includeTag"
                             checked={includeTag}
                             onCheckedChange={(checked) => setIncludeTag(!!checked)}
                        />
                         <Label htmlFor="includeTag" className="text-sm font-normal">Incluir TAG do Ativo</Label>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="customText" className="text-sm font-normal">Texto Adicional</Label>
                        <Input
                             id="customText"
                             value={customText}
                             onChange={(e) => setCustomText(e.target.value)}
                             placeholder="Ex: Contato Suporte"
                        />
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="qrSizeEdit" className="text-sm font-normal">Tamanho QR Code (mm) [{currentQrSize}]</Label>
                         <Slider
                             id="qrSizeEdit"
                             min={5}
                             max={Math.min(50, labelW_mm * 0.8, labelH_mm * 0.8)}
                             step={1}
                             value={[currentQrSize]}
                             onValueChange={(value) => setCurrentQrSize(value[0])}
                             className="my-2"
                         />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="qrPosition" className="text-sm font-normal">Posição QR Code</Label>
                        <Select value={qrPosition} onValueChange={(v: 'left' | 'right' | 'center') => setQrPosition(v)}>
                            <SelectTrigger id="qrPosition"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="left">Esquerda</SelectItem>
                                <SelectItem value="right">Direita</SelectItem>
                                <SelectItem value="center">Centro (Texto abaixo)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                             <Label htmlFor="nameFontSize" className="text-xs font-normal">Fonte Nome [{nameFontSize}pt]</Label>
                             <Slider id="nameFontSize" min={4} max={12} step={1} value={[nameFontSize]} onValueChange={v => setNameFontSize(v[0])} />
                        </div>
                         <div className="space-y-1">
                             <Label htmlFor="tagFontSize" className="text-xs font-normal">Fonte TAG [{tagFontSize}pt]</Label>
                            <Slider id="tagFontSize" min={4} max={10} step={1} value={[tagFontSize]} onValueChange={v => setTagFontSize(v[0])} />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="customTextFontSize" className="text-xs font-normal">Fonte Adicional [{customTextFontSize}pt]</Label>
                            <Slider id="customTextFontSize" min={4} max={10} step={1} value={[customTextFontSize]} onValueChange={v => setCustomTextFontSize(v[0])} />
                        </div>
                     </div>
                    <div className="space-y-1">
                        <Label htmlFor="textAlignment" className="text-sm font-normal">Alinhamento Texto</Label>
                        <Select value={textAlignment} onValueChange={(v: 'left' | 'center' | 'right') => setTextAlignment(v)}>
                            <SelectTrigger id="textAlignment"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="left">Esquerda</SelectItem>
                                <SelectItem value="center">Centro</SelectItem>
                                <SelectItem value="right">Direita</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Logo Controls */}
                    <div className="pt-3 border-t mt-3">
                        <Label className="text-sm font-medium mb-2 block">Opções do Logo</Label>
                        <div className="flex items-center space-x-2 mb-2">
                            <Checkbox
                                id="includeLogo"
                                checked={includeLogo}
                                onCheckedChange={(checked) => setIncludeLogo(!!checked)}
                            />
                            <Label htmlFor="includeLogo" className="text-sm font-normal">Incluir Logo da Empresa</Label>
                        </div>
                        {includeLogo && (
                            <>
                                <div className="space-y-1 mb-2">
                                    <Label htmlFor="companyLogoUpload" className="text-sm font-normal">Arquivo do Logo</Label>
                                    <Input
                                        id="companyLogoUpload"
                                        type="file"
                                        accept="image/png, image/jpeg, image/svg+xml"
                                        onChange={handleLogoChange}
                                        ref={logoInputRef}
                                        className="text-xs"
                                    />
                                     {companyLogo && (
                                        <Button variant="link" size="sm" className="text-xs p-0 h-auto" onClick={() => {setCompanyLogo(null); if(logoInputRef.current) logoInputRef.current.value = '';}}>Remover logo</Button>
                                     )}
                                </div>
                                <div className="space-y-1 mb-2">
                                    <Label htmlFor="logoSizeRatio" className="text-sm font-normal">Tamanho Logo (relativo à altura da etiqueta) [{Math.round(logoSizeRatio * 100)}%]</Label>
                                    <Slider
                                        id="logoSizeRatio"
                                        min={0.1} max={0.5} step={0.05}
                                        value={[logoSizeRatio]}
                                        onValueChange={(value) => setLogoSizeRatio(value[0])}
                                        className="my-2"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="logoPosition" className="text-sm font-normal">Posição do Logo</Label>
                                    <Select value={logoPosition} onValueChange={(v: 'top-left' | 'top-right' | 'top-center') => setLogoPosition(v)}>
                                        <SelectTrigger id="logoPosition"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="top-left">Topo Esquerda</SelectItem>
                                            <SelectItem value="top-right">Topo Direita</SelectItem>
                                            <SelectItem value="top-center">Topo Centro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        )}
                    </div>
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
