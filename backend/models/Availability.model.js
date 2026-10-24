const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema(
  {
    tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    weekday: { type: Number, min: 0, max: 6, required: true }, // 0 = Sunday
    start: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    end: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Availability', availabilitySchema);
