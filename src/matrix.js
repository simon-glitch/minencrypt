
import {encrypt, decrypt, make_random_key, hash} from './crypto.js';
import {seeded_random_32, seeded_random_float} from './seeded-rng.js';

const modulus = 7;

// function to find (a^-1) mod m using Extended Euclidean Algorithm;
function mod_inverse(a){
  // let's assume a is in range;
  // a = ((a % modulus) + modulus) % modulus;
  for(let x = 1; x < modulus; x++){
    if((a * x) % modulus === 1) return x;
  }
  return 1;
}

const inverses = Array(modulus).fill(0).map((_, i) => mod_inverse(i));

function random_invertible_matrix(n){
  let matrix = Array.from({length: n}, () => Array(n).fill(0));
  
  // Initialize as Identity matrix
  for(let i = 0; i < n; i++) matrix[i][i] = 1;
  
  // Apply random row operations to "scramble" the identity matrix
  // This guarantees the matrix remains invertible.
  for(let count = 0; count < n * n; count++){
    let i = Math.floor(Math.random() * n);
    let j = Math.floor(Math.random() * n);
    if(i === j) continue;
    
    let scalar = Math.floor(Math.random() * (modulus - 1)) + 1;
    
    // Row operation: R_i = (R_i + scalar * R_j) mod modulus
    for(let k = 0; k < n; k++){
      matrix[i][k] = (matrix[i][k] + scalar * matrix[j][k]) % modulus;
    }
  }
  return matrix;
}

function invert_matrix(matrix){
  let n = matrix.length;
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

// size of the output vector;
const size = 64;
const secret_key = 'Simon is the best.';

export function hash_str(input = ""){
  const salt = make_random_key(16);
  const seed = hash(secret_key, salt, 16);
  // get raw data;
  const hashed_vector = hash(input, salt, size);
  
  const n = 3;
  const A = random_invertible_matrix(n);
  const A_inv = invert_matrix(A);
  
  return {
    salt,
    seed,
    hashed_vector,
    matrix: A,
    matrix_inverse: A_inv,
  };
}

