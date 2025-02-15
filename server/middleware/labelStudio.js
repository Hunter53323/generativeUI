import { createProxyMiddleware } from 'http-proxy-middleware'

export default function setupLabelStudioProxy(app) {
  app.use('/label-studio', createProxyMiddleware({
    target: 'http://127.0.0.1:8080',
    changeOrigin: true,
    pathRewrite: {
      '^/label-studio': ''
    },
    onProxyRes: function(proxyRes, req, res) {
      // 处理响应头
      proxyRes.headers['Access-Control-Allow-Origin'] = '*'
    }
  }))
} 