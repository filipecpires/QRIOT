
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
    const timer = setTimeout(() => {
      if (canvasRef.current) {
        try {
          // Ensure the canvas has non-zero dimensions before attempting to get data URL
          if (canvasRef.current.width === 0 || canvasRef.current.height === 0) {
            console.warn(`[HiddenQrCanvas] Canvas for ${assetId} has zero dimensions. QR not generated.`);
            onDataUrlReady(assetId, null);
            return;
          }
          const dataUrl = canvasRef.current.toDataURL('image/png');
          // console.log(`[HiddenQrCanvas] QR Data URL for ${assetId} (first 60 chars): ${dataUrl.substring(0, 60)}`);
          if (dataUrl && dataUrl.startsWith('data:image/png;base64,') && dataUrl.length > 'data:image/png;base64,'.length) {
            onDataUrlReady(assetId, dataUrl);
          } else {
            console.warn(`[HiddenQrCanvas] Generated empty or invalid data URL for QR code ${assetId}`);
            onDataUrlReady(assetId, null);
          }
        } catch (e) {
          console.error(`[HiddenQrCanvas] Error generating QR data URL for asset ${assetId}:`, e);
          onDataUrlReady(assetId, null);
        }
      } else {
        // This might happen if the component unmounts before the timeout,
        // or if QRCodeCanvas failed to render for some reason.
        console.warn(`[HiddenQrCanvas] Canvas ref not available for QR code ${assetId} during data URL generation attempt.`);
        onDataUrlReady(assetId, null); 
      }
    }, 200); // Increased timeout slightly for more complex renders or slower devices

    return () => clearTimeout(timer);
  }, [assetId, value, size, onDataUrlReady]);

  if (!value) {
    // If value is empty, don't attempt to render QRCodeCanvas as it might error or produce invalid output
    useEffect(() => {
      console.warn(`[HiddenQrCanvas] No value provided for QR code for asset ${assetId}. Not rendering canvas.`);
      onDataUrlReady(assetId, null); // Report as not ready
    }, [assetId, onDataUrlReady]);
    return null; // Render nothing
  }

  return (
    <QRCodeCanvas
      value={value}
      size={size}
      level="H"
      includeMargin={false}
      ref={canvasRef}
      // It's important this component is actually rendered, even if hidden,
      // for canvasRef.current to be populated.
      // The parent component will hide this using CSS.
    />
  );
};

