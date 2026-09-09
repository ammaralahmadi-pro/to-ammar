const crypto = require('crypto');
const { tokenEncryptionKey } = require('./env');

// AES-256-GCM — يشفّر access/refresh tokens قبل حفظها في قاعدة البيانات
const key = Buffer.from(tokenEncryptionKey, 'hex');
if (key.length !== 32) {
  throw new Error('TOKEN_ENCRYPTION_KEY يجب أن يكون 32 بايت (64 حرف hex) — ولّده بـ: openssl rand -hex 32');
}

function encrypt(plainText) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

function decrypt(payload) {
  const raw = Buffer.from(payload, 'base64');
  const iv = raw.subarray(0, 12);
  const authTag = raw.subarray(12, 28);
  const encrypted = raw.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}

module.exports = { encrypt, decrypt };
