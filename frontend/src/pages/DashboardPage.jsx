import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Truck, Package, Route, ArrowLeft, Play, RotateCcw, Clock, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { fractionalKnapsack, generateRandomBoxes } from '@/components/algorithms/FractionalKnapsack';
import { multiStageGraphWithEdges } from '@/components/algorithms/MultiStageGraph';
import { tsp } from '@/components/algorithms/TSP';

export default function DashboardPage() {
  const navigate = useNavigate();
  
  // Algorithm selection state
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('multistage');
  
  // Input states for different algorithms
  const [multistageInputs, setMultistageInputs] = useState({
    stages: '4',
    nodesPerStage: '3',
    edgeCosts: '0-1:2, 0-2:3, 1-3:4, 2-3:5, 1-4:3, 2-4:5, 3-5:1, 4-5:2'
  });
  
  const [tspInputs, setTspInputs] = useState({
    numLocations: '5',
    distanceMatrix: '0-1:10, 0-2:15, 0-3:20, 1-2:35, 1-3:25, 2-3:30, 0-4:12, 1-4:20, 2-4:25, 3-4:18'
  });
  
  const [knapsackInputs, setKnapsackInputs] = useState({
    capacity: '50',
    packageDetails: '10:60:electronics, 20:100:furniture, 15:120:appliances'
  });
  
  // Calculation states
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);
  
  // Animation state
  const [animationProgress, setAnimationProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const algorithms = [
    { id: 'multistage', name: 'Multi-Stage Graph', icon: Route, color: 'primary' },
    { id: 'tsp', name: 'TSP Route', icon: Truck, color: 'secondary' },
    { id: 'knapsack', name: 'Knapsack Loading', icon: Package, color: 'accent' }
  ];

  // ========================================
  // ALGORITHM IMPLEMENTATIONS
  // All algorithms imported from separate files in @/components/algorithms/
  // ========================================
  
  // Multi-Stage Graph: @/components/algorithms/MultiStageGraph
  // Fractional Knapsack: @/components/algorithms/FractionalKnapsack
  // TSP: @/components/algorithms/TSP

  // ========================================
  // CALCULATION HANDLER
  // ========================================
  const handleCalculate = () => {
    setIsCalculating(true);
    setShowAnimation(false);
    setResult(null);
    setAnimationProgress(0);
    setCurrentStep(0);
    
    setTimeout(() => {
      const startTime = performance.now();
      let calculatedResult;
      
      // Execute selected algorithm
      if (selectedAlgorithm === 'multistage') {
        try {
          const edgeCosts = multistageInputs.edgeCosts.trim();
          if (!edgeCosts) {
            toast.error('Please enter edge costs');
            setIsCalculating(false);
            return;
          }
          calculatedResult = multiStageGraphWithEdges(
            multistageInputs.stages, 
            multistageInputs.nodesPerStage,
            edgeCosts
          );
        } catch (error) {
          toast.error(error.message || 'Invalid edge costs format');
          setIsCalculating(false);
          return;
        }
      } else if (selectedAlgorithm === 'tsp') {
        try {
          const distanceMatrixString = tspInputs.distanceMatrix.trim();
          const numLocations = parseInt(tspInputs.numLocations);
          
          if (!distanceMatrixString) {
            toast.error('Please enter distance matrix');
            setIsCalculating(false);
            return;
          }
          
          // Parse distance matrix from string format
          const distances = Array(numLocations).fill(null).map(() => Array(numLocations).fill(Infinity));
          
          // Set diagonal to 0
          for (let i = 0; i < numLocations; i++) {
            distances[i][i] = 0;
          }
          
          // Parse edges
          const edges = distanceMatrixString.split(',');
          edges.forEach(edge => {
            const parts = edge.trim().split(/[-:]/);
            if (parts.length === 3) {
              const from = parseInt(parts[0]);
              const to = parseInt(parts[1]);
              const dist = parseInt(parts[2]);
              
              if (!isNaN(from) && !isNaN(to) && !isNaN(dist)) {
                distances[from][to] = dist;
                distances[to][from] = dist; // Symmetric
              }
            }
          });
          
          calculatedResult = tsp(numLocations, null, distances);
        } catch (error) {
          toast.error(error.message || 'Invalid distance matrix format');
          setIsCalculating(false);
          return;
        }
      } else if (selectedAlgorithm === 'knapsack') {
        // Parse package details from input string
        try {
          const packageString = knapsackInputs.packageDetails.trim();
          if (!packageString) {
            toast.error('Please enter package details');
            setIsCalculating(false);
            return;
          }

          const packages = packageString.split(',').map((pkg, index) => {
            const parts = pkg.trim().split(':');
            if (parts.length !== 3) {
              throw new Error('Invalid format. Use weight:value:name');
            }
            const weight = parseFloat(parts[0]);
            const profit = parseFloat(parts[1]);
            const name = parts[2].trim();
            
            if (isNaN(weight) || isNaN(profit)) {
              throw new Error('Weight and value must be numbers');
            }
            
            return {
              index,
              weight,
              profit,
              name,
              ratio: profit / weight
            };
          });

          calculatedResult = fractionalKnapsack(packages, 3, parseInt(knapsackInputs.capacity));
          
          // Map to expected format for animation with names
          calculatedResult.selectedPackages = calculatedResult.selectedBoxes.map(box => ({
            id: box.index,
            weight: box.weight,
            value: box.profit,
            name: box.name,
            fraction: box.fraction,
            takenWeight: box.takenWeight,
            takenValue: box.takenProfit
          }));
          calculatedResult.totalValue = calculatedResult.totalProfit;
          calculatedResult.allPackages = packages;
        } catch (error) {
          toast.error(error.message || 'Invalid package details format');
          setIsCalculating(false);
          return;
        }
      }
      
      const endTime = performance.now();
      
      setResult({
        ...calculatedResult,
        computationTime: (endTime - startTime).toFixed(2)
      });
      
      setIsCalculating(false);
      setShowAnimation(true);
      toast.success('Calculation completed successfully!');
    }, 800);
  };

  const handleReset = () => {
    setResult(null);
    setShowAnimation(false);
    setAnimationProgress(0);
    setCurrentStep(0);
  };

  // Animation with step-by-step progression
  useEffect(() => {
    if (showAnimation && result) {
      const steps = result.type === 'multistage' ? result.path.length : 
                    result.type === 'tsp' ? result.tour.length :
                    result.selectedPackages.length;
      
      setCurrentStep(0);
      setAnimationProgress(0);
      
      const interval = setInterval(() => {
        setCurrentStep(prev => {
          const next = prev + 1;
          const progress = ((next + 1) / steps) * 100;
          setAnimationProgress(progress);
          
          if (next >= steps - 1) {
            clearInterval(interval);
            return steps - 1;
          }
          return next;
        });
      }, 1000); // 1 second per step
      
      return () => clearInterval(interval);
    }
  }, [showAnimation, result]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-[hsl(var(--muted))] to-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/')}
                className="hover:bg-[hsl(var(--primary))]/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[hsl(var(--primary))] rounded-lg">
                  <Truck className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">Algorithm Dashboard</h1>
                  <p className="text-xs text-muted-foreground">Interactive Optimization Tools</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Algorithm Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">Choose Algorithm</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {algorithms.map((algo) => (
              <motion.button
                key={algo.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedAlgorithm(algo.id);
                  handleReset();
                }}
                className={`p-6 rounded-lg border-2 transition-all duration-300 text-left ${
                  selectedAlgorithm === algo.id
                    ? `border-[hsl(var(--${algo.color}))] bg-[hsl(var(--${algo.color}))]/10`
                    : 'border-border/50 hover:border-[hsl(var(--primary))]/30'
                }`}
              >
                <algo.icon className={`w-8 h-8 mb-3 ${
                  selectedAlgorithm === algo.id 
                    ? `text-[hsl(var(--${algo.color}))]` 
                    : 'text-muted-foreground'
                }`} />
                <h3 className="font-semibold text-lg mb-1">{algo.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {algo.id === 'multistage' && 'Optimal path through stages'}
                  {algo.id === 'tsp' && 'Shortest tour visiting all cities'}
                  {algo.id === 'knapsack' && 'Maximize value within capacity'}
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Input Parameters</CardTitle>
              <CardDescription>
                Configure parameters for {algorithms.find(a => a.id === selectedAlgorithm)?.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <AnimatePresence mode="wait">
                {/* Multi-Stage Graph Inputs */}
                {selectedAlgorithm === 'multistage' && (
                  <motion.div
                    key="multistage"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="stages">Number of Stages</Label>
                      <Input
                        id="stages"
                        type="number"
                        min="2"
                        max="10"
                        value={multistageInputs.stages}
                        onChange={(e) => setMultistageInputs(prev => ({ ...prev, stages: e.target.value }))}
                        placeholder="Enter number of stages"
                      />
                      <p className="text-xs text-muted-foreground">Sequential delivery stages (minimum 2)</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nodesPerStage">Nodes per Stage</Label>
                      <Input
                        id="nodesPerStage"
                        type="number"
                        min="2"
                        max="8"
                        value={multistageInputs.nodesPerStage}
                        onChange={(e) => setMultistageInputs(prev => ({ ...prev, nodesPerStage: e.target.value }))}
                        placeholder="Enter nodes per stage"
                      />
                      <p className="text-xs text-muted-foreground">Distribution centers at each stage</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edgeCosts">Edge Costs</Label>
                      <Input
                        id="edgeCosts"
                        type="text"
                        value={multistageInputs.edgeCosts}
                        onChange={(e) => setMultistageInputs(prev => ({ ...prev, edgeCosts: e.target.value }))}
                        placeholder="0-1:2, 0-2:3, 1-3:4, 2-3:5"
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">Format: source-destination:cost (comma-separated)</p>
                    </div>
                  </motion.div>
                )}

                {/* TSP Inputs */}
                {selectedAlgorithm === 'tsp' && (
                  <motion.div
                    key="tsp"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="numLocations">Number of Locations</Label>
                      <Input
                        id="numLocations"
                        type="number"
                        min="3"
                        max="15"
                        value={tspInputs.numLocations}
                        onChange={(e) => setTspInputs(prev => ({ ...prev, numLocations: e.target.value }))}
                        placeholder="Enter number of locations"
                      />
                      <p className="text-xs text-muted-foreground">Delivery destinations including warehouse</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="distanceMatrix">Distance Matrix</Label>
                      <Input
                        id="distanceMatrix"
                        type="text"
                        value={tspInputs.distanceMatrix}
                        onChange={(e) => setTspInputs(prev => ({ ...prev, distanceMatrix: e.target.value }))}
                        placeholder="0-1:10, 0-2:15, 0-3:20, 1-2:35, 1-3:25, 2-3:30"
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">Format: location1-location2:distance (comma-separated)</p>
                    </div>
                  </motion.div>
                )}

                {/* Knapsack Inputs */}
                {selectedAlgorithm === 'knapsack' && (
                  <motion.div
                    key="knapsack"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Vehicle Capacity (kg)</Label>
                      <Input
                        id="capacity"
                        type="number"
                        min="10"
                        max="500"
                        value={knapsackInputs.capacity}
                        onChange={(e) => setKnapsackInputs(prev => ({ ...prev, capacity: e.target.value }))}
                        placeholder="Enter vehicle capacity"
                      />
                      <p className="text-xs text-muted-foreground">Maximum weight the vehicle can carry</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="packageDetails">Package Details</Label>
                      <Input
                        id="packageDetails"
                        type="text"
                        value={knapsackInputs.packageDetails}
                        onChange={(e) => setKnapsackInputs(prev => ({ ...prev, packageDetails: e.target.value }))}
                        placeholder="10:60:electronics, 20:100:furniture, 15:120:appliances"
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">Format: weight:value:name (comma-separated)</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleCalculate}
                  disabled={isCalculating}
                  className="flex-1 gap-2"
                  size="lg"
                >
                  {isCalculating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Calculate Route
                    </>
                  )}
                </Button>
                <Button onClick={handleReset} variant="outline" size="lg" className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              </div>

              {/* Results Summary */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 pt-4 border-t border-border"
                >
                  <h4 className="font-semibold text-sm">Results Summary</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-[hsl(var(--accent))]/10 rounded-lg">
                      <div className="flex items-center gap-2 text-[hsl(var(--accent))] mb-1">
                        <TrendingDown className="w-4 h-4" />
                        <span className="text-xs font-medium">
                          {result.type === 'knapsack' ? 'Total Value' : 'Total Cost'}
                        </span>
                      </div>
                      <div className="text-2xl font-bold">
                        {result.type === 'knapsack' ? `$${result.totalValue}` : 
                         result.type === 'tsp' ? `${result.distance} km` :
                         `$${result.cost}`}
                      </div>
                    </div>
                    <div className="p-3 bg-[hsl(var(--primary))]/10 rounded-lg">
                      <div className="flex items-center gap-2 text-[hsl(var(--primary))] mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-medium">Time</span>
                      </div>
                      <div className="text-2xl font-bold">{result.computationTime}ms</div>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-xs font-medium text-muted-foreground mb-2">
                      {result.type === 'knapsack' ? 'Selected Packages' : 'Route Sequence'}
                    </div>
                    <div className="text-sm">
                      {result.type === 'knapsack' && (
                        <div className="space-y-1">
                          <div className="font-medium">{result.selectedPackages.length} packages loaded</div>
                          <div className="text-xs text-muted-foreground max-h-20 overflow-y-auto">
                            {result.selectedPackages.map((pkg, idx) => (
                              <div key={idx}>
                                • {pkg.name} ({pkg.takenWeight.toFixed(1)}kg, ${pkg.takenValue.toFixed(0)})
                                {pkg.fraction < 1 && ` - ${(pkg.fraction * 100).toFixed(0)}%`}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {result.type === 'tsp' && `${result.tour.length} locations visited`}
                      {result.type === 'multistage' && `${result.path.length} nodes in path`}
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Visualization Panel */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Live Animation</CardTitle>
              <CardDescription>
                {result ? 'Watch the optimization in action' : 'Configure and calculate to see animation'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result && showAnimation ? (
                <div className="space-y-4">
                  {/* Animation Canvas */}
                  <div className="relative h-[400px] bg-muted/30 rounded-lg border-2 border-dashed border-border overflow-hidden">
                    {/* Render based on algorithm type */}
                    {result.type === 'tsp' && (
                      <TruckAnimation 
                        tour={result.tour}
                        cityPositions={result.cityPositions}
                        currentStep={currentStep}
                      />
                    )}
                    
                    {result.type === 'multistage' && (
                      <MultiStageAnimation 
                        path={result.path}
                        stages={result.stages}
                        nodesPerStage={result.nodesPerStage}
                        totalVertices={result.totalVertices}
                        stageVertices={result.stageVertices}
                        costMatrix={result.costMatrix}
                        currentStep={currentStep}
                      />
                    )}
                    
                    {result.type === 'knapsack' && (
                      <KnapsackAnimation 
                        packages={result.selectedPackages}
                        currentStep={currentStep}
                      />
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{Math.round(animationProgress)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-[hsl(var(--primary))]"
                        initial={{ width: 0 }}
                        animate={{ width: `${animationProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[400px] bg-muted/30 rounded-lg border-2 border-dashed border-border">
                  <div className="text-center">
                    <Truck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Select algorithm and click Calculate</p>
                    <p className="text-sm text-muted-foreground mt-2">Animation will appear here</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ========================================
// ANIMATION COMPONENTS
// ========================================

// TSP Bike Delivery Animation Component
function TruckAnimation({ tour, cityPositions, currentStep }) {
  const currentCity = tour[currentStep];
  const pos = cityPositions[currentCity];
  
  return (
    <div className="relative h-full w-full bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 rounded-2xl shadow-lg pb-24">
      <svg width="100%" height="calc(100% - 96px)" viewBox="0 0 600 300" preserveAspectRatio="xMidYMid meet" className="overflow-visible">
        <defs>
          {/* Gradient for visited path */}
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
          </linearGradient>
          
          {/* Drop shadow filter */}
          <filter id="dropShadow">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
            <feOffset dx="0" dy="2" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Draw all paths (unvisited) */}
        {tour.slice(0, -1).map((cityIdx, i) => {
          const from = cityPositions[cityIdx];
          const to = cityPositions[tour[i + 1]];
          const isVisited = i < currentStep;
          
          if (!isVisited) {
            return (
              <line
                key={`path-${i}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="#cbd5e1"
                strokeWidth="2"
                strokeDasharray="8,4"
                opacity="0.4"
              />
            );
          }
          return null;
        })}

        {/* Draw visited paths with animation */}
        {tour.slice(0, -1).map((cityIdx, i) => {
          const from = cityPositions[cityIdx];
          const to = cityPositions[tour[i + 1]];
          const isVisited = i < currentStep;
          
          if (isVisited) {
            return (
              <motion.line
                key={`visited-${i}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="url(#pathGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                filter="url(#dropShadow)"
              />
            );
          }
          return null;
        })}
        
        {/* Draw delivery locations */}
        {cityPositions.map((pos, idx) => {
          const isVisited = tour.slice(0, currentStep + 1).includes(idx);
          const isStart = idx === 0;
          const isCurrent = idx === currentCity;
          
          return (
            <g key={`city-${idx}`}>
              {/* Outer glow for current location */}
              {isCurrent && (
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r="25"
                  fill="#3b82f6"
                  opacity="0.3"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
              
              {/* Location marker */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isStart ? 20 : 16}
                fill={isVisited ? (isStart ? '#f59e0b' : '#10b981') : '#e5e7eb'}
                stroke={isVisited ? (isStart ? '#d97706' : '#059669') : '#9ca3af'}
                strokeWidth="3"
                filter="url(#dropShadow)"
              />
              
              {/* Location icon */}
              {isStart ? (
                <text
                  x={pos.x}
                  y={pos.y + 7}
                  textAnchor="middle"
                  fontSize="18"
                  fill="white"
                >
                  🏠
                </text>
              ) : (
                <>
                  <text
                    x={pos.x}
                    y={pos.y + 5}
                    textAnchor="middle"
                    fill="white"
                    fontSize="14"
                    fontWeight="700"
                  >
                    {idx}
                  </text>
                  {isVisited && !isCurrent && (
                    <text
                      x={pos.x}
                      y={pos.y - 25}
                      textAnchor="middle"
                      fontSize="16"
                    >
                      ✓
                    </text>
                  )}
                </>
              )}
            </g>
          );
        })}
        
        {/* Animated Delivery Bike */}
        <motion.g
          animate={{ 
            x: pos.x, 
            y: pos.y 
          }}
          transition={{ 
            duration: 0.8, 
            ease: 'easeInOut'
          }}
        >
          {/* Bike shadow */}
          <ellipse 
            cx="0" 
            cy="15" 
            rx="20" 
            ry="5" 
            fill="rgba(0,0,0,0.2)"
            opacity="0.5"
          />
          
          {/* Delivery box on bike */}
          <rect
            x="-8"
            y="-25"
            width="16"
            height="14"
            fill="#fb923c"
            stroke="#ea580c"
            strokeWidth="2"
            rx="2"
          />
          
          {/* Bike emoji with bounce */}
          <motion.text 
            x="0" 
            y="10" 
            textAnchor="middle" 
            fontSize="35"
            animate={{ y: [10, 7, 10] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
          >
            🚴
          </motion.text>
          
          {/* Speed lines for motion effect */}
          <motion.line
            x1="-25"
            y1="0"
            x2="-35"
            y2="0"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.6"
            animate={{ x1: [-25, -30], x2: [-35, -40] }}
            transition={{ duration: 0.3, repeat: Infinity }}
          />
          <motion.line
            x1="-25"
            y1="-5"
            x2="-32"
            y2="-5"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.4"
            animate={{ x1: [-25, -28], x2: [-32, -36] }}
            transition={{ duration: 0.3, repeat: Infinity, delay: 0.1 }}
          />
        </motion.g>
      </svg>
      
      {/* Delivery Status Info */}
      <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-2 border-blue-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {currentStep + 1}
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-700">
                {currentStep === 0 ? '🏠 Starting from Warehouse' : currentStep === tour.length - 1 ? '🏠 Returning to Warehouse' : `📍 Delivering to Location ${currentCity}`}
              </div>
              <div className="text-xs text-gray-500">
                Step {currentStep + 1} of {tour.length}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Progress</div>
            <div className="text-lg font-bold text-blue-600">
              {Math.round((currentStep / (tour.length - 1)) * 100)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Multi-Stage Graph Visualization with Animated Truck
function MultiStageAnimation({ path, stages, totalVertices, stageVertices, costMatrix, currentStep }) {
  if (!path || !stageVertices || !costMatrix) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading graph...</p>
      </div>
    );
  }

  const width = 1100;
  const height = 450;
  const padding = 100;
  const stageWidth = stages > 1 ? (width - 2 * padding) / (stages - 1) : 0;

  const nodePositions = {};

  stageVertices.forEach((stageNodes, stageIndex) => {
    const nodesInStage = stageNodes.length;
    const verticalSpacing = nodesInStage > 1 ? (height - 2 * padding) / (nodesInStage + 1) : height / 2;

    stageNodes.forEach((nodeId, nodeIndex) => {
      nodePositions[nodeId] = {
        x: padding + stageIndex * stageWidth,
        y: nodesInStage > 1 ? padding + (nodeIndex + 1) * verticalSpacing : height / 2,
      };
    });
  });

  const edges = [];
  for (let i = 0; i < totalVertices; i++) {
    for (let j = 0; j < totalVertices; j++) {
      if (costMatrix[i][j] !== Infinity && costMatrix[i][j] > 0) {
        edges.push({ from: i, to: j, cost: costMatrix[i][j] });
      }
    }
  }

  const isEdgeInPath = (from, to) => {
    for (let i = 0; i < path.length - 1; i++) {
      if (path[i] === from && path[i + 1] === to) return { inPath: true, index: i };
    }
    return { inPath: false, index: -1 };
  };

  // Get current truck position
  const currentNodeId = currentStep < path.length ? path[currentStep] : path[path.length - 1];
  const currentPos = nodePositions[currentNodeId] || { x: padding, y: height / 2 };

  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl shadow-md p-4">
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">

        {/* Stage separators + labels */}
        {stageVertices.map((_, stageIndex) => {
          const x = padding + stageIndex * stageWidth;
          return (
            <g key={`stage-${stageIndex}`}>
              <line
                x1={x}
                y1={60}
                x2={x}
                y2={height - 40}
                stroke="rgba(148,163,184,0.15)"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <text
                x={x}
                y={40}
                textAnchor="middle"
                fill="#475569"
                fontSize="14"
                fontWeight="600"
              >
                Stage {stageIndex}
              </text>
            </g>
          );
        })}

        {/* Edges */}
        {edges.map((edge, idx) => {
          const fromPos = nodePositions[edge.from];
          const toPos = nodePositions[edge.to];
          if (!fromPos || !toPos) return null;

          const pathInfo = isEdgeInPath(edge.from, edge.to);
          const isInPath = pathInfo.inPath;
          const isVisited = isInPath && pathInfo.index < currentStep;
          const midX = (fromPos.x + toPos.x) / 2;
          const midY = (fromPos.y + toPos.y) / 2;

          return (
            <g key={`edge-${idx}`}>
              <line
                x1={fromPos.x}
                y1={fromPos.y}
                x2={toPos.x}
                y2={toPos.y}
                stroke={isVisited ? "#22c55e" : isInPath ? "#3b82f6" : "#cbd5e1"}
                strokeWidth={isVisited ? 5 : isInPath ? 4 : 2}
                opacity={isVisited ? 1 : isInPath ? 0.95 : 0.5}
                strokeLinecap="round"
              />
              <text
                x={midX}
                y={midY - 6}
                textAnchor="middle"
                fill={isVisited ? "#16a34a" : isInPath ? "#1e40af" : "#64748b"}
                fontSize="12"
                fontWeight={isInPath ? "700" : "500"}
                style={{ paintOrder: "stroke", stroke: "white", strokeWidth: 3 }}
              >
                {edge.cost}
              </text>
            </g>
          );
        })}

        {/* Nodes */}
        {Object.entries(nodePositions).map(([nodeId, pos]) => {
          const id = parseInt(nodeId);
          const isInPath = path.includes(id);
          const isSource = id === 0;
          const isDestination = id === totalVertices - 1;

          let fillColor = "#e2e8f0";
          let strokeColor = "#94a3b8";
          let radius = 22;

          if (isSource || isDestination) {
            fillColor = "#10b981";
            strokeColor = "#059669";
            radius = 28;
          } else if (isInPath) {
            fillColor = "#3b82f6";
            strokeColor = "#2563eb";
            radius = 25;
          }

          const isVisited = isInPath && path.indexOf(id) <= currentStep;

          return (
            <g key={`node-${nodeId}`}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={radius}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth="3"
                filter={isInPath ? "drop-shadow(0px 2px 6px rgba(59,130,246,0.4))" : ""}
                opacity={isVisited ? 1 : isInPath ? 0.7 : 1}
              />
              <text
                x={pos.x}
                y={pos.y + 5}
                textAnchor="middle"
                fill="white"
                fontSize="16"
                fontWeight="700"
              >
                {id + 1}
              </text>
            </g>
          );
        })}

        {/* Animated Truck */}
        <motion.g
          animate={{ 
            x: currentPos.x, 
            y: currentPos.y 
          }}
          transition={{ 
            duration: 0.8, 
            ease: 'easeInOut'
          }}
        >
          {/* Glow effect */}
          <circle 
            cx="0" 
            cy="0" 
            r="35" 
            fill="#3b82f6" 
            opacity="0.2"
          />
          <circle 
            cx="0" 
            cy="0" 
            r="25" 
            fill="#3b82f6" 
            opacity="0.3"
          />
          {/* Truck emoji */}
          <text 
            x="0" 
            y="10" 
            textAnchor="middle" 
            fontSize="40"
            style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
          >
            🚚
          </text>
        </motion.g>
      </svg>

      {/* Animation Info */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-slate-200">
        <div className="text-xs font-medium text-slate-600">
          Node {currentNodeId + 1} of {totalVertices} | Step {currentStep + 1}/{path.length}
        </div>
      </div>
    </div>
  );
}

// Knapsack Animation Component
function KnapsackAnimation({ packages, currentStep }) {
  const loadedPackages = packages.slice(0, currentStep + 1);
  
  return (
    <div className="p-6 h-full flex flex-col justify-center">
      <div className="text-center mb-6">
        <div className="text-6xl mb-4">🚚</div>
        <p className="text-sm text-muted-foreground">Loading packages...</p>
      </div>
      
      <div className="grid grid-cols-3 gap-3 max-h-[320px] overflow-y-auto">
        {loadedPackages.map((pkg, index) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, scale: 0.5, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              duration: 0.5, 
              delay: index * 0.1,
              type: 'spring',
              stiffness: 300
            }}
            className={`p-3 rounded-lg border-2 ${
              pkg.fraction === 1
                ? 'bg-[hsl(var(--accent))]/20 border-[hsl(var(--accent))]'
                : 'bg-[hsl(var(--warning))]/20 border-[hsl(var(--warning))]'
            }`}
          >
            <div className="text-2xl mb-1">📦</div>
            <div className="text-xs font-semibold truncate" title={pkg.name}>
              {pkg.name || `Package ${pkg.id}`}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {pkg.takenWeight.toFixed(1)}kg
            </div>
            <div className="text-xs font-medium text-green-600">
              ${pkg.takenValue ? pkg.takenValue.toFixed(0) : pkg.value}
            </div>
            {pkg.fraction < 1 && (
              <div className="text-xs font-medium text-[hsl(var(--warning))] mt-1">
                {(pkg.fraction * 100).toFixed(0)}%
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

