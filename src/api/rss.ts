import apiClient from './axios'
import type { ApiResponse, CollectorLog, RssSource } from '../types'

export const getRssSources = async () => {
  const { data } = await apiClient.get<ApiResponse<RssSource[]>>('/v1/rss-sources')
  return data.data
}

export const addRssSource = async (body: { siteName: string; rssUrl: string; logoUrl: string; active: boolean }) => {
  const { data } = await apiClient.post<ApiResponse<RssSource>>('/v1/rss-sources', body)
  return data
}

export const updateRssSource = async (id: number, body: { siteName: string; rssUrl: string; logoUrl: string; active: boolean }) => {
  const { data } = await apiClient.put<ApiResponse<RssSource>>(`/v1/rss-sources/${id}`, body)
  return data
}

export const deleteRssSource = async (id: number) => {
  const { data } = await apiClient.delete<ApiResponse<void>>(`/v1/rss-sources/${id}`)
  return data
}

export const triggerCollect = async (full: boolean) => {
  const { data } = await apiClient.post<ApiResponse<number>>(`/v1/collector/collect?full=${full}`)
  return data
}

export const getLogs = async () => {
  const { data } = await apiClient.get<ApiResponse<CollectorLog[]>>('/v1/collector/logs')
  return data.data
}

export const getFailureLogs = async () => {
  const { data } = await apiClient.get<ApiResponse<CollectorLog[]>>('/v1/collector/logs/failures')
  return data.data
}
