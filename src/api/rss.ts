import apiClient from './axios'
import type { AccessLog, AccessStats, ApiResponse, CollectorLog, RssSource } from '../types'

export const getRssSources = async () => {
  const { data } = await apiClient.get<ApiResponse<RssSource[]>>('/v1/rss-sources')
  return data.data
}

export const addRssSource = async (body: { siteName: string; rssUrl: string; siteUrl: string; logoUrl: string; active: boolean }) => {
  const { data } = await apiClient.post<ApiResponse<RssSource>>('/v1/rss-sources', body)
  return data
}

export const updateRssSource = async (id: number, body: { siteName: string; rssUrl: string; siteUrl: string; logoUrl: string; active: boolean }) => {
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

export const triggerCollectOne = async (sourceId: number, full: boolean) => {
  const { data } = await apiClient.post<ApiResponse<number>>(`/v1/collector/collect/${sourceId}?full=${full}`)
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

export const getCollectionStatus = async (): Promise<boolean> => {
  const { data } = await apiClient.get<ApiResponse<{ running: boolean }>>('/v1/collector/status')
  return data.data.running
}

export const stopCollection = async () => {
  await Promise.all([
    apiClient.post('/v1/collector/stop'),
    apiClient.post('/v1/summarize/stop'),
  ])
}

export const startCollection = async () => {
  await Promise.all([
    apiClient.post('/v1/collector/start'),
    apiClient.post('/v1/summarize/start'),
  ])
}

export const resummary = async () => {
  const { data } = await apiClient.post<ApiResponse<number>>('/v1/collector/resummary')
  return data.data
}

export const getAccessStats = async () => {
  const { data } = await apiClient.get<ApiResponse<AccessStats>>('/v1/access-logs/stats')
  return data.data
}

export const getAccessLogs = async () => {
  const { data } = await apiClient.get<ApiResponse<AccessLog[]>>('/v1/access-logs/recent')
  return data.data
}
