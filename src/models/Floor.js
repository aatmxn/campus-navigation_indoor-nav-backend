const mongoose = require('mongoose');
const FloorSchema = new mongoose.Schema({
  venueId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
  level:       { type: Number, required: true },   // 0 = ground, 1 = first, etc.
  label:       { type: String, required: true },   // "Ground Floor", "Floor 1"
  imageUrl:    { type: String, default: null },    // Cloudinary URL
  imageDimensions: {
    widthPx:  { type: Number, default: 0 },
    heightPx: { type: Number, default: 0 },
  },
  bounds: {
    originLat:      { type: Number, default: 0 },
    originLng:      { type: Number, default: 0 },
    metersPerPixelX: { type: Number, default: 1 },
    metersPerPixelY: { type: Number, default: 1 },
    realWidthMeters:  { type: Number, default: 0 },
    realHeightMeters: { type: Number, default: 0 },
  },
  pressureBaseline:  { type: Number, default: null }, // hPa delta from ground
  calibrationStatus: {
    type:    String,
    enum:    ['none', 'in_progress', 'active'],
    default: 'none',
  },
  fingerprintVersion: { type: Number, default: 0 },
}, { timestamps: true });
 
FloorSchema.index({ venueId: 1, level: 1 });
module.exports = mongoose.model('Floor', FloorSchema);