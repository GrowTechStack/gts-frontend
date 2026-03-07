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
    <div className="bg-[#f8f9fa] min-h-screen">
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
            />

            {/* 검색 결과 헤더 */}
            {isSearchMode && (
              <div className="mb-3 text-[0.85rem] text-[#888]">
                '<strong className="text-[#111]">{searchQuery}</strong>' 검색 결과 ({data?.totalElements ?? 0}건)
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
            <Pagination
              currentPage={currentPage}
              totalPages={data?.totalPages ?? 0}
              onPageChange={setCurrentPage}
              first={data?.first ?? true}
              last={data?.last ?? true}
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
