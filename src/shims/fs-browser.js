// Minimal browser shim for Node's `fs` APIs used in client code.
// Note: This does not provide access to the user's filesystem.
// `readFile` will attempt to `fetch()` the given path/URL and return its contents.

export function readFile(pathOrUrl, encodingOrCallback, cb) {
  let encoding = 'utf8'
  if (typeof encodingOrCallback === 'function') {
    cb = encodingOrCallback
  } else if (typeof encodingOrCallback === 'string') {
    encoding = encodingOrCallback
  }

  fetch(pathOrUrl)
    .then(res => {
      if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`)
      return encoding === 'utf8' ? res.text() : res.arrayBuffer()
    })
    .then(data => cb && cb(null, data))
    .catch(err => cb && cb(err))
}

export const promises = {
  async readFile(pathOrUrl, encoding = 'utf8') {
    const res = await fetch(pathOrUrl)
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`)
    return encoding === 'utf8' ? await res.text() : await res.arrayBuffer()
  }
}

// Provide a minimal default export for `import fs from 'fs'` style
export default {
  readFile,
  promises
}
