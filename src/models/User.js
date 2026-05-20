const mongoose = require('mongoose');
 
const UserSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  email:       { type: String, required: true },
  role:        { type: String, enum: ['admin', 'visitor'], default: 'visitor' },
  venueIds:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Venue' }],
  fcmToken:    { type: String, default: null },
  language:    { type: String, default: 'en' },
}, { timestamps: true });
 

module.exports = mongoose.model('User', UserSchema);