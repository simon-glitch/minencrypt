
import {encrypt, decrypt, make_random_key, hash} from './crypto.js';

const width = 16;
const max_distance = 4;

export function mine(input = ""){
  const salt = make_random_key(16);
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
  return {
    salt,
    mines,
  };
}
