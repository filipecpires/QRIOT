
'use client';

import React, { useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface HiddenQrCanvasWithDataUrlProps {
  assetId: string;
  value: string;
  size?: number;
  onDataUrlReady: (assetId: string, dataUrl: string | null) => void;
}

export const HiddenQrCanvasWithDataUrl: React.FC<HiddenQrCanvasWithDataUrlProps> = ({
  assetId,
  value,
  size = 256, // Default size for good quality in PDF
  onDataUrlReady,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // This effect runs when the component mounts and when `value`, `size`, or `assetId` changes.
    // `qrcode.react` updates the canvas when its props (like `value` or `size`) change.
    // We use a short timeout to ensure the canvas has been redrawn by `qrcode.react`
    // before we attempt to get its data URL.
    const timer = setTimeout(() => {
      if (canvasRef.current) {
        try {
          const dataUrl = canvasRef.current.toDataURL('image/png');
          if (dataUrl.length > 'data:image/png;base64,'.length) { // Basic check for valid data URL
            onDataUrlReady(assetId, dataUrl);
          } else {
            console.warn(`Generated empty data URL for QR code ${assetId}`);
            onDataUrlReady(assetId, null);
          }
        } catch (e) {
          console.error(`Error generating QR data URL for asset ${assetId}:`, e);
          onDataUrlReady(assetId, null);
        }
      }
    }, 50); // A small delay should be enough for canvas to update. Adjust if needed.

    return () => clearTimeout(timer); // Cleanup timer on unmount or before re-run
  }, [assetId, value, size, onDataUrlReady]);

  return (
    <QRCodeCanvas
      value={value}
      size={size}
      level="H" // High error correction level
      includeMargin={false} // No margin for cleaner image capture
      ref={canvasRef}
      // The 'style' prop here is for the wrapper div if qrcode.react adds one,
      // but for QRCodeCanvas it directly renders a <canvas>.
      // The actual canvas element is what canvasRef will point to.
    />
  );
};
