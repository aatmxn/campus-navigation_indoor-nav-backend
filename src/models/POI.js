const mongoose = require('mongoose');
const POISchema = new mongoose.Schema({
  venueId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
  floorId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Floor', required: true },
  nodeId:   { type: String, required: true }, // matches node.id in NavGraph
  name:     { type: String, required: true },
  category: { type: String, required: true }, // 'washroom','exit','canteen','office','stairs','elevator'
  x:        { type: Number, required: true },
  y:        { type: Number, required: true },
  floor:    { type: Number, required: true },
  searchKeywords: [{ type: String }],
  accessible: { type: Boolean, default: true },
  description: { type: String, default: '' },
}, { timestamps: true });
 
POISchema.index({ venueId: 1, category: 1 });
POISchema.index({ name: 'text', searchKeywords: 'text' }); // enables $text search
module.exports = mongoose.model('POI', POISchema);