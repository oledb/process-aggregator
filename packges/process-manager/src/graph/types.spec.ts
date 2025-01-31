import { GraphNode, isGraphNode } from './types';

describe('graph', () => {
  describe('types', () => {
    describe('isGraphNode', () => {
      it('case 1', () => {
        const node: GraphNode<number> = {
          id: 0,
          value: 0,
        };
        expect(isGraphNode(node)).toBe(true);
        expect(isGraphNode({})).toBe(false);
        expect(isGraphNode({ id: 0 })).toBe(false);
        expect(isGraphNode({ value: 0 })).toBe(false);
        expect(isGraphNode(null)).toBe(false);
      });
    });
  });
});
