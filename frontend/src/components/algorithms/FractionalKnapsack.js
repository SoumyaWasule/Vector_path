/**
 * Fractional Knapsack Algorithm
 * Based on the C implementation provided
 * Supports three approaches: Weight-based, Profit-based, and Ratio-based (optimal)
 */

/**
 * Sort boxes based on selected approach
 * @param {Array} boxes - Array of box objects
 * @param {number} approach - 1: Weight-based, 2: Profit-based, 3: Ratio-based
 */
function sortBoxes(boxes, approach) {
  const n = boxes.length;
  
  for (let i = 0; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      let swap = false;
      
      if (approach === 1 && boxes[i].weight > boxes[j].weight) {
        swap = true;
      } else if (approach === 2 && boxes[i].profit < boxes[j].profit) {
        swap = true;
      } else if (approach === 3 && boxes[i].ratio < boxes[j].ratio) {
        swap = true;
      }
      
      if (swap) {
        const temp = boxes[i];
        boxes[i] = boxes[j];
        boxes[j] = temp;
      }
    }
  }
}

/**
 * Execute Fractional Knapsack Algorithm
 * @param {Array} boxes - Original boxes array with weight and profit
 * @param {number} approach - 1: Weight-based, 2: Profit-based, 3: Ratio-based (default)
 * @param {number} truckCapacity - Maximum capacity of truck
 * @returns {Object} Result containing total profit, selected boxes, and efficiency
 */
export function fractionalKnapsack(boxes, approach = 3, truckCapacity) {
  // Create deep copy and calculate ratios
  const temp = boxes.map((box, index) => ({
    index: box.index !== undefined ? box.index : index,
    weight: parseFloat(box.weight),
    profit: parseFloat(box.profit),
    name: box.name || `Box ${index}`,
    ratio: box.weight > 0 ? parseFloat(box.profit) / parseFloat(box.weight) : 0
  }));
  
  // Sort based on approach
  sortBoxes(temp, approach);
  
  let totalProfit = 0.0;
  let capacity = truckCapacity;
  const selectedBoxes = [];
  
  for (let i = 0; i < temp.length && capacity > 0; i++) {
    const w = temp[i].weight;
    const p = temp[i].profit;
    
    if (w <= capacity) {
      // Take full box
      totalProfit += p;
      capacity -= w;
      selectedBoxes.push({
        ...temp[i],
        fraction: 1.0,
        takenWeight: w,
        takenProfit: p
      });
    } else {
      // Take fractional box
      const fraction = capacity / w;
      const fractionalProfit = p * fraction;
      totalProfit += fractionalProfit;
      selectedBoxes.push({
        ...temp[i],
        fraction: fraction,
        takenWeight: capacity,
        takenProfit: fractionalProfit
      });
      capacity = 0;
    }
  }
  
  const usedCapacity = truckCapacity - capacity;
  const efficiency = truckCapacity > 0 ? (totalProfit / usedCapacity) : 0;
  
  return {
    type: 'knapsack',
    totalProfit: totalProfit.toFixed(2),
    selectedBoxes,
    usedCapacity,
    remainingCapacity: capacity,
    capacity: truckCapacity,
    efficiency: efficiency.toFixed(2),
    approach: approach,
    approachName: approach === 1 ? 'Weight-based' : approach === 2 ? 'Profit-based' : 'Ratio-based'
  };
}

export default fractionalKnapsack;
