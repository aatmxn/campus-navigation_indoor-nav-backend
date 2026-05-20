const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const { parse } = require('csv-parse/sync'); // Fast synchronous parser
const verifyToken = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage() });
const Fingerprint = mongoose.model('Fingerprint');

// 1. POST /api/venues/:id/floors/:fid/fingerprints - Parse and Bulk Store raw data
router.post('/:id/floors/:fid/fingerprints', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No CSV fingerprint file uploaded' });
    
    const { id: venueId, fid: floorId } = req.params;

    // Parse incoming buffer string
    const csvRawString = req.file.buffer.toString();
    const records = parse(csvRawString, {
      columns: true, // Auto-maps headers: x, y, mag_total, mag_horizontal, mag_vertical, bssid, rssi
      skip_empty_lines: true
    });

    // Structure array objects to match Fingerprint schema requirements
    const bulkPayload = records.map(row => {
      // Parses wireless access fields if mapped as a continuous flat JSON format
      let wifiMap = new Map();
      if (row.bssid && row.rssi) {
        wifiMap.set(row.bssid, Number(row.rssi));
      }

      return {
        venueId,
        floorId,
        x: Number(row.x),
        y: Number(row.y),
        mag_total: Number(row.mag_total),
        mag_horizontal: Number(row.mag_horizontal),
        mag_vertical: Number(row.mag_vertical),
        wifi: wifiMap,
        active: false, // Remains inactive until averaging pipeline executes
        version: 1
      };
    });

    // Perform atomic database operation
    await Fingerprint.insertMany(bulkPayload);
    res.status(201).json({ success: true, count: bulkPayload.length, message: 'Raw traces stored successfully' });

  } catch (error) {
    res.status(500).json({ error: 'Fingerprint upload batch operation failed', details: error.message });
  }
});

// 2. POST /api/venues/:id/floors/:fid/fingerprints/activate - Compute structural cluster averages
router.post('/:id/floors/:fid/fingerprints/activate', verifyToken, async (req, res) => {
  try {
    const { fid: floorId } = req.params;

    // Pipeline to group by spatial coordinates (x, y) and average out local structural magnetic values
    const averagedData = await Fingerprint.aggregate([
      { $match: { floorId: new mongoose.Types.ObjectId(floorId), active: false } },
      {
        $group: {
          _id: { x: "$x", y: "$y" },
          avg_mag_total: { $avg: "$mag_total" },
          avg_mag_horizontal: { $avg: "$mag_horizontal" },
          avg_mag_vertical: { $avg: "$mag_vertical" },
          venueId: { $first: "$venueId" }
        }
      }
    ]);

    if (averagedData.length === 0) {
      return res.status(400).json({ error: 'No new raw footprints found to compile for validation' });
    }

    // Set old floor sets to active: false to clean historical slates
    await Fingerprint.updateMany({ floorId, active: true }, { $set: { active: false } });

    // Insert computed master fingerprints array
    const cleanMasterSet = averagedData.map(node => ({
      venueId: node.venueId,
      floorId: floorId,
      x: node._id.x,
      y: node._id.y,
      mag_total: node.avg_mag_total,
      mag_horizontal: node.avg_mag_horizontal,
      mag_vertical: node.avg_mag_vertical,
      active: true,
      version: 2
    }));

    await Fingerprint.insertMany(cleanMasterSet);
    res.json({ success: true, message: `Calibration complete. ${cleanMasterSet.length} map nodes optimized.` });

  } catch (error) {
    res.status(500).json({ error: 'Calibration pipeline aggregation failure', details: error.message });
  }
});

module.exports = router;