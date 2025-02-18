import { fileURLToPath, URL } from 'node:url'
import path from 'path'

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
      '@': path.resolve(__dirname, './src'),
    },
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
      },
      '/devicemanager': {
        target: 'http://150.158.159.3:8888',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/devicemanager/, '')
      }
    }
  }
})