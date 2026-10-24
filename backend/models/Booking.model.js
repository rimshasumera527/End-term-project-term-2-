const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true },
    start: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    end: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    price: { type: Number, required: true, min: 0 },
    subject: { type: String, trim: true },
    status: { type: String, enum: ['booked', 'completed', 'cancelled', 'no-show'], default: 'booked' },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancelledAt: { type: Date },
    lateCancel: { type: Boolean, default: false },
  },
  { timestamps: true }
);

bookingSchema.index({ tutor: 1, date: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
