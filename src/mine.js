
import {encrypt, decrypt, make_random_key, hash} from './crypto.js';
import {seeded_random_32, seeded_random_float} from './seeded-rng.js';

const width = 16;
const max_distance = 4;
const secret_key = 'Simon is the best.';

export function mine(input = ""){
  const salt = make_random_key(16);
  const seed = hash(secret_key, salt, 16);
  const mines = [];
  const area = width * width;
  // bits per word;
  const word_size = 32;
  // get raw data;
  const raw_mines = hash(input, salt, area / 8);
  // parse bits;
  for(let word_i = 0; word_i < area / word_size; word_i++){
    const word = parseInt(raw_mines.slice(
      word_i * 8, word_i * 8 + 8
    ), 16);
    for(let bit_i = 0; bit_i < word_size; bit_i++){
      const bit = (
        word >>
        (31 - bit_i)
      ) & 1;
      mines.push(bit === 1 ? 1 : 0);
    }
  }
  
  // in the future, these will be randomized based on seeded RNG;
  const weights = mines.map((v, i) => 1);
  
  const numbers = [];
  for(let i = 0; i < mines.length; i++){
    if(mines[i] === 1) continue;
    const x = i % width;
    const y = Math.floor(i / width);
    let count = 0;
    // in the future, these will be randomized based on seeded RNG;
    const neighbors = [
      [-1,-1], [0,-1], [1,-1],
      [-1, 0],         [1, 0],
      [-1, 1], [0, 1], [1, 1],
    ];
    for(const [dx, dy] of neighbors){
      // the mine field is a torus;
      const nx = (x + dx) % width;
      const ny = (y + dy) % width;
      const ni = ny * width + nx;
      count += mines[ni] * weights[ni];
    }
    numbers[i] = count;
  }
  
  return {
    salt,
    raw_mines,
    mines,
    numbers,
    weights,
    seed,
  };
}

