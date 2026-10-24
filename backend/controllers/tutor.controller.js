const { z } = require('zod');
const User = require('../models/User.model');
const Availability = require('../models/Availability.model');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { toMin, overlaps } = require('../utils/time');

const availabilitySchema = z
  .object({
    weekday: z.coerce.number().int().min(0).max(6),
    start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Start must be HH:MM'),
    end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'End must be HH:MM'),
  })
  .refine((v) => toMin(v.start) < toMin(v.end), { message: 'End time must be after start time' });

exports.search = asyncHandler(async (req, res) => {
  const { subject, maxPrice, minRating, city } = req.query;
  const filter = { role: 'tutor' };
  if (subject) filter.subjects = subject.trim().toLowerCase();
  if (maxPrice) filter.hourlyRate = { ...(filter.hourlyRate || {}), $lte: Number(maxPrice) };
  if (minRating) filter.rating = { $gte: Number(minRating) };
  if (city) filter.city = new RegExp(city.trim(), 'i');

  const tutors = await User.find(filter)
    .select('name subjects hourlyRate bio city rating ratingCount')
    .sort('-rating hourlyRate');
  res.json(tutors);
});

exports.getOne = asyncHandler(async (req, res) => {
  if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) throw new AppError(404, 'Tutor not found');
  const tutor = await User.findOne({ _id: req.params.id, role: 'tutor' }).select('-passwordHash');
  if (!tutor) throw new AppError(404, 'Tutor not found');
  const availability = await Availability.find({ tutor: tutor._id }).sort('weekday start');
  res.json({ ...tutor.toObject(), availability });
});

exports.addAvailability = asyncHandler(async (req, res) => {
  const parsed = availabilitySchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message, parsed.error.issues);
  if (req.user.role !== 'tutor') throw new AppError(403, 'Only tutors can publish availability');

  const existing = await Availability.find({ tutor: req.user.id, weekday: parsed.data.weekday });
  for (const slot of existing) {
    if (overlaps(slot.start, slot.end, parsed.data.start, parsed.data.end)) {
      throw new AppError(409, `That overlaps an existing slot (${slot.start}–${slot.end})`);
    }
  }
  const slot = await Availability.create({ tutor: req.user.id, ...parsed.data });
  res.status(201).json(slot);
});

exports.removeAvailability = asyncHandler(async (req, res) => {
  const slot = await Availability.findById(req.params.id);
  if (!slot) throw new AppError(404, 'Availability slot not found');
  if (String(slot.tutor) !== String(req.user.id)) throw new AppError(403, 'Not your availability slot');
  await slot.deleteOne();
  res.json({ deleted: true });
});

exports.getAvailability = asyncHandler(async (req, res) => {
  const availability = await Availability.find({ tutor: req.params.id }).sort('weekday start');
  res.json(availability);
});
