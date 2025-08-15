// Optimized Data Structures - Efficient algorithms and data organization
// Improves performance for large datasets and complex operations

export interface TreeNode<T> {
  id: string;
  data: T;
  children: TreeNode<T>[];
  parent?: TreeNode<T>;
  depth: number;
  path: string[];
}

export interface SearchResult<T> {
  item: T;
  score: number;
  highlights: string[];
}

export interface IndexConfig {
  fields: string[];
  weights?: Record<string, number>;
  fuzzy?: boolean;
  maxResults?: number;
}

/**
 * Optimized Tree Structure with efficient traversal
 */
export class OptimizedTree<T> {
  private nodes = new Map<string, TreeNode<T>>();
  private rootNodes: TreeNode<T>[] = [];
  private indexes = new Map<string, Map<string, Set<string>>>();

  constructor(
    private config: { enableIndexing?: boolean; maxDepth?: number } = {},
  ) {
    this.config = { enableIndexing: true, maxDepth: 10, ...config };
  }

  /**
   * Add a node to the tree
   */
  addNode(id: string, data: T, parentId?: string): void {
    const node: TreeNode<T> = {
      id,
      data,
      children: [],
      depth: 0,
      path: [id],
    };

    if (parentId) {
      const parent = this.nodes.get(parentId);
      if (parent) {
        node.parent = parent;
        node.depth = parent.depth + 1;
        node.path = [...parent.path, id];
        parent.children.push(node);
      }
    } else {
      this.rootNodes.push(node);
    }

    this.nodes.set(id, node);

    if (this.config.enableIndexing) {
      this.updateIndexes(node);
    }
  }

  /**
   * Get node by ID with O(1) lookup
   */
  getNode(id: string): TreeNode<T> | undefined {
    return this.nodes.get(id);
  }

  /**
   * Get all descendants of a node
   */
  getDescendants(id: string): TreeNode<T>[] {
    const node = this.nodes.get(id);
    if (!node) return [];

    const descendants: TreeNode<T>[] = [];
    const queue = [node];

    while (queue.length > 0) {
      const current = queue.shift()!;
      descendants.push(current);
      queue.push(...current.children);
    }

    return descendants;
  }

  /**
   * Get all ancestors of a node
   */
  getAncestors(id: string): TreeNode<T>[] {
    const ancestors: TreeNode<T>[] = [];
    let node = this.nodes.get(id);

    while (node?.parent) {
      ancestors.unshift(node.parent);
      node = node.parent;
    }

    return ancestors;
  }

  /**
   * Find nodes by data criteria
   */
  findNodes(predicate: (data: T) => boolean): TreeNode<T>[] {
    const results: TreeNode<T>[] = [];

    for (const node of this.nodes.values()) {
      if (predicate(node.data)) {
        results.push(node);
      }
    }

    return results;
  }

  /**
   * Traverse tree in different orders
   */
  traverse(
    order: "preorder" | "inorder" | "postorder" | "level" = "preorder",
  ): TreeNode<T>[] {
    const result: TreeNode<T>[] = [];

    switch (order) {
      case "preorder":
        this.preorderTraversal(this.rootNodes, result);
        break;
      case "inorder":
        this.inorderTraversal(this.rootNodes, result);
        break;
      case "postorder":
        this.postorderTraversal(this.rootNodes, result);
        break;
      case "level":
        this.levelOrderTraversal(result);
        break;
    }

    return result;
  }

  /**
   * Update search indexes
   */
  private updateIndexes(node: TreeNode<T>): void {
    if (node.depth > (this.config.maxDepth || 10)) return;

    // Index by depth
    if (!this.indexes.has("depth")) {
      this.indexes.set("depth", new Map());
    }
    const depthIndex = this.indexes.get("depth")!;
    if (!depthIndex.has(node.depth.toString())) {
      depthIndex.set(node.depth.toString(), new Set());
    }
    depthIndex.get(node.depth.toString())!.add(node.id);

    // Index by path
    if (!this.indexes.has("path")) {
      this.indexes.set("path", new Map());
    }
    const pathIndex = this.indexes.get("path")!;
    const pathKey = node.path.join(".");
    if (!pathIndex.has(pathKey)) {
      pathIndex.set(pathKey, new Set());
    }
    pathIndex.get(pathKey)!.add(node.id);
  }

  private preorderTraversal(nodes: TreeNode<T>[], result: TreeNode<T>[]): void {
    for (const node of nodes) {
      result.push(node);
      this.preorderTraversal(node.children, result);
    }
  }

  private inorderTraversal(nodes: TreeNode<T>[], result: TreeNode<T>[]): void {
    for (const node of nodes) {
      if (node.children.length > 0) {
        this.inorderTraversal(
          node.children.slice(0, Math.floor(node.children.length / 2)),
          result,
        );
      }
      result.push(node);
      if (node.children.length > 0) {
        this.inorderTraversal(
          node.children.slice(Math.floor(node.children.length / 2)),
          result,
        );
      }
    }
  }

  private postorderTraversal(
    nodes: TreeNode<T>[],
    result: TreeNode<T>[],
  ): void {
    for (const node of nodes) {
      this.postorderTraversal(node.children, result);
      result.push(node);
    }
  }

  private levelOrderTraversal(result: TreeNode<T>[]): void {
    const queue = [...this.rootNodes];

    while (queue.length > 0) {
      const node = queue.shift()!;
      result.push(node);
      queue.push(...node.children);
    }
  }
}

/**
 * Full-Text Search Index with fuzzy matching
 */
export class SearchIndex<T> {
  private documents = new Map<string, T>();
  private invertedIndex = new Map<string, Map<string, Set<string>>>();
  private config: IndexConfig;

  constructor(config: IndexConfig) {
    this.config = config;
  }

  /**
   * Add document to search index
   */
  addDocument(id: string, document: T): void {
    this.documents.set(id, document);
    this.indexDocument(id, document);
  }

  /**
   * Search documents with scoring
   */
  search(query: string): SearchResult<T>[] {
    const queryTerms = this.tokenize(query);
    const scores = new Map<string, number>();
    const highlights = new Map<string, Set<string>>();

    for (const term of queryTerms) {
      const matches = this.findMatches(term);

      for (const [docId, positions] of matches) {
        const currentScore = scores.get(docId) || 0;
        const termScore = this.calculateTermScore(term, positions);
        scores.set(docId, currentScore + termScore);

        if (!highlights.has(docId)) {
          highlights.set(docId, new Set());
        }
        highlights.get(docId)!.add(term);
      }
    }

    // Convert to results and sort by score
    const results: SearchResult<T>[] = [];
    for (const [docId, score] of scores) {
      const document = this.documents.get(docId);
      if (document) {
        results.push({
          item: document,
          score,
          highlights: Array.from(highlights.get(docId) || []),
        });
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, this.config.maxResults || 50);
  }

  /**
   * Tokenize search query
   */
  private tokenize(query: string): string[] {
    return query
      .toLowerCase()
      .split(/\s+/)
      .map((term) => term.replace(/[^\w]/g, ""))
      .filter((term) => term.length > 0);
  }

  /**
   * Find matches for a term
   */
  private findMatches(term: string): Map<string, Set<string>> {
    const matches = new Map<string, Set<string>>();

    if (this.config.fuzzy) {
      // Fuzzy matching with edit distance
      for (const [indexTerm, docPositions] of this.invertedIndex) {
        if (this.levenshteinDistance(term, indexTerm) <= 2) {
          for (const [docId, positions] of docPositions) {
            if (!matches.has(docId)) {
              matches.set(docId, new Set());
            }
            matches.get(docId)!.add(positions);
          }
        }
      }
    } else {
      // Exact matching
      const docPositions = this.invertedIndex.get(term);
      if (docPositions) {
        for (const [docId, positions] of docPositions) {
          matches.set(docId, new Set([positions]));
        }
      }
    }

    return matches;
  }

  /**
   * Calculate score for a term match
   */
  private calculateTermScore(term: string, positions: Set<string>): number {
    let score = positions.size; // Frequency bonus

    // Field weight bonus
    for (const field of this.config.fields) {
      if (term.includes(field)) {
        score *= this.config.weights?.[field] || 1;
      }
    }

    return score;
  }

  /**
   * Index a document
   */
  private indexDocument(id: string, document: T): void {
    for (const field of this.config.fields) {
      const value = (document as any)[field];
      if (value) {
        const terms = this.tokenize(String(value));

        for (const term of terms) {
          if (!this.invertedIndex.has(term)) {
            this.invertedIndex.set(term, new Map());
          }

          const termIndex = this.invertedIndex.get(term)!;
          if (!termIndex.has(id)) {
            termIndex.set(id, new Set());
          }

          termIndex.get(id)!.add(field);
        }
      }
    }
  }

  /**
   * Calculate Levenshtein distance for fuzzy matching
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator,
        );
      }
    }

    return matrix[str2.length][str1.length];
  }
}

/**
 * Optimized Queue with O(1) operations
 */
export class OptimizedQueue<T> {
  private items: T[] = [];
  private head = 0;
  private tail = 0;
  private size = 0;

  /**
   * Enqueue item
   */
  enqueue(item: T): void {
    this.items[this.tail] = item;
    this.tail = (this.tail + 1) % this.items.length;
    this.size++;

    // Resize if needed
    if (this.size === this.items.length) {
      this.resize(this.items.length * 2);
    }
  }

  /**
   * Dequeue item
   */
  dequeue(): T | undefined {
    if (this.isEmpty()) return undefined;

    const item = this.items[this.head];
    this.items[this.head] = undefined as any;
    this.head = (this.head + 1) % this.items.length;
    this.size--;

    // Resize if needed
    if (this.size > 0 && this.size === Math.floor(this.items.length / 4)) {
      this.resize(Math.floor(this.items.length / 2));
    }

    return item;
  }

  /**
   * Peek at front item
   */
  peek(): T | undefined {
    if (this.isEmpty()) return undefined;
    return this.items[this.head];
  }

  /**
   * Check if queue is empty
   */
  isEmpty(): boolean {
    return this.size === 0;
  }

  /**
   * Get queue size
   */
  getSize(): number {
    return this.size;
  }

  /**
   * Clear queue
   */
  clear(): void {
    this.items = [];
    this.head = 0;
    this.tail = 0;
    this.size = 0;
  }

  /**
   * Resize internal array
   */
  private resize(newSize: number): void {
    const newItems = new Array(newSize);
    let index = 0;

    while (!this.isEmpty()) {
      newItems[index++] = this.dequeue()!;
    }

    this.items = newItems;
    this.head = 0;
    this.tail = this.size;
  }
}

/**
 * Optimized Priority Queue with binary heap
 */
export class PriorityQueue<T> {
  private heap: Array<{ item: T; priority: number }> = [];

  /**
   * Enqueue item with priority
   */
  enqueue(item: T, priority: number): void {
    this.heap.push({ item, priority });
    this.bubbleUp(this.heap.length - 1);
  }

  /**
   * Dequeue highest priority item
   */
  dequeue(): T | undefined {
    if (this.isEmpty()) return undefined;

    const result = this.heap[0].item;
    const last = this.heap.pop()!;

    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }

    return result;
  }

  /**
   * Peek at highest priority item
   */
  peek(): T | undefined {
    if (this.isEmpty()) return undefined;
    return this.heap[0].item;
  }

  /**
   * Check if queue is empty
   */
  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  /**
   * Get queue size
   */
  getSize(): number {
    return this.heap.length;
  }

  /**
   * Bubble up operation for heap
   */
  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);

      if (this.heap[parentIndex].priority >= this.heap[index].priority) {
        break;
      }

      [this.heap[index], this.heap[parentIndex]] = [
        this.heap[parentIndex],
        this.heap[index],
      ];
      index = parentIndex;
    }
  }

  /**
   * Bubble down operation for heap
   */
  private bubbleDown(index: number): void {
    while (true) {
      let smallest = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (
        leftChild < this.heap.length &&
        this.heap[leftChild].priority > this.heap[smallest].priority
      ) {
        smallest = leftChild;
      }

      if (
        rightChild < this.heap.length &&
        this.heap[rightChild].priority > this.heap[smallest].priority
      ) {
        smallest = rightChild;
      }

      if (smallest === index) break;

      [this.heap[index], this.heap[smallest]] = [
        this.heap[smallest],
        this.heap[index],
      ];
      index = smallest;
    }
  }
}
