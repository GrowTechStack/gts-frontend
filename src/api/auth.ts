import apiClient from './axios'
import type { ApiResponse, AuthUser, TokenResponse } from '../types'

export const signup = async (email: string, password: string, nickname: string) => {
  const { data } = await apiClient.post<ApiResponse<null>>('/v1/auth/signup', { email, password, nickname })
  return data
}

export const login = async (email: string, password: string) => {
  const { data } = await apiClient.post<ApiResponse<TokenResponse>>('/v1/auth/login', { email, password })
  return data.data
}

export const logout = async () => {
  await apiClient.post('/v1/auth/logout')
}

export const refresh = async (refreshToken: string) => {
  const { data } = await apiClient.post<ApiResponse<TokenResponse>>('/v1/auth/refresh', { refreshToken })
  return data.data
}

export const getMe = async () => {
  const { data } = await apiClient.get<ApiResponse<AuthUser>>('/v1/auth/me')
  return data.data
}
