const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const User = require('../models/User.model');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const env = require('../config/env');

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name needs at least 2 characters').max(60),
  email: z.string().trim().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'Password needs at least 8 characters')
    .regex(/[A-Za-z]/, 'Password needs a letter')
    .regex(/\d/, 'Password needs a number'),
  role: z.enum(['student', 'tutor'], { message: 'Pick a role: student or tutor' }),
  city: z.string().trim().max(60).optional(),
  subjects: z.array(z.string().trim()).max(8).optional(),
  hourlyRate: z.coerce.number().min(0).optional(),
  bio: z.string().trim().max(500).optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

function sign(user) {
  return jwt.sign({ id: user._id, name: user.name, role: user.role }, env.JWT_SECRET, { expiresIn: '7d' });
}

exports.register = asyncHandler(async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message, parsed.error.issues);
  const { name, email, password, role, city, subjects, hourlyRate, bio } = parsed.data;

  const existing = await User.findOne({ email });
  if (existing) throw new AppError(409, 'An account with this email already exists');
  if (role === 'tutor' && (!subjects?.length || !hourlyRate)) {
    throw new AppError(400, 'Tutors need at least one subject and an hourly rate');
  }

  const user = await User.create({
    name, email, role, city,
    passwordHash: await bcrypt.hash(password, 12),
    ...(role === 'tutor' ? { subjects, hourlyRate, bio } : {}),
  });
  res.status(201).json({ id: user._id, name: user.name, role: user.role, token: sign(user) });
});

exports.login = asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError(400, parsed.error.issues[0].message, parsed.error.issues);
  const { email, password } = parsed.data;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError(401, 'Email or password is incorrect');
  }
  res.json({ id: user._id, name: user.name, role: user.role, token: sign(user) });
});

exports.me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-passwordHash');
  if (!user) throw new AppError(404, 'User not found');
  res.json(user);
});
