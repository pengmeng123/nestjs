import { defineStore } from 'pinia'
import http from '../api/http'

export interface LoginPayload {
  name: string
  password: string
}
export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export interface Profile {
  id: number
  name: string
  email?: string
  avatar?: string | null
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: (typeof window !== 'undefined' && localStorage.getItem('token')) || '',
    profile: null as Profile | null,
  }),
  actions: {
    /** 用户登录 */
    async login(payload: LoginPayload) {
      const { data } = await http.post('/login', payload)
      this.token = data.access_token
      localStorage.setItem('token', this.token)
      await this.fetchProfile()
      return true
    },
    /** 用户注册 */
    async register(payload: RegisterPayload) {
      await http.post('/register', payload)
      return true
    },
    /** 拉取用户资料 */
    async fetchProfile() {
      if (!this.token) return
      const { data } = await http.get('/profile')
      this.profile = data.user || null
    },
    /** 退出登录 */
    logout() {
      this.token = ''
      this.profile = null
      localStorage.removeItem('token')
    },
  },
})

