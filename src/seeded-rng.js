import crypto from 'crypto'

/**
 * Deterministic 32-bit value derived from a seed and integer coordinates.
 * seed: string or Buffer
 * x,y,z: integers (32-bit signed or unsigned)
 * Returns a Number in range [0, 2**32-1]
 */
export function seeded_random_32(seed, x = 0, y = 0, z = 0) {
  const key = Buffer.isBuffer(seed) ? seed : Buffer.from(String(seed), 'utf8')
  const h = crypto.createHmac('sha256', key)
  const buf = Buffer.allocUnsafe(12)
  buf.writeInt32LE(x|0, 0)
  buf.writeInt32LE(y|0, 4)
  buf.writeInt32LE(z|0, 8)
  h.update(buf)
  const digest = h.digest()
  return digest.readUInt32LE(0)
}

/**
 * Convenience float in [0,1).
 */
export function seeded_random_float(seed, x = 0, y = 0, z = 0) {
  const v = seeded_random_32(seed, x, y, z)
  return v / 0x100000000
}
