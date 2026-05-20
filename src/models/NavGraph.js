const mongoose = require('mongoose');

const NodeSchema = new mongoose.Schema({
  id:         { type: String, required: true },
  x:          { type: Number, required: true },
  y:          { type: Number, required: true },
  floor:      { type: Number, required: true },
  type:       { type: String, enum: ['junction','poi','stairs','elevator','entry','escalator'], default: 'junction' },
  label:      { type: String, default: '' },
  accessible: { type: Boolean, default: true },
}, { _id: false });
 
const EdgeSchema = new mongoose.Schema({
  from:           { type: String, required: true }, // node id
  to:             { type: String, required: true }, // node id
  distanceMetres: { type: Number, required: true },
  accessible:     { type: Boolean, default: true },
  type:           { type: String, enum: ['walkable','stairs','elevator','escalator'], default: 'walkable' },
  floorChange:    { type: Boolean, default: false },
}, { _id: false });
 
const NavGraphSchema = new mongoose.Schema({
  venueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true, unique: true },
  version: { type: Number, default: 1 },
  nodes:   [NodeSchema],
  edges:   [EdgeSchema],
}, { timestamps: true });
 

module.exports = mongoose.model('NavGraph', NavGraphSchema);