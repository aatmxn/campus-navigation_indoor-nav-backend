require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const astar = require('./src/utils/astar');

const app = express();

// --- Middleware ---
app.use(express.json());
app.use(cors()); // Critical for your friend in the US to connect
app.use(helmet()); // Security headers
app.use(morgan('dev')); // Logs requests to your terminal

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// --- Mock Data ---
// Tomorrow we will replace these with: const nodes = await Node.find({});
const mockNodes = [
  {id: 'entrance', x: 0, y: 0},
  {id: 'corridor_a', x: 10, y: 0},
  {id: 'corridor_b', x: 10, y: 10},
  {id: 'room_101', x: 20, y: 0},
  {id: 'room_102', x: 20, y: 10},
  {id: 'stairs', x: 5, y: 10},
];

const mockEdges = [
  {from: 'entrance', to: 'corridor_a', weight: 10, accessible: true},
  {from: 'corridor_a', to: 'corridor_b', weight: 10, accessible: true},
  {from: 'corridor_a', to: 'room_101', weight: 10, accessible: true},
  {from: 'corridor_b', to: 'room_102', weight: 10, accessible: true},
  {from: 'entrance', to: 'stairs', weight: 7, accessible: false},
  {from: 'stairs', to: 'corridor_b', weight: 7, accessible: false},
];

// --- API Endpoints ---

// 1. Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Indoor Nav Backend is running',
    timestamp: new Date()
  });
});

// 2. Navigation Endpoint
// Friend's Flutter app will POST to this
app.post('/api/navigate', (req, res) => {
  const { startId, endId, accessibleOnly } = req.body;

  if (!startId || !endId) {
    return res.status(400).json({ error: "Missing startId or endId" });
  }

  // Calculate path using your A* logic
  const path = astar(mockNodes, mockEdges, startId, endId, accessibleOnly);

  if (path) {
    res.json({ success: true, path });
  } else {
    res.status(404).json({ success: false, message: "No path found between these points" });
  }
});

// --- Server Startup ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});