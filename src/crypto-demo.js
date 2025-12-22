import { encrypt, decrypt, make_random_key, hash } from './crypto.js';

const password = 'correct horse battery staple';
const message = 'The quick brown fox jumps over the lazy dog';

import { seeded_random_32, seededRandomFloat } from './seeded-rng.js';
const encrypted = encrypt(message, password);
console.log('Encrypted:', encrypted);

const decrypted = decrypt(encrypted, password);
console.log('Decrypted:', decrypted);

if (decrypted !== message) {
  console.error('Mismatch!');
  process.exit(1);
}

console.log('Demo OK — encryption and decryption matched')

// Demo one-way hash
const salt = make_random_key(16);
const h = hash(message, salt);
console.log('Salt:', salt);
console.log('Hash:', h);

// Demo seeded RNG
const seed = 'example-seed-1234';
console.log('seededRandom32(seed,0,0,0)=', seeded_random_32(seed, 0, 0, 0));
console.log('seededRandom32(seed,1,2,3)=', seeded_random_32(seed, 1, 2, 3));
console.log('seededRandomFloat(seed,1,2,3)=', seededRandomFloat(seed, 1, 2, 3));
