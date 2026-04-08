const astar = require('./src/utils/astar');

const nodes = [
  {id: 'entrance', x: 0, y: 0},
  {id: 'corridor_a', x: 10, y: 0},
  {id: 'corridor_b', x: 10, y: 10},
  {id: 'room_101', x: 20, y: 0},
  {id: 'room_102', x: 20, y: 10},
  {id: 'stairs', x: 5, y: 10},
];

const edges = [
  {from: 'entrance', to: 'corridor_a', weight: 10, accessible: true},
  {from: 'corridor_a', to: 'corridor_b', weight: 10, accessible: true},
  {from: 'corridor_a', to: 'room_101', weight: 10, accessible: true},
  {from: 'corridor_b', to: 'room_102', weight: 10, accessible: true},
  {from: 'entrance', to: 'stairs', weight: 7, accessible: false}, // Stairs are faster but not accessible
  {from: 'stairs', to: 'corridor_b', weight: 7, accessible: false},
];

console.log("--- TEST 1: ABLE-BODIED USER (Should use Stairs) ---");
const normalPath = astar(nodes, edges, 'entrance', 'room_102', false);
console.log('Path:', normalPath ? normalPath.join(' -> ') : "No path found"); 

console.log("\n--- TEST 2: WHEELCHAIR ACCESSIBLE (Should use Corridors) ---");
const accessiblePath = astar(nodes, edges, 'entrance', 'room_102', true);
console.log('Path:', accessiblePath ? accessiblePath.join(' -> ') : "No path found");