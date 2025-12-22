// Minimal runtime shim to provide a `process` global in the browser.
// Avoids importing `process/browser` so Vite doesn't need to resolve that module.
if (typeof globalThis.process === 'undefined') {
  // Provide the minimal properties commonly expected by libraries:
  // - env: object
  // - browser: true
  // - nextTick: microtask-based nextTick
  globalThis.process = {
    env: {},
    browser: true,
    nextTick(fn, ...args) {
      return Promise.resolve().then(() => fn(...args))
    }
  }
}

export default globalThis.process
