import bcrypt from 'bcryptjs';
import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { sendVerificationCode } from '../utils/email.js';

const verificationLifetimeMs = 10 * 60 * 1000;
const resendCooldownMs = 60 * 1000;
const maxVerificationAttempts = 5;

function hashVerificationCode(code) {
  return createHmac('sha256', process.env.JWT_SECRET).update(code).digest('hex');
}

function clearVerificationCode(user) {
  user.emailVerificationCodeHash = undefined;
  user.emailVerificationExpiresAt = undefined;
  user.emailVerificationSentAt = undefined;
  user.emailVerificationAttempts = 0;
}

async function issueVerificationCode(user) {
  const now = Date.now();
  if (user.emailVerificationSentAt && now - user.emailVerificationSentAt.getTime() < resendCooldownMs) return false;

  const code = String(randomInt(100000, 1000000));
  user.emailVerificationCodeHash = hashVerificationCode(code);
  user.emailVerificationExpiresAt = new Date(now + verificationLifetimeMs);
  user.emailVerificationSentAt = new Date(now);
  user.emailVerificationAttempts = 0;
  await user.save();

  try {
    await sendVerificationCode(user.email, user.name, code);
  } catch (cause) {
    clearVerificationCode(user);
    await user.save();
    const error = new Error('Verification email could not be sent.');
    error.code = 'EMAIL_DELIVERY_FAILED';
    error.cause = cause;
    throw error;
  }
  return true;
}

function emailDeliveryError(res, error) {
  if (error.code !== 'EMAIL_DELIVERY_FAILED') return false;
  console.error('Verification email delivery failed:', error.cause?.message || error.message);
  res.status(503).json({ message: 'Could not send the verification email. Check the email settings and try again.' });
  return true;
}

export async function register(req, res) {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (!name || !email || password.length < 8) return res.status(400).json({ message: 'Enter your name, a valid email, and a password of at least 8 characters.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
  let user = await User.findOne({ email }).select('+emailVerificationCodeHash +emailVerificationExpiresAt +emailVerificationSentAt +emailVerificationAttempts');
  if (user?.emailVerified) return res.status(409).json({ message: 'An account with that email already exists.' });
  if (!user) user = new User({ name, email, password, emailVerified: false });
  try {
    const sent = await issueVerificationCode(user);
    res.status(202).json({ message: sent ? 'Verification code sent to your email.' : 'A code was sent recently. Please wait before requesting another.' });
  } catch (error) {
    if (!emailDeliveryError(res, error)) throw error;
  }
}

export async function verifyEmail(req, res) {
  const email = String(req.body.email || '').trim().toLowerCase();
  const code = String(req.body.code || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{6}$/.test(code)) {
    return res.status(400).json({ message: 'Enter a valid email and the 6-digit verification code.' });
  }

  const user = await User.findOne({ email }).select('+emailVerificationCodeHash +emailVerificationExpiresAt +emailVerificationAttempts');
  if (!user || user.emailVerified) return res.status(400).json({ message: 'The verification code is invalid or expired.' });
  if (!user.emailVerificationCodeHash || !user.emailVerificationExpiresAt || user.emailVerificationExpiresAt <= new Date() || user.emailVerificationAttempts >= maxVerificationAttempts) {
    clearVerificationCode(user);
    await user.save();
    return res.status(400).json({ message: 'The verification code is invalid or expired. Request a new code.' });
  }

  const providedHash = Buffer.from(hashVerificationCode(code), 'hex');
  const savedHash = Buffer.from(user.emailVerificationCodeHash, 'hex');
  if (providedHash.length !== savedHash.length || !timingSafeEqual(providedHash, savedHash)) {
    user.emailVerificationAttempts += 1;
    if (user.emailVerificationAttempts >= maxVerificationAttempts) clearVerificationCode(user);
    await user.save();
    return res.status(400).json({ message: 'The verification code is invalid or expired.' });
  }

  user.emailVerified = true;
  clearVerificationCode(user);
  await user.save();
  res.json({ token: generateToken(user.id), user });
}

export async function resendVerification(req, res) {
  const email = String(req.body.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
  const user = await User.findOne({ email }).select('+emailVerificationCodeHash +emailVerificationExpiresAt +emailVerificationSentAt +emailVerificationAttempts');
  if (!user || user.emailVerified) return res.status(202).json({ message: 'If that address has an unverified account, a code will be sent.' });
  try {
    await issueVerificationCode(user);
    res.status(202).json({ message: 'If that address has an unverified account, a code will be sent.' });
  } catch (error) {
    if (!emailDeliveryError(res, error)) throw error;
  }
}

export async function login(req, res) {
  const email = String(req.body.email || '').trim().toLowerCase();
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await bcrypt.compare(String(req.body.password || ''), user.password))) return res.status(401).json({ message: 'Email or password is incorrect.' });
  if (!user.emailVerified) return res.status(403).json({ message: 'Verify your email before logging in. Use the registration page to request a new code.' });
  res.json({ token: generateToken(user.id), user });
}
export async function me(req, res) { res.json({ user: req.user }); }
