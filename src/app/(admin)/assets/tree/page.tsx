
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Building, MapPin, QrCode as AssetIcon, User, AlertTriangle, ChevronRight, ChevronDown, Folder, FolderOpen, File, Package, Home, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Import Tooltip

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
    tag: string; // Asset tag
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
    { id: 'ASSET001', label: 'Notebook Dell X', type: 'asset', parentId: 'loc1_floor1', tag: 'TI-NB-001', status: 'active', responsibleUserName: 'João Silva', ownership: 'own' },
    { id: 'ASSET002', label: 'Monitor LG 27"', type: 'asset', parentId: 'ASSET001', tag: 'TI-MN-005', status: 'active', responsibleUserName: 'João Silva', ownership: 'own' }, // Asset child of asset
    { id: 'ASSET003', label: 'Cadeira Escritório', type: 'asset', parentId: 'loc1_sala_reuniao', tag: 'MOB-CAD-012', status: 'lost', responsibleUserName: 'Carlos Pereira', ownership: 'rented' },
    { id: 'ASSET004', label: 'Projetor Epson', type: 'asset', parentId: 'loc1_sala_reuniao', tag: 'TI-PROJ-002', status: 'inactive', responsibleUserName: 'Ana Costa', ownership: 'own' },
    { id: 'ASSET007', label: 'Mesa Grande', type: 'asset', parentId: 'loc1_sala_reuniao', tag: 'MOB-MES-001', status: 'active', responsibleUserName: 'Carlos Pereira', ownership: 'rented' },
    { id: 'ASSET008', label: 'Gaveteiro', type: 'asset', parentId: 'ASSET007', tag: 'MOB-GAV-002', status: 'active', responsibleUserName: 'Carlos Pereira', ownership: 'own' }, // Asset child of asset
    { id: 'ASSET009', label: 'Paleteira Manual', type: 'asset', parentId: 'loc2', tag: 'ALM-PAL-001', status: 'active', responsibleUserName: 'Carlos Pereira', ownership: 'own' },
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
// --- End Mock Data Fetching ---


// --- Tree View Component ---
interface TreeViewNodeProps {
    node: TreeNode;
    level: number;
    expandedNodes: Set<string>;
    onToggleExpand: (nodeId: string) => void;
    isLast: boolean; // Flag to help with line drawing (optional)
}

const TreeViewNode: React.FC<TreeViewNodeProps> = ({ node, level, expandedNodes, onToggleExpand, isLast }) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = !!node.rawChildren && node.rawChildren.length > 0;

    const getNodeIcon = () => {
        if (node.type === 'company') return <Building className="h-4 w-4 text-blue-600 flex-shrink-0" />;
        if (node.type === 'location') {
             // Use Folder icons if it has children, otherwise MapPin
             return hasChildren ? (isExpanded ? <FolderOpen className="h-4 w-4 text-yellow-600 flex-shrink-0"/> : <Folder className="h-4 w-4 text-yellow-600 flex-shrink-0"/>) : <MapPin className="h-4 w-4 text-green-600 flex-shrink-0" />;
        }
        if (node.type === 'asset') {
            // Use Package icon if it has children (parent asset), otherwise QrCode (final asset)
            return hasChildren ? <Package className="h-4 w-4 text-indigo-600 flex-shrink-0"/> : <AssetIcon className="h-4 w-4 text-orange-600 flex-shrink-0" />;
        }
        return <File className="h-4 w-4 text-gray-500 flex-shrink-0" />; // Default icon
    };

    // Determines text color based on status, now mainly for inactive effect
    const getStatusTextColorClass = () => {
        if (node.type === 'asset') {
            switch ((node as AssetNodeData).status) {
                case 'inactive': return 'text-muted-foreground italic opacity-70';
                // Other statuses handled by icon color
                default: return 'text-card-foreground';
            }
        }
        return 'text-card-foreground';
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

    return (
        <li className="relative">
            <div
                className={cn(
                    "flex items-center space-x-1 py-1 px-2 rounded hover:bg-muted/50 cursor-pointer group", // Added group for hover effects on indicators
                    getStatusTextColorClass()
                )}
                style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }} // Indentation based on level
                onClick={() => hasChildren && onToggleExpand(node.id)} // Toggle on click if it has children
            >
                 {/* Toggle Button */}
                <div className="w-4 flex-shrink-0">
                    {hasChildren && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 p-0"
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
                     <span className="font-medium truncate" title={node.label}>{node.label}</span>
                     {node.type === 'asset' && (node as AssetNodeData).tag && (
                         <span className="text-xs text-muted-foreground">({(node as AssetNodeData).tag})</span>
                     )}
                      {/* Ownership Indicator */}
                     {node.type === 'asset' && getOwnershipIndicator()}
                      {(node as AssetNodeData).responsibleUserName && (
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
                 </div>

                 {/* Status Indicator (Icon) - aligned to the right */}
                  <div className="ml-auto pl-2 flex-shrink-0">
                     {node.type === 'asset' && getStatusIndicator()}
                  </div>


            </div>

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
                            isLast={index === node.rawChildren!.length - 1}
                        />
                    ))}
                </ul>
            )}
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
            if (fetchedRootData.rawChildren) {
                 fetchedRootData.rawChildren.forEach(child => initialExpanded.add(child.id));
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
                    isLast={true}
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
              <span className="flex items-center gap-1"><Building className="inline h-3 w-3 text-blue-600" /> Empresa</span>
              <span className="flex items-center gap-1"><Folder className="inline h-3 w-3 text-yellow-600"/> Local (com filhos)</span>
              <span className="flex items-center gap-1"><MapPin className="inline h-3 w-3 text-green-600" /> Local Final</span>
              <span className="flex items-center gap-1"><Package className="inline h-3 w-3 text-indigo-600"/> Ativo Pai</span>
              <span className="flex items-center gap-1"><AssetIcon className="inline h-3 w-3 text-orange-600"/> Ativo Final</span>
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
    

