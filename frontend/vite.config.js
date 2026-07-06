import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { fileURLToPath, URL } from 'node:url'

const inputDir = fileURLToPath(new URL('.', import.meta.url))
process.env.UNI_INPUT_DIR ||= inputDir
process.env.UNI_CLI_CONTEXT ||= inputDir

const uniPlugin = typeof uni === 'function' ? uni : uni.default

export default defineConfig({
  plugins: [uniPlugin()]
})
