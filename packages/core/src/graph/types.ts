export type GraphColor = 'w' | 'g';

export interface GraphNode<NV> {
  id: number;
  value: NV;
}

export interface GraphEdge<W> {
  start: number;
  end: number;
  weight: W;
}

export type GraphUnorderedEdge = Pick<GraphEdge<unknown>, 'start' | 'end'>;

export interface Graph<NV, W> {
  nodes: GraphNode<NV>[];
  edges: GraphEdge<W>[];
}

export function isGraphNode<NV>(value: unknown): value is GraphNode<NV> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.hasOwn(value, 'value') &&
    Object.hasOwn(value, 'id')
  );
}
