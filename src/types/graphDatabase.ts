/*** A JSON-compatible scalar, object, or list stored as a node or edge property. */
export type GraphPropertyValue =
  boolean | null | number | string | readonly GraphPropertyValue[] | GraphPropertyObject;

/*** A named, JSON-compatible property collection. */
export interface GraphPropertyObject {
  readonly [key: string]: GraphPropertyValue;
}

/*** An identity-stable durable graph node. */
export interface GraphNode {
  readonly id: string;
  readonly properties: GraphPropertyObject;
}

/*** A directed, typed durable graph edge. */
export interface GraphEdge {
  readonly id: string;
  readonly sourceNodeId: string;
  readonly targetNodeId: string;
  readonly type: string;
  readonly properties: GraphPropertyObject;
}

/*** A capability that a graph database session may support. */
export type GraphDatabaseCapability = 'mutate' | 'read' | 'traverse';

/*** A mutation applied as part of one all-or-nothing graph database operation. */
export type GraphMutation =
  | { readonly kind: 'upsertNode'; readonly node: GraphNode }
  | { readonly kind: 'deleteNode'; readonly nodeId: string }
  | { readonly kind: 'upsertEdge'; readonly edge: GraphEdge }
  | { readonly kind: 'deleteEdge'; readonly edgeId: string };

/*** An atomic set of node and edge mutations. */
export interface GraphMutationOperation {
  readonly kind: 'mutate';
  readonly mutations: readonly GraphMutation[];
}

/*** A direct node lookup operation. */
export interface GraphNodesOperation {
  readonly kind: 'nodes';
  readonly nodeIds: readonly string[];
}

/*** Direction used to expand graph traversal paths. */
export type GraphTraversalDirection = 'incoming' | 'outgoing' | 'both';

/*** A bounded, optionally typed traversal request with an opaque continuation cursor. */
export interface GraphTraversalOperation {
  readonly kind: 'traverse';
  readonly startNodeIds: readonly string[];
  readonly direction: GraphTraversalDirection;
  readonly maxDepth: number;
  readonly pageSize: number;
  readonly edgeTypes?: readonly string[];
  readonly cursor?: string;
}

/*** A portable durable graph database operation. */
export type GraphDatabaseOperation =
  GraphMutationOperation | GraphNodesOperation | GraphTraversalOperation;

/*** The receipt for a fully committed atomic mutation operation. */
export interface GraphMutationResult {
  readonly kind: 'mutated';
  readonly mutationCount: number;
}

/*** The result of a direct node lookup. Missing requested node identifiers are omitted. */
export interface GraphNodesResult {
  readonly kind: 'nodes';
  readonly nodes: readonly GraphNode[];
}

/*** One bounded traversal page. A cursor is present only when a subsequent page exists. */
export interface GraphTraversalPage {
  readonly kind: 'traversal';
  readonly nodes: readonly GraphNode[];
  readonly edges: readonly GraphEdge[];
  readonly nextCursor?: string;
}

/*** An explicit result for an operation whose required capability is unavailable in this session. */
export interface GraphUnsupportedResult {
  readonly kind: 'unsupported';
  readonly capability: GraphDatabaseCapability;
}

/*** The result of executing one portable graph database operation. */
export type GraphDatabaseOperationResult =
  GraphMutationResult | GraphNodesResult | GraphTraversalPage | GraphUnsupportedResult;

/*** A live database session. Implementations must commit `mutate` operations atomically. */
export interface GraphDatabaseSession {
  readonly capabilities: readonly GraphDatabaseCapability[];
  executeAsync(operation: GraphDatabaseOperation): Promise<GraphDatabaseOperationResult>;
  closeAsync(): Promise<void>;
}

/*** The provider-neutral lifecycle boundary that opens durable graph database sessions. */
export interface GraphDatabasePort {
  openAsync(): Promise<GraphDatabaseSession>;
}
