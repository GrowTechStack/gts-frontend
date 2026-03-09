import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getContents, searchContents } from '../api/contents'
import { useNavigate } from 'react-router-dom'
import { getRssSources } from '../api/rss'
import { getTags } from '../api/tags'
import ContentCard from '../components/content/ContentCard'
import SourceSidebar from '../components/rss/SourceSidebar'
import SearchBar from '../components/common/SearchBar'
import TagNavigation from '../components/content/TagNavigation'
import Pagination from '../components/common/Pagination'

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
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [selectedSites, setSelectedSites] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [searchPage, setSearchPage] = useState(0)
  const [readIds, setReadIds] = useState<number[]>(getReadIds)
  const [viewMode, setViewMode] = useState<'detailed' | 'compact'>('detailed')
  const [sort, setSort] = useState<'publishedAt,desc' | 'publishedAt,asc' | 'viewCount,desc'>('publishedAt,desc')

  const isSearchMode = searchQuery.length > 0

  const { data: feedData, isLoading: feedLoading } = useQuery({
    queryKey: ['contents', page, selectedTag, [...selectedSites].sort(), sort],
    queryFn: () =>
      getContents({
        page,
        size: 12,
        tag: selectedTag ?? undefined,
        sites: selectedSites.size > 0 ? [...selectedSites] : undefined,
        sort,
      }),
    enabled: !isSearchMode,
    placeholderData: (prev) => prev,
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

  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: getTags,
    staleTime: 1000 * 60 * 10,
  })

  const { data: popularData } = useQuery({
    queryKey: ['contents-popular'],
    queryFn: () => getContents({ size: 5, sort: 'viewCount,desc' }),
    staleTime: 1000 * 60 * 10,
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

  const handleSearchWithQuery = (query: string) => {
    setSearchInput(query)
    setSearchQuery(query.trim())
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
    <div className="bg-page min-h-screen">
      <div className="max-w-[1140px] mx-auto px-4 py-6">
        <div className="flex justify-center items-start gap-6">
          {/* 메인 콘텐츠 */}
          <div className="w-full max-w-[850px] min-w-0">
            {/* 검색바 */}
            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              onSearch={() => handleSearch()}
              onSearchQuery={handleSearchWithQuery}
              onReset={handleReset}
              isSearchMode={isSearchMode}
              tags={tags}
              popularContents={popularData?.content ?? []}
              onSelectContent={(id) => navigate(`/contents/${id}`)}
              rssSources={rssSources}
              selectedSites={selectedSites}
              onToggleSite={handleToggleSite}
            />

            {/* 모바일 블로그 필터 칩 바 (xl 미만에서만 표시) */}
            {!isSearchMode && (
              <div className="xl:hidden overflow-x-auto no-scrollbar mb-3">
                <div className="flex gap-2 w-max">
                  <button
                    onClick={handleResetSites}
                    className={`shrink-0 flex items-center px-3 py-1.5 rounded-full border text-[0.8rem] font-semibold transition-colors ${
                      selectedSites.size === 0
                        ? 'bg-brand border-brand text-white'
                        : 'bg-card border-line text-secondary'
                    }`}
                  >
                    전체
                  </button>
                  {rssSources.map((source) => (
                    <button
                      key={source.id}
                      onClick={() => handleToggleSite(source.siteName)}
                      className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[0.8rem] font-semibold transition-colors ${
                        selectedSites.has(source.siteName)
                          ? 'bg-brand border-brand text-white'
                          : 'bg-card border-line text-secondary'
                      }`}
                    >
                      <img
                        src={source.logoUrl ?? '/img/default-logo.svg'}
                        alt=""
                        onError={(e) => { (e.target as HTMLImageElement).src = '/img/default-logo.svg' }}
                        className="w-4 h-4 rounded-full object-cover"
                      />
                      {source.siteName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 검색 결과 헤더 */}
            {isSearchMode && (
              <div className="mb-3 text-[0.85rem] text-muted">
                '<strong className="text-heading">{searchQuery}</strong>' 검색 결과 ({data?.page?.totalElements ?? 0}건)
              </div>
            )}

            {/* 태그 네비게이션 */}
            {!isSearchMode && (
              <TagNavigation
                tags={tags}
                selectedTag={selectedTag}
                onSelectTag={(tag) => { setSelectedTag(tag); setPage(0) }}
              />
            )}

            {/* 정렬 + 뷰 모드 토글 */}
            <div className="flex items-center justify-between mb-3">
              {!isSearchMode ? (
                <div className="flex gap-1 bg-card border border-line-lt rounded-lg p-1">
                  {([
                    { value: 'publishedAt,desc', label: '최신순' },
                    { value: 'publishedAt,asc',  label: '오래된순' },
                    { value: 'viewCount,desc',   label: '조회수순' },
                  ] as const).map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => { setSort(value); setPage(0) }}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${sort === value ? 'bg-brand text-white' : 'text-muted hover:text-heading'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              ) : <div />}

              {/* 뷰 모드 토글 (모바일 숨김) */}
              <div className="flex gap-1 bg-card border border-line-lt rounded-lg p-1 shrink-0">
                <button
                  onClick={() => setViewMode('detailed')}
                  title="자세히"
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'detailed' ? 'bg-brand text-white' : 'text-muted hover:text-heading'}`}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="1" y="1" width="9" height="6" rx="1"/>
                    <rect x="12" y="1" width="3" height="6" rx="1"/>
                    <rect x="1" y="9" width="14" height="2" rx="0.5"/>
                    <rect x="1" y="13" width="10" height="2" rx="0.5"/>
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('compact')}
                  title="간략히"
                  className={`p-1.5 rounded-md transition-colors ${viewMode === 'compact' ? 'bg-brand text-white' : 'text-muted hover:text-heading'}`}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="1" y="2" width="14" height="2" rx="0.5"/>
                    <rect x="1" y="7" width="14" height="2" rx="0.5"/>
                    <rect x="1" y="12" width="14" height="2" rx="0.5"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* 콘텐츠 목록 */}
            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
              </div>
            ) : data?.content.length === 0 ? (
              <div className="text-center text-muted py-20 text-[0.95rem]">
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
                  compact={viewMode === 'compact'}
                />
              ))
            )}

            {/* 페이지네이션 */}
            <Pagination
              currentPage={currentPage}
              totalPages={data?.page?.totalPages ?? 0}
              onPageChange={setCurrentPage}
              first={(data?.page?.number ?? 0) === 0}
              last={(data?.page?.number ?? 0) >= (data?.page?.totalPages ?? 1) - 1}
            />
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
