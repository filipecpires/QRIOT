
'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Position, // Import Position for handle placement
  Handle, // Import Handle explicitly
} from 'reactflow';

import 'reactflow/dist/style.css'; // Ensure styles are imported

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Building, MapPin, QrCode as AssetIcon, GitBranch } from 'lucide-react'; // Use relevant icons
import { Badge } from '@/components/ui/badge'; // For node badges

// Define Node Types
type NodeType = 'company' | 'location' | 'asset';

// Define Node Data Structures
interface BaseNodeData {
    id: string;
    label: string; // Name or identifier
    type: NodeType;
    parentId?: string;
    children?: TreeNode[]; // Generic children array
}

interface CompanyNodeData extends BaseNodeData {
    type: 'company';
    // Add company-specific data if needed
}

interface LocationNodeData extends BaseNodeData {
    type: 'location';
    gps?: { lat: number; lng: number };
    // Add location-specific data if needed
}

interface AssetNodeData extends BaseNodeData {
    type: 'asset';
    tag: string; // Asset tag
    status?: 'active' | 'lost' | 'inactive';
    // Add asset-specific data if needed
}

type TreeNode = CompanyNodeData | LocationNodeData | AssetNodeData;

// --- Mock Data Fetching ---
// In a real app, fetch this data from your backend (e.g., Firestore)
async function fetchHierarchicalData(): Promise<TreeNode> {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay

  // Mock Data - Replace with your actual data structure
  const company: CompanyNodeData = {
    id: 'COMPANY_XYZ',
    label: 'Minha Empresa Exemplo',
    type: 'company',
  };

  const locations: LocationNodeData[] = [
    { id: 'loc1', label: 'Escritório Principal', type: 'location', parentId: 'COMPANY_XYZ', gps: { lat: -23.55, lng: -46.63 } },
    { id: 'loc2', label: 'Almoxarifado Central', type: 'location', parentId: 'COMPANY_XYZ', gps: { lat: -23.56, lng: -46.64 } },
    { id: 'loc1_floor1', label: '1º Andar', type: 'location', parentId: 'loc1' }, // Sub-location
    { id: 'loc1_sala_reuniao', label: 'Sala Reunião Alfa', type: 'location', parentId: 'loc1_floor1' }, // Sub-sub-location
  ];

  const assets: AssetNodeData[] = [
    { id: 'ASSET001', label: 'Notebook Dell X', type: 'asset', parentId: 'loc1_floor1', tag: 'TI-NB-001', status: 'active' },
    { id: 'ASSET002', label: 'Monitor LG 27"', type: 'asset', parentId: 'ASSET001', tag: 'TI-MN-005', status: 'active' }, // Asset child of asset
    { id: 'ASSET003', label: 'Cadeira Escritório', type: 'asset', parentId: 'loc1_sala_reuniao', tag: 'MOB-CAD-012', status: 'lost' },
    { id: 'ASSET004', label: 'Projetor Epson', type: 'asset', parentId: 'loc1_sala_reuniao', tag: 'TI-PROJ-002', status: 'inactive' },
    { id: 'ASSET007', label: 'Mesa Grande', type: 'asset', parentId: 'loc1_sala_reuniao', tag: 'MOB-MES-001', status: 'active' },
    { id: 'ASSET008', label: 'Gaveteiro', type: 'asset', parentId: 'ASSET007', tag: 'MOB-GAV-002', status: 'active' }, // Asset child of asset
    { id: 'ASSET009', label: 'Paleteira Manual', type: 'asset', parentId: 'loc2', tag: 'ALM-PAL-001', status: 'active' },
  ];

  // --- Build Tree Structure (Simple Example) ---
  const allNodes = [company, ...locations, ...assets];
  const nodeMap: { [key: string]: TreeNode & { children?: TreeNode[] } } = {};

  // Initialize map and children arrays
  allNodes.forEach(node => {
    nodeMap[node.id] = { ...node, children: [] };
  });

  // Link children to parents
  allNodes.forEach(node => {
    if (node.parentId && nodeMap[node.parentId]) {
      nodeMap[node.parentId].children?.push(nodeMap[node.id]);
    }
  });

  // Return the root node (company)
  return nodeMap[company.id];
}
// --- End Mock Data Fetching ---


// Custom Node Component (Optional but Recommended for Styling)
const CustomNode: React.FC<{ data: TreeNode }> = ({ data }) => {
  const getNodeIcon = () => {
    switch (data.type) {
      case 'company': return <Building className="h-5 w-5 text-blue-600" />;
      case 'location': return <MapPin className="h-5 w-5 text-green-600" />;
      case 'asset': return <AssetIcon className="h-5 w-5 text-orange-600" />;
      default: return <GitBranch className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = () => {
      if (data.type === 'asset' && data.status) {
          switch (data.status) {
              case 'lost': return <Badge variant="destructive" className="ml-2 text-xs">Perdido</Badge>;
              case 'inactive': return <Badge variant="secondary" className="ml-2 text-xs">Inativo</Badge>;
              default: return null; // Active doesn't need a badge here
          }
      }
      return null;
  }

  return (
    <div className={cn(
        "react-flow__node-default flex items-center gap-2 p-3 rounded-lg border shadow-md bg-card text-card-foreground min-w-[180px]",
        data.type === 'company' && 'border-blue-500',
        data.type === 'location' && 'border-green-500',
        data.type === 'asset' && 'border-orange-500',
      )}
      >
       {/* Input handle (target) - always on top */}
        <Handle type="target" position={Position.Top} className="!bg-primary" />

        {getNodeIcon()}
        <div className="flex-grow">
            <div className="font-semibold text-sm">{data.label}</div>
            {data.type === 'asset' && <div className="text-xs text-muted-foreground">{data.tag}</div>}
            {data.type === 'location' && data.gps && <div className="text-xs text-muted-foreground">GPS: {data.gps.lat.toFixed(2)}, {data.gps.lng.toFixed(2)}</div>}
        </div>
        {getStatusBadge()}

        {/* Output handle (source) - always on bottom */}
        <Handle type="source" position={Position.Bottom} className="!bg-primary" />
    </div>
  );
};

const nodeTypes = {
    custom: CustomNode, // Register the custom node
};

// Function to transform hierarchical data into React Flow nodes and edges using simple vertical layout
const transformToFlowData = (rootNode: TreeNode) => {
  const nodes: Node<TreeNode>[] = [];
  const edges: Edge[] = [];
  const nodeSpacingY = 120; // Vertical spacing
  const levelSpacingX = 250; // Horizontal spacing per level

  const processNode = (treeNode: TreeNode, level: number, positionY: number, parentX: number | null = null): number => {
    const positionX = level * levelSpacingX;

    nodes.push({
      id: treeNode.id,
      type: 'custom', // Use the custom node type
      position: { x: positionX, y: positionY },
      data: treeNode,
      // draggable: false, // Consider making nodes non-draggable for layout stability
    });

    let currentY = positionY + nodeSpacingY;
    let maxChildY = positionY; // Track the maximum Y used by this branch

    if (treeNode.children && treeNode.children.length > 0) {
       // Basic horizontal distribution for direct children
       const childrenCount = treeNode.children.length;
       const totalWidth = (childrenCount - 1) * levelSpacingX; // Approx width needed for children
       let startX = positionX - totalWidth / 2 + levelSpacingX; // Start position for first child


      treeNode.children.forEach((child, index) => {
        // Create edge from parent to child
        edges.push({
          id: `e-${treeNode.id}-${child.id}`,
          source: treeNode.id,
          target: child.id,
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed, width: 15, height: 15, color: 'hsl(var(--primary))' },
          style: { stroke: 'hsl(var(--primary))' },
        });

        // Recursively process child node
        const childMaxY = processNode(child, level + 1, currentY, positionX);
        maxChildY = Math.max(maxChildY, childMaxY);
        currentY = childMaxY + nodeSpacingY; // Position next child below the previous one's branch
      });
    }

     return maxChildY; // Return the max Y position reached in this branch
  };


   // Use a layouting algorithm (like ELK or Dagre) for better results in complex trees
   // This basic vertical layout is prone to overlaps with multiple branches.
   // See React Flow docs for ELKjs integration: https://reactflow.dev/learn/layouting/layouting#using-an-external-layouting-library

    // Start processing from the root node
    processNode(rootNode, 0, 0);


    // --- Placeholder for ELK/Dagre Layouting ---
    // const getLayoutedElements = (nodes, edges) => {
    //    const elk = new ELK();
    //    const graph = { id: 'root', layoutOptions: { 'elk.algorithm': 'layered' }, children: [], edges: [] };
    //    // Convert nodes and edges to ELK format...
    //    // return elk.layout(graph);
    // };
    // const layoutedGraph = getLayoutedElements(initialNodes, initialEdges);
    // Apply layouted positions to nodes...
    // --- End Placeholder ---


  return { initialNodes: nodes, initialEdges: edges };
};


export default function AssetTreePage() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const rootData = await fetchHierarchicalData();
        if (!rootData) {
           setError("Nenhum dado encontrado para a árvore.");
           setNodes([]);
           setEdges([]);
        } else {
            // Use the basic vertical layout for now
            const { initialNodes, initialEdges } = transformToFlowData(rootData);
            setNodes(initialNodes);
            setEdges(initialEdges);
            // TODO: Replace with ELK or Dagre layouting for better results
        }
      } catch (err) {
        console.error("Error fetching hierarchical data:", err);
        setError("Falha ao carregar a árvore hierárquica.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [setNodes, setEdges]);


  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node<TreeNode>) => {
    console.log('Node clicked:', node);
    // Navigate based on node type
    // if (node.data.type === 'asset') {
    //   router.push(`/assets/${node.id}/edit`);
    // } else if (node.data.type === 'location') {
    //   router.push(`/locations/${node.id}/edit`);
    // }
  }, []);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Árvore Hierárquica</h1>

      <Card>
        <CardHeader>
          <CardTitle>Visualização Estrutural</CardTitle>
          <CardDescription>
            Explore a estrutura da empresa, locais e ativos. (Empresa {'>'} Locais {'>'} Sub-Locais {'>'} Ativos {'>'} Ativos Filhos)
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[75vh] w-full p-0 border rounded-lg overflow-hidden"> {/* Ensure container has height */}
          {loading && <Skeleton className="h-full w-full" />}
          {error && (
            <div className="flex items-center justify-center h-full text-destructive p-4">
              {error}
            </div>
          )}
          {!loading && !error && nodes.length > 0 && (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes} // Use custom node types
              fitView
              fitViewOptions={{ padding: 0.2 }}
              proOptions={{ hideAttribution: true }}
              className="bg-background" // Ensure background is applied
            >
              <Controls />
              <MiniMap nodeStrokeWidth={3} zoomable pannable />
              <Background gap={16} />
            </ReactFlow>
           )}
            {!loading && !error && nodes.length === 0 && (
             <div className="flex items-center justify-center h-full text-muted-foreground p-4">
               Nenhum dado para exibir na árvore.
            </div>
           )}
        </CardContent>
      </Card>
       <p className="text-sm text-muted-foreground mt-4">
          Navegue pela estrutura organizacional e de ativos. A disposição dos nós pode precisar de ajustes para árvores complexas (implementar layout automático).
      </p>
    </div>
  );
}
