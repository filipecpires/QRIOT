'use client';

import React, { useRef } from 'react';
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
import { Download } from 'lucide-react';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrValue: string;
  assetName: string;
  assetTag: string;
  size?: number; // Optional size prop for QR code
}

export function QrCodeModal({
  isOpen,
  onClose,
  qrValue,
  assetName,
  assetTag,
  size = 256, // Default size
}: QrCodeModalProps) {
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const canvas = qrCodeRef.current?.querySelector('canvas');
    if (canvas) {
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      let downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `QR_${assetTag}.png`; // Filename based on tag
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>QR Code para {assetName}</DialogTitle>
          <DialogDescription>
            Tag: {assetTag}. Escaneie este código para acessar a página pública do ativo.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-4" ref={qrCodeRef}>
          <QRCodeStyling
            value={qrValue}
            size={size}
            level={"H"} // Error correction level
            includeMargin={true}
            // You can customize the QR code appearance further here
            // imageSettings={{
            //   src: "/path/to/your/logo.png", // Optional logo
            //   excavate: true,
            //   width: size * 0.15,
            //   height: size * 0.15,
            // }}
            // dotsOptions={{
            //    color: "#003049", // Dark Blue
            //    type: "rounded"
            // }}
            // cornersSquareOptions={{ color: "#003049", type: "extra-rounded" }}
            // cornersDotOptions={{ color: "#40E0D0", type: "dot" }} // Teal accent
          />
        </div>
        <DialogFooter>
           <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" /> Baixar PNG
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
