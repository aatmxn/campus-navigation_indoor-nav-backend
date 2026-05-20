class PriorityQueue {
    constructor() { this.items = []; }
    enqueue(item, priority) {
      this.items.push({item, priority});
      this.items.sort((a,b) => a.priority - b.priority);
    }
    dequeue() { return this.items.shift().item; }
    isEmpty() { return this.items.length === 0; }
  }
  
  function heuristic(a, b) {
    return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2);
  }
  
  function astar(nodes, edges, startId, endId, accessibleOnly = false) {
    const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));
    
    // Build adjacency list
    const adj = {};
    nodes.forEach(n => adj[n.id] = []);
    edges.forEach(e => {
      if (accessibleOnly && e.accessible === false) return;
      adj[e.from].push({ to: e.to, weight: e.weight });
      adj[e.to].push({ to: e.from, weight: e.weight }); // undirected
    });
  
    const g = {}, f = {}, prev = {};
    nodes.forEach(n => { g[n.id] = Infinity; f[n.id] = Infinity; });
    g[startId] = 0;
    f[startId] = heuristic(nodeMap[startId], nodeMap[endId]);
  
    const pq = new PriorityQueue();
    pq.enqueue(startId, f[startId]);
  
    while (!pq.isEmpty()) {
      const current = pq.dequeue();
      if (current === endId) break;
  
      for (const {to, weight} of adj[current]) {
        const tentative = g[current] + weight;
        if (tentative < g[to]) {
          g[to] = tentative;
          f[to] = tentative + heuristic(nodeMap[to], nodeMap[endId]);
          prev[to] = current;
          pq.enqueue(to, f[to]);
        }
      }
    }
  
    // Reconstruct path
    const path = [];
    let curr = endId;
    while (curr) { path.unshift(curr); curr = prev[curr]; }
    return path[0] === startId ? path : null; // null = no path found
  }
  
  module.exports = astar;