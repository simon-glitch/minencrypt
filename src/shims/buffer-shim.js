// Ensure `Buffer` is available in browser runtime for polyfilled libraries.
try {
  // lazy import so bundler can inline/alias if configured
  const { Buffer } = await import('buffer')
  if (typeof globalThis.Buffer === 'undefined') {
    globalThis.Buffer = Buffer
  }
} catch (e) {
  // fallback: very small Buffer polyfill for basic uses
  if (typeof globalThis.Buffer === 'undefined') {
    globalThis.Buffer = {
      from: (input, enc) => {
        if (typeof input === 'string') {
          const utf8 = new TextEncoder().encode(input)
          return utf8
        }
        return input
      }
    }
  }
}

export default globalThis.Buffer
