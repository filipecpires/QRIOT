
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
}

export function LabelPreviewModal({
  isOpen,
  onClose,
  asset,
  labelConfig,
  qrSize,
  qrValue,
}: LabelPreviewModalProps) {
  const labelW_mm = labelConfig.width;
  const labelH_mm = labelConfig.height;
  // Convert mm to pixels for display (approximate, adjust scale as needed)
  const scale = 3.78; // Approx pixels per mm (for 96 DPI)
  const labelW_px = labelW_mm * scale;
  const labelH_px = labelH_mm * scale;
  const qrSize_px = Math.min(qrSize * scale, labelH_px * 0.6, labelW_px * 0.4); // Limit QR size in pixels
  const textXStart_px = 2 * scale + qrSize_px + 2 * scale; // Text start position in pixels
  const availableTextWidth_px = labelW_px - textXStart_px - 2 * scale;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md"> {/* Adjust width if needed */}
        <DialogHeader>
          <DialogTitle>Pré-visualização da Etiqueta</DialogTitle>
          <DialogDescription>
            Esta é uma prévia de como a etiqueta para "{asset.name}" ({asset.tag}) será gerada.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center items-center py-4 my-4 border rounded-md overflow-hidden bg-white">
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
              }}
            >
              {/* Asset Name */}
              <div
                style={{
                  fontSize: `${7 * (scale/3.78)}px`, // Adjust font size relative to scale
                  fontWeight: 'bold',
                  wordBreak: 'break-word', // Allow wrapping long names
                  overflow: 'hidden',
                  maxHeight: `${(labelH_px - 9 * scale) * 0.6}px`, // Limit name height
                  textAlign: 'left',
                }}
              >
                {asset.name}
              </div>
              {/* Asset Tag */}
              <div
                style={{
                  fontSize: `${6 * (scale/3.78)}px`, // Adjust font size
                  marginTop: 'auto', // Push tag towards bottom
                  textAlign: 'left',
                }}
              >
                TAG: {asset.tag}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
