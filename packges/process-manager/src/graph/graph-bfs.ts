import { GraphProcessor } from './graph-processor';
import { GraphColor } from './types';

export function* traverseGraphBfs<NV, W>(
  graph: GraphProcessor<NV, W>,
  startNodeId?: number,
) {
  startNodeId = startNodeId ?? graph.getNodeById(0)?.id ?? -1;
  const colors = new Map<number, GraphColor>(graph.nodes.map((n) => [n.id, 'w']));
  const planned: number[] = [startNodeId];
  colors.set(startNodeId, 'g');

  while (planned.length > 0) {
    const plannedId = planned.shift() ?? -1;
    for (const c of graph.getNodeChildrenById(plannedId)) {
      if (colors.get(c.id) === 'g') {
        continue;
      }
      colors.set(c.id, 'g');
      planned.push(c.id);
    }
    yield graph.getNodeById(plannedId);
  }
}
