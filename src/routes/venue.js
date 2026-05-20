const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const verifyToken = require('../middleware/auth');

// Configure Multer storage (Memory storage for direct Cloudinary streaming)
const upload = multer({ storage: multer.memoryStorage() });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Access pre-registered Mongoose Models
const Venue = mongoose.model('Venue');
const Floor = mongoose.model('Floor');

// 1. POST /api/venues - Create a new venue (Protected)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, location, gpsGeofenceRadius } = req.body;
    
    const newVenue = new Venue({
      ownerId: req.user.uid, // Derived securely from verified Firebase token
      name,
      location,
      gpsGeofenceRadius
    });

    const savedVenue = await newVenue.save();
    res.status(201).json(savedVenue);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create venue', details: error.message });
  }
});

// 2. GET /api/venues/:id - Get specific venue info (Public/Protected depending on use)
router.get('/:id', async (req, res) => {
  try {
    const venue = await Venue.findById(req.id).populate('floors');
    if (!venue) return res.status(404).json({ error: 'Venue not found' });
    res.json(venue);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching venue', details: error.message });
  }
});

// 3. POST /api/venues/:id/floors/:fid/upload - Upload layout blueprint to Cloudinary (Protected)
router.post('/:id/floors/:fid/upload', verifyToken, upload.single('blueprint'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });

    // Stream upload directly to Cloudinary from memory buffer
    cloudinary.uploader.upload_stream(
      { folder: 'indoor_nav_blueprints' },
      async (error, result) => {
        if (error) return res.status(500).json({ error: 'Cloudinary upload failed', details: error.message });

        // Update Floor Document with spatial metadata and Cloudinary image parameters
        const updatedFloor = await Floor.findByIdAndUpdate(
          req.params.fid,
          {
            imageUrl: result.secure_url,
            imageDimensions: { width: result.width, height: result.height },
            calibrationStatus: 'uncalibrated'
          },
          { new: true }
        );

        if (!updatedFloor) return res.status(404).json({ error: 'Floor document not found' });
        return res.status(200).json(updatedFloor);
      }
    ).end(req.file.buffer);

  } catch (error) {
    res.status(500).json({ error: 'Blueprint upload routine crashed', details: error.message });
  }
});

module.exports = router;