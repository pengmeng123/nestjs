import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx()],
  server: {
    proxy: {
      /**
       * 开发环境代理到后端服务，前缀为 /api
       * - 前端请求 /api/** -> http://localhost:3000/api/**
       * - 避免跨域问题
       */
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
