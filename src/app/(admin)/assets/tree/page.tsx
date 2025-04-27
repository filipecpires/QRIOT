
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  MarkerType,
  Position,
  Handle,
} from 'reactflow';

import 'reactflow/dist/style.css'; // Ensure styles are imported

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Building, MapPin, QrCode as AssetIcon, GitBranch, User, PlusCircle, MinusCircle, AlertTriangle } from 'lucide-react'; // Added User, PlusCircle, MinusCircle, AlertTriangle
import { Button } from '@/components/ui/button'; // Import Button for expand/collapse

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
}

// Combined type for raw data structure
type TreeNode = CompanyNodeData | LocationNodeData | AssetNodeData;

// Type for nodes used in React Flow state, includes rendering info
interface FlowNodeData extends BaseNodeData {
    hasChildren: boolean;
    isExpanded: boolean;
    onToggleExpand: (nodeId: string) => void;
    status?: 'active' | 'lost' | 'inactive'; // Include status for styling
    responsibleUserName?: string; // Include responsible user for display
    tag?: string; // Include tag for display
    gps?: { lat: number; lng: number }; // Include gps for display
}


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
    { id: 'ASSET001', label: 'Notebook Dell X', type: 'asset', parentId: 'loc1_floor1', tag: 'TI-NB-001', status: 'active', responsibleUserName: 'João Silva' },
    { id: 'ASSET002', label: 'Monitor LG 27"', type: 'asset', parentId: 'ASSET001', tag: 'TI-MN-005', status: 'active', responsibleUserName: 'João Silva' }, // Asset child of asset
    { id: 'ASSET003', label: 'Cadeira Escritório', type: 'asset', parentId: 'loc1_sala_reuniao', tag: 'MOB-CAD-012', status: 'lost', responsibleUserName: 'Carlos Pereira' },
    { id: 'ASSET004', label: 'Projetor Epson', type: 'asset', parentId: 'loc1_sala_reuniao', tag: 'TI-PROJ-002', status: 'inactive', responsibleUserName: 'Ana Costa' },
    { id: 'ASSET007', label: 'Mesa Grande', type: 'asset', parentId: 'loc1_sala_reuniao', tag: 'MOB-MES-001', status: 'active', responsibleUserName: 'Carlos Pereira' },
    { id: 'ASSET008', label: 'Gaveteiro', type: 'asset', parentId: 'ASSET007', tag: 'MOB-GAV-002', status: 'active', responsibleUserName: 'Carlos Pereira' }, // Asset child of asset
    { id: 'ASSET009', label: 'Paleteira Manual', type: 'asset', parentId: 'loc2', tag: 'ALM-PAL-001', status: 'active', responsibleUserName: 'Carlos Pereira' },
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

// Custom Node Component
const CustomNode: React.FC<{ data: FlowNodeData }> = React.memo(({ data }) => {
  const getNodeIcon = () => {
    switch (data.type) {
      case 'company': return <Building className="h-5 w-5 text-blue-600" />;
      case 'location': return <MapPin className="h-5 w-5 text-green-600" />;
      case 'asset': return <AssetIcon className="h-5 w-5 text-orange-600" />;
      default: return <GitBranch className="h-5 w-5 text-gray-500" />;
    }
  };

   const getStatusColorClass = () => {
    if (data.type === 'asset') {
      switch (data.status) {
        case 'lost': return 'bg-destructive/10 border-destructive';
        case 'inactive': return 'bg-gray-400/10 border-gray-400 opacity-70';
        case 'active': return 'bg-green-500/10 border-green-500';
        default: return 'bg-card border-border';
      }
    }
    return 'bg-card border-border'; // Default for non-assets
  };


  return (
    <div className={cn(
        "react-flow__node-default flex items-center gap-2 p-2 rounded-lg border-2 shadow-md text-card-foreground min-w-[200px] relative",
        getStatusColorClass(),
        data.type === 'company' && 'border-blue-500',
        // Use status color primarily for assets, keep type borders minimal or remove
        // data.type === 'location' && 'border-green-500',
        // data.type === 'asset' && 'border-orange-500',
      )}
      >
       {/* Input handle (target) - always on top */}
        <Handle type="target" position={Position.Top} className="!bg-primary !opacity-0" />

        {/* Expand/Collapse Button */}
        {data.hasChildren && (
             <button
                onClick={(e) => { e.stopPropagation(); data.onToggleExpand(data.id); }}
                className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 p-0 h-5 w-5 bg-background rounded-full border text-primary hover:bg-accent"
                aria-label={data.isExpanded ? 'Recolher' : 'Expandir'}
            >
                {data.isExpanded ? <MinusCircle className="h-5 w-5" /> : <PlusCircle className="h-5 w-5" />}
            </button>
        )}


        {getNodeIcon()}
        <div className="flex-grow overflow-hidden">
            <div className="font-semibold text-sm truncate" title={data.label}>{data.label}</div>
            {data.type === 'asset' && data.tag && <div className="text-xs text-muted-foreground">{data.tag}</div>}
            {data.type === 'location' && data.gps && <div className="text-xs text-muted-foreground">GPS: {data.gps.lat.toFixed(2)}, {data.gps.lng.toFixed(2)}</div>}
            {data.type === 'asset' && data.responsibleUserName && <div className="text-xs text-muted-foreground flex items-center gap-1"><User className="h-3 w-3"/> {data.responsibleUserName}</div>}
        </div>
        {/* Removed Badge */}
        {data.type === 'asset' && data.status === 'lost' && <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" title="Perdido"/>}

        {/* Output handle (source) - always on bottom */}
        <Handle type="source" position={Position.Bottom} className="!bg-primary !opacity-0" />
    </div>
  );
});
CustomNode.displayName = 'CustomNode';

const nodeTypes = {
    custom: CustomNode,
};

// Function to transform hierarchical data into React Flow nodes and edges
const transformToFlowData = (
    rootNode: TreeNode,
    expandedNodes: Set<string>,
    onToggleExpand: (nodeId: string) => void
) => {
  const nodes: Node<FlowNodeData>[] = [];
  const edges: Edge[] = [];
  const nodeSpacingY = 100;
  const levelSpacingX = 250;

  const processNode = (
      treeNode: TreeNode,
      level: number,
      positionY: number,
      parentX: number | null = null,
      parentIsExpanded: boolean = true // Root parent is always "expanded"
  ): number => {
    // Only add node if its parent is expanded
    if (!parentIsExpanded) return positionY;

    const isExpanded = expandedNodes.has(treeNode.id);
    const hasChildren = !!treeNode.rawChildren && treeNode.rawChildren.length > 0;

    nodes.push({
      id: treeNode.id,
      type: 'custom',
      position: { x: level * levelSpacingX, y: positionY },
      data: {
         ...treeNode, // Spread original data
         hasChildren: hasChildren,
         isExpanded: isExpanded,
         onToggleExpand: onToggleExpand,
         // Pass specific fields needed for display/styling if not already present
         status: (treeNode as AssetNodeData).status,
         responsibleUserName: (treeNode as AssetNodeData).responsibleUserName,
         tag: (treeNode as AssetNodeData).tag,
         gps: (treeNode as LocationNodeData).gps,
      },
      // draggable: false, // Consider making nodes non-draggable for layout stability
    });

    let currentY = positionY + nodeSpacingY;
    let maxChildY = positionY;

    if (hasChildren && treeNode.rawChildren) {
       // Basic horizontal distribution for direct children
       const childrenCount = treeNode.rawChildren.length;
       //let startX = (level + 1) * levelSpacingX - (childrenCount > 1 ? levelSpacingX / 3 * (childrenCount - 1) / 2 : 0); // Adjust starting X for children


      treeNode.rawChildren.forEach((child, index) => {
          // Only create edge if child node will also be rendered (i.e., if current node is expanded)
         if (isExpanded) {
            edges.push({
              id: `e-${treeNode.id}-${child.id}`,
              source: treeNode.id,
              target: child.id,
              type: 'smoothstep',
              markerEnd: { type: MarkerType.ArrowClosed, width: 15, height: 15, color: 'hsl(var(--primary))' },
              style: { stroke: 'hsl(var(--primary))' },
            });
         }

        // Recursively process child node, passing the current node's expansion state
        const childMaxY = processNode(child, level + 1, currentY, level * levelSpacingX, isExpanded);
        maxChildY = Math.max(maxChildY, childMaxY);
        currentY = childMaxY + nodeSpacingY; // Position next child below the previous one's branch
      });
    }

     return maxChildY;
  };

    processNode(rootNode, 0, 0);


     // Placeholder for automatic layouting (ELK/Dagre) - would replace the manual position calculation
    // const getLayoutedElements = (nodes, edges) => { ... return layoutedNodesAndEdges };
    // const { initialNodes, initialEdges } = getLayoutedElements(calculatedNodes, calculatedEdges);

  return { initialNodes: nodes, initialEdges: edges };
};


export default function AssetTreePage() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rootData, setRootData] = useState<TreeNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const handleToggleExpand = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
        const newSet = new Set(prev);
        if (newSet.has(nodeId)) {
            newSet.delete(nodeId);
            // Optionally, collapse children recursively
            // findChildrenRecursively(nodeId, rootData).forEach(id => newSet.delete(id));
        } else {
            newSet.add(nodeId);
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
           setNodes([]);
           setEdges([]);
        } else {
            setRootData(fetchedRootData);
            // Initially expand the root node
            setExpandedNodes(new Set([fetchedRootData.id]));
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

   // Re-calculate nodes and edges when rootData or expandedNodes change
  useEffect(() => {
        if (rootData) {
            const { initialNodes, initialEdges } = transformToFlowData(rootData, expandedNodes, handleToggleExpand);
            setNodes(initialNodes);
            setEdges(initialEdges);
             // TODO: Consider using a layout algorithm here after nodes/edges are set
        } else {
            setNodes([]);
            setEdges([]);
        }
    }, [rootData, expandedNodes, handleToggleExpand, setNodes, setEdges]);


  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node<FlowNodeData>) => {
    console.log('Node clicked:', node);
    // Navigate based on node type or toggle expand
    // Example: Toggle on click if it has children
     if (node.data.hasChildren) {
        // handleToggleExpand(node.id); // Or trigger navigation
     }
    // if (node.data.type === 'asset') {
    //   router.push(`/assets/${node.id}/edit`);
    // } else if (node.data.type === 'location') {
    //   router.push(`/locations/${node.id}/edit`);
    // }
  }, [handleToggleExpand]);

  return (
    <div className="space-y-6 h-full flex flex-col"> {/* Ensure full height and flex column */}
      <h1 className="text-3xl font-bold mb-6 flex-shrink-0">Árvore Hierárquica</h1>

      <Card className="flex-grow flex flex-col"> {/* Make card grow and contain */}
        <CardHeader className="flex-shrink-0">
          <CardTitle>Visualização Estrutural</CardTitle>
          <CardDescription>
            Explore a estrutura da empresa, locais e ativos. Use os botões (+/-) para expandir/recolher.
             <span className="ml-4">Legenda: <span className="inline-block w-3 h-3 bg-green-500/50 border border-green-600 rounded-sm"></span> Ativo <span className="inline-block w-3 h-3 bg-destructive/30 border border-destructive rounded-sm"></span> Perdido <span className="inline-block w-3 h-3 bg-gray-400/30 border border-gray-500 rounded-sm"></span> Inativo</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow p-0 border-t rounded-b-lg overflow-hidden relative"> {/* Ensure content grows */}
          {loading && <Skeleton className="absolute inset-0 h-full w-full" />}
          {error && (
            <div className="flex items-center justify-center h-full text-destructive p-4">
              {error}
            </div>
          )}
          {!loading && !error && nodes.length > 0 && (
             // Wrap ReactFlow in a div with defined height and width
             <div className="h-full w-full">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    nodeTypes={nodeTypes}
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                    proOptions={{ hideAttribution: true }}
                    className="bg-background"
                    // Remove default panning on drag, allow node drag
                    panOnDrag={true} // Keep panning enabled
                    nodesDraggable={true} // Allow nodes to be dragged for manual adjustment
                    // Prevent selection on drag start
                    panOnScroll
                    selectionOnDrag={false}
                >
                    <Controls />
                    <MiniMap nodeStrokeWidth={3} zoomable pannable />
                    <Background gap={16} />
                </ReactFlow>
            </div>
           )}
            {!loading && !error && nodes.length === 0 && (
             <div className="flex items-center justify-center h-full text-muted-foreground p-4">
               Nenhum dado para exibir na árvore.
            </div>
           )}
        </CardContent>
      </Card>
       {/* <p className="text-sm text-muted-foreground mt-4 flex-shrink-0">
          Navegue pela estrutura organizacional e de ativos. A disposição dos nós pode precisar de ajustes para árvores complexas (implementar layout automático).
      </p> */}
    </div>
  );
}

    