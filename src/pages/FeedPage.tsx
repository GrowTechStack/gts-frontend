import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getContents, searchContents } from '../api/contents'
import { getRssSources } from '../api/rss'
import ContentCard from '../components/ContentCard'
import SourceSidebar from '../components/SourceSidebar'

const TAGS = ['backend', 'frontend', 'ai', 'design', 'tech']

function getReadIds(): number[] {
  try {
    const ids = localStorage.getItem('read_content_ids')
    return ids ? JSON.parse(ids).map(Number) : []
  } catch { return [] }
}

function markAsRead(id: number) {
  const ids = getReadIds()
  if (!ids.includes(id)) {
    localStorage.setItem('read_content_ids', JSON.stringify([...ids, id]))
  }
}

export default function FeedPage() {
  const [page, setPage] = useState(0)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [selectedSites, setSelectedSites] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [searchPage, setSearchPage] = useState(0)
  const [readIds, setReadIds] = useState<number[]>(getReadIds)

  const isSearchMode = searchQuery.length > 0

  const { data: feedData, isLoading: feedLoading } = useQuery({
    queryKey: ['contents', page, selectedTag, [...selectedSites].sort()],
    queryFn: () =>
      getContents({
        page,
        size: 12,
        tag: selectedTag ?? undefined,
        sites: selectedSites.size > 0 ? [...selectedSites] : undefined,
        sort: 'publishedAt,desc',
      }),
    enabled: !isSearchMode,
  })

  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ['search', searchQuery, searchPage],
    queryFn: () => searchContents(searchQuery, searchPage),
    enabled: isSearchMode,
  })

  const { data: rssSources = [] } = useQuery({
    queryKey: ['rss-sources'],
    queryFn: getRssSources,
  })

  const siteLogos: Record<string, string> = {}
  rssSources.forEach((s) => { if (s.logoUrl) siteLogos[s.siteName] = s.logoUrl })

  const data = isSearchMode ? searchData : feedData
  const isLoading = isSearchMode ? searchLoading : feedLoading

  const handleSearch = (p = 0) => {
    const q = searchInput.trim()
    if (!q) return
    setSearchQuery(q)
    setSearchPage(p)
  }

  const handleReset = () => {
    setSearchInput('')
    setSearchQuery('')
    setSearchPage(0)
  }

  const handleToggleSite = useCallback((name: string) => {
    setSelectedSites((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
    setPage(0)
  }, [])

  const handleResetSites = useCallback(() => {
    setSelectedSites(new Set())
    setPage(0)
  }, [])

  const handleRead = (id: number) => {
    markAsRead(id)
    setReadIds(getReadIds())
  }

  const currentPage = isSearchMode ? searchPage : page
  const setCurrentPage = isSearchMode ? setSearchPage : setPage

  return (
    <div className="bg-[#f8f9fa] min-h-screen">
      <div className="max-w-[1140px] mx-auto px-4 py-6">
        <div className="flex justify-center gap-6" style={{ alignItems: 'flex-start' }}>
          {/* 메인 콘텐츠 */}
          <div style={{ width: '100%', maxWidth: 850, minWidth: 0 }}>
            {/* 검색바 */}
            <div className="mb-3 flex gap-2">
              <div className="flex flex-1">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
                  placeholder="제목, 내용으로 검색..."
                  className="flex-1 border border-[#e9ecef] rounded-l-[10px] px-3 py-2 text-[0.9rem] outline-none focus:border-[#0d6efd] transition-colors"
                />
                <button
                  onClick={() => handleSearch()}
                  className="bg-[#0d6efd] text-white px-4 py-2 rounded-r-[10px] text-[0.9rem] hover:bg-[#0b5ed7] transition-colors"
                >
                  검색
                </button>
              </div>
              {isSearchMode && (
                <button
                  onClick={handleReset}
                  className="border border-[#ccc] text-[#555] px-3 py-2 rounded-[10px] text-[0.9rem] hover:bg-[#f1f1f1] transition-colors"
                >
                  초기화
                </button>
              )}
            </div>

            {/* 검색 결과 헤더 */}
            {isSearchMode && (
              <div className="mb-3 text-[0.85rem] text-[#888]">
                '<strong className="text-[#111]">{searchQuery}</strong>' 검색 결과 ({data?.totalElements ?? 0}건)
              </div>
            )}

            {/* 태그 네비게이션 */}
            {!isSearchMode && (
              <div className="flex gap-2.5 overflow-x-auto mb-4 mt-2 pb-1 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
                <button
                  onClick={() => { setSelectedTag(null); setPage(0) }}
                  className={`px-4 py-1.5 rounded-full border text-[0.95rem] font-medium whitespace-nowrap transition-all ${
                    selectedTag === null
                      ? 'bg-[#0d6efd] border-[#0d6efd] text-white'
                      : 'bg-white border-[#dee2e6] text-[#6c757d] hover:border-[#0d6efd] hover:text-[#0d6efd]'
                  }`}
                >
                  전체
                </button>
                {TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => { setSelectedTag(tag); setPage(0) }}
                    className={`px-4 py-1.5 rounded-full border text-[0.95rem] font-medium whitespace-nowrap transition-all ${
                      selectedTag === tag
                        ? 'bg-[#0d6efd] border-[#0d6efd] text-white'
                        : 'bg-white border-[#dee2e6] text-[#6c757d] hover:border-[#0d6efd] hover:text-[#0d6efd]'
                    }`}
                  >
                    {tag.charAt(0).toUpperCase() + tag.slice(1)}
                  </button>
                ))}
              </div>
            )}

            {/* 콘텐츠 목록 */}
            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-[#0d6efd] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : data?.content.length === 0 ? (
              <div className="text-center text-[#888] py-20 text-[0.95rem]">
                {isSearchMode ? '검색 결과가 없습니다.' : '게시글이 없습니다.'}
              </div>
            ) : (
              data?.content.map((item) => (
                <ContentCard
                  key={item.id}
                  content={item}
                  siteLogos={siteLogos}
                  isRead={readIds.includes(item.id)}
                  onRead={handleRead}
                />
              ))
            )}

            {/* 페이지네이션 */}
            {data && data.totalPages > 1 && (
              <nav className="mt-5 mb-5">
                <ul className="flex justify-center items-center gap-1">
                  <li>
                    <button
                      onClick={() => setCurrentPage((p) => p - 1)}
                      disabled={data.first}
                      className="px-3 py-1.5 text-[#6c757d] text-sm disabled:opacity-40 hover:text-[#0d6efd] transition-colors"
                    >
                      이전
                    </button>
                  </li>
                  {(() => {
                    const start = Math.max(0, Math.min(currentPage - 2, data.totalPages - 5))
                    const end = Math.min(data.totalPages - 1, start + 4)
                    return Array.from({ length: end - start + 1 }, (_, i) => start + i).map((i) => (
                      <li key={i}>
                        <button
                          onClick={() => setCurrentPage(i)}
                          className={`w-9 h-9 rounded-full text-sm transition-colors ${
                            i === currentPage
                              ? 'bg-[#0d6efd] text-white'
                              : 'text-[#6c757d] hover:text-[#0d6efd]'
                          }`}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))
                  })()}
                  <li>
                    <button
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={data.last}
                      className="px-3 py-1.5 text-[#6c757d] text-sm disabled:opacity-40 hover:text-[#0d6efd] transition-colors"
                    >
                      다음
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </div>

          {/* 우측 사이드바 */}
          <SourceSidebar
            sources={rssSources}
            selectedSites={selectedSites}
            onToggle={handleToggleSite}
            onReset={handleResetSites}
          />
        </div>
      </div>
    </div>
  )
}
