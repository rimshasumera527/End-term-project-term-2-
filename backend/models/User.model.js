const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'tutor'], required: true },
    // tutor profile
    subjects: [{ type: String, trim: true, lowercase: true }],
    hourlyRate: { type: Number, min: 0 },
    bio: { type: String, trim: true, maxlength: 500 },
    city: { type: String, trim: true },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
