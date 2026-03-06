import apiClient from './axios'
import type { ApiResponse, Content, PageResponse } from '../types'

export const getContents = async (params?: {
  page?: number
  size?: number
  tag?: string
  sites?: string[]
  sort?: string
}) => {
  const { data } = await apiClient.get<ApiResponse<PageResponse<Content>>>('/v1/contents', {
    params,
    paramsSerializer: (p) => {
      const sp = new URLSearchParams()
      Object.entries(p).forEach(([k, v]) => {
        if (Array.isArray(v)) v.forEach((val) => sp.append(k, val))
        else if (v !== undefined) sp.append(k, String(v))
      })
      return sp.toString()
    },
  })
  return data.data
}

export const searchContents = async (q: string, page = 0) => {
  const { data } = await apiClient.get<ApiResponse<PageResponse<Content>>>('/v1/contents/search', {
    params: { q, page, size: 12, sort: 'publishedAt,desc' },
  })
  return data.data
}

export const getContent = async (id: number) => {
  const { data } = await apiClient.get<ApiResponse<Content>>(`/v1/contents/${id}`)
  return data.data
}
