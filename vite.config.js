import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
        aplicacao: resolve(process.cwd(), 'aplicacao.html')
      }
    }
  }
})
