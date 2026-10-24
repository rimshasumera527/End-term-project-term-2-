const { z } = require('zod');
const User = require('../models/User.model');
const Availability = require('../models/Availability.model');
const Booking = require('../models/Booking.model');
const Review = require('../models/Review.model');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { toMin, overlaps, atTime } = require('../utils/time');
const extra = require('./extra.controller');

const DAY_MS = 24 * 60 * 60 * 1000;
const CANCEL_NOTICE_HOURS = 12;

const bookingSchema = z.object({
  tutor: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid tutor id'),
  date: z.coerce.date(),
  start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Start must be HH:MM'),
  end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'End must be HH:MM'),
  subject: z.string().trim().max(60).optional(),
});

const rescheduleSchema = z.object({
  date: z.coerce.date(),
  start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
});

async function assertFree(tutorId, studentId, date, start, end, excludeBookingId = null) {
  if (toMin(start) >= toMin(end)) throw new AppError(400, 'End time must be after start time');
  const weekday = new Date(date).getDay();
  if (extra.isBlackouted(tutorId, date)) throw new AppError(400, 'The tutor is unavailable on that date');

  const slots = await Availability.find({ tutor: tutorId, weekday });
  const within = slots.some((s) => toMin(s.start) <= toMin(start) && toMin(end) <= toMin(s.end));
  if (!within) throw new AppError(400, 'That time is outside the tutor’s published availability');

  const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart.getTime() + DAY_MS);
  const query = {
    tutor: tutorId,
    date: { $gte: dayStart, $lt: dayEnd },
    status: { $in: ['booked'] },
    $or: [
      { start: { $lt: end }, end: { $gt: start } }, // time overlap in "HH:MM" space
    ],
  };
  if (excludeBookingId) query._id = { $ne: excludeBookingId };
  const clash = await Booking.findOne(query);
  if (clash) throw new AppError(409, 'That slot was just taken — pick another time');

  const studentClash = await Booking.findOne({
    student: studentId,
    date: { $gte: dayStart, $lt: dayEnd },
    status: 'booked',
    start: { $lt: end },
    end: { $gt: start },
    ...(excludeBookingId ? { _id: { $ne: excludeBookingId } } : {}),
  });
  if (studentClash) throw new AppError(409, 'You already have a session booked in that window');
}

exports.create = asyncHandler(async (req, res) => {
  const parsed = bookingSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message, parsed.error.issues);
  if (req.user.role !== 'student') throw new AppError(403, 'Only students can book sessions');

  const tutor = await User.findOne({ _id: parsed.data.tutor, role: 'tutor' });
  if (!tutor) throw new AppError(404, 'Tutor not found');

  await assertFree(tutor._id, req.user.id, parsed.data.date, parsed.data.start, parsed.data.end);

  const durationH = (toMin(parsed.data.end) - toMin(parsed.data.start)) / 60;
  const booking = await Booking.create({
    tutor: tutor._id,
    student: req.user.id,
    date: parsed.data.date,
    start: parsed.data.start,
    end: parsed.data.end,
    subject: parsed.data.subject || tutor.subjects[0] || 'general',
    price: Math.round(tutor.hourlyRate * durationH * 100) / 100,
  });
  res.status(201).json(booking);
});

exports.reschedule = asyncHandler(async (req, res) => {
  const parsed = rescheduleSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message, parsed.error.issues);
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new AppError(404, 'Booking not found');
  const isParticipant = [booking.student, booking.tutor].some((u) => u.toString() === String(req.user.id));
  if (!isParticipant) throw new AppError(403, 'Only the tutor or student on this booking can change it');
  if (booking.status !== 'booked') throw new AppError(409, 'Only upcoming bookings can be rescheduled');

  await assertFree(booking.tutor, booking.student, parsed.data.date, parsed.data.start, parsed.data.end, booking._id);
  booking.date = parsed.data.date;
  booking.start = parsed.data.start;
  booking.end = parsed.data.end;
  await booking.save();
  res.json(booking);
});

exports.cancel = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new AppError(404, 'Booking not found');
  const isParticipant = [booking.student, booking.tutor].some((u) => u.toString() === String(req.user.id));
  if (!isParticipant) throw new AppError(403, 'Only the tutor or student on this booking can cancel it');
  if (booking.status !== 'booked') throw new AppError(409, 'Only upcoming bookings can be cancelled');

  // 12-hour notice policy: later than that counts as a late cancellation.
  const startsAt = atTime(booking.date, booking.start);
  const hoursAhead = (startsAt - Date.now()) / (60 * 60 * 1000);
  booking.status = 'cancelled';
  booking.cancelledBy = req.user.id;
  booking.cancelledAt = new Date();
  booking.lateCancel = hoursAhead < CANCEL_NOTICE_HOURS;
  await booking.save();
  res.json({ ...booking.toObject(), hoursNotice: Math.round(hoursAhead * 10) / 10 });
});

exports.complete = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new AppError(404, 'Booking not found');
  if (String(booking.tutor) !== String(req.user.id)) throw new AppError(403, 'Only the tutor can mark the outcome');
  if (booking.status !== 'booked') throw new AppError(409, 'Only booked sessions can be updated');
  booking.status = req.body.outcome === 'no-show' ? 'no-show' : 'completed';
  await booking.save();
  res.json(booking);
});

exports.review = asyncHandler(async (req, res) => {
  const parsed = z
    .object({
      rating: z.coerce.number().int().min(1, 'Rating is 1-5 stars').max(5, 'Rating is 1-5 stars'),
      comment: z.string().trim().max(500).optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message, parsed.error.issues);

  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new AppError(404, 'Booking not found');
  if (String(booking.student) !== String(req.user.id)) throw new AppError(403, 'Only the student on this booking can review it');
  if (booking.status !== 'completed') throw new AppError(409, 'You can only review completed sessions');

  const existing = await Review.findOne({ booking: booking._id });
  if (existing) throw new AppError(409, 'You already reviewed this session');

  const review = await Review.create({
    booking: booking._id,
    student: booking.student,
    tutor: booking.tutor,
    rating: parsed.data.rating,
    comment: parsed.data.comment,
  });

  // Refresh the tutor's cached rating
  const agg = await Review.aggregate([
    { $match: { tutor: booking.tutor } },
    { $group: { _id: '$tutor', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (agg[0]) {
    await User.findByIdAndUpdate(booking.tutor, {
      rating: Math.round(agg[0].avg * 10) / 10,
      ratingCount: agg[0].count,
    });
  }
  res.status(201).json(review);
});

exports.listMine = asyncHandler(async (req, res) => {
  const field = req.user.role === 'tutor' ? 'tutor' : 'student';
  const bookings = await Booking.find({ [field]: req.user.id })
    .populate('tutor', 'name rating subjects hourlyRate')
    .populate('student', 'name')
    .sort('-date');
  res.json(bookings);
});

exports.tutorDashboard = asyncHandler(async (req, res) => {
  if (req.user.role !== 'tutor') throw new AppError(403, 'Tutor dashboard only');
  const now = new Date();
  const upcoming = await Booking.find({ tutor: req.user.id, status: 'booked', date: { $gte: now.setHours(0, 0, 0, 0) } })
    .populate('student', 'name')
    .sort('date start');
  const completed = await Booking.find({ tutor: req.user.id, status: 'completed' });
  const stats = {
    completedSessions: completed.length,
    earnings: completed.reduce((s, b) => s + b.price, 0),
    lateCancellations: (await Booking.countDocuments({ tutor: req.user.id, lateCancel: true })),
    rating: req.user.role === 'tutor' ? (await User.findById(req.user.id)).rating : 0,
  };
  res.json({ upcoming, stats });
});

exports.studentDashboard = asyncHandler(async (req, res) => {
  const now = new Date();
  const upcoming = await Booking.find({ student: req.user.id, status: 'booked', date: { $gte: now.setHours(0, 0, 0, 0) } })
    .populate('tutor', 'name rating subjects hourlyRate')
    .sort('date start');
  const reviewsGiven = await Review.countDocuments({ student: req.user.id });
  res.json({ upcoming, reviewsGiven });
});
