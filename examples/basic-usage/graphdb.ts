import type { GraphDatabasePort } from '@ankhorage/graphdb';

/***
 * Opens a graph database session, atomically records two nodes and one directed typed edge, then closes the session.
 *
 * @usage
 * @readme
 * @title Basic graph database usage
 */
export const recordRelationshipAsync = async (graphDatabase: GraphDatabasePort) => {
  const session = await graphDatabase.openAsync();

  try {
    return await session.executeAsync({
      kind: 'mutate',
      mutations: [
        { kind: 'upsertNode', node: { id: 'alpha', properties: { name: 'Alpha' } } },
        { kind: 'upsertNode', node: { id: 'beta', properties: { name: 'Beta' } } },
        {
          kind: 'upsertEdge',
          edge: {
            id: 'beta-from-alpha',
            sourceNodeId: 'alpha',
            targetNodeId: 'beta',
            type: 'depends-on',
            properties: {},
          },
        },
      ],
    });
  } finally {
    await session.closeAsync();
  }
};
