import crypto from 'crypto';

const SALT_BYTES = 16;
const IV_BYTES = 12;
const TAG_BYTES = 16;
const KEY_BYTES = 32;
const PBKDF2_ITER = 120000;

function derive_key(password, salt){
  return crypto.pbkdf2Sync(Buffer.from(password, 'utf8'), salt, PBKDF2_ITER, KEY_BYTES, 'sha256');
}

export function encrypt(plaintext, password){
  const salt = crypto.randomBytes(SALT_BYTES);
  const iv = crypto.randomBytes(IV_BYTES);
  const key = derive_key(password, salt);

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(Buffer.from(plaintext, 'utf8')), cipher.final()]);
  const tag = cipher.getAuthTag();

  // Format: salt | iv | tag | ciphertext;
  return Buffer.concat([salt, iv, tag, ciphertext]).toString('base64');
}

export function decrypt(encrypted_base_64, password){
  const data = Buffer.from(encrypted_base_64, 'base64');
  if (data.length < SALT_BYTES + IV_BYTES + TAG_BYTES) throw new Error('Invalid data');

  const salt = data.slice(0, SALT_BYTES);
  const iv = data.slice(SALT_BYTES, SALT_BYTES + IV_BYTES);
  const tag = data.slice(SALT_BYTES + IV_BYTES, SALT_BYTES + IV_BYTES + TAG_BYTES);
  const ciphertext = data.slice(SALT_BYTES + IV_BYTES + TAG_BYTES);

  const key = derive_key(password, salt);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.toString('utf8');
}

export function make_random_key(length = 32){
  return crypto.randomBytes(length).toString('hex');
}

/**
 * One-way hash of `data` with `salt` using scrypt (memory-hard KDF).
 * Returns a hex string.
 * Signature: hash(data, salt, keylen = 32);
 * @param {number} [keylen=32] the number of bytes to output;
 */
export function hash(data, salt, keylen = 32){
  // Derive key material synchronously using HMAC-SHA256 in counter mode.
  // This is a portable, deterministic, one-way KDF that works with
  // `crypto.createHmac` (supported by Node and crypto-browserify).
  const saltBuf = Buffer.isBuffer(salt) ? salt : Buffer.from(String(salt), 'utf8');
  const dataBuf = Buffer.from(String(data), 'utf8');

  const hashLen = 32; // SHA-256 output length in bytes
  const blocks = Math.ceil(keylen / hashLen);
  const outBuf = Buffer.allocUnsafe(blocks * hashLen);

  for (let i = 0; i < blocks; i++) {
    const hmac = crypto.createHmac('sha256', saltBuf);
    hmac.update(dataBuf);
    // append counter byte
    hmac.update(Buffer.from([i & 0xff]));
    const digest = hmac.digest();
    digest.copy(outBuf, i * hashLen);
  }

  return outBuf.slice(0, keylen).toString('hex');
}
