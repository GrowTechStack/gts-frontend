export interface Content {
  id: number
  type: string
  title: string
  summary: string | null
  body: string
  originalUrl: string
  siteName: string
  thumbnailUrl: string | null
  tags: string | null
  viewCount: number
  publishedAt: string
  aiSummarized: boolean
}

export interface PageResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  number: number
  size: number
  first: boolean
  last: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  error: { code: string; message: string } | null
}

export interface RssSource {
  id: number
  siteName: string
  rssUrl: string
  siteUrl: string
  logoUrl: string | null
  active: boolean
  postCount: number
  totalViewCount: number
  latestPublishedAt: string | null
}

export interface CollectorLog {
  id: number
  siteName: string
  success: boolean
  collectedCount: number
  startTime: string | null
  endTime: string | null
  errorMessage: string | null
}
