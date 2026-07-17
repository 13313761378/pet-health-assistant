import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { fileURLToPath, URL } from 'node:url'
import { cpSync } from 'node:fs'

const inputDir = fileURLToPath(new URL('.', import.meta.url))
process.env.UNI_INPUT_DIR ||= inputDir
process.env.UNI_CLI_CONTEXT ||= inputDir

const uniPlugin = typeof uni === 'function' ? uni : uni.default

const legacyH5Assets = {
  name: 'legacy-h5-assets',
  closeBundle() {
    if (process.env.UNI_PLATFORM !== 'h5') return
    const outputDir = fileURLToPath(new URL('./dist/', import.meta.url))
    cpSync(fileURLToPath(new URL('./script.js', import.meta.url)), `${outputDir}script.js`)
    cpSync(
      fileURLToPath(new URL('./assets/breeds/', import.meta.url)),
      `${outputDir}assets/breeds`,
      { recursive: true },
    )
  },
}

export default defineConfig({
  plugins: [uniPlugin(), legacyH5Assets],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },
})
