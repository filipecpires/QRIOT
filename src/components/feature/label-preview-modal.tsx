
'use client';

import React from 'react';
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
import { Label } from '@/components/ui/label'; // Import Label
import { Input } from '@/components/ui/input'; // Import Input
import { Checkbox } from '@/components/ui/checkbox'; // Import Checkbox

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
}

export function LabelPreviewModal({
  isOpen,
  onClose,
  asset,
  labelConfig,
  qrSize,
  qrValue,
}: LabelPreviewModalProps) {
  // Add state for editable fields within the modal (or pass state/setters from parent)
  const [includeName, setIncludeName] = React.useState(true);
  const [includeTag, setIncludeTag] = React.useState(true);
  const [customText, setCustomText] = React.useState('');
  const [currentQrSize, setCurrentQrSize] = React.useState(qrSize); // Local state for QR size editing


  const labelW_mm = labelConfig.width;
  const labelH_mm = labelConfig.height;
  // Convert mm to pixels for display (approximate, adjust scale as needed)
  const scale = 3.78; // Approx pixels per mm (for 96 DPI)
  const labelW_px = labelW_mm * scale;
  const labelH_px = labelH_mm * scale;
  const qrSize_px = Math.min(currentQrSize * scale, labelH_px * 0.6, labelW_px * 0.4); // Use local state for QR size
  const textXStart_px = 2 * scale + qrSize_px + 2 * scale; // Text start position in pixels
  const availableTextWidth_px = labelW_px - textXStart_px - 2 * scale;

  const handleSave = () => {
    // TODO: Implement logic to save the edited label settings if needed
    // This might involve updating the parent component's state or making an API call
    console.log("Saving label changes (not implemented):", { includeName, includeTag, customText, qrSize: currentQrSize });
    onClose(); // Close modal after save (or show success message)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl"> {/* Increased width */}
        <DialogHeader>
          <DialogTitle>Editar Etiqueta</DialogTitle> {/* Changed title */}
          <DialogDescription>
            Ajuste os elementos e o tamanho do QR Code para a etiqueta de "{asset.name}" ({asset.tag}). {/* Adjusted description */}
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
                      overflow: 'hidden', // Clip content outside label boundaries
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      backgroundColor: 'white', // Ensure white background
                      border: '1px dashed #ccc', // Dashed border for visualization
                    }}
                  >
                    {/* QR Code */}
                    <div
                      style={{
                        position: 'absolute',
                        left: `${2 * scale}px`, // Position from left
                        top: `${(labelH_px - qrSize_px) / 2}px`, // Center vertically
                      }}
                    >
                      <QRCodeStyling
                        value={qrValue || asset.tag} // Ensure qrValue is passed
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
                        top: `${3 * scale}px`, // Start text slightly from the top
                        width: `${availableTextWidth_px}px`,
                        height: `${labelH_px - 6 * scale}px`, // Adjust height considering top/bottom padding
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center', // Try centering text vertically
                        lineHeight: '1.2',
                        color: 'black', // Ensure text is black
                        fontSize: `${7 * (scale/3.78)}px`, // Base font size
                      }}
                    >
                      {/* Asset Name */}
                      {includeName && (
                          <div
                            style={{
                              fontWeight: 'bold',
                              wordBreak: 'break-word', // Allow wrapping long names
                              overflow: 'hidden',
                              maxHeight: `${(labelH_px - 9 * scale) * 0.5}px`, // Limit name height slightly more
                              textAlign: 'left',
                            }}
                           >
                            {asset.name}
                           </div>
                      )}
                       {/* Custom Text */}
                       {customText && (
                           <div
                                style={{
                                  fontSize: `${6 * (scale/3.78)}px`, // Slightly smaller
                                  wordBreak: 'break-word',
                                  overflow: 'hidden',
                                  maxHeight: `${(labelH_px - 9 * scale) * 0.3}px`, // Limit height
                                  textAlign: 'left',
                                  marginTop: includeName ? `${1 * scale}px` : '0', // Add margin if name is present
                                }}
                           >
                                {customText}
                           </div>
                       )}
                      {/* Asset Tag */}
                      {includeTag && (
                          <div
                            style={{
                              fontSize: `${6 * (scale/3.78)}px`, // Adjust font size
                              marginTop: 'auto', // Push tag towards bottom
                              textAlign: 'left',
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
            <div className="space-y-4">
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
                        <Label htmlFor="customText" className="text-sm font-normal">Texto Adicional (Opcional)</Label>
                        <Input
                             id="customText"
                             value={customText}
                             onChange={(e) => setCustomText(e.target.value)}
                             placeholder="Ex: Contato Suporte TI"
                        />
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="qrSizeEdit" className="text-sm font-normal">Tamanho QR Code (mm)</Label>
                        <Input
                             id="qrSizeEdit"
                             type="number"
                             min="5"
                             max="50" // Sensible max based on label size maybe?
                             value={currentQrSize}
                             onChange={(e) => setCurrentQrSize(Math.max(5, parseInt(e.target.value) || 15))}
                             className="w-24"
                        />
                    </div>
                </div>
            </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
           {/* Add a save button if edits should persist */}
           <Button onClick={handleSave}>Aplicar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
