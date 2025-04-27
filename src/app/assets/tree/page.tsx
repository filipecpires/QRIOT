
'use client';

import { useState, useEffect } from 'react';
import { ResponsiveContainer, Treemap } from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

// Mock data structure for assets with parent relationship
interface AssetNode {
  id: string;
  name: string;
  tag: string;
  parentId?: string;
  children?: AssetNode[];
  value: number; // Treemap requires a 'value' for size calculation
}

// Mock function to fetch assets and build the tree structure
async function fetchAssetTree(): Promise<AssetNode[]> {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay

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

  // Simple tree building logic
  const assetMap: { [key: string]: AssetNode } = {};
  const rootAssets: AssetNode[] = [];

  assets.forEach(asset => {
    assetMap[asset.id] = { ...asset, children: [], value: 1 }; // Assign default value 1
  });

  assets.forEach(asset => {
    if (asset.parentId && assetMap[asset.parentId]) {
      assetMap[asset.parentId].children?.push(assetMap[asset.id]);
      assetMap[asset.parentId].value += assetMap[asset.id].value; // Aggregate value to parent
    } else {
      rootAssets.push(assetMap[asset.id]);
    }
  });

  // Recursive function to update parent values based on children's aggregated values
  const updateParentValues = (nodes: AssetNode[]) => {
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        updateParentValues(node.children);
        node.value = node.children.reduce((sum, child) => sum + child.value, 1); // Sum children's values + 1 for the node itself
      } else {
        node.value = 1; // Leaf node value
      }
    });
  };

  updateParentValues(rootAssets);


  // Wrap root assets in a single root node for Treemap
  return [{ id: 'root', name: 'Todos os Ativos', tag: 'ROOT', children: rootAssets, value: rootAssets.reduce((sum, node) => sum + node.value, 0) }];
}

interface CustomizedContentProps {
  root?: any;
  depth?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
  payload?: any;
  colors?: string[];
  rank?: number;
  name?: string;
}

const CustomizedContent: React.FC<CustomizedContentProps> = ({ root, depth = 0, x = 0, y = 0, width = 0, height = 0, index = 0, colors = [], name }) => {
  if (depth > 2) return null; // Limit depth for clarity

  const isRoot = depth === 0;
  const isParent = depth === 1;

  const bgColor = isRoot ? 'hsl(var(--muted))' : (isParent ? `hsl(var(--chart-${(index % 5) + 1}))` : `hsl(var(--chart-${(index % 5) + 1})) / 0.6`);
  const textColor = isRoot ? 'hsl(var(--muted-foreground))' : (isParent ? 'hsl(var(--primary-foreground))' : 'hsl(var(--primary-foreground)) / 0.9');
  const borderColor = 'hsl(var(--background))';

  // Adjust font size based on depth and available space
  let fontSize = 12;
  if (width < 80 || height < 30) {
    fontSize = 8;
  } else if (width < 150 || height < 50) {
     fontSize = 10;
  }
   if (isRoot) fontSize = 14;
   if (isParent) fontSize = 12;

  // Hide text if the box is too small
  const showText = width > 50 && height > 20;


  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: bgColor,
          stroke: borderColor,
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
      />
      {showText && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={textColor}
          fontSize={fontSize}
          fontWeight={isRoot || isParent ? 500 : 400}
          className="pointer-events-none select-none truncate" // Add truncate utility
        >
           {/* Display name and potentially tag or value based on size */}
           <tspan x={x + width / 2} dy={fontSize > 10 ? "-0.3em" : "0"}> {/* Adjust dy for larger font sizes */}
              {name}
            </tspan>
            {(width > 100 && height > 40 && fontSize > 10) && ( // Show tag if enough space
              <tspan x={x + width / 2} dy="1.2em" fontSize={fontSize * 0.8} fillOpacity={0.7}>
                ({(root?.children && root?.children[index]?.tag) || ''})
              </tspan>
            )}
        </text>
      )}
    </g>
  );
};


export default function AssetTreePage() {
  const [treeData, setTreeData] = useState<AssetNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAssetTree();
        setTreeData(data);
      } catch (err) {
        console.error("Error fetching asset tree:", err);
        setError("Falha ao carregar a árvore de ativos.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Árvore de Ativos</h1>

      <Card>
        <CardHeader>
          <CardTitle>Visualização Hierárquica</CardTitle>
          <CardDescription>
            Explore a estrutura dos ativos e seus relacionamentos. O tamanho de cada bloco representa a quantidade de ativos filhos (incluindo ele mesmo).
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[600px] w-full">
          {loading && <Skeleton className="h-full w-full" />}
          {error && (
            <div className="flex items-center justify-center h-full text-destructive">
              {error}
            </div>
          )}
          {!loading && !error && treeData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={treeData}
                dataKey="value"
                ratio={4 / 3}
                stroke="#fff"
                fill="hsl(var(--primary))" // Base fill color
                isAnimationActive={true}
                content={
                    <CustomizedContent
                        colors={[
                            'hsl(var(--chart-1))',
                            'hsl(var(--chart-2))',
                            'hsl(var(--chart-3))',
                            'hsl(var(--chart-4))',
                            'hsl(var(--chart-5))',
                         ]}
                     />
                  }
               >
                 {/* Tooltip could be added here if needed */}
                 {/* <Tooltip content={<CustomTooltip />} /> */}
                </Treemap>
            </ResponsiveContainer>
           )}
           {!loading && !error && treeData.length === 0 && (
             <div className="flex items-center justify-center h-full text-muted-foreground">
               Nenhum dado de ativo para exibir na árvore.
            </div>
           )}
        </CardContent>
      </Card>
       <p className="text-sm text-muted-foreground mt-4">
         Nota: A visualização pode não mostrar todos os níveis de profundidade para melhor clareza. Clique em um ativo para ver mais detalhes (funcionalidade a implementar).
      </p>
    </div>
  );
}

// Example Custom Tooltip (optional)
// const CustomTooltip = ({ active, payload, label }: any) => {
//   if (active && payload && payload.length) {
//     const data = payload[0].payload; // Access the node data
//     return (
//       <div className="bg-background border rounded-md shadow-lg p-2 text-sm">
//         <p className="font-semibold">{data.name}</p>
//         {data.tag && <p className="text-muted-foreground">Tag: {data.tag}</p>}
//         <p>Valor (Tamanho): {data.value}</p>
//         {/* Add link to asset page */}
//          <Link href={`/assets/${data.id}/edit`} className="text-primary hover:underline text-xs">
//             Ver detalhes
//          </Link>
//       </div>
//     );
//   }
//   return null;
// };

