require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const astar = require('./src/services/astar');

const app = express();

// --- 1. Middleware ---
app.use(express.json());
app.use(cors()); 
app.use(helmet()); 
app.use(morgan('dev')); 

// --- 2. Synchronous Model Registration (CRITICAL: MUST RUN FIRST) ---
require('./src/models/User');
require('./src/models/Venue');
require('./src/models/Floor');
require('./src/models/Fingerprint');
require('./src/models/NavGraph');
require('./src/models/POI');
require('./src/models/ActiveSession');
console.log('📦 All 7 Mongoose models registered successfully');

// --- 3. Route Mounting (Safe now that schemas exist) ---
const venueRoutes = require('./src/routes/venue');
app.use('/api/venues', venueRoutes);

const fingerprintRoutes = require('./src/routes/fingerprint');
app.use('/api/fingerprints', fingerprintRoutes);

// --- 4. Database Connection ---
mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// --- Mock Data ---
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

// --- 5. API Endpoints ---
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Indoor Nav Backend is running',
    timestamp: new Date()
  });
});

app.post('/api/navigate', (req, res) => {
  const { startId, endId, accessibleOnly } = req.body;

  if (!startId || !endId) {
    return res.status(400).json({ error: "Missing startId or endId" });
  }

  const path = astar(mockNodes, mockEdges, startId, endId, accessibleOnly);

  if (path) {
    res.json({ success: true, path });
  } else {
    res.status(404).json({ success: false, message: "No path found between these points" });
  }
});

// --- 6. Server Startup ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});