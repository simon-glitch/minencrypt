
import {encrypt, decrypt, make_random_key, hash} from './crypto.js';
import {seeded_random_32, seeded_random_float} from './seeded-rng.js';

const modulus = 7;
// this is 12 for modulus = 7;
const values_per_word = (() => {
  let count = 1;
  while(modulus ** count < 2**32) count++;
  return count;
})();

// function to find (a^-1) mod m using Extended Euclidean Algorithm;
function mod_inverse(a = 0){
  // let's assume a is in range;
  // a = ((a % modulus) + modulus) % modulus;
  for(let x = 1; x < modulus; x++){
    if((a * x) % modulus === 1) return x;
  }
  return 1;
}

const inverses = Array(modulus).fill(0).map((_, i) => mod_inverse(i));

// every matrix is formatted as a list of its rows;
function random_invertible_matrix(n = 0, seed = 0){
  /** @type {number[][]} */
  let matrix = Array.from({length: n}, () => Array(n).fill(0));
  
  // Initialize as Identity matrix
  for(let i = 0; i < n; i++) matrix[i][i] = 1;
  
  // Apply random row operations to "scramble" the identity matrix
  // This guarantees the matrix remains invertible.
  for(let count = 0; count < n * n; count++){
    let i = Math.floor(seeded_random_float(seed, count * 3) * n);
    let j = Math.floor(seeded_random_float(seed, count * 3 + 1) * n);
    if(i === j) continue;
    
    let scalar = Math.floor(seeded_random_float(seed, count * 3 + 2) * (modulus - 1)) + 1;
    
    // Row operation: R_i = (R_i + scalar * R_j) mod modulus
    for(let k = 0; k < n; k++){
      matrix[i][k] = (matrix[i][k] + scalar * matrix[j][k]) % modulus;
    }
  }
  return matrix;
}

function invert_matrix(matrix){
  let n = matrix.length;
  /** @type {number[][]} */
  let inv = Array.from({length: n}, (_, i) => 
    Array.from({length: n}, (_, j) => (i === j ? 1 : 0))
  );
  let mat = matrix.map(row => [...row]); // Copy original
  
  for(let i = 0; i < n; i++){
    // Find pivot
    let pivot = mat[i][i];
    if(pivot === 0){
      // Basic swap logic if pivot is 0
      for(let j = i + 1; j < n; j++){
        if(mat[j][i] !== 0){
          [mat[i], mat[j]] = [mat[j], mat[i]];
          [inv[i], inv[j]] = [inv[j], inv[i]];
          break;
        }
      }
      pivot = mat[i][i];
    }

    let invPivot = inverses[pivot];

    // Scale row to make pivot 1
    for(let j = 0; j < n; j++){
      mat[i][j] = (mat[i][j] * invPivot) % modulus;
      inv[i][j] = (inv[i][j] * invPivot) % modulus;
    }

    // Eliminate other entries in column
    for(let k = 0; k < n; k++){
      if(k !== i){
        let factor = mat[k][i];
        for(let j = 0; j < n; j++){
          mat[k][j] = (mat[k][j] - factor * mat[i][j] % modulus + modulus) % modulus;
          inv[k][j] = (inv[k][j] - factor * inv[i][j] % modulus + modulus) % modulus;
        }
      }
    }
  }
  return inv;
}

/**
 * Multiplies two matrices A and B under modular arithmetic.
 * @param {number[][]} A
 * @param {number[][]} B
 */
function multiply_matrices(A, B){
  const rows_A = A.length;
  const cols_A = A[0].length;
  const cols_B = B[0].length;
  
  // Initialize result matrix with zeros
  /** @type {number[][]} */
  let result = Array.from({length: rows_A}, () => Array(cols_B).fill(0));
  
  for(let i = 0; i < rows_A; i++){
    for(let j = 0; j < cols_B; j++){
      let sum = 0;
      for(let k = 0; k < cols_A; k++){
        // (sum + (A[i][k] * B[k][j])) mod modulus
        sum = (sum + (A[i][k] * B[k][j])) % modulus;
      }
      result[i][j] = sum;
    }
  }
  return result;
}

// size of the output vector, in bytes;
const size = 8;
const nibbles_per_word = 8;
const secret_key = 'Simon is the best.';

export function hash_str(input = ""){
  const salt = make_random_key(16);
  const seed = hash(secret_key, salt, 16);
  // get raw data;
  const hashed_bytes = hash(input, salt, size);
  
  const n = Math.ceil(size / 4) * values_per_word;
  const A = random_invertible_matrix(n, seed);
  const A_inv = invert_matrix(A);
  const product = multiply_matrices(A, A_inv);
  
  const hashed_words = [];
  for(let i = 0; i < size; i += nibbles_per_word){
    let chunk = hashed_bytes.slice(i, Math.min(
      i + nibbles_per_word, size
    ));
    while(chunk.length < nibbles_per_word) chunk += '0';
    hashed_words.push(Number.parseInt(chunk, 16));
  }
  
  const hashed_vector = hashed_words.map(word => {
    let vector = [];
    for(let i = 0; i < values_per_word; i++){
      vector.push(word % modulus);
      word = Math.floor(word / modulus);
    }
    return vector;
  }).flat();
  
  const encrypted_vector = multiply_matrices(A,
    hashed_vector.map(v => [v])
  ).map(row => row[0]);
  
  return {
    salt,
    seed,
    hashed_bytes,
    hashed_words,
    hashed_vector,
    encrypted_vector,
    matrix: A,
    matrix_inverse: A_inv,
    product,
  };
}

