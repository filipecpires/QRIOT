
'use client';

import React, { useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface HiddenQrCanvasWithDataUrlProps {
  assetId: string;
  value: string; // This value is the URL to be encoded in the QR
  size?: number;
  onDataUrlReady: (assetId: string, dataUrl: string | null) => void;
}

export const HiddenQrCanvasWithDataUrl: React.FC<HiddenQrCanvasWithDataUrlProps> = ({
  assetId,
  value,
  size = 256,
  onDataUrlReady,
}) => {
  // This component will render the QRCodeCanvas which internally creates a <canvas> element.
  // We will give this QRCodeCanvas an id, and then use document.getElementById to fetch it
  // in the useEffect hook to get its data URL.

  useEffect(() => {
    if (!value || typeof value !== 'string' || value.trim() === '') {
      console.error(`[HiddenQrCanvas] Invalid or empty value for QR code asset ${assetId}. Value: "${value}"`);
      onDataUrlReady(assetId, null);
      return;
    }

    // The QRCodeCanvas component renders a <canvas> tag. We will try to get this canvas.
    const timer = setTimeout(() => {
      // Attempt to get the canvas element using the id prop passed to QRCodeCanvas
      const canvasElement = document.getElementById(`qr-canvas-${assetId}`) as HTMLCanvasElement | null;

      if (canvasElement) {
        try {
          // Ensure the canvas has non-zero dimensions before attempting to get data URL
          if (canvasElement.width === 0 || canvasElement.height === 0) {
            console.warn(`[HiddenQrCanvas] Canvas for ${assetId} (#qr-canvas-${assetId}) has zero dimensions. QR not generated.`);
            onDataUrlReady(assetId, null);
            return;
          }
          const dataUrl = canvasElement.toDataURL('image/png');
          
          if (dataUrl && dataUrl.startsWith('data:image/png;base64,') && dataUrl.length > 'data:image/png;base64,'.length) {
            // console.log(`[HiddenQrCanvas] Generated data URL for ${assetId} (first 70): ${dataUrl.substring(0,70)}...`);
            onDataUrlReady(assetId, dataUrl);
          } else {
            console.warn(`[HiddenQrCanvas] Generated empty or invalid data URL for QR code ${assetId} from canvas #qr-canvas-${assetId}.`);
            onDataUrlReady(assetId, null);
          }
        } catch (e) {
          console.error(`[HiddenQrCanvas] Error generating QR data URL for asset ${assetId} from canvas #qr-canvas-${assetId}:`, e);
          onDataUrlReady(assetId, null);
        }
      } else {
        console.warn(`[HiddenQrCanvas] Canvas element #qr-canvas-${assetId} not found for QR code ${assetId}. This might happen if QRCodeCanvas failed to render or unmounted too quickly.`);
        onDataUrlReady(assetId, null);
      }
    }, 350); // Increased timeout slightly more to ensure canvas is ready for querying

    return () => clearTimeout(timer);
  }, [assetId, value, size, onDataUrlReady]);

  // Render QRCodeCanvas with a direct id.
  // The parent component must ensure this HiddenQrCanvasWithDataUrl is rendered (even if styled to be off-screen)
  // for the useEffect to run and for document.getElementById to find the canvas.
  return (
    <QRCodeCanvas
      id={`qr-canvas-${assetId}`} // This ID will be on the <canvas> element rendered by QRCodeCanvas
      value={value}
      size={size}
      level="H"
      includeMargin={false} // Usually false for embedding, but can be true if it helps
      // Note: The 'ref' prop on QRCodeCanvas from 'qrcode.react' might not directly give
      // the <canvas> element, or might behave differently across versions.
      // Using a direct ID is a more straightforward way to ensure we can select the canvas.
    />
  );
};

