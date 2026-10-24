const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const { notFound, errorHandler } = require('./middlewares/error');

const app = express();
app.set('trust proxy', 1);
app.use(express.json({ limit: '100kb' }));
app.use(
  cors({
    origin: (origin, cb) => {
      const allowed = [env.CLIENT_ORIGIN, 'http://localhost:5302', 'http://127.0.0.1:5302'];
      if (!origin || allowed.includes(origin)) return cb(null, true);
      cb(new Error('Origin not allowed by CORS'));
    },
  })
);

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'tutorslot-api' }));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/tutors', require('./routes/tutor.routes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
