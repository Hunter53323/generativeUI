import axios from 'axios'

const request = axios.create({
  baseURL: 'http://127.0.0.1:8081',
  timeout: 10000,
  withCredentials: true
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    config.withCredentials = true
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    return response
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

export function useRequest() {
  return request
} 