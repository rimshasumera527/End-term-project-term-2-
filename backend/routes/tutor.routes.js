const router = require('express').Router();
const c = require('../controllers/tutor.controller');
const b = require('../controllers/booking.controller');
const extra = require('../controllers/extra.controller');
const { requireAuth } = require('../middlewares/auth');

// Public discovery
router.get('/', c.search);

// Authenticated endpoints — declared BEFORE the parameterized public routes so
// "/bookings" and "/dashboard/..." are never swallowed by "/:id".
router.post('/availability', requireAuth, c.addAvailability);
router.delete('/availability/:slotId', requireAuth, c.removeAvailability);
router.post('/bookings', requireAuth, b.create);
router.get('/bookings', requireAuth, b.listMine);
router.patch('/bookings/:id/reschedule', requireAuth, b.reschedule);
router.patch('/bookings/:id/cancel', requireAuth, b.cancel);
router.patch('/bookings/:id/complete', requireAuth, b.complete);
router.post('/bookings/:id/review', requireAuth, b.review);
router.get('/dashboard/tutor', requireAuth, b.tutorDashboard);
router.get('/dashboard/student', requireAuth, b.studentDashboard);
router.get('/stats/me', requireAuth, extra.myStats);
router.get('/calendar.ics', requireAuth, extra.calendar);
router.post('/availability/blackouts', requireAuth, extra.setBlackouts);
router.get('/availability/blackouts', requireAuth, extra.getBlackouts);

// Public detail — must come after the specific routes above
router.get('/:id', c.getOne);
router.get('/:id/availability', c.getAvailability);

module.exports = router;
