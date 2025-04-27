
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
} from 'reactflow';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link'; // Keep for potential linking later
import { cn } from '@/lib/utils'; // Assuming cn utility exists

// Mock data structure for assets with parent relationship
interface AssetNodeData {
  id: string;
  name: string;
  tag: string;
  parentId?: string;
  children?: AssetNodeData[];
}

// Mock function to fetch assets and build the tree structure
async function fetchAssetTree(): Promise<AssetNodeData[]> {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay

  // Raw asset data (same as before)
  const assets = [
    { id: 'ASSET001', name: 'Notebook Dell Latitude 7400', tag: 'TI-NB-001', parentId: undefined },
    { id: 'ASSET002', name: 'Monitor LG 27"', tag: 'TI-MN-005', parentId: 'ASSET001' },
    { id: 'ASSET003', name: 'Cadeira de Escritório', tag: 'MOB-CAD-012', parentId: undefined },
    { id: 'ASSET004', name: 'Projetor Epson PowerLite', tag: 'TI-PROJ-002', parentId: undefined },
    { id: 'ASSET005', name: 'Teclado Dell', tag: 'TI-TEC-010', parentId: 'ASSET001' },
    { id: 'ASSET006', name: 'Mouse Logitech', tag: 'TI-MOU-015', parentId: 'ASSET001' },
    { id: 'ASSET007', name: 'Mesa Escritório', tag: 'MOB-MES-001', parentId: undefined },
    { id: 'ASSET008', name: 'Gaveteiro', tag: 'MOB-GAV-002', parentId: 'ASSET007' },
  ];

  // Simple tree building logic (same as before)
  const assetMap: { [key: string]: AssetNodeData } = {};
  const rootAssets: AssetNodeData[] = [];

  assets.forEach(asset => {
    assetMap[asset.id] = { ...asset, children: [] };
  });

  assets.forEach(asset => {
    if (asset.parentId && assetMap[asset.parentId]) {
      assetMap[asset.parentId].children?.push(assetMap[asset.id]);
    } else {
      rootAssets.push(assetMap[asset.id]);
    }
  });

  return rootAssets;
}

// Function to transform asset tree into React Flow nodes and edges
const transformToFlowData = (assetTree: AssetNodeData[]) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const nodeSpacingX = 250;
  const nodeSpacingY = 150;
  let currentY = 0;

  const processNode = (assetNode: AssetNodeData, level: number, parentX: number): number => {
    const posX = parentX + (level > 0 ? nodeSpacingX : 0);
    const posY = currentY;

    nodes.push({
      id: assetNode.id,
      type: 'default', // Or a custom node type
      position: { x: posX, y: posY },
      data: { label: `${assetNode.name} (${assetNode.tag})` }, // Node label
      // Add styles if needed (e.g., based on level or asset type)
       style: {
        // background: level === 0 ? 'hsl(var(--secondary))' : 'hsl(var(--card))',
        // borderColor: 'hsl(var(--primary))',
        // color: level === 0 ? 'hsl(var(--secondary-foreground))' : 'hsl(var(--card-foreground))'
      }
    });

    currentY += nodeSpacingY; // Increment Y position for the next node

    let maxChildX = posX; // Track the maximum X position used by children

    if (assetNode.children && assetNode.children.length > 0) {
      assetNode.children.forEach((child) => {
        edges.push({
          id: `e-${assetNode.id}-${child.id}`,
          source: assetNode.id,
          target: child.id,
          type: 'smoothstep', // Or 'step', 'straight'
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 15,
            height: 15,
            color: 'hsl(var(--primary))'
          },
           style: { stroke: 'hsl(var(--primary))' }
        });
        const childMaxX = processNode(child, level + 1, posX);
        maxChildX = Math.max(maxChildX, childMaxX);
      });
    }

    return maxChildX;
  };

  // Process each root node
  let currentX = 0;
  assetTree.forEach((rootNode) => {
    currentY = 0; // Reset Y for each root tree
    const treeMaxX = processNode(rootNode, 0, currentX);
    currentX = treeMaxX + nodeSpacingX * 2; // Add spacing between root trees
  });


  // Basic layouting (very simple horizontal layout)
  // This is a placeholder. For complex trees, use a layouting library like Dagre.
  // const layoutNodes = (nodes: Node[], edges: Edge[]) => {
     // Use a layout library (like elkjs or dagre) here for better results
     // Example: Simple horizontal positioning for roots, vertical for children
     // This simple layout might lead to overlaps.
     // Consider ELKjs: https://github.com/wbkd/react-flow/tree/main/examples/react/src/Layouting/ELKjs
  //   let rootX = 0;
  //   const processedNodes = new Set<string>();

  //   nodes.forEach(node => {
  //       if (!edges.some(edge => edge.target === node.id)) { // Root node
  //           if (!processedNodes.has(node.id)) {
  //              layoutChildren(node, nodes, edges, rootX, 0, processedNodes);
  //              rootX += 400; // Space out root nodes
  //           }
  //       }
  //   });

  // };

  // const layoutChildren = (node: Node, allNodes: Node[], allEdges: Edge[], x: number, y: number, processed: Set<string>) => {
  //    if (processed.has(node.id)) return;
  //    node.position = { x, y };
  //    processed.add(node.id);

  //    const childrenEdges = allEdges.filter(edge => edge.source === node.id);
  //    let childY = y + 150;
  //    childrenEdges.forEach(edge => {
  //       const childNode = allNodes.find(n => n.id === edge.target);
  //       if(childNode) {
  //          layoutChildren(childNode, allNodes, allEdges, x + 200, childY, processed);
  //          childY += 100; // Basic vertical spacing for children
  //       }
  //    })
  // }

  // layoutNodes(nodes, edges); // Apply layout

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
        const treeData = await fetchAssetTree();
        if (treeData.length === 0) {
           setNodes([]);
           setEdges([]);
        } else {
            const { initialNodes, initialEdges } = transformToFlowData(treeData);
            setNodes(initialNodes);
            setEdges(initialEdges);
        }
      } catch (err) {
        console.error("Error fetching asset tree:", err);
        setError("Falha ao carregar a árvore de ativos.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [setNodes, setEdges]); // Add setters to dependency array


  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

   // Handle node click (e.g., navigate to asset edit page)
   const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    console.log('Node clicked:', node);
    // Example: Redirect to asset edit page
    // import { useRouter } from 'next/navigation';
    // const router = useRouter();
    // router.push(`/assets/${node.id}/edit`);
  }, []);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Árvore de Ativos</h1>

      <Card>
        <CardHeader>
          <CardTitle>Visualização Hierárquica</CardTitle>
          <CardDescription>
            Explore a estrutura dos ativos e seus relacionamentos pai-filho. Clique em um nó para ver detalhes.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[70vh] w-full p-0"> {/* Adjust height as needed, remove padding */}
          {loading && <Skeleton className="h-full w-full" />}
          {error && (
            <div className="flex items-center justify-center h-full text-destructive p-4">
              {error}
            </div>
          )}
          {!loading && !error && (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              fitView // Automatically fit the view to the nodes
              fitViewOptions={{ padding: 0.2 }}
              proOptions={{ hideAttribution: true }} // Hide React Flow attribution
              className="bg-background"
            >
              <Controls />
              <MiniMap nodeStrokeWidth={3} zoomable pannable />
              <Background gap={16} />
            </ReactFlow>
           )}
            {!loading && !error && nodes.length === 0 && (
             <div className="flex items-center justify-center h-full text-muted-foreground p-4">
               Nenhum dado de ativo para exibir na árvore.
            </div>
           )}
        </CardContent>
      </Card>
       <p className="text-sm text-muted-foreground mt-4">
          Use os controles para navegar, zoom e centralizar o diagrama.
      </p>
    </div>
  );
}
