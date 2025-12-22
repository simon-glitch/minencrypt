import { defineConfig } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'
import rollupPolyfills from 'rollup-plugin-node-polyfills'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  server: {
    port: 5173
  },
  // Make `global` available in browser bundles (maps to globalThis)
  define: {
    global: 'globalThis'
  },
  plugins: [
    // esbuild plugin used by Vite's optimize step to polyfill globals like Buffer
    // (Vite will only use this during dev optimization)
    // Note: @esbuild-plugins/node-globals-polyfill is a dev dependency that will be
    // installed via npm. If you prefer not to add it, keep the rollup polyfills only.
  ],
  optimizeDeps: {
    // include common Node builtins and polyfills to pre-bundle for dev
    include: ['buffer', 'process', 'crypto-browserify', 'stream-browserify', 'events'] ,
    esbuildOptions: {
      define: { global: 'globalThis' }
    }
  },
  build: {
    rollupOptions: {
      plugins: [rollupPolyfills()]
    }
  },
  resolve: {
    alias: {
      // Keep fs alias to our shim as a fallback for file fetching behavior
      fs: path.resolve(__dirname, 'src/shims/fs-browser.js'),
      // aliases for common Node core modules to browser-friendly packages
      // point `buffer` to the package entry so Vite bundles the browser build
      buffer: 'buffer/',
      process: 'process/browser',
      crypto: 'crypto-browserify',
      stream: 'stream-browserify',
      events: 'events'
      ,
      // alias util to a small browser shim to provide debuglog
      util: path.resolve(__dirname, 'src/shims/util-shim.js')
    }
  }
})
