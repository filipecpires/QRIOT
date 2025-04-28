
'use client';

import React, { useState } from 'react'; // Added useState
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
import type { LabelConfig } from '@/app/(admin)/labels/print/page'; // Import LabelConfig type
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Import Select
import { Slider } from '@/components/ui/slider'; // Import Slider

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
  qrSize: number;
  qrValue: string;
  // Add state and setters for editable fields if needed, passed from parent
  // Example: onSave: (newConfig: LabelEditConfig) => void;
}

// Optional: Define a type for editable settings
// interface LabelEditConfig {
//     includeName: boolean;
//     includeTag: boolean;
//     customText: string;
//     qrSize: number;
//     nameFontSize: number;
//     tagFontSize: number;
//     customTextFontSize: number;
//     textAlignment: 'left' | 'center' | 'right';
// }

export function LabelPreviewModal({
  isOpen,
  onClose,
  asset,
  labelConfig,
  qrSize,
  qrValue,
}: LabelPreviewModalProps) {
  // Add state for editable fields within the modal
  const [includeName, setIncludeName] = useState(true);
  const [includeTag, setIncludeTag] = useState(true);
  const [customText, setCustomText] = useState('');
  const [currentQrSize, setCurrentQrSize] = useState(qrSize); // Local state for QR size editing
  const [nameFontSize, setNameFontSize] = useState(7); // Default font size for name
  const [tagFontSize, setTagFontSize] = useState(6); // Default font size for tag
  const [customTextFontSize, setCustomTextFontSize] = useState(6); // Default font size for custom text
  const [textAlignment, setTextAlignment] = useState<'left' | 'center' | 'right'>('left'); // Default text alignment
  const [qrPosition, setQrPosition] = useState<'left' | 'right' | 'center'>('left'); // Default QR position

  const labelW_mm = labelConfig.width;
  const labelH_mm = labelConfig.height;
  const scale = 3.78; // Approx pixels per mm (for 96 DPI)

  // Recalculate dimensions based on state
  const labelW_px = labelW_mm * scale;
  const labelH_px = labelH_mm * scale;
  const qrSize_px = Math.min(currentQrSize * scale, labelH_px * 0.8, labelW_px * 0.8); // Allow slightly larger QR

  // Calculate QR and Text positions based on qrPosition state
  let qrX_px = 2 * scale;
  let textXStart_px = qrX_px + qrSize_px + 2 * scale;
  let availableTextWidth_px = labelW_px - textXStart_px - 2 * scale;

  if (qrPosition === 'right') {
    qrX_px = labelW_px - qrSize_px - 2 * scale;
    textXStart_px = 2 * scale;
    availableTextWidth_px = qrX_px - textXStart_px - 2 * scale;
  } else if (qrPosition === 'center') {
    // Centered QR might overlap text, or we push text above/below.
    // Simplification: Centered QR pushes text below.
    qrX_px = (labelW_px - qrSize_px) / 2;
    textXStart_px = 2 * scale;
    availableTextWidth_px = labelW_px - 4 * scale; // Full width for text below
  }

  const handleSave = () => {
    // TODO: Implement logic to save the edited label settings if needed
    // Pass the edited config back to the parent component via onSave prop if necessary
    console.log("Saving label changes (not implemented):", {
      includeName,
      includeTag,
      customText,
      qrSize: currentQrSize,
      nameFontSize,
      tagFontSize,
      customTextFontSize,
      textAlignment,
      qrPosition,
    });
    onClose(); // Close modal after save
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl"> {/* Increased width further */}
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
                  {/* Label Container */}
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
                    {/* QR Code */}
                    <div
                      style={{
                        position: 'absolute',
                        left: `${qrX_px}px`,
                        top: `${(labelH_px - qrSize_px) / 2}px`, // Center vertically by default
                      }}
                    >
                      <QRCodeStyling
                        value={qrValue || asset.tag}
                        size={qrSize_px}
                        level={"H"}
                        includeMargin={false}
                      />
                    </div>

                    {/* Text Content */}
                    <div
                      style={{
                        position: 'absolute',
                        left: `${textXStart_px}px`,
                        top: qrPosition === 'center' ? `${qrSize_px + 4 * scale}px` : `${3 * scale}px`, // Adjust top based on QR position
                        width: `${availableTextWidth_px}px`,
                        height: qrPosition === 'center' ? `${labelH_px - qrSize_px - 6 * scale}px` : `${labelH_px - 6 * scale}px`, // Adjust height
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between', // Space items between top and bottom
                        lineHeight: '1.2',
                        color: 'black',
                        textAlign: textAlignment, // Apply text alignment
                      }}
                    >
                      {/* Top aligned text block (Name, Custom Text) */}
                       <div>
                         {includeName && (
                           <div
                             style={{
                               fontWeight: 'bold',
                               wordBreak: 'break-word',
                               overflow: 'hidden',
                               fontSize: `${nameFontSize * (scale / 3.78)}px`, // Apply dynamic font size
                             }}
                           >
                             {asset.name}
                           </div>
                         )}
                         {customText && (
                           <div
                             style={{
                               wordBreak: 'break-word',
                               overflow: 'hidden',
                               marginTop: includeName ? `${1 * scale}px` : '0',
                               fontSize: `${customTextFontSize * (scale / 3.78)}px`, // Apply dynamic font size
                             }}
                           >
                             {customText}
                           </div>
                         )}
                       </div>

                      {/* Bottom aligned text block (Tag) */}
                       {includeTag && (
                         <div
                           style={{
                             marginTop: 'auto', // Push tag towards bottom
                             fontSize: `${tagFontSize * (scale / 3.78)}px`, // Apply dynamic font size
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
                     {/* Include Checkboxes */}
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
                    {/* Custom Text */}
                    <div className="space-y-1">
                        <Label htmlFor="customText" className="text-sm font-normal">Texto Adicional</Label>
                        <Input
                             id="customText"
                             value={customText}
                             onChange={(e) => setCustomText(e.target.value)}
                             placeholder="Ex: Contato Suporte"
                        />
                    </div>
                     {/* QR Code Size */}
                     <div className="space-y-1">
                        <Label htmlFor="qrSizeEdit" className="text-sm font-normal">Tamanho QR Code (mm) [{currentQrSize}]</Label>
                         <Slider
                             id="qrSizeEdit"
                             min={5}
                             max={Math.min(50, labelW_mm * 0.8, labelH_mm * 0.8)} // Dynamic max based on label
                             step={1}
                             value={[currentQrSize]}
                             onValueChange={(value) => setCurrentQrSize(value[0])}
                             className="my-2"
                         />
                    </div>
                     {/* QR Code Position */}
                    <div className="space-y-1">
                        <Label htmlFor="qrPosition" className="text-sm font-normal">Posição QR Code</Label>
                        <Select value={qrPosition} onValueChange={(v: 'left' | 'right' | 'center') => setQrPosition(v)}>
                            <SelectTrigger id="qrPosition">
                                <SelectValue placeholder="Selecione a posição" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="left">Esquerda</SelectItem>
                                <SelectItem value="right">Direita</SelectItem>
                                <SelectItem value="center">Centro (Texto abaixo)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                     {/* Font Sizes */}
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
                     {/* Text Alignment */}
                    <div className="space-y-1">
                        <Label htmlFor="textAlignment" className="text-sm font-normal">Alinhamento Texto</Label>
                        <Select value={textAlignment} onValueChange={(v: 'left' | 'center' | 'right') => setTextAlignment(v)}>
                            <SelectTrigger id="textAlignment">
                                <SelectValue placeholder="Selecione o alinhamento" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="left">Esquerda</SelectItem>
                                <SelectItem value="center">Centro</SelectItem>
                                <SelectItem value="right">Direita</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                </div>
            </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
           {/* Save button applies changes locally for now */}
           <Button onClick={handleSave}>Aplicar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
