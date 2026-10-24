const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const c = require('../controllers/auth.controller');
const { requireAuth } = require('../middlewares/auth');

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 50, standardHeaders: true, legacyHeaders: false });

router.post('/register', authLimiter, c.register);
router.post('/login', authLimiter, c.login);
router.get('/me', requireAuth, c.me);

module.exports = router;
