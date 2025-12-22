// Minimal browser shim for Node's `util` module.
// Only implements `debuglog(section)` which returns a no-op logger in browser.
export function debuglog(section) {
  // If user sets DEBUG via process.env.NODE_DEBUG in the shim, we could enable it.
  try {
    const nodeDebug = (globalThis.process && globalThis.process.env && globalThis.process.env.NODE_DEBUG) || ''
    const enabled = nodeDebug && nodeDebug.split(',').map(s => s.trim()).includes(section)
    if (enabled) {
      return function(...args) { console.debug(`${section}:`, ...args) }
    }
  } catch (e) {
    // ignore
  }
  return function() {}
}

export default { debuglog }
