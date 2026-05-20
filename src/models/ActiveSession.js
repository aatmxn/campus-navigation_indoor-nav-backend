
const mongoose = require('mongoose');
const ActiveSessionSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  venueId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
  socketId: { type: String, required: true },
  lastPosition: {
    x:          { type: Number, default: 0 },
    y:          { type: Number, default: 0 },
    floor:      { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
  },
  lastSeen: { type: Date, default: Date.now },
}, { timestamps: true });
 
// TTL index — MongoDB auto-deletes sessions inactive for 600 seconds
ActiveSessionSchema.index({ lastSeen: 1 }, { expireAfterSeconds: 600 });
ActiveSessionSchema.index({ socketId: 1 });
ActiveSessionSchema.index({ userId: 1, venueId: 1 });
module.exports = mongoose.model('ActiveSession', ActiveSessionSchema);