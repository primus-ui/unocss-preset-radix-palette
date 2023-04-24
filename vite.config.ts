import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [UnoCSS()],
  test: {
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'json', 'html']
    }
  }
})
