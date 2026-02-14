import axios, { AxiosInstance } from 'axios'

/**
 * 创建带有鉴权拦截器的 Axios 实例
 */
function createHttpClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: (import.meta as any).env?.VITE_API_BASE || '/api',
    timeout: 10000,
  })

  /**
   * 请求拦截器：附加 Authorization 头
   */
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers = config.headers || {}
      ;(config.headers as any).Authorization = `Bearer ${token}`
    }
    return config
  })

  /**
   * 响应拦截器：兼容后端统一返回 { code, message, data } 的包裹格式
   * - 保持调用方写法不变：const { data } = await http.get(...)
   * - 如果外层存在 data 字段，则把 resp.data 重写为该 data
   */
  instance.interceptors.response.use(
    (resp) => {
      const payload = resp.data as any
      if (payload && typeof payload === 'object' && 'data' in payload) {
        resp.data = payload.data
      }
      return resp
    },
    (error) => {
      return Promise.reject(error)
    },
  )
  return instance
}

const http = createHttpClient()
export default http
