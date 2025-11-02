/**
 * Multi-Stage Graph Algorithm
 * Based on the Python implementation using backward cost approach
 * Finds the minimum cost path from source to destination through multiple stages
 */

const INF = Infinity;

/**
 * Calculate minimum cost path using backward cost approach
 * @param {Array<Array<number>>} G - Cost matrix (adjacency matrix with edge weights)
 * @param {number} n - Number of vertices
 * @returns {Object} Result containing minimum cost and path
 */
export function backwardCost(G, n) {
  // Initialize backward cost array and decision array
  const bcost = Array(n).fill(INF);
  const d = Array(n).fill(0);
  
  // Base case: cost from destination to itself is 0
  bcost[n - 1] = 0;
  
  // Calculate backward costs from n-2 to 0
  for (let j = n - 2; j >= 0; j--) {
    let minCost = INF;
    let nextVertex = -1;
    
    // Check all possible next vertices
    for (let r = j + 1; r < n; r++) {
      const edgeCost = G[j][r];
      
      if (edgeCost !== INF) {
        const total = bcost[r] + edgeCost;
        
        if (total < minCost) {
          minCost = total;
          nextVertex = r;
        }
      }
    }
    
    bcost[j] = minCost;
    d[j] = nextVertex;
  }
  
  // Reconstruct the path
  const p = Array(n + 1).fill(0);
  p[0] = 0; // Start from vertex 0
  
  let current = 0;
  let index = 1;
  
  // Follow the decision array to build the path
  while (current !== n - 1) {
    if (current === -1 || d[current] === -1) {
      break;
    }
    
    const nextNode = d[current];
    p[index] = nextNode;
    current = nextNode;
    index++;
  }
  
  // Extract the actual path
  const path = p.slice(0, index);
  
  return {
    minimumCost: bcost[0],
    path: path,
    bcostArray: bcost,
    decisionArray: d
  };
}

/**
 * Multi-Stage Graph with edge costs input
 * @param {number} numStages - Number of stages
 * @param {number} nodesPerStage - Number of nodes per stage
 * @param {string} edgeCostsString - Edge costs in format "0-1:2, 0-2:3, 1-3:4"
 * @returns {Object} Result containing cost, path, and graph structure
 */
export function multiStageGraphWithEdges(numStages, nodesPerStage, edgeCostsString) {
  const stages = parseInt(numStages);
  const nodes = parseInt(nodesPerStage);
  
  // Calculate total number of vertices
  const n = 1 + (stages - 2) * nodes + 1;
  
  // Create cost matrix initialized with INF
  const costMatrix = Array(n).fill(null).map(() => Array(n).fill(INF));
  
  // Parse edge costs
  if (edgeCostsString && edgeCostsString.trim()) {
    const edges = edgeCostsString.split(',');
    for (const edge of edges) {
      const parts = edge.trim().split(/[-:]/);
      if (parts.length === 3) {
        const from = parseInt(parts[0]);
        const to = parseInt(parts[1]);
        const cost = parseFloat(parts[2]);
        
        if (!isNaN(from) && !isNaN(to) && !isNaN(cost) && from < n && to < n) {
          costMatrix[from][to] = cost;
        }
      }
    }
  }
  
  // Build stage structure for visualization
  const stageVertices = [];
  stageVertices[0] = [0]; // Source vertex
  
  let vertexIndex = 1;
  for (let stage = 1; stage < stages - 1; stage++) {
    stageVertices[stage] = [];
    for (let i = 0; i < nodes; i++) {
      stageVertices[stage].push(vertexIndex);
      vertexIndex++;
    }
  }
  
  stageVertices[stages - 1] = [n - 1]; // Destination vertex
  
  // Run backward cost algorithm
  const result = backwardCost(costMatrix, n);
  
  // Convert path to 1-indexed for display
  const displayPath = result.path.map(v => v + 1);
  
  return {
    type: 'multistage',
    minimumCost: result.minimumCost,
    cost: result.minimumCost,
    path: result.path,
    displayPath: displayPath,
    stages: stages,
    nodesPerStage: nodes,
    totalVertices: n,
    costMatrix: costMatrix,
    stageVertices: stageVertices,
    bcostArray: result.bcostArray,
    decisionArray: result.decisionArray
  };
}

export default multiStageGraphWithEdges;
