import {
  EDGE_HAS_BEEN_ADDED_ERROR,
  GraphProcessor,
  NODE_HAS_BEEN_ADDED_ERROR,
} from './graph-processor';
import { GraphUnorderedEdge } from './types';

describe('graph', () => {
  describe('graph-processor', () => {
    it('addNode', () => {
      const gp = new GraphProcessor<string, number>();
      gp.addNode('start');
      gp.addNode('in-progress');
      gp.addNode('finish');

      expect(gp.nodes.length).toEqual(3);
      expect(() => gp.addNode('finish')).toThrow(new Error(NODE_HAS_BEEN_ADDED_ERROR));
    });

    it('addEdge', () => {
      const gp = new GraphProcessor<string, number>();
      gp.addNode('start');
      gp.addNode('in-progress');
      gp.addNode('finish');

      gp.addEdge('start', 'in-progress', 10);
      gp.addEdge('in-progress', 'finish', 15);
      expect(gp.edges.length).toEqual(2);
      expect(() => gp.addEdge('start', 'in-progress', 10)).toThrow(
        new Error(EDGE_HAS_BEEN_ADDED_ERROR),
      );
    });

    it('getNodeByValue', () => {
      const gp = new GraphProcessor<string, number>();
      gp.addNode('start');
      gp.addNode('in-progress');
      gp.addNode('finish');

      expect(gp.getNodeByValue('start')?.value).toEqual('start');
      expect(gp.getNodeByValue('finish')?.value).toEqual('finish');
      expect(gp.getNodeByValue('buy')).toBeNull();
    });

    it('getNodeById', () => {
      const gp = new GraphProcessor<string, number>();
      gp.addNode('start');
      gp.addNode('in-progress');
      gp.addNode('finish');

      expect(gp.getNodeById(0)?.value).toEqual('start');
      expect(gp.getNodeById(2)?.value).toEqual('finish');
      expect(gp.getNodeById(5)).toBeNull();
    });

    it('getNodeChildrenByValue', () => {
      const gp = new GraphProcessor<string, number>();
      gp.addNode('start');
      gp.addNode('in-progress');
      gp.addNode('finish');

      gp.addEdge('start', 'in-progress', 10);
      gp.addEdge('start', 'finish', 15);

      const children = gp.getNodeChildrenByValue('start');

      expect(children.filter((c) => c.value === 'in-progress')[0]).toBeDefined();
      expect(children.filter((c) => c.value === 'finish')[0]).toBeDefined();
    });

    it('getNodeChildrenById', () => {
      const gp = new GraphProcessor<string, number>();
      gp.addNode('start');
      gp.addNode('in-progress');
      gp.addNode('finish');

      gp.addEdge('start', 'in-progress', 10);
      gp.addEdge('start', 'finish', 15);

      const children = gp.getNodeChildrenById(0);

      expect(children.filter((c) => c.value === 'in-progress')[0]).toBeDefined();
      expect(children.filter((c) => c.value === 'finish')[0]).toBeDefined();
    });

    it('getNodeWeightsByValue', () => {
      const gp = new GraphProcessor<string, number>();
      gp.addNode('start');
      gp.addNode('in-progress');
      gp.addNode('finish');

      gp.addEdge('start', 'in-progress', 10);
      gp.addEdge('start', 'finish', 15);

      const children = gp.getNodeWeightsByValue('start').sort((a, b) => a - b);

      expect(children).toEqual([10, 15]);
    });

    it('getNodeWeightsById', () => {
      const gp = new GraphProcessor<string, number>();
      gp.addNode('start');
      gp.addNode('in-progress');
      gp.addNode('finish');

      gp.addEdge('start', 'in-progress', 10);
      gp.addEdge('start', 'finish', 15);

      const children = gp.getNodeWeightsById(0).sort((a, b) => a - b);

      expect(children).toEqual([10, 15]);
    });

    describe('getUnorderedEdgesById', () => {
      const gp = new GraphProcessor<string, number>();
      gp.addNode('start');
      gp.addNode('in-progress');
      gp.addNode('finish');

      gp.addEdge('start', 'in-progress', 10);
      gp.addEdge('start', 'finish', 15);

      it('case 1', () => {
        const result = gp.getUnorderedEdgesById(0);
        expect(result).toEqual<GraphUnorderedEdge[]>([
          {
            start: 0,
            end: 1,
          },
          {
            start: 0,
            end: 2,
          },
        ]);
      });

      it('case 2', () => {
        const result = gp.getUnorderedEdgesById(1);
        expect(result).toEqual<GraphUnorderedEdge[]>([
          {
            start: 1,
            end: 0,
          },
        ]);
      });

      it('case 2', () => {
        const result = gp.getUnorderedEdgesById(2);
        expect(result).toEqual<GraphUnorderedEdge[]>([
          {
            start: 2,
            end: 0,
          },
        ]);
      });
    });
  });
});
