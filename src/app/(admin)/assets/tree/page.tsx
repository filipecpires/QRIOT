
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link'; // Import Link
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
    Building, MapPin, Package, QrCode as AssetIcon, User, AlertTriangle, ChevronRight, ChevronDown, Network, File, Home, CheckCircle, XCircle, MinusCircle,
    Edit, Eye, Trash2, MoreHorizontal // Icons for dropdown actions
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import DropdownMenu components
import { useToast } from '@/hooks/use-toast'; // Import useToast for delete action feedback
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog" // Import AlertDialog

// Define Node Types
type NodeType = 'company' | 'location' | 'asset';

// Define Node Data Structures
interface BaseNodeData {
    id: string;
    label: string; // Name or identifier
    type: NodeType;
    parentId?: string;
    // Raw children data from fetch, used for processing
    rawChildren?: TreeNode[];
}

interface CompanyNodeData extends BaseNodeData {
    type: 'company';
}

interface LocationNodeData extends BaseNodeData {
    type: 'location';
    gps?: { lat: number; lng: number };
}

interface AssetNodeData extends BaseNodeData {
    type: 'asset';
    tag: string; // Asset tag (now 5-char alphanumeric)
    status?: 'active' | 'lost' | 'inactive';
    responsibleUserName?: string; // Added responsible user name
    ownership?: 'own' | 'rented'; // Added ownership type
}

// Combined type for raw data structure
type TreeNode = CompanyNodeData | LocationNodeData | AssetNodeData;

// --- Mock Data Fetching ---
async function fetchHierarchicalData(): Promise<TreeNode> {
  await new Promise(resolve => setTimeout(resolve, 1500));

  const company: CompanyNodeData = {
    id: 'COMPANY_XYZ',
    label: 'Minha Empresa Exemplo',
    type: 'company',
  };

  const locations: LocationNodeData[] = [
    { id: 'loc1', label: 'Escritório Principal', type: 'location', parentId: 'COMPANY_XYZ', gps: { lat: -23.55, lng: -46.63 } },
    { id: 'loc2', label: 'Almoxarifado Central', type: 'location', parentId: 'COMPANY_XYZ', gps: { lat: -23.56, lng: -46.64 } },
    { id: 'loc1_floor1', label: '1º Andar', type: 'location', parentId: 'loc1' },
    { id: 'loc1_sala_reuniao', label: 'Sala Reunião Alfa', type: 'location', parentId: 'loc1_floor1' },
  ];

  const assets: AssetNodeData[] = [
    { id: 'ASSET001', label: 'Notebook Dell X', type: 'asset', parentId: 'loc1_floor1', tag: 'AB12C', status: 'active', responsibleUserName: 'João Silva', ownership: 'own' }, // Updated tag
    { id: 'ASSET002', label: 'Monitor LG 27"', type: 'asset', parentId: 'ASSET001', tag: 'DE34F', status: 'active', responsibleUserName: 'João Silva', ownership: 'own' }, // Asset child of asset, updated tag
    { id: 'ASSET003', label: 'Cadeira Escritório', type: 'asset', parentId: 'loc1_sala_reuniao', tag: 'GH56I', status: 'lost', responsibleUserName: 'Carlos Pereira', ownership: 'rented' }, // Updated tag
    { id: 'ASSET004', label: 'Projetor Epson', type: 'asset', parentId: 'loc1_sala_reuniao', tag: 'JK78L', status: 'inactive', responsibleUserName: 'Ana Costa', ownership: 'own' }, // Updated tag
    { id: 'ASSET007', label: 'Mesa Grande', type: 'asset', parentId: 'loc1_sala_reuniao', tag: 'MN90P', status: 'active', responsibleUserName: 'Carlos Pereira', ownership: 'rented' }, // Updated tag
    { id: 'ASSET008', label: 'Gaveteiro', type: 'asset', parentId: 'ASSET007', tag: 'QR12S', status: 'active', responsibleUserName: 'Carlos Pereira', ownership: 'own' }, // Asset child of asset, updated tag
    { id: 'ASSET009', label: 'Paleteira Manual', type: 'asset', parentId: 'loc2', tag: 'TU34V', status: 'active', responsibleUserName: 'Carlos Pereira', ownership: 'own' }, // Updated tag
  ];

  // Build Tree Structure
  const allNodes = [company, ...locations, ...assets];
  const nodeMap: { [key: string]: TreeNode & { rawChildren?: TreeNode[] } } = {};

  allNodes.forEach(node => {
    nodeMap[node.id] = { ...node, rawChildren: [] };
  });

  allNodes.forEach(node => {
    if (node.parentId && nodeMap[node.parentId]) {
      nodeMap[node.parentId].rawChildren?.push(nodeMap[node.id]);
    }
  });

  return nodeMap[company.id];
}

// Mock Delete Function
async function deleteAsset(assetId: string): Promise<{ success: boolean }> {
    console.log(`Attempting to delete asset ${assetId}`);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    // In a real app, perform the deletion in Firestore and handle errors
    return { success: true };
}

// --- End Mock Data Fetching ---


// --- Tree View Component ---
interface TreeViewNodeProps {
    node: TreeNode;
    level: number;
    expandedNodes: Set<string>;
    onToggleExpand: (nodeId: string) => void;
    onDeleteNode: (nodeId: string, nodeType: NodeType) => void; // Callback to update state after deletion
}

const TreeViewNode: React.FC<TreeViewNodeProps> = ({ node, level, expandedNodes, onToggleExpand, onDeleteNode }) => {
    const { toast } = useToast();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = !!node.rawChildren && node.rawChildren.length > 0;
    const iconClasses = "h-4 w-4 text-muted-foreground/80 flex-shrink-0"; // Slightly lighter than text

    const getNodeIcon = () => {
        if (node.type === 'company') return <Building className={iconClasses} />;
        if (node.type === 'location') {
             // Use Network icon if it has children, otherwise MapPin
             return hasChildren ? <Network className={iconClasses} /> : <MapPin className={iconClasses} />;
        }
        if (node.type === 'asset') {
            // Use Package for assets with children, AssetIcon for final assets
            return hasChildren ? <Package className={iconClasses} /> : <AssetIcon className={iconClasses} />;
        }
        return <File className={iconClasses} />; // Default icon
    };

     // Returns the appropriate status icon and tooltip
    const getStatusIndicator = () => {
        if (node.type !== 'asset') return null;
        const assetNode = node as AssetNodeData;
        switch (assetNode.status) {
            case 'active':
                 return <Tooltip><TooltipTrigger asChild><CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" /></TooltipTrigger><TooltipContent><p>Ativo</p></TooltipContent></Tooltip>;
            case 'lost':
                 return <Tooltip><TooltipTrigger asChild><XCircle className="h-4 w-4 text-destructive flex-shrink-0" /></TooltipTrigger><TooltipContent><p>Perdido</p></TooltipContent></Tooltip>;
            case 'inactive':
                 return <Tooltip><TooltipTrigger asChild><MinusCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" /></TooltipTrigger><TooltipContent><p>Inativo</p></TooltipContent></Tooltip>;
            default:
                return null;
        }
    };

    // Returns ownership icon and tooltip for assets
    const getOwnershipIndicator = () => {
        if (node.type !== 'asset') return null;
        const assetNode = node as AssetNodeData;
        if (!assetNode.ownership) return null;

        if (assetNode.ownership === 'rented') {
            return <Tooltip><TooltipTrigger asChild><Building className="h-3 w-3 text-orange-500 flex-shrink-0" /></TooltipTrigger><TooltipContent><p>Alugado</p></TooltipContent></Tooltip>;
        } else {
             return <Tooltip><TooltipTrigger asChild><Home className="h-3 w-3 text-blue-500 flex-shrink-0" /></TooltipTrigger><TooltipContent><p>Próprio</p></TooltipContent></Tooltip>;
        }
    };

    // Construct the public URL based on the asset tag
    const getPublicUrl = (tag: string) => {
        if (typeof window !== 'undefined') {
            return `${window.location.origin}/public/asset/${tag}`;
        }
        return '#'; // Fallback URL if window is not defined (SSR/build time)
    };

    const handleDeleteConfirm = async () => {
        if (node.type !== 'asset') return; // Only allow deleting assets for now
        const result = await deleteAsset(node.id);
        if (result.success) {
            toast({ title: "Sucesso", description: `Ativo ${node.label} excluído.` });
            onDeleteNode(node.id, node.type); // Notify parent to remove node from state
        } else {
            toast({ title: "Erro", description: "Falha ao excluir o ativo.", variant: "destructive" });
        }
        setIsDeleteDialogOpen(false);
    };


    // Click anywhere on the node container to trigger the dropdown if it's an asset
    const NodeContainer = node.type === 'asset' ? DropdownMenuTrigger : 'div';
    // For assets, use asChild and apply block class
    // For non-assets, handle expand/collapse and apply cursor-pointer if it has children
    const nodeContainerProps = node.type === 'asset'
        ? { asChild: true, className: "cursor-pointer w-full block" }
        : { onClick: () => hasChildren && onToggleExpand(node.id), className: cn("w-full", hasChildren ? "cursor-pointer" : "") };


    return (
        <li className="relative">
          <DropdownMenu>
             <NodeContainer {...nodeContainerProps}>
                 <div
                     className={cn(
                         "flex items-center space-x-1 py-1 px-2 rounded hover:bg-muted/50 group",
                     )}
                     style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }} // Indentation based on level
                     // Click handler removed for assets, handled by DropdownMenuTrigger
                     // For non-assets, it's handled by the NodeContainer's onClick
                 >
                      {/* Toggle Button */}
                     <div className="w-4 flex-shrink-0">
                         {hasChildren && (
                             <Button
                                 variant="ghost"
                                 size="icon"
                                 className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                                 // Prevent dropdown trigger, only expand/collapse
                                 onClick={(e) => { e.stopPropagation(); onToggleExpand(node.id); }}
                                 aria-label={isExpanded ? 'Recolher' : 'Expandir'}
                             >
                                 {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                             </Button>
                          )}
                      </div>

                     {/* Node Icon */}
                      {getNodeIcon()}

                     {/* Label and Details */}
                     <div className="flex-grow overflow-hidden text-sm flex items-center gap-1.5">
                        <span className="font-medium truncate text-foreground/90" title={node.label}>{node.label}</span>
                         {node.type === 'asset' && (node as AssetNodeData).tag && (
                            <span className="text-xs text-muted-foreground">({(node as AssetNodeData).tag})</span>
                        )}
                        {/* Ownership and Responsible for Assets */}
                        {node.type === 'asset' && getOwnershipIndicator()}
                         {node.type === 'asset' && (node as AssetNodeData).responsibleUserName && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                     <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <User className="h-3 w-3"/> {(node as AssetNodeData).responsibleUserName}
                                     </span>
                                </TooltipTrigger>
                                 <TooltipContent>
                                    <p>Responsável: {(node as AssetNodeData).responsibleUserName}</p>
                                </TooltipContent>
                            </Tooltip>
                          )}
                          {/* GPS for Locations */}
                         {node.type === 'location' && (node as LocationNodeData).gps && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0"/>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>GPS: {(node as LocationNodeData).gps?.lat.toFixed(4)}, {(node as LocationNodeData).gps?.lng.toFixed(4)}</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                     </div>


                      {/* Status Indicator (Icon) - aligned to the right */}
                       <div className="ml-auto pl-2 flex-shrink-0">
                          {node.type === 'asset' && getStatusIndicator()}
                       </div>

                 </div>
              </NodeContainer>


             {/* Dropdown Content (only for assets) */}
             {node.type === 'asset' && (
                <DropdownMenuContent align="start">
                     <DropdownMenuLabel>{node.label}</DropdownMenuLabel>
                     <DropdownMenuSeparator />
                     <DropdownMenuItem asChild>
                       <Link href={`/assets/${node.id}/edit`}>
                         <Edit className="mr-2 h-4 w-4" /> Editar
                       </Link>
                     </DropdownMenuItem>
                     <DropdownMenuItem asChild>
                       <Link href={getPublicUrl((node as AssetNodeData).tag)} target="_blank">
                         <Eye className="mr-2 h-4 w-4" /> Ver Página Pública
                       </Link>
                     </DropdownMenuItem>
                     <DropdownMenuSeparator />
                     <DropdownMenuItem
                         className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                         onSelect={(e) => {
                            e.preventDefault(); // Prevent closing menu
                            setIsDeleteDialogOpen(true); // Open confirmation dialog
                         }}
                      >
                       <Trash2 className="mr-2 h-4 w-4" /> Excluir
                     </DropdownMenuItem>
                </DropdownMenuContent>
              )}
            </DropdownMenu>

             {/* Children Nodes */}
            {isExpanded && hasChildren && node.rawChildren && (
                <ul className="pl-0"> {/* No extra padding needed, handled by child padding */}
                    {node.rawChildren.map((child, index) => (
                        <TreeViewNode
                            key={child.id}
                            node={child}
                            level={level + 1}
                            expandedNodes={expandedNodes}
                            onToggleExpand={onToggleExpand}
                            onDeleteNode={onDeleteNode}
                        />
                    ))}
                </ul>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                 <AlertDialogContent>
                     <AlertDialogHeader>
                       <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                       <AlertDialogDescription>
                         Tem certeza que deseja excluir o ativo "{node.label}" ({ (node as AssetNodeData).tag })? Esta ação não pode ser desfeita.
                       </AlertDialogDescription>
                     </AlertDialogHeader>
                     <AlertDialogFooter>
                       <AlertDialogCancel>Cancelar</AlertDialogCancel>
                       <AlertDialogAction
                         onClick={handleDeleteConfirm}
                         className="bg-destructive hover:bg-destructive/90"
                       >
                         Confirmar Exclusão
                       </AlertDialogAction>
                     </AlertDialogFooter>
                 </AlertDialogContent>
            </AlertDialog>
        </li>
    );
};
// --- End Tree View Component ---


export default function AssetTreePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rootData, setRootData] = useState<TreeNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const handleToggleExpand = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
        const newSet = new Set(prev);
        if (newSet.has(nodeId)) {
            newSet.delete(nodeId);
            // Optional: Collapse children recursively if desired
            // findChildrenRecursively(nodeId, rootData).forEach(id => newSet.delete(id));
        } else {
            newSet.add(nodeId);
            // Optional: Expand parent nodes if collapsing children is implemented above
        }
        return newSet;
        });
    }, []);

   // Function to remove a node from the tree state
    const handleDeleteNode = useCallback((nodeId: string, nodeType: NodeType) => {
        // This function needs to recursively find and remove the node from the rootData state.
        // This is a complex operation depending on how your data is structured.
        // For simplicity, we'll just refetch the data for now.
        // A more optimized approach would be to update the state directly.
        console.log(`Node ${nodeId} deleted, refetching data...`);
        // Refetch data to reflect the deletion
        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                const fetchedRootData = await fetchHierarchicalData();
                 if (!fetchedRootData) {
                   setError("Nenhum dado encontrado para a árvore.");
                   setRootData(null);
                 } else {
                     setRootData(fetchedRootData);
                     // Keep existing expanded state or reset it
                      // const initialExpanded = new Set([fetchedRootData.id]);
                      // if (fetchedRootData.rawChildren) {
                      //     fetchedRootData.rawChildren.forEach(child => initialExpanded.add(child.id));
                      // }
                      // setExpandedNodes(initialExpanded);
                 }
            } catch (err) {
                 console.error("Error refetching hierarchical data:", err);
                 setError("Falha ao recarregar a árvore hierárquica.");
                 setRootData(null);
             } finally {
                 setLoading(false);
             }
         };
         loadData();

    }, []);


  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedRootData = await fetchHierarchicalData();
        if (!fetchedRootData) {
           setError("Nenhum dado encontrado para a árvore.");
           setRootData(null);
        } else {
            setRootData(fetchedRootData);
            // Initially expand the root node and its direct children
            const initialExpanded = new Set([fetchedRootData.id]);
            // Automatically expand first level of locations
            if (fetchedRootData.rawChildren) {
                 fetchedRootData.rawChildren.forEach(child => {
                     if (child.type === 'location') {
                        initialExpanded.add(child.id);
                        // Optionally expand one more level if needed
                        // if (child.rawChildren) {
                        //     child.rawChildren.forEach(grandChild => initialExpanded.add(grandChild.id));
                        // }
                     }
                 });
            }
            setExpandedNodes(initialExpanded);
        }
      } catch (err) {
        console.error("Error fetching hierarchical data:", err);
        setError("Falha ao carregar a árvore hierárquica.");
        setRootData(null);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []); // Fetch data only once


  return (
    <TooltipProvider> {/* Wrap with TooltipProvider */}
        <div className="space-y-6 h-full flex flex-col">
          <h1 className="text-3xl font-bold mb-6 flex-shrink-0">Árvore Hierárquica</h1>

          <Card className="flex-grow flex flex-col">
             <CardContent className="flex-grow p-2 border rounded-lg overflow-auto">
                {loading && <Skeleton className="h-64 w-full" />}
                {error && (
                <div className="flex items-center justify-center h-full text-destructive p-4">
                  {error}
                </div>
                )}
                {!loading && !error && rootData && (
                <ul className="space-y-0"> {/* List structure for the tree */}
                  <TreeViewNode
                    node={rootData}
                    level={0}
                    expandedNodes={expandedNodes}
                    onToggleExpand={handleToggleExpand}
                    onDeleteNode={handleDeleteNode}
                  />
                </ul>
                )}
                {!loading && !error && !rootData && (
                <div className="flex items-center justify-center h-full text-muted-foreground p-4">
                   Nenhum dado para exibir na árvore.
                </div>
                )}
            </CardContent>
          </Card>

        {/* Legend moved to the bottom */}
           <div className="text-xs text-muted-foreground mt-4 flex flex-wrap gap-x-4 gap-y-1 justify-center items-center">
              <span className="font-semibold mr-2">Legenda:</span>
              <span className="flex items-center gap-1"><Building className="inline h-3 w-3 text-muted-foreground/80" /> Empresa</span>
              <span className="flex items-center gap-1"><Network className="inline h-3 w-3 text-muted-foreground/80"/> Local (com filhos)</span>
              <span className="flex items-center gap-1"><MapPin className="inline h-3 w-3 text-muted-foreground/80" /> Local Final</span>
              <span className="flex items-center gap-1"><Package className="inline h-3 w-3 text-muted-foreground/80"/> Ativo Pai</span>
              <span className="flex items-center gap-1"><AssetIcon className="inline h-3 w-3 text-muted-foreground/80"/> Ativo Final</span>
              <span className="ml-2 flex items-center gap-1"><Home className="h-3 w-3 text-blue-500" /> Próprio</span>
              <span className="flex items-center gap-1"><Building className="h-3 w-3 text-orange-500" /> Alugado</span>
               <span className="ml-2 flex items-center gap-1"><CheckCircle className="h-3 w-3 text-green-600"/> Ativo</span>
              <span className="flex items-center gap-1"><XCircle className="h-3 w-3 text-destructive"/> Perdido</span>
              <span className="flex items-center gap-1"><MinusCircle className="h-3 w-3 text-muted-foreground"/> Inativo</span>
           </div>
        </div>
     </TooltipProvider>
  );
}

