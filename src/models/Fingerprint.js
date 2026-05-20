const mongoose = require('mongoose');
const FingerprintSchema = new mongoose.Schema({
  venueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
  floorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Floor', required: true },
  x:       { type: Number, required: true }, // pixel x on floor plan
  y:       { type: Number, required: true }, // pixel y on floor plan
  // Earth-frame magnetic features (from sensor logger v8)
  mag_total:      { type: Number, required: true },
  mag_horizontal: { type: Number, required: true },
  mag_vertical:   { type: Number, required: true },
  mag_north:      { type: Number, default: 0 },
  mag_east:       { type: Number, default: 0 },
  mag_down:       { type: Number, default: 0 },
  // WiFi: { bssid: relative_rssi } — relative (max=0, others negative)
  wifi:    { type: Map, of: Number, default: {} },
  // Versioning — KNN only uses active:true fingerprints
  active:  { type: Boolean, default: false },
  version: { type: Number, default: 1 },
  // Raw sample count before averaging (for quality tracking)
  sampleCount: { type: Number, default: 10 },
}, { timestamps: true });
 
FingerprintSchema.index({ floorId: 1, active: 1 });
FingerprintSchema.index({ venueId: 1 });
module.exports = mongoose.model('Fingerprint', FingerprintSchema);