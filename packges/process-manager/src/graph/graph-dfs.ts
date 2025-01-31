import { GraphProcessor } from './graph-processor';
import { GraphColor, GraphNode } from './types';

export type TraverseGraphMode = 'ordered' | 'unordered';
export type TraverseGraphOptions = {
  mode?: TraverseGraphMode;
  startNodeId?: number;
};
export function* traverseGraphDfs<NV, W>(
  graph: GraphProcessor<NV, W>,
  options: TraverseGraphOptions = {},
) {
  const mode = options.mode || 'unordered';
  const colors = new Map<number, GraphColor>(
    graph.nodes.map((n) => [n.id, 'w' as GraphColor]),
  );

  function* dfs(nodeId: number): Generator<GraphNode<NV> | null> {
    colors.set(nodeId, 'g');
    for (const w of graph.getNodeChildrenById(nodeId).map((n) => n.id)) {
      if (colors.get(w) === 'w') {
        yield* dfs(w);
      }
    }
    yield graph.getNodeById(nodeId);
  }

  if (mode === 'unordered') {
    for (const w of colors.keys()) {
      if (colors.get(w) === 'w') {
        yield* dfs(w);
      }
    }
  } else {
    const startNode = options.startNodeId || graph.nodes[0]?.id;
    if (startNode === undefined) {
      throw new Error(GRAPH_EMPTY_ORDERED_DFS);
    }
    yield* dfs(startNode);
  }
}

export const GRAPH_EMPTY_ORDERED_DFS = 'Could not traverse orderly empty graph';
