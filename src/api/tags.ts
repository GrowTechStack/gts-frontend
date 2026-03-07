import apiClient from './axios'
import type { ApiResponse } from '../types'

export const getTags = async () => {
  const { data } = await apiClient.get<ApiResponse<string[]>>('/v1/tags')
  return data.data
}
