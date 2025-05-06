
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
import { ImageIcon, Trash2 } from 'lucide-react';
import { Separator } from '../ui/separator';
import { cn } from '@/lib/utils';

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

export interface LabelLayoutSettings {
    // Column Layout
    column1Proportion: number; // Percentage for column 1
    col1HorizontalAlign: 'flex-start' | 'center' | 'flex-end';
    col2HorizontalAlign: 'flex-start' | 'center' | 'flex-end';

    // Element Visibility & Assignment
    includeName: boolean;
    nameAssignment: 'col1' | 'col2' | 'none';
    includeTag: boolean;
    tagAssignment: 'col1' | 'col2' | 'none';
    includeCustomText: boolean;
    customText: string;
    customTextAssignment: 'col1' | 'col2' | 'none';
    includeQr: boolean;
    qrAssignment: 'col1' | 'col2' | 'none';
    includeLogo: boolean;
    logoAssignment: 'col1' | 'col2' | 'none';
    
    // Element Specific Settings
    qrSizeMm: number;
    nameFontSizePt: number;
    tagFontSizePt: number;
    customTextFontSizePt: number;
    textAlignment: 'left' | 'center' | 'right'; // General text alignment for text within elements
    companyLogoDataUrl: string | null;
    logoHeightMm: number;
}

const elementRenderOrder = ['logo', 'name', 'customText', 'tag', 'qr'] as const;
type ElementType = typeof elementRenderOrder[number];


export function LabelPreviewModal({
  isOpen,
  onClose,
  asset,
  labelConfig,
  qrSize: initialQrSizeMm,
  qrValue,
}: LabelPreviewModalProps) {
  // Column Layout
  const [column1Proportion, setColumn1Proportion] = useState(50);
  const [col1HorizontalAlign, setCol1HorizontalAlign] = useState<'flex-start' | 'center' | 'flex-end'>('center');
  const [col2HorizontalAlign, setCol2HorizontalAlign] = useState<'flex-start' | 'center' | 'flex-end'>('center');

  // Element Visibility & Assignment
  const [includeName, setIncludeName] = useState(true);
  const [nameAssignment, setNameAssignment] = useState<'col1' | 'col2' | 'none'>('col2');
  const [includeTag, setIncludeTag] = useState(true);
  const [tagAssignment, setTagAssignment] = useState<'col1' | 'col2' | 'none'>('col2');
  const [includeCustomText, setIncludeCustomText] = useState(false);
  const [customText, setCustomText] = useState('');
  const [customTextAssignment, setCustomTextAssignment] = useState<'col1' | 'col2' | 'none'>('none');
  const [includeQr, setIncludeQr] = useState(true);
  const [qrAssignment, setQrAssignment] = useState<'col1' | 'col2' | 'none'>('col1');
  const [includeLogo, setIncludeLogo] = useState(false);
  const [logoAssignment, setLogoAssignment] = useState<'col1' | 'col2' | 'none'>('none');

  // Element Specific Settings
  const [currentQrSizeMm, setCurrentQrSizeMm] = useState(initialQrSizeMm);
  const [nameFontSizePt, setNameFontSizePt] = useState(7);
  const [tagFontSizePt, setTagFontSizePt] = useState(6);
  const [customTextFontSizePt, setCustomTextFontSizePt] = useState(6);
  const [textAlignment, setTextAlignment] = useState<'left' | 'center' | 'right'>('left');
  const [companyLogoDataUrl, setCompanyLogoDataUrl] = useState<string | null>(null);
  const [logoHeightMm, setLogoHeightMm] = useState(5);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const logoImageRef = useRef<HTMLImageElement>(null);

  const [actualLogoWidthPx, setActualLogoWidthPx] = useState(0);
  const [actualLogoHeightPx, setActualLogoHeightPx] = useState(0);

  const scale = 3.78; // Approx pixels per mm (for 96 DPI display simulation)
  const labelW_mm = labelConfig.width;
  const labelH_mm = labelConfig.height;
  const labelW_px = labelW_mm * scale;
  const labelH_px = labelH_mm * scale;
  const mainPaddingMm = 1; // 1mm padding on all sides of the label content area
  const mainPaddingPx = mainPaddingMm * scale; 
  const columnGapPx = 1 * scale; // 1mm gap between columns

  useEffect(() => {
    setCurrentQrSizeMm(initialQrSizeMm);
  }, [initialQrSizeMm]);
  
  useEffect(() => {
    if (companyLogoDataUrl && logoImageRef.current) {
        const img = logoImageRef.current;
        const calculateSize = () => {
            if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                const desiredHeightPx = logoHeightMm * scale;
                const aspectRatio = img.naturalWidth / img.naturalHeight;
                setActualLogoHeightPx(desiredHeightPx);
                setActualLogoWidthPx(desiredHeightPx * aspectRatio);
            }
        };
        if (img.complete) {
            calculateSize();
        } else {
            img.onload = calculateSize;
            img.onerror = () => console.error("Logo image failed to load for dimension calculation.");
        }
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
            if(logoAssignment === 'none' && column1Proportion > 0) setLogoAssignment('col1');
            else if (logoAssignment === 'none') setLogoAssignment('col2');
        };
        reader.readAsDataURL(file);
    } else {
        setCompanyLogoDataUrl(null);
    }
  };

  const handleRemoveLogo = () => {
    setCompanyLogoDataUrl(null);
    setIncludeLogo(false);
    setLogoAssignment('none');
    if (logoInputRef.current) {
        logoInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    const currentLayoutSettings: LabelLayoutSettings = {
        column1Proportion, col1HorizontalAlign, col2HorizontalAlign,
        includeName, nameAssignment,
        includeTag, tagAssignment,
        includeCustomText, customText, customTextAssignment,
        includeQr, qrAssignment,
        includeLogo, logoAssignment,
        qrSizeMm: currentQrSizeMm,
        nameFontSizePt,
        tagFontSizePt,
        customTextFontSizePt,
        textAlignment,
        companyLogoDataUrl,
        logoHeightMm,
    };
    console.log("Saving label layout settings (simulated):", currentLayoutSettings);
    // TODO: Implement saving these settings to user preferences or a global config
    onClose();
  };

  const elementsConfig = [
    { type: 'logo', assignment: logoAssignment, included: includeLogo, content: companyLogoDataUrl, settings: { heightMm: logoHeightMm, actualHPx: actualLogoHeightPx, actualWPx: actualLogoWidthPx } },
    { type: 'name', assignment: nameAssignment, included: includeName, content: asset.name, settings: { fontSizePt: nameFontSizePt, fontWeight: 'bold' } },
    { type: 'customText', assignment: customTextAssignment, included: includeCustomText && !!customText.trim(), content: customText, settings: { fontSizePt: customTextFontSizePt } },
    { type: 'tag', assignment: tagAssignment, included: includeTag, content: `TAG: ${asset.tag}`, settings: { fontSizePt: tagFontSizePt } },
    { type: 'qr', assignment: qrAssignment, included: includeQr, content: qrValue, settings: { sizeMm: currentQrSizeMm } },
  ] as const;


  const renderElement = (el: typeof elementsConfig[number], columnContentWidthPx: number) => {
    const commonTextStyle: React.CSSProperties = {
        fontSize: `${el.settings.fontSizePt * 0.75}px`, // pt to px approx for web
        lineHeight: '1.2',
        color: 'black',
        textAlign: textAlignment,
        wordBreak: 'break-word',
        width: '100%', // Take full width of its direct container (the flex item)
        fontWeight: (el.settings as any).fontWeight || 'normal',
    };

    switch (el.type) {
        case 'logo':
            if (el.included && el.content && el.settings.actualWPx > 0 && el.settings.actualHPx > 0) {
                return (
                    <div style={{ display: 'flex', justifyContent: textAlignment, width: '100%' }}>
                        <img 
                            src={el.content} 
                            alt="Logo" 
                            style={{ 
                                maxWidth: `${Math.min(el.settings.actualWPx, columnContentWidthPx)}px`,
                                maxHeight: `${el.settings.actualHPx}px`,
                                height: `${el.settings.actualHPx}px`,
                                width: 'auto',
                                objectFit: 'contain',
                            }} 
                        />
                    </div>
                );
            }
            break;
        case 'name': case 'customText': case 'tag':
            if (el.included && el.content) {
                return <div style={commonTextStyle}>{el.content}</div>;
            }
            break;
        case 'qr':
            if (el.included) {
                // QR size constrained by its column's content width and overall label height
                const maxQrDimBasedOnLabel = Math.min(labelH_px - 2 * mainPaddingPx, labelW_px - 2 * mainPaddingPx);
                const qrSizePx = Math.min(el.settings.sizeMm * scale, columnContentWidthPx, maxQrDimBasedOnLabel * 0.95);
                return (
                    <div style={{display: 'flex', justifyContent: textAlignment, width: '100%'}}>
                         <QRCodeStyling value={el.content} size={qrSizePx} level="H" includeMargin={false} />
                    </div>
                );
            }
            break;
    }
    return null;
  };
  
  const renderColumnContent = (elements: Array<ReturnType<typeof renderElement>>) => {
    return elements.filter(Boolean).map((elJsx, index) => (
        <div key={index} style={{ marginBottom: `${0.5 * scale}px`, width: '100%' }}> {/* Ensure items try to take width */}
            {elJsx}
        </div>
    ));
  };
  
  const col1ContentWidth = labelW_px * (column1Proportion / 100) - (column1Proportion > 0 && column1Proportion < 100 ? columnGapPx / 2 : 0) - (column1Proportion > 0 ? 2*mainPaddingPx : 0) ;
  const col2ContentWidth = labelW_px * ((100 - column1Proportion) / 100) - (column1Proportion > 0 && column1Proportion < 100 ? columnGapPx / 2 : 0) - ((100-column1Proportion) > 0 ? 2*mainPaddingPx : 0);


  const sortedCol1Elements = elementsConfig
    .filter(el => el.assignment === 'col1' && el.included)
    .sort((a, b) => elementRenderOrder.indexOf(a.type) - elementRenderOrder.indexOf(b.type))
    .map(elConf => renderElement(elConf, labelW_px * (column1Proportion/100) - (column1Proportion > 0 && (100-column1Proportion) > 0 ? columnGapPx/2 : 0) ));

  const sortedCol2Elements = elementsConfig
    .filter(el => el.assignment === 'col2' && el.included)
    .sort((a, b) => elementRenderOrder.indexOf(a.type) - elementRenderOrder.indexOf(b.type))
    .map(elConf => renderElement(elConf, labelW_px * ((100-column1Proportion)/100) - (column1Proportion > 0 && (100-column1Proportion) > 0 ? columnGapPx/2 : 0) ));


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
          <div className="lg:col-span-2 flex flex-col items-center justify-center p-4 border rounded-md bg-gray-100 dark:bg-gray-800 overflow-auto">
              <Label className="mb-2 text-sm font-medium text-center">Pré-visualização da Etiqueta</Label>
               <div className="flex justify-center items-center my-2 w-full h-full">
                  <div
                    style={{
                      width: `${labelW_px}px`,
                      height: `${labelH_px}px`,
                      display: 'flex',
                      flexDirection: 'row',
                      position: 'relative',
                      overflow: 'visible', // Allow content to be visible for debugging, set to hidden for final
                      fontFamily: 'Arial, sans-serif',
                      backgroundColor: 'white',
                      border: '1px dashed #999',
                      boxSizing: 'border-box',
                      padding: `${mainPaddingPx}px`,
                    }}
                  >
                    {companyLogoDataUrl && <img ref={logoImageRef} src={companyLogoDataUrl} alt="logo preloader" style={{position: 'absolute', opacity: 0, pointerEvents: 'none', width: 'auto', height: 'auto'}}/> }
                    
                    {/* Column 1 */}
                    {column1Proportion > 0 && (
                        <div style={{
                            width: `calc(${column1Proportion}% - ${column1Proportion < 100 ? `${columnGapPx / 2}px` : '0px'})`,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: col1HorizontalAlign,
                            justifyContent: 'flex-start', // Stack from top
                            marginRight: column1Proportion < 100 ? `${columnGapPx / 2}px` : '0px',
                            boxSizing: 'border-box',
                            overflow: 'hidden',
                        }}>
                            {renderColumnContent(sortedCol1Elements)}
                        </div>
                    )}

                    {/* Column 2 */}
                    {(100 - column1Proportion) > 0 && (
                         <div style={{
                            width: `calc(${(100 - column1Proportion)}% - ${column1Proportion > 0 ? `${columnGapPx / 2}px` : '0px'})`,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: col2HorizontalAlign,
                            justifyContent: 'flex-start', // Stack from top
                            marginLeft: column1Proportion > 0 ? `${columnGapPx / 2}px` : '0px',
                            boxSizing: 'border-box',
                            overflow: 'hidden',
                        }}>
                            {renderColumnContent(sortedCol2Elements)}
                        </div>
                    )}
                  </div>
                </div>
            </div>

            <div className="space-y-3 overflow-y-auto pr-2 lg:max-h-[calc(75vh-3rem)]">
                {/* Column Layout */}
                <div className="space-y-3 border p-3 rounded-md bg-muted/30">
                    <Label className="text-sm font-semibold">Layout das Colunas</Label>
                    <div>
                        <Label htmlFor="col1Proportion" className="text-xs font-normal">Coluna 1: {column1Proportion}% / Coluna 2: {100-column1Proportion}%</Label>
                        <Slider id="col1Proportion" min={0} max={100} step={5} value={[column1Proportion]} onValueChange={(value) => setColumn1Proportion(value[0])} className="my-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label htmlFor="col1HAlign" className="text-xs font-normal">Alinh. Col. 1</Label>
                             <Select value={col1HorizontalAlign} onValueChange={(v: any) => setCol1HorizontalAlign(v)}>
                                <SelectTrigger className="text-xs h-8 mt-1"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="flex-start">Esquerda</SelectItem>
                                    <SelectItem value="center">Centro</SelectItem>
                                    <SelectItem value="flex-end">Direita</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="col2HAlign" className="text-xs font-normal">Alinh. Col. 2</Label>
                            <Select value={col2HorizontalAlign} onValueChange={(v: any) => setCol2HorizontalAlign(v)}>
                                <SelectTrigger className="text-xs h-8 mt-1"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="flex-start">Esquerda</SelectItem>
                                    <SelectItem value="center">Centro</SelectItem>
                                    <SelectItem value="flex-end">Direita</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <Separator />

                {/* Element Configuration */}
                <div className="space-y-3 border p-3 rounded-md bg-muted/30">
                    <Label className="text-sm font-semibold">Conteúdo da Etiqueta</Label>
                    {/* Name */}
                    <div className="space-y-1 border-b pb-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="includeName" checked={includeName} onCheckedChange={(checked) => setIncludeName(!!checked)} />
                            <Label htmlFor="includeName" className="text-xs font-normal flex-grow">Nome do Ativo</Label>
                        </div>
                        {includeName && (
                            <Select value={nameAssignment} onValueChange={(v: any) => setNameAssignment(v)}>
                                <SelectTrigger className="text-xs h-8 mt-1"><SelectValue placeholder="Atribuir à coluna..." /></SelectTrigger>
                                <SelectContent><SelectItem value="col1">Coluna 1</SelectItem><SelectItem value="col2">Coluna 2</SelectItem><SelectItem value="none">Não Mostrar</SelectItem></SelectContent>
                            </Select>
                        )}
                    </div>
                    {/* Tag */}
                    <div className="space-y-1 border-b pb-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="includeTag" checked={includeTag} onCheckedChange={(checked) => setIncludeTag(!!checked)} />
                            <Label htmlFor="includeTag" className="text-xs font-normal flex-grow">TAG do Ativo</Label>
                        </div>
                        {includeTag && (
                             <Select value={tagAssignment} onValueChange={(v: any) => setTagAssignment(v)}>
                                <SelectTrigger className="text-xs h-8 mt-1"><SelectValue placeholder="Atribuir à coluna..." /></SelectTrigger>
                                <SelectContent><SelectItem value="col1">Coluna 1</SelectItem><SelectItem value="col2">Coluna 2</SelectItem><SelectItem value="none">Não Mostrar</SelectItem></SelectContent>
                            </Select>
                        )}
                    </div>
                    {/* Custom Text */}
                    <div className="space-y-1 border-b pb-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="includeCustomText" checked={includeCustomText} onCheckedChange={(checked) => setIncludeCustomText(!!checked)} />
                            <Label htmlFor="includeCustomText" className="text-xs font-normal flex-grow">Texto Adicional</Label>
                        </div>
                        {includeCustomText && (
                            <>
                                <Input id="customText" value={customText} onChange={(e) => setCustomText(e.target.value)} placeholder="Ex: Depto. TI" className="text-xs h-8 mt-1" />
                                <Select value={customTextAssignment} onValueChange={(v: any) => setCustomTextAssignment(v)}>
                                    <SelectTrigger className="text-xs h-8 mt-1"><SelectValue placeholder="Atribuir à coluna..." /></SelectTrigger>
                                    <SelectContent><SelectItem value="col1">Coluna 1</SelectItem><SelectItem value="col2">Coluna 2</SelectItem><SelectItem value="none">Não Mostrar</SelectItem></SelectContent>
                                </Select>
                            </>
                        )}
                    </div>
                    {/* QR Code */}
                    <div className="space-y-1 border-b pb-2">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="includeQr" checked={includeQr} onCheckedChange={(checked) => setIncludeQr(!!checked)} />
                            <Label htmlFor="includeQr" className="text-xs font-normal flex-grow">QR Code</Label>
                        </div>
                         {includeQr && (
                            <Select value={qrAssignment} onValueChange={(v: any) => setQrAssignment(v)}>
                                <SelectTrigger className="text-xs h-8 mt-1"><SelectValue placeholder="Atribuir à coluna..." /></SelectTrigger>
                                <SelectContent><SelectItem value="col1">Coluna 1</SelectItem><SelectItem value="col2">Coluna 2</SelectItem><SelectItem value="none">Não Mostrar</SelectItem></SelectContent>
                            </Select>
                        )}
                    </div>
                    {/* Logo */}
                    <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                            <Checkbox id="includeLogo" checked={includeLogo} onCheckedChange={(checked) => setIncludeLogo(!!checked)} />
                            <Label htmlFor="includeLogo" className="text-xs font-normal flex-grow">Logo da Empresa</Label>
                        </div>
                        {includeLogo && (
                           <Select value={logoAssignment} onValueChange={(v: any) => setLogoAssignment(v)}>
                                <SelectTrigger className="text-xs h-8 mt-1"><SelectValue placeholder="Atribuir à coluna..." /></SelectTrigger>
                                <SelectContent><SelectItem value="col1">Coluna 1</SelectItem><SelectItem value="col2">Coluna 2</SelectItem><SelectItem value="none">Não Mostrar</SelectItem></SelectContent>
                            </Select>
                        )}
                    </div>
                </div>
                <Separator />

                {/* Element Specific Settings */}
                 <div className="space-y-3 border p-3 rounded-md bg-muted/30">
                    <Label className="text-sm font-semibold">Configurações dos Elementos</Label>
                     {/* QR Size */}
                     {includeQr && (
                         <div>
                            <Label htmlFor="qrSizeEdit" className="text-xs font-normal">Tamanho QR (mm) [{currentQrSizeMm}]</Label>
                            <Slider id="qrSizeEdit" min={5} max={Math.min(50, labelW_mm * 0.95, labelH_mm * 0.95)} step={1} value={[currentQrSizeMm]} onValueChange={(value) => setCurrentQrSizeMm(value[0])} className="my-1" />
                        </div>
                     )}
                    {/* Logo */}
                    {includeLogo && (
                        <>
                            <div className="space-y-1">
                                <Label htmlFor="companyLogoUpload" className="text-xs font-normal">Arquivo Logo (PNG, JPG, SVG)</Label>
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
                                <Label htmlFor="logoHeightMm" className="text-xs font-normal">Altura Logo (mm) [{logoHeightMm}]</Label>
                                <Slider id="logoHeightMm" min={2} max={Math.min(20, labelH_mm * 0.8)} step={0.5} value={[logoHeightMm]} onValueChange={(value) => setLogoHeightMm(value[0])} className="my-1" />
                            </div>
                        </>
                    )}
                 </div>
                 <Separator />

                {/* Text Styling Section */}
                <div className="space-y-3 border p-3 rounded-md bg-muted/30">
                    <Label className="text-sm font-semibold">Estilo do Texto (para elementos de texto)</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {includeName && <div> <Label htmlFor="nameFontSize" className="text-xs font-normal">Nome [{nameFontSizePt}pt]</Label> <Slider id="nameFontSize" min={4} max={12} step={0.5} value={[nameFontSizePt]} onValueChange={v => setNameFontSizePt(v[0])} className="my-1" /> </div>}
                        {includeTag && <div> <Label htmlFor="tagFontSize" className="text-xs font-normal">TAG [{tagFontSizePt}pt]</Label> <Slider id="tagFontSize" min={4} max={10} step={0.5} value={[tagFontSizePt]} onValueChange={v => setTagFontSizePt(v[0])} className="my-1"/> </div>}
                        {includeCustomText && customText.trim() && <div> <Label htmlFor="customTextFontSize" className="text-xs font-normal">Adicional [{customTextFontSizePt}pt]</Label> <Slider id="customTextFontSize" min={4} max={10} step={0.5} value={[customTextFontSizePt]} onValueChange={v => setCustomTextFontSizePt(v[0])} className="my-1"/> </div>}
                    </div>
                    <div>
                        <Label htmlFor="textAlignment" className="text-xs font-normal">Alinhamento do Texto (dentro de cada bloco de texto)</Label>
                        <Select value={textAlignment} onValueChange={(v: 'left' | 'center' | 'right') => setTextAlignment(v)}>
                            <SelectTrigger id="textAlignment" className="text-xs h-8 mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent> <SelectItem value="left">Esquerda</SelectItem> <SelectItem value="center">Centro</SelectItem> <SelectItem value="right">Direita</SelectItem> </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}> Cancelar </Button>
          <Button onClick={handleSave}>Aplicar e Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

