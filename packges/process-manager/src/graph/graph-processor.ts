import { Graph, GraphEdge, GraphNode, GraphUnorderedEdge } from './types';

export class GraphProcessor<NV, W> implements Graph<NV, W> {
  readonly nodes: GraphNode<NV>[] = [];
  readonly edges: GraphEdge<W>[] = [];
  private _id = 0;

  addNode(value: NV) {
    this._assertNodeIsNotExist(value);
    this.nodes.push({
      id: this._id++,
      value,
    });
  }

  addEdge(start: NV, end: NV, weight: W) {
    const startNode = this.getNodeByValue(start);
    if (!startNode) {
      throw new Error(NODE_NOT_EXIST_ERROR);
    }
    const endNode = this.getNodeByValue(end);
    if (!endNode) {
      throw new Error(NODE_NOT_EXIST_ERROR);
    }
    const existEdge = this.edges.filter(
      (e) => e.start === startNode.id && e.end === endNode.id
    )[0];
    if (existEdge) {
      throw new Error(EDGE_HAS_BEEN_ADDED_ERROR);
    }
    this.edges.push({
      start: this.getNodeByValue(start)?.id || 0,
      end: this.getNodeByValue(end)?.id || 0,
      weight,
    });
  }

  getNodeByValue(value: NV): GraphNode<NV> | null {
    return this.nodes.filter((v) => v.value === value)[0] || null;
  }

  getNodeById(id: number): GraphNode<NV> | null {
    return this.nodes.filter((v) => v.id === id)[0] || null;
  }

  getNodeChildrenByValue(value: NV): GraphNode<NV>[] {
    const node = this.getNodeByValue(value);
    if (!node) {
      throw new Error(NODE_NOT_EXIST_ERROR);
    }
    return this.getNodeChildrenById(node.id);
  }

  getNodeChildrenById(id: number): GraphNode<NV>[] {
    const node = this.getNodeById(id);
    if (!node) {
      throw new Error(NODE_NOT_EXIST_ERROR);
    }
    const nodesIds = this.edges.filter((n) => n.start === id).map((n) => n.end);
    return this.nodes.filter((n) => nodesIds.includes(n.id));
  }

  getNodeWeightsByValue(value: NV): W[] {
    const node = this.getNodeByValue(value);
    if (!node) {
      throw new Error(NODE_NOT_EXIST_ERROR);
    }
    return this.getNodeWeightsById(node.id);
  }

  getNodeWeightsById(id: number): W[] {
    return this.edges.filter((n) => n.start === id).map((n) => n.weight);
  }

  getUnorderedEdgesById(nodeId: number): GraphUnorderedEdge[] {
    return this.edges
      .filter((e) => e.start === nodeId)
      .map(({ start, end }) => ({ start, end }))
      .concat(
        this.edges
          .filter((e) => e.end === nodeId)
          .map(({ start, end }) => ({ start: end, end: start }))
      );
  }

  searchNodes(predicate: (node: NV) => boolean): GraphNode<NV>[] {
    return this.nodes.filter((n) => predicate(n.value));
  }

  hasNodesWith(predicate: (node: NV) => boolean): boolean {
    return this.nodes.filter((n) => predicate(n.value)).length > 0;
  }

  searchEdges(predicate: (edge: W) => boolean): GraphEdge<W>[] {
    return this.edges.filter((e) => predicate(e.weight));
  }

  private _assertNodeIsNotExist(value: NV) {
    if (this.getNodeByValue(value) !== null) {
      throw new Error(NODE_HAS_BEEN_ADDED_ERROR);
    }
  }
}

export const NODE_NOT_EXIST_ERROR =
  'There is no a node in the graph with such value.';
export const NODE_HAS_BEEN_ADDED_ERROR = 'Node has existed yet.';
export const EDGE_HAS_BEEN_ADDED_ERROR = 'Edge has existed yet';
