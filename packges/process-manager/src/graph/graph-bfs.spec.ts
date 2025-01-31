import { GraphProcessor, NODE_NOT_EXIST_ERROR } from './graph-processor';
import { traverseGraphBfs } from './graph-bfs';

describe('graph', () => {
  describe('traverseGraphBfs', () => {
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

    it('default startNodeId', () => {
      const generator = traverseGraphBfs(gp);
      const result = [...generator].map((n) => n?.id);
      expect(result).toEqual([0, 1, 3, 2]);
    });

    it('"in-progress" startNodeId', () => {
      const generator = traverseGraphBfs(gp, gp.getNodeByValue('in-progress')?.id);
      const result = [...generator].map((n) => n?.id);
      expect(result).toEqual([1, 2, 3]);
    });

    it('unknown startNodeId', () => {
      const generator = traverseGraphBfs(gp, 15);
      expect(() => [...generator]).toThrow(NODE_NOT_EXIST_ERROR);
    });

    it('emptyGraph with default startNodeId', () => {
      const generator = traverseGraphBfs(new GraphProcessor());
      expect(() => [...generator]).toThrow(NODE_NOT_EXIST_ERROR);
    });
  });
});
