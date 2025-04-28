
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react'; // Added useEffect, useState
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Info, Image as ImageIcon, Link as LinkIcon, MapPin, UserCircle, Calendar } from 'lucide-react'; // Corrected Link icon import
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { cn } from '@/lib/utils'; // Added missing import

// Mock data structure - replace with actual fetching and data structure
interface AssetCharacteristic {
    key: string;
    value: string;
    isPublic: boolean;
}

interface AssetPhoto {
    url: string;
    description?: string; // Optional description for the photo
}

interface AssetAttachment {
    id?: string; // ID might be useful
    name: string;
    url: string;
    isPublic: boolean; // Added flag
}

interface PublicAssetData {
    id: string;
    name: string;
    category?: string; // Make optional if not always public
    tag: string; // Tag is now 5-char alphanumeric
    location?: { // Make optional if not always public
        name: string;
        lat?: number;
        lng?: number;
    };
    responsible?: { // Make optional if not always public
        name: string;
    };
    description?: string; // Make optional if not always public
    characteristics: AssetCharacteristic[];
    photos: AssetPhoto[];
    attachments: AssetAttachment[];
    status: 'active' | 'lost' | 'inactive'; // inactive assets might not be publicly visible
    lastInventoryDate?: string; // Optional, if public
    // Add other fields that might be public
}

// Mock data fetching function - replace with actual API call
async function fetchPublicAssetData(tag: string): Promise<PublicAssetData | null> {
    console.log(`Fetching data for tag: ${tag}`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real app, fetch from Firestore based on the tag
    // Filter characteristics, photos, attachments based on public visibility settings
    // Only return data if the asset exists and is not 'inactive' (or based on your rules)

    // Use the new 5-character tags
    if (tag === 'AB12C') { // Example: TI-NB-001 became AB12C
        return {
            id: 'ASSET001',
            name: 'Notebook Dell Latitude 7400',
            category: 'Eletrônicos',
            tag: 'AB12C', // Use the new tag
            location: { name: 'Escritório 1' },
            responsible: { name: 'João Silva' },
            description: 'Notebook corporativo para desenvolvimento.',
            characteristics: [
                { key: 'Processador', value: 'Intel Core i7', isPublic: true },
                { key: 'Memória RAM', value: '16GB', isPublic: true },
                { key: 'Armazenamento', value: '512GB SSD', isPublic: true },
                { key: 'Número de Série', value: 'ABC123XYZ', isPublic: false }, // Example non-public
                { key: 'Voltagem', value: 'Bivolt', isPublic: true },
                { key: 'Ano Fabricação', value: '2022', isPublic: true},
            ],
            photos: [
                { url: 'https://picsum.photos/seed/asset001/600/400', description: 'Vista frontal' },
                 { url: 'https://picsum.photos/seed/asset001_2/600/400', description: 'Vista lateral' }
            ],
            attachments: [
                { id: 'attach1', name: 'Manual do Usuário', url: 'https://example.com/manual.pdf', isPublic: true }, // Public
                { id: 'attach2', name: 'Nota Fiscal', url: 'https://example.com/invoice.pdf', isPublic: false } // Not Public
            ],
            status: 'active',
            lastInventoryDate: '2024-05-10'
        };
    } else if (tag === 'GH56I') { // Example: MOB-CAD-012 became GH56I
         return {
            id: 'ASSET003',
            name: 'Cadeira de Escritório',
            category: 'Mobiliário',
            tag: 'GH56I', // Use the new tag
            location: { name: 'Sala de Reuniões' },
            responsible: { name: 'Carlos Pereira' },
            description: 'Cadeira ergonômica.',
            characteristics: [
                 { key: 'Cor', value: 'Preta', isPublic: true },
                 { key: 'Material', value: 'Tecido', isPublic: true },
            ],
            photos: [{ url: 'https://picsum.photos/seed/asset003/600/400', description: 'Cadeira' }],
            attachments: [],
            status: 'lost', // Marked as lost
            lastInventoryDate: '2024-01-15'
        };
    }

    return null; // Asset not found or not public
}

// Server-side function to log access - replace with Cloud Function or server action
async function logAccess(tag: string, ip: string | undefined, userAgent: string | undefined) {
     console.log(`Access logged for tag: ${tag}, IP: ${ip}, Device: ${userAgent}`);
    // In a real app, save this data to Firestore
    // Consider using a Cloud Function triggered by HTTP request for scalability
    // Or a Next.js Server Action
}


export default function PublicAssetPage() {
    const params = useParams();
    const tag = params.tag as string; // The tag should now be the 5-char ID from the URL
    const [asset, setAsset] = useState<PublicAssetData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (tag) {
            const loadAsset = async () => {
                setLoading(true);
                setError(null);
                try {
                    // Validate tag format (optional but recommended client-side check)
                     if (!/^[A-Z0-9]{5}$/.test(tag)) {
                         throw new Error('Tag inválida.');
                     }

                    const data = await fetchPublicAssetData(tag);
                    setAsset(data);
                    if (data) {
                         // Log access - Get IP/UserAgent server-side if possible, or approximate client-side
                         // For now, log client-side (less reliable for IP)
                         // Ensure navigator is available (client-side)
                         if (typeof navigator !== 'undefined') {
                            logAccess(tag, 'N/A (Client)', navigator.userAgent);
                         }
                    } else {
                         setError('Ativo não encontrado ou não disponível publicamente.');
                    }
                } catch (err: any) { // Catch specific errors or general error
                    console.error('Error fetching asset data:', err);
                    setError(err.message || 'Ocorreu um erro ao carregar as informações do ativo.');
                } finally {
                    setLoading(false);
                }
            };
            loadAsset();
        } else {
             setError('Tag do ativo inválida.');
             setLoading(false);
        }

    }, [tag]);

    if (loading) {
        return (
             <div className="container mx-auto max-w-4xl py-10 px-4">
                 <Skeleton className="h-8 w-3/4 mb-4" />
                 <Skeleton className="h-4 w-1/4 mb-6" />
                 <Card>
                     <CardHeader>
                         <Skeleton className="h-6 w-1/2" />
                         <Skeleton className="h-4 w-1/3 mt-2" />
                     </CardHeader>
                     <CardContent className="space-y-4">
                         <Skeleton className="h-4 w-full" />
                         <Skeleton className="h-4 w-full" />
                         <Skeleton className="h-4 w-2/3" />
                          <Skeleton className="h-40 w-full mt-6" />
                     </CardContent>
                 </Card>
            </div>
        );
    }

    if (error || !asset) {
        return (
            <div className="container mx-auto max-w-4xl py-10 px-4 flex justify-center items-center h-[calc(100vh-200px)]">
                <Alert variant="destructive" className="w-full max-w-md">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Erro</AlertTitle>
                  <AlertDescription>
                    {error || 'Ativo não encontrado ou não disponível publicamente.'}
                  </AlertDescription>
                </Alert>
             </div>
        );
    }

     const publicCharacteristics = asset.characteristics.filter(c => c.isPublic);
     const publicAttachments = asset.attachments.filter(a => a.isPublic); // Filter attachments

    return (
         <div className="container mx-auto max-w-4xl py-10 px-4 bg-secondary/50"> {/* Light gray background for page */}
             <div className="flex justify-between items-start mb-4">
                 <div>
                     <h1 className="text-3xl font-bold text-primary">{asset.name}</h1>
                     <Badge variant="outline" className="mt-1">{asset.tag}</Badge>
                     {asset.category && <Badge variant="secondary" className="mt-1 ml-2">{asset.category}</Badge>}
                 </div>
                  {/* Optionally add a logo or branding here */}
             </div>

             {asset.status === 'lost' && (
                 <Alert variant="destructive" className="mb-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>ATIVO PERDIDO!</AlertTitle>
                    <AlertDescription>
                        Este item foi marcado como perdido. Se você o encontrou, por favor, entre em contato com a administração.
                    </AlertDescription>
                 </Alert>
             )}
             {asset.status === 'inactive' && (
                 <Alert variant="default" className="mb-6 bg-yellow-100 border-yellow-300 text-yellow-800">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Ativo Inativo</AlertTitle>
                    <AlertDescription>
                        Este item está atualmente marcado como inativo no sistema.
                    </AlertDescription>
                 </Alert>
             )}


            <Card className="shadow-lg"> {/* Add subtle shadow */}
                 <CardContent className="pt-6 space-y-6">
                     {/* Basic Info Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4">
                         {asset.location && (
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Localização</p>
                                    <p className="font-medium">{asset.location.name}</p>
                                </div>
                            </div>
                        )}
                         {asset.responsible && (
                            <div className="flex items-center gap-2">
                                <UserCircle className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Responsável</p>
                                    <p className="font-medium">{asset.responsible.name}</p>
                                </div>
                            </div>
                        )}
                         {asset.lastInventoryDate && (
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Último Inventário</p>
                                    <p className="font-medium">{new Date(asset.lastInventoryDate).toLocaleDateString('pt-BR')}</p>
                                </div>
                            </div>
                        )}
                    </div>


                     {asset.description && (
                         <div>
                             <h3 className="text-lg font-semibold mb-2">Descrição</h3>
                             <p className="text-muted-foreground">{asset.description}</p>
                         </div>
                     )}

                     {/* Characteristics Section */}
                     {publicCharacteristics.length > 0 && (
                         <div>
                             <h3 className="text-lg font-semibold mb-2">Características</h3>
                             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                                 {publicCharacteristics.map((char) => (
                                     <div key={char.key} className="text-sm">
                                         <span className="font-medium">{char.key}:</span>{' '}
                                         <span className="text-muted-foreground">{char.value}</span>
                                     </div>
                                 ))}
                             </div>
                         </div>
                     )}

                    {/* Photos Section */}
                    {asset.photos.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><ImageIcon className="h-5 w-5" /> Fotos</h3>
                             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {asset.photos.map((photo, index) => (
                                    <div key={index} className="relative aspect-video rounded-md overflow-hidden border">
                                        <Image
                                            src={photo.url}
                                            alt={photo.description || `${asset.name} - Foto ${index + 1}`}
                                            fill
                                            style={{ objectFit: 'cover' }}
                                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                                            />
                                        {photo.description && (
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                                                    {photo.description}
                                                </div>
                                            )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}


                     {/* Attachments Section - Only shows public attachments */}
                     {publicAttachments.length > 0 && (
                         <div>
                            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><LinkIcon className="h-5 w-5" /> Anexos Públicos</h3>
                             <ul className="space-y-2">
                                {publicAttachments.map((att, index) => (
                                    <li key={att.id || index}>
                                        <a
                                            href={att.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-accent hover:underline flex items-center gap-1"
                                        >
                                            <LinkIcon className="h-4 w-4" /> {att.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                         </div>
                     )}

                      {publicCharacteristics.length === 0 && asset.photos.length === 0 && publicAttachments.length === 0 && !asset.description && (
                         <p className="text-muted-foreground text-center py-4">Nenhuma informação pública adicional disponível para este ativo.</p>
                      )}

                 </CardContent>
             </Card>

             <footer className="mt-8 text-center text-xs text-muted-foreground">
                Gerenciado por QRIoT.app - Acesso registrado em {new Date().toLocaleString('pt-BR')}
             </footer>
         </div>
    );
}

