import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0', // 允许外部访问
    port: 3000,
    open: true,
    strictPort: false // 如果端口被占用，自动尝试下一个可用端口
  }
})
