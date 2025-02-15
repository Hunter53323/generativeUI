import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/label-studio': {
        target: 'http://127.0.0.1:8081',
        changeOrigin: true,
        rewrite: (path) => {
          if (path.startsWith('/label-studio/static/')) {
            return path.replace('/label-studio/static/', '/static/')
          }
          return path.replace(/^\/label-studio/, '')
        },
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('Cookie', req.headers.cookie || '')
          })
          proxy.on('proxyRes', (proxyRes, req, res) => {
            const cookies = proxyRes.headers['set-cookie']
            if (cookies) {
              proxyRes.headers['set-cookie'] = cookies.map(cookie =>
                cookie.replace(/Path=\//, 'Path=/label-studio/')
              )
            }
          })
        }
      }
    }
  }
})
