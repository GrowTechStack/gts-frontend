import { create } from 'zustand'
import type { AuthUser } from '../types'

const ACCESS_TOKEN_KEY = 'gts-access-token'
const REFRESH_TOKEN_KEY = 'gts-refresh-token'

interface AuthState {
  accessToken: string | null
  user: AuthUser | null
  setTokens: (accessToken: string, refreshToken: string) => void
  setUser: (user: AuthUser) => void
  logout: () => void
  getAccessToken: () => string | null
  getRefreshToken: () => string | null
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
  user: null,

  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    set({ accessToken })
  },

  setUser: (user) => set({ user }),

  logout: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    set({ accessToken: null, user: null })
  },

  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
}))
