import { describe, expect, test } from 'bun:test';

import type {
  GraphDatabaseOperation,
  GraphDatabasePort,
  GraphDatabaseSession,
  GraphEdge,
  GraphNode,
} from './graphDatabase.js';

const startNode: GraphNode = { id: 'start', properties: { rank: 1 } };
const nextNode: GraphNode = { id: 'next', properties: { rank: 2 } };
const edge: GraphEdge = {
  id: 'next-from-start',
  sourceNodeId: startNode.id,
  targetNodeId: nextNode.id,
  type: 'next',
  properties: {},
};

/*** Executes graph operations against a deterministic in-memory port used to verify the public boundary. */
const executeOperationAsync = async (
  port: GraphDatabasePort,
  operation: GraphDatabaseOperation,
) => {
  const session = await port.openAsync();
  const result = await session.executeAsync(operation);
  await session.closeAsync();
  return result;
};

describe('GraphDatabasePort', () => {
  test('commits a mutation batch atomically', async () => {
    const port = createAtomicPort();

    const result = await executeOperationAsync(port, {
      kind: 'mutate',
      mutations: [
        { kind: 'upsertNode', node: startNode },
        { kind: 'upsertNode', node: nextNode },
        { kind: 'upsertEdge', edge },
      ],
    });

    expect(result).toEqual({ kind: 'mutated', mutationCount: 3 });
    const failedMutation = executeOperationAsync(port, {
      kind: 'mutate',
      mutations: [
        { kind: 'upsertNode', node: { id: 'uncommitted', properties: {} } },
        { kind: 'upsertEdge', edge: { ...edge, id: 'invalid', sourceNodeId: 'missing' } },
      ],
    });

    await expectRejectedAsync(failedMutation, 'Graph edges must reference existing nodes.');
    expect(await executeOperationAsync(port, { kind: 'nodes', nodeIds: ['uncommitted'] })).toEqual({
      kind: 'nodes',
      nodes: [],
    });
  });

  test('returns an explicit unsupported result for an unavailable capability', async () => {
    const session: GraphDatabaseSession = {
      capabilities: ['read'],
      closeAsync: () => Promise.resolve(),
      executeAsync: () => Promise.resolve({ kind: 'unsupported', capability: 'traverse' }),
    };
    const port: GraphDatabasePort = { openAsync: () => Promise.resolve(session) };

    expect(
      await executeOperationAsync(port, {
        kind: 'traverse',
        startNodeIds: [startNode.id],
        direction: 'outgoing',
        maxDepth: 1,
        pageSize: 10,
      }),
    ).toEqual({ kind: 'unsupported', capability: 'traverse' });
  });
});

/*** Creates a minimal port double that makes the boundary's atomic mutation invariant observable. */
const createAtomicPort = (): GraphDatabasePort => {
  const nodes = new Map<string, GraphNode>();
  const edges = new Map<string, GraphEdge>();

  return {
    openAsync: () =>
      Promise.resolve({
        capabilities: ['mutate', 'read'],
        closeAsync: () => Promise.resolve(),
        executeAsync: (operation) =>
          Promise.resolve().then(() => executeAtomicOperation(operation, nodes, edges)),
      }),
  };
};

/*** Executes direct reads and validates every mutation before committing it to the test double. */
const executeAtomicOperation = (
  operation: GraphDatabaseOperation,
  nodes: Map<string, GraphNode>,
  edges: Map<string, GraphEdge>,
) => {
  if (operation.kind === 'nodes') {
    return {
      kind: 'nodes' as const,
      nodes: operation.nodeIds.flatMap((nodeId) => {
        const node = nodes.get(nodeId);
        return node === undefined ? [] : [node];
      }),
    };
  }

  if (operation.kind === 'traverse') {
    return { kind: 'unsupported' as const, capability: 'traverse' as const };
  }

  const nextNodes = new Map(nodes);
  const nextEdges = new Map(edges);

  for (const mutation of operation.mutations) {
    if (mutation.kind === 'upsertNode') nextNodes.set(mutation.node.id, mutation.node);
    if (mutation.kind === 'deleteNode') nextNodes.delete(mutation.nodeId);
    if (mutation.kind === 'upsertEdge') nextEdges.set(mutation.edge.id, mutation.edge);
    if (mutation.kind === 'deleteEdge') nextEdges.delete(mutation.edgeId);
  }

  for (const graphEdge of nextEdges.values()) {
    if (!nextNodes.has(graphEdge.sourceNodeId) || !nextNodes.has(graphEdge.targetNodeId)) {
      throw new Error('Graph edges must reference existing nodes.');
    }
  }

  nodes.clear();
  edges.clear();
  for (const [id, node] of nextNodes) nodes.set(id, node);
  for (const [id, graphEdge] of nextEdges) edges.set(id, graphEdge);

  return { kind: 'mutated' as const, mutationCount: operation.mutations.length };
};

/*** Verifies a rejected asynchronous operation without relying on assertion-library promise typing. */
const expectRejectedAsync = async (operation: Promise<unknown>, message: string) => {
  try {
    await operation;
    throw new Error('Expected the graph operation to reject.');
  } catch (error) {
    expect(error).toHaveProperty('message', message);
  }
};
