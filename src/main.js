
import './shims/crypto-shim.js'
import './shims/buffer-shim.js'
import './shims/process-shim.js'
import {hash_str} from './matrix.js'

/** @type {HTMLInputElement} */
const input_source_text = document.getElementById('source_text');
const button_generate = document.getElementById('generate');

button_generate.onclick = function(e){
  const source_text = input_source_text.value;
  const result = mine(source_text);
  console.log('result:', result);
}
