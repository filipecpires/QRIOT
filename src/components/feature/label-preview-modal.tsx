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
import type { LabelConfig } from '@/app/(admin)/labels/print/page'; // Assuming this path is correct
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ImageIcon, Trash2, ArrowDown, ArrowUp, GripVertical, PlusCircle } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Card, CardContent } from '@/components/ui/card'; // Added Card import
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface AssetForLabel {
    id: string;
    name: string;
    tag: string;
    category: string;
    location: string;
    characteristics?: { key: string, value: string }[]; // Add characteristics
}

export interface LabelElementConfig {
    id: string;
    type: 'text' | 'qr' | 'logo' | 'custom' | 'characteristic';
    content: string; // For text, custom text, QR value, characteristic key
    characteristicValue?: string; // For characteristic type, stores the actual value from asset
    dataUrl?: string; // For logo image
    fontSizePx: number;
    widthPx: number; // For QR and Logo, can be used for text block width too
    heightPx: number; // For Logo
    visible: boolean;
    fontFamily?: string;
    textAlign?: 'left' | 'center' | 'right';
    x: number; // Position X (pixels) relative to label container
    y: number; // Position Y (pixels) relative to label container
    // width and height for draggable/resizable text blocks? (future enhancement)
}

interface LabelPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: AssetForLabel;
  labelConfig: LabelConfig;
  qrValue: string;
  onSave: (elements: LabelElementConfig[]) => void;
}

const DEFAULT_FONT_SIZE_PX = 12;
const DEFAULT_QR_SIZE_PX = 50;
const DEFAULT_LOGO_HEIGHT_PX = 30;
const DEFAULT_LOGO_WIDTH_PX = 50;
const DEFAULT_TEXT_X = 10;
const DEFAULT_TEXT_Y_SPACING = 20;


export function LabelPreviewModal({
  isOpen,
  onClose,
  asset,
  labelConfig,
  qrValue,
  onSave,
}: LabelPreviewModalProps) {
  const scale = 3.78; // Approx pixels per mm for display preview
  const initialElements: LabelElementConfig[] = [
    { id: 'assetName', type: 'text', content: asset.name, fontSizePx: DEFAULT_FONT_SIZE_PX + 2, visible: true, widthPx: 100, heightPx: 0, textAlign: 'center', fontFamily: 'Arial, sans-serif', x: DEFAULT_TEXT_X, y: DEFAULT_TEXT_Y_SPACING },
    { id: 'assetTag', type: 'text', content: `TAG: ${asset.tag}`, fontSizePx: DEFAULT_FONT_SIZE_PX -2 , visible: true, widthPx: 100, heightPx: 0, textAlign: 'center', fontFamily: 'Arial, sans-serif', x: DEFAULT_TEXT_X, y: DEFAULT_TEXT_Y_SPACING * 2 },
    { id: 'qrCode', type: 'qr', content: qrValue, widthPx: DEFAULT_QR_SIZE_PX, heightPx: DEFAULT_QR_SIZE_PX, visible: true, fontSizePx: 0, textAlign: 'center', x: DEFAULT_TEXT_X + 20, y: DEFAULT_TEXT_Y_SPACING * 3 },
  ];

  const [elements, setElements] = useState<LabelElementConfig[]>(initialElements);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const previewAreaRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef<{ x: number; y: number, elX: number, elY: number } | null>(null);


  useEffect(() => {
    const newInitialElements: LabelElementConfig[] = [
        { id: 'assetName', type: 'text', content: asset.name, fontSizePx: DEFAULT_FONT_SIZE_PX + 2, visible: true, widthPx: Math.max(50, asset.name.length * 7), heightPx: 0, textAlign: 'center', fontFamily: 'Arial, sans-serif', x: 10, y: 20 },
        { id: 'assetTag', type: 'text', content: `TAG: ${asset.tag}`, fontSizePx: DEFAULT_FONT_SIZE_PX -2, visible: true, widthPx: Math.max(50, `TAG: ${asset.tag}`.length * 6), heightPx: 0, textAlign: 'center', fontFamily: 'Arial, sans-serif', x: 10, y: 45 },
        { id: 'qrCode', type: 'qr', content: qrValue, widthPx: DEFAULT_QR_SIZE_PX, heightPx: DEFAULT_QR_SIZE_PX, visible: true, fontSizePx: 0, textAlign: 'center', x: 10, y: 70 },
    ];
    // Try to merge existing user modifications if IDs match, otherwise reset
    const currentLogo = elements.find(el => el.type === 'logo');
    if (currentLogo) newInitialElements.unshift(currentLogo); // Preserve logo if exists

    const customTexts = elements.filter(el => el.type === 'custom');
    newInitialElements.push(...customTexts);
    
    const characteristics = elements.filter(el => el.type === 'characteristic');
    newInitialElements.push(...characteristics);


    setElements(newInitialElements);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset, isOpen, qrValue]);


  const updateElement = (id: string, updates: Partial<LabelElementConfig>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const addElement = (type: 'text' | 'custom' | 'logo' | 'qr' | 'characteristic', content?: string, characteristicKey?: string) => {
    const newId = `${type}-${Date.now()}`;
    let newElement: LabelElementConfig;
    const nextY = elements.reduce((max, el) => Math.max(max, el.y + (el.heightPx || el.fontSizePx || 20)), 0) + 10;

    switch (type) {
      case 'logo':
        newElement = { id: newId, type, content: 'Logo', dataUrl: undefined, widthPx: DEFAULT_LOGO_WIDTH_PX, heightPx: DEFAULT_LOGO_HEIGHT_PX, visible: true, fontSizePx: 0, textAlign: 'center', x: 10, y: nextY };
        break;
      case 'qr':
        newElement = { id: newId, type, content: qrValue, widthPx: DEFAULT_QR_SIZE_PX, heightPx: DEFAULT_QR_SIZE_PX, visible: true, fontSizePx: 0, textAlign: 'center', x: 10, y: nextY };
        break;
      case 'characteristic':
        const char = asset.characteristics?.find(c => c.key === characteristicKey);
        newElement = { id: newId, type, content: characteristicKey || 'Característica', characteristicValue: char?.value || '', fontSizePx: DEFAULT_FONT_SIZE_PX, visible: true, widthPx: 100, heightPx: 0, textAlign: 'left', fontFamily: 'Arial, sans-serif', x: 10, y: nextY };
        break;
      case 'custom':
      default: // also 'text'
        newElement = { id: newId, type: type === 'text' ? 'text': 'custom' , content: content || 'Texto Personalizado', fontSizePx: DEFAULT_FONT_SIZE_PX, visible: true, widthPx: 100, heightPx: 0, textAlign: 'left', fontFamily: 'Arial, sans-serif', x: 10, y: nextY };
        break;
    }
    setElements(prev => [...prev, newElement]);
  };

  const removeElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedElementId === id) setSelectedElementId(null);
  };


  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const logoElement = elements.find(el => el.type === 'logo' && el.id === selectedElementId);
    if (file && logoElement) {
        const reader = new FileReader();
        reader.onloadend = () => {
            updateElement(logoElement.id, { dataUrl: reader.result as string, visible: true });
        };
        reader.readAsDataURL(file);
    } else if (file && !elements.find(el => el.type === 'logo')) { // Add new logo if none exists
        const newId = `logo-${Date.now()}`;
        const reader = new FileReader();
        reader.onloadend = () => {
            const newLogo: LabelElementConfig = {
                id: newId, type: 'logo', content: 'Logo', dataUrl: reader.result as string,
                widthPx: DEFAULT_LOGO_WIDTH_PX, heightPx: DEFAULT_LOGO_HEIGHT_PX,
                visible: true, fontSizePx: 0, textAlign: 'center', x: 10, y: 10
            };
            setElements(prev => [newLogo, ...prev]);
            setSelectedElementId(newId);
        };
        reader.readAsDataURL(file);
    }
  };
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
    setSelectedElementId(id);
    const el = elements.find(elem => elem.id === id);
    if (!el || !previewAreaRef.current) return;

    const previewRect = previewAreaRef.current.getBoundingClientRect();
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      elX: el.x,
      elY: el.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStartPos.current) return;
      const dx = moveEvent.clientX - dragStartPos.current.x;
      const dy = moveEvent.clientY - dragStartPos.current.y;
      
      let newX = dragStartPos.current.elX + dx;
      let newY = dragStartPos.current.elY + dy;

      // Boundary checks (relative to preview area)
      const labelWidthPx = labelConfig.width * scale;
      const labelHeightPx = labelConfig.height * scale;
      const elementWidth = el.widthPx || 50; // Fallback width
      const elementHeight = el.heightPx || el.fontSizePx || 20; // Fallback height
      
      newX = Math.max(0, Math.min(newX, labelWidthPx - elementWidth));
      newY = Math.max(0, Math.min(newY, labelHeightPx - elementHeight));

      updateElement(id, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
      dragStartPos.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };


  const handleSaveAndClose = () => {
    onSave(elements);
    onClose();
  };

  const selectedElement = elements.find(el => el.id === selectedElementId);
  const availableCharacteristics = asset.characteristics?.filter(ac => !elements.some(el => el.type === 'characteristic' && el.content === ac.key)) || [];


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl md:max-w-5xl lg:max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Editor de Etiqueta</DialogTitle>
          <DialogDescription>
            Arraste e personalize os elementos. Dimensões: {labelConfig.width.toFixed(1)}mm x {labelConfig.height.toFixed(1)}mm.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-grow min-h-0">
          {/* Preview Area */}
          <div ref={previewAreaRef} className="lg:col-span-2 flex items-center justify-center p-2 border rounded-md bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
            <div
              style={{
                width: `${labelConfig.width * scale}px`,
                height: `${labelConfig.height * scale}px`,
                backgroundColor: 'white',
                border: '1px dashed #ccc',
                position: 'relative', // For absolute positioning of elements
                overflow: 'hidden', // Important for boundary checks for children
              }}
            >
              {elements.filter(el => el.visible).map(el => (
                <div
                  key={el.id}
                  onMouseDown={(e) => handleMouseDown(e, el.id)}
                  onClick={() => setSelectedElementId(el.id)}
                  className={cn(
                    "absolute cursor-grab select-none p-1",
                    selectedElementId === el.id && "ring-2 ring-primary ring-offset-1"
                  )}
                  style={{
                    left: `${el.x}px`,
                    top: `${el.y}px`,
                    fontSize: `${el.fontSizePx}px`,
                    fontFamily: el.fontFamily || 'Arial, sans-serif',
                    color: 'black',
                    textAlign: el.textAlign,
                    width: el.type === 'qr' || el.type === 'logo' ? `${el.widthPx}px` : 'auto', // QR/Logo have fixed width
                    height: el.type === 'qr' || el.type === 'logo' ? `${el.type === 'qr' ? el.widthPx : el.heightPx}px` : 'auto',
                  }}
                >
                  {el.type === 'text' && <span style={{whiteSpace: 'nowrap'}}>{el.content}</span>}
                  {el.type === 'custom' && <span style={{whiteSpace: 'nowrap'}}>{el.content}</span>}
                  {el.type === 'characteristic' && <span style={{whiteSpace: 'nowrap'}}>{el.content}: {el.characteristicValue}</span>}
                  {el.type === 'qr' && <QRCodeStyling value={el.content} size={el.widthPx} level="H" includeMargin={false} />}
                  {el.type === 'logo' && el.dataUrl && (
                    <img src={el.dataUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Controls Area */}
          <div className="space-y-3 overflow-y-auto pr-2 flex flex-col">
            <div className="flex-grow space-y-3">
            <Label className="text-base font-semibold">Elementos</Label>
             <div className="grid grid-cols-2 gap-2 mb-3">
                <Button variant="outline" size="sm" onClick={() => addElement('custom')}><PlusCircle className="mr-2 h-4 w-4" />Texto</Button>
                <Button variant="outline" size="sm" onClick={() => addElement('qr')}><PlusCircle className="mr-2 h-4 w-4" />QR Code</Button>
                <Button variant="outline" size="sm" onClick={() => addElement('logo')}><PlusCircle className="mr-2 h-4 w-4" />Logo</Button>
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" disabled={!asset.characteristics || availableCharacteristics.length === 0}><PlusCircle className="mr-2 h-4 w-4" />Característica</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-0">
                        <Command>
                            <CommandInput placeholder="Buscar característica..." />
                            <CommandEmpty>Nenhuma característica disponível.</CommandEmpty>
                            <CommandGroup>
                                {availableCharacteristics.map((char) => (
                                <CommandItem
                                    key={char.key}
                                    value={char.key}
                                    onSelect={() => addElement('characteristic', undefined, char.key)}
                                >
                                    {char.key}
                                </CommandItem>
                                ))}
                            </CommandGroup>
                        </Command>
                    </PopoverContent>
                </Popover>
             </div>

            {selectedElement && (
              <Card className="p-3">
                <div className="flex justify-between items-center mb-2">
                    <Label className="text-sm font-medium">
                        Editando: {
                        selectedElement.type === 'text' ? selectedElement.content.substring(0,20) + '...' :
                        selectedElement.type === 'custom' ? (selectedElement.content || 'Texto Personalizado').substring(0,20) + '...' :
                        selectedElement.type === 'characteristic' ? selectedElement.content :
                        selectedElement.type === 'qr' ? 'QR Code' : 'Logo'
                        }
                    </Label>
                    <Button variant="ghost" size="icon" onClick={() => removeElement(selectedElement.id)} className="h-6 w-6">
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
                <Separator className="my-2"/>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                         <Label htmlFor={`visible-${selectedElement.id}`} className="text-xs whitespace-nowrap">Visível:</Label>
                         <Checkbox
                            id={`visible-${selectedElement.id}`}
                            checked={selectedElement.visible}
                            onCheckedChange={(checked) => updateElement(selectedElement.id, { visible: !!checked })}
                         />
                    </div>
                  {(selectedElement.type === 'text' || selectedElement.type === 'custom' || selectedElement.type === 'characteristic') && (
                    <>
                      {selectedElement.type === 'custom' && (
                        <div>
                            <Label htmlFor={`content-${selectedElement.id}`} className="text-xs">Conteúdo</Label>
                            <Textarea id={`content-${selectedElement.id}`} value={selectedElement.content} onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })} className="text-xs h-16 mt-1" />
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                         <div>
                            <Label htmlFor={`fontSize-${selectedElement.id}`} className="text-xs">Fonte (px)</Label>
                            <Input id={`fontSize-${selectedElement.id}`} type="number" value={selectedElement.fontSizePx} onChange={(e) => updateElement(selectedElement.id, { fontSizePx: parseInt(e.target.value) || DEFAULT_FONT_SIZE_PX })} className="text-xs h-8 mt-1" />
                         </div>
                          <div>
                            <Label htmlFor={`textAlign-${selectedElement.id}`} className="text-xs">Alinhar</Label>
                            <Select value={selectedElement.textAlign || 'left'} onValueChange={(v: 'left' | 'center' | 'right') => updateElement(selectedElement.id, { textAlign: v })}>
                                <SelectTrigger className="text-xs h-8 mt-1"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="left">Esquerda</SelectItem>
                                    <SelectItem value="center">Centro</SelectItem>
                                    <SelectItem value="right">Direita</SelectItem>
                                </SelectContent>
                            </Select>
                          </div>
                      </div>
                    </>
                  )}
                  {selectedElement.type === 'qr' && (
                    <div>
                      <Label htmlFor={`qrSize-${selectedElement.id}`} className="text-xs">Tamanho QR (px)</Label>
                      <Input id={`qrSize-${selectedElement.id}`} type="number" value={selectedElement.widthPx} onChange={(e) => { const s = parseInt(e.target.value) || DEFAULT_QR_SIZE_PX; updateElement(selectedElement.id, { widthPx: s, heightPx: s });}} className="text-xs h-8 mt-1" />
                    </div>
                  )}
                  {selectedElement.type === 'logo' && (
                    <div className="space-y-2">
                        <div>
                            <Label htmlFor={`logoUpload-${selectedElement.id}`} className="text-xs">Arquivo</Label>
                            <Input id={`logoUpload-${selectedElement.id}`} type="file" accept="image/png, image/jpeg" onChange={handleLogoChange} ref={logoInputRef} className="text-xs h-8 mt-1" />
                        </div>
                      <div className="grid grid-cols-2 gap-2">
                         <div>
                            <Label htmlFor={`logoWidth-${selectedElement.id}`} className="text-xs">Largura (px)</Label>
                            <Input id={`logoWidth-${selectedElement.id}`} type="number" value={selectedElement.widthPx} onChange={(e) => updateElement(selectedElement.id, { widthPx: parseInt(e.target.value) || DEFAULT_LOGO_WIDTH_PX })} className="text-xs h-8 mt-1" />
                         </div>
                         <div>
                            <Label htmlFor={`logoHeight-${selectedElement.id}`} className="text-xs">Altura (px)</Label>
                            <Input id={`logoHeight-${selectedElement.id}`} type="number" value={selectedElement.heightPx} onChange={(e) => updateElement(selectedElement.id, { heightPx: parseInt(e.target.value) || DEFAULT_LOGO_HEIGHT_PX })} className="text-xs h-8 mt-1" />
                         </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
            {!selectedElement && <p className="text-xs text-muted-foreground text-center py-4">Selecione um elemento na pré-visualização ou adicione um novo para editar.</p>}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-auto pt-4 border-t">
          <Button variant="outline" onClick={onClose}> Cancelar </Button>
          <Button onClick={handleSaveAndClose}>Aplicar Layout e Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


// Helper components for Popover and Command (shadcn/ui structure)
const Command = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Root>
>(({ className, ...props }, ref) => (
    <CommandPrimitive.Root
        ref={ref}
        className={cn("flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground", className)}
        {...props} />
));
Command.displayName = CommandPrimitive.Root.displayName;

const CommandInput = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.Input>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
    <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <CommandPrimitive.Input
            ref={ref}
            className={cn("flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50", className)}
            {...props} />
    </div>
));
CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandGroup = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.Group>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
    <CommandPrimitive.Group
        ref={ref}
        className={cn("overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground", className)}
        {...props} />
));
CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandItem = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
    <CommandPrimitive.Item
        ref={ref}
        className={cn("relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled='true']:pointer-events-none data-[disabled='true']:opacity-50", className)}
        {...props} />
));
CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandEmpty = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.Empty>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
    <CommandPrimitive.Empty ref={ref} className="py-6 text-center text-sm" {...props} />
));
CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

// You might need to install `cmdk` if not already: npm install cmdk
// And import CommandPrimitive from 'cmdk'
import { Command as CommandPrimitive } from 'cmdk';
import { Search } from 'lucide-react'; // Assuming lucide-react is used for icons
