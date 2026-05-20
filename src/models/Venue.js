const mongoose = require('mongoose');
const VenueSchema = new mongoose.Schema({
  ownerId:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:              { type: String, required: true },
  address:           { type: String },
  location: {
    type:        { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
  },
  gpsGeofenceRadius: { type: Number, default: 50 },   // metres
  gpsPolygon:        { type: [[Number]], default: [] }, // [[lng,lat], ...]
  isPublished:       { type: Boolean, default: false },
  qrCode:            { type: String, default: null },  // base64 data URL
  floors:            [{ type: mongoose.Schema.Types.ObjectId, ref: 'Floor' }],
}, { timestamps: true });
 
VenueSchema.index({ location: '2dsphere' });
VenueSchema.index({ ownerId: 1 });
module.exports = mongoose.model('Venue', VenueSchema);