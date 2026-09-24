const crypto = require('crypto');

const KEY_LENGTH = 64;

function validatePassword(password) {
  // Trim so a stray leading/trailing space (common with mobile keyboards and
  // password managers) never silently turns a correct password into a
  // "wrong password" error at login.
  const value = String(password || '').trim();
  if (value.length < 6) throw new Error('Password must be at least 6 characters');
  if (value.length > 128) throw new Error('Password must be 128 characters or less');
  return value;
}

function hashPassword(password) {
  const value = validatePassword(password);
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(value, salt, KEY_LENGTH).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || typeof storedHash !== 'string') return false;
  const [algorithm, salt, expectedHex] = storedHash.split('$');
  if (algorithm !== 'scrypt' || !salt || !expectedHex) return false;

  try {
    const actual = crypto.scryptSync(String(password || ''), salt, KEY_LENGTH);
    const expected = Buffer.from(expectedHex, 'hex');
    if (actual.length !== expected.length) return false;
    return crypto.timingSafeEqual(actual, expected);
  } catch (_) {
    return false;
  }
}

module.exports = { validatePassword, hashPassword, verifyPassword };
