const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const Availability = require('../models/Availability.model');
const Booking = require('../models/Booking.model');
const Review = require('../models/Review.model');

const DEMO_PASSWORD = 'Demo@1234';

async function seed() {
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const [meera, arjun, fatima, rahul] = await User.create(
    { name: 'Meera Iyer', email: 'meera@demo.com', passwordHash: hash, role: 'tutor', subjects: ['mathematics', 'algebra'], hourlyRate: 600, city: 'Bengaluru', bio: 'IIT-B grad. 8 years teaching CBSE & ICSE maths. Concepts first, tricks second.' },
    { name: 'Arjun Rao', email: 'arjun@demo.com', passwordHash: hash, role: 'tutor', subjects: ['physics'], hourlyRate: 800, city: 'Bengaluru', bio: 'JEE physics specialist. Mechanics and electromagnetism made intuitive.' },
    { name: 'Fatima Khan', email: 'fatima@demo.com', passwordHash: hash, role: 'tutor', subjects: ['chemistry'], hourlyRate: 700, city: 'Mumbai', bio: 'Organic chemistry without tears. Board + NEET focus.' },
    { name: 'Rahul Menon', email: 'rahul@demo.com', passwordHash: hash, role: 'student', city: 'Bengaluru' }
  );

  // Mon-Sat 16:00-20:00 availability for every tutor
  for (const tutor of [meera, arjun, fatima]) {
    for (let weekday = 1; weekday <= 6; weekday++) {
      await Availability.create({ tutor: tutor._id, weekday, start: '16:00', end: '20:00' });
    }
  }

  const yesterday = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  const lastWeek = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const b1 = await Booking.create({ tutor: meera._id, student: rahul._id, date: lastWeek, start: '17:00', end: '18:00', price: 600, subject: 'mathematics', status: 'completed' });
  const b2 = await Booking.create({ tutor: arjun._id, student: rahul._id, date: yesterday, start: '16:00', end: '17:00', price: 800, subject: 'physics', status: 'completed' });
  await Review.create({ booking: b1._id, student: rahul._id, tutor: meera._id, rating: 5, comment: 'Meera explained quadratics so clearly — best session so far.' });
  await Review.create({ booking: b2._id, student: rahul._id, tutor: arjun._id, rating: 4, comment: 'Great mechanics revision, slightly rushed at the end.' });
  await User.findByIdAndUpdate(meera._id, { rating: 5, ratingCount: 1 });
  await User.findByIdAndUpdate(arjun._id, { rating: 4, ratingCount: 1 });

  await Booking.create({ tutor: meera._id, student: rahul._id, date: tomorrow, start: '17:00', end: '18:00', price: 600, subject: 'mathematics', status: 'booked' });
  return { meera, arjun, fatima, rahul };
}

module.exports = seed;
module.exports.DEMO_PASSWORD = DEMO_PASSWORD;
