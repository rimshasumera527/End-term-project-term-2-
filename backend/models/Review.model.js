const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);
