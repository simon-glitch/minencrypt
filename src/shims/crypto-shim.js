// Ensure `crypto.getRandomValues` exists in the browser runtime.
// Prefer native Web Crypto; fall back to Math.random if unavailable.
if (typeof globalThis.crypto === 'undefined') {
  if (typeof self !== 'undefined' && self.crypto && typeof self.crypto.getRandomValues === 'function') {
    globalThis.crypto = self.crypto
  } else if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.getRandomValues === 'function') {
    globalThis.crypto = window.crypto
  } else {
    globalThis.crypto = {
      getRandomValues(buf) {
        for (let i = 0; i < buf.length; i++) {
          buf[i] = Math.floor(Math.random() * 256)
        }
        return buf
      }
    }
  }
}

export default globalThis.crypto
