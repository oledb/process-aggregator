import { GraphProcessor, NODE_NOT_EXIST_ERROR } from './graph-processor';
import { GRAPH_EMPTY_ORDERED_DFS, traverseGraphDfs } from './graph-dfs';

describe('graph', () => {
  describe('traverseGraphDfs', () => {
    type Progress = 'start' | 'in-progress' | 'finished' | 'error';

    const gp = new GraphProcessor<Progress, number>();
    gp.addNode('start');
    gp.addNode('in-progress');
    gp.addNode('finished');
    gp.addNode('error');

    gp.addEdge('start', 'in-progress', 0);
    gp.addEdge('in-progress', 'finished', 0);
    gp.addEdge('in-progress', 'error', 0);
    gp.addEdge('start', 'error', 0);

    it('unordered with default startNodeId', () => {
      const generator = traverseGraphDfs(gp);
      const result = [...generator].map((n) => n?.id);
      expect(result).toEqual([2, 3, 1, 0]);
    });

    it('unordered with "start" startNodeId', () => {
      const generator = traverseGraphDfs(gp, {
        startNodeId: gp.getNodeByValue('start')?.id,
      });
      const result = [...generator].map((n) => n?.id);
      expect(result).toEqual([2, 3, 1, 0]);
    });

    it('unordered with "error" startNodeId', () => {
      const generator = traverseGraphDfs(gp, {
        startNodeId: gp.getNodeByValue('error')?.id,
      });
      const result = [...generator].map((n) => n?.id);
      expect(result).toEqual([2, 3, 1, 0]);
    });

    it('ordered with default startNodeId', () => {
      const generator = traverseGraphDfs(gp, { mode: 'ordered' });
      const result = [...generator].map((n) => n?.id);
      expect(result).toEqual([2, 3, 1, 0]);
    });

    it('ordered with "in-progress" startNodeId', () => {
      const generator = traverseGraphDfs(gp, {
        mode: 'ordered',
        startNodeId: gp.getNodeByValue('in-progress')?.id,
      });
      const result = [...generator].map((n) => n?.id);
      expect(result).toEqual([2, 3, 1]);
    });

    it('unordered empty graph', () => {
      const emptyGp = new GraphProcessor();
      const result = [...traverseGraphDfs(emptyGp)];
      expect(result).toEqual([]);
    });

    it('ordered empty graph with default startNodeId', () => {
      const emptyGp = new GraphProcessor();
      const generator = traverseGraphDfs(emptyGp, { mode: 'ordered' });
      expect(() => [...generator]).toThrow(GRAPH_EMPTY_ORDERED_DFS);
    });

    it('ordered empty graph with unknown startNodeId', () => {
      const generator = traverseGraphDfs(gp, { mode: 'ordered', startNodeId: 15 });
      expect(() => [...generator]).toThrow(NODE_NOT_EXIST_ERROR);
    });
  });
});
