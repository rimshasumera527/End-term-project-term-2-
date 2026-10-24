const { z } = require('zod');
const Booking = require('../models/Booking.model');
const Availability = require('../models/Availability.model');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// Blackout dates: tutors block specific dates (leave, exams, holidays).
const blackoutSchema = z.object({ dates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).max(60) });
const blackouts = new Map(); // tutorId -> Set('YYYY-MM-DD')  (in-memory; simple & fast)

exports.setBlackouts = asyncHandler(async (req, res) => {
  const parsed = blackoutSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message, parsed.error.issues);
  if (req.user.role !== 'tutor') throw new AppError(403, 'Tutors only');
  blackouts.set(String(req.user.id), new Set(parsed.data.dates));
  res.json({ dates: parsed.data.dates });
});

exports.getBlackouts = asyncHandler(async (req, res) => {
  res.json({ dates: [...(blackouts.get(String(req.user.id)) || [])] });
});

function isBlackouted(tutorId, date) {
  const set = blackouts.get(String(tutorId));
  return set ? set.has(new Date(date).toISOString().slice(0, 10)) : false;
}

// ICS calendar feed: all upcoming sessions for the logged-in user.
function icsEscape(s) { return String(s).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n'); }
function icsDate(d) { return new Date(d).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'; }

exports.calendar = asyncHandler(async (req, res) => {
  const field = req.user.role === 'tutor' ? 'tutor' : 'student';
  const bookings = await Booking.find({
    [field]: req.user.id,
    status: { $in: ['booked', 'completed'] },
  }).populate('tutor', 'name').populate('student', 'name').sort('date');

  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//TutorSlot//EN', 'CALSCALE:GREGORIAN',
  ];
  for (const b of bookings) {
    const start = new Date(b.date); const [sh, sm] = b.start.split(':').map(Number);
    start.setHours(sh, sm, 0, 0);
    const end = new Date(b.date); const [eh, em] = b.end.split(':').map(Number);
    end.setHours(eh, em, 0, 0);
    const other = req.user.role === 'tutor' ? b.student?.name : b.tutor?.name;
    lines.push(
      'BEGIN:VEVENT',
      `UID:${b._id}@tutorslot`,
      `DTSTAMP:${icsDate(b.createdAt || Date.now())}`,
      `DTSTART:${icsDate(start)}`,
      `DTEND:${icsDate(end)}`,
      `SUMMARY:${icsEscape(`TutorSlot: ${b.subject} with ${other}`)}`,
      `DESCRIPTION:${icsEscape(`Session booked via TutorSlot · ₹${b.price} · status ${b.status}`)}`,
      'END:VEVENT'
    );
  }
  lines.push('END:VCALENDAR');
  res.setHeader('Content-Type', 'text/calendar');
  res.setHeader('Content-Disposition', 'attachment; filename="tutorslot-sessions.ics"');
  res.send(lines.join('\r\n'));
});

// Learning/teaching stats for dashboards.
exports.myStats = asyncHandler(async (req, res) => {
  const field = req.user.role === 'tutor' ? 'tutor' : 'student';
  const all = await Booking.find({ [field]: req.user.id });
  const completed = all.filter((b) => b.status === 'completed');
  const bySubject = {};
  for (const b of all) bySubject[b.subject] = (bySubject[b.subject] || 0) + 1;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const hoursLearned = completed.reduce((s, b) => {
    const [sh, sm] = b.start.split(':').map(Number); const [eh, em] = b.end.split(':').map(Number);
    return s + (eh * 60 + em - (sh * 60 + sm)) / 60;
  }, 0);
  res.json({
    totalSessions: all.length,
    completed: completed.length,
    upcoming: all.filter((b) => b.status === 'booked' && new Date(b.date) >= today).length,
    hours: Math.round(hoursLearned * 10) / 10,
    totalSpendOrEarn: completed.reduce((s, b) => s + b.price, 0),
    bySubject,
    cancelled: all.filter((b) => b.status === 'cancelled').length,
  });
});

exports.isBlackouted = isBlackouted;
