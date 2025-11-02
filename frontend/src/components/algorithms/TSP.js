/**
 * Traveling Salesman Problem (TSP) Algorithm
 * Finds shortest route visiting all cities exactly once and returning to start
 * Uses Nearest Neighbor Heuristic with validation
 */

/**
 * Calculate Euclidean distance between two cities
 * @param {Object} city1 - City with x, y coordinates
 * @param {Object} city2 - City with x, y coordinates
 * @returns {number} Euclidean distance
 */
function calculateDistance(city1, city2) {
  const dx = city1.x - city2.x;
  const dy = city1.y - city2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Build distance matrix for all cities
 * @param {Array} cityPositions - Array of city objects with x, y coordinates
 * @returns {Array<Array<number>>} Distance matrix
 */
function buildDistanceMatrix(cityPositions) {
  const n = cityPositions.length;
  const distances = Array(n).fill(0).map(() => Array(n).fill(0));
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        distances[i][j] = calculateDistance(cityPositions[i], cityPositions[j]);
      } else {
        distances[i][j] = 0;
      }
    }
  }
  
  return distances;
}

/**
 * Nearest Neighbor Heuristic for TSP
 * Starts from city 0, always visits nearest unvisited city
 * @param {Array<Array<number>>} distances - Distance matrix
 * @param {number} startCity - Starting city index (default: 0)
 * @returns {Object} Tour and total distance
 */
function nearestNeighbor(distances, startCity = 0) {
  const n = distances.length;
  const visited = Array(n).fill(false);
  const tour = [startCity];
  visited[startCity] = true;
  let totalDistance = 0;
  let currentCity = startCity;
  
  // Visit n-1 cities (excluding start)
  for (let step = 0; step < n - 1; step++) {
    let nearestCity = -1;
    let minDistance = Infinity;
    
    // Find nearest unvisited city
    for (let city = 0; city < n; city++) {
      if (!visited[city] && distances[currentCity][city] < minDistance) {
        minDistance = distances[currentCity][city];
        nearestCity = city;
      }
    }
    
    // Visit the nearest city
    if (nearestCity !== -1) {
      tour.push(nearestCity);
      visited[nearestCity] = true;
      totalDistance += minDistance;
      currentCity = nearestCity;
    }
  }
  
  // Return to starting city
  const returnDistance = distances[currentCity][startCity];
  totalDistance += returnDistance;
  tour.push(startCity); // Complete the cycle
  
  // Validate all cities were visited
  const allVisited = visited.every(v => v === true);
  
  return {
    tour,
    totalDistance,
    allVisited,
    numCitiesVisited: visited.filter(v => v).length
  };
}

/**
 * Generate random city positions
 * @param {number} numCities - Number of cities to generate
 * @param {number} width - Canvas width (default: 600)
 * @param {number} height - Canvas height (default: 400)
 * @returns {Array} Array of city objects with x, y coordinates
 */
export function generateCityPositions(numCities, width = 600, height = 400) {
  const cities = [];
  const margin = 50;
  
  for (let i = 0; i < numCities; i++) {
    cities.push({
      id: i,
      x: Math.random() * (width - 2 * margin) + margin,
      y: Math.random() * (height - 2 * margin) + margin
    });
  }
  
  return cities;
}

/**
 * Main TSP function
 * @param {number} numCities - Number of cities to visit
 * @param {Array} customCityPositions - Optional custom city positions
 * @param {Array} customDistanceMatrix - Optional custom distance matrix
 * @returns {Object} Result containing tour, distance, and city positions
 */
export function tsp(numCities, customCityPositions = null, customDistanceMatrix = null) {
  const cities = parseInt(numCities);
  
  // Generate or use provided city positions
  const cityPositions = customCityPositions || generateCityPositions(cities);
  
  // Build or use provided distance matrix
  const distances = customDistanceMatrix || buildDistanceMatrix(cityPositions);
  
  // Run nearest neighbor algorithm
  const result = nearestNeighbor(distances, 0);
  
  // Validate solution
  if (!result.allVisited) {
    console.error('TSP Error: Not all cities were visited!');
  }
  
  // Calculate tour segments for animation
  const tourSegments = [];
  for (let i = 0; i < result.tour.length - 1; i++) {
    const from = result.tour[i];
    const to = result.tour[i + 1];
    tourSegments.push({
      from,
      to,
      distance: distances[from][to].toFixed(2)
    });
  }
  
  return {
    type: 'tsp',
    tour: result.tour,
    distance: result.totalDistance.toFixed(2),
    cityPositions,
    numCities: cities,
    allVisited: result.allVisited,
    numCitiesVisited: result.numCitiesVisited,
    distanceMatrix: distances,
    tourSegments,
    averageSegmentDistance: (result.totalDistance / (result.tour.length - 1)).toFixed(2)
  };
}

export default tsp;
