import { useState, useEffect } from 'react'
import type { Content } from '../../types'

const DEFAULT_LOGO = '/img/default-logo.svg'

interface Props {
  value: string
  onChange: (value: string) => void
  onSearch: () => void
  onSearchQuery: (query: string) => void
  onReset: () => void
  isSearchMode: boolean
  tags?: string[]
  popularContents?: Content[]
  onSelectContent?: (id: number) => void
}

export default function SearchBar({ value, onChange, onSearch, onSearchQuery, onReset, isSearchMode, tags = [], popularContents = [], onSelectContent }: Props) {
  const [overlayOpen, setOverlayOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = overlayOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [overlayOpen])

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (window.innerWidth < 768) {
      e.target.blur()
      setOverlayOpen(true)
    }
  }

  const handleTagClick = (tag: string) => {
    onChange(tag)
    onSearchQuery(tag)
    setOverlayOpen(false)
  }

  const handleOverlaySearch = () => {
    onSearch()
    setOverlayOpen(false)
  }

  const handleOverlayKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleOverlaySearch()
  }

  return (
    <>
      {/* 기존 검색바 (데스크톱 + 모바일 공통) */}
      <div className="mb-3 flex gap-2">
        <div className="flex flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onSearch() }}
            onFocus={handleFocus}
            placeholder="제목, 내용으로 검색..."
            className="flex-1 bg-white border border-[#e9ecef] rounded-l-[10px] px-3 py-2 text-[0.9rem] outline-none focus:border-[#0d6efd] transition-colors"
          />
          <button
            onClick={onSearch}
            className="bg-[#0d6efd] text-white px-4 py-2 rounded-r-[10px] text-[0.9rem] hover:bg-[#0b5ed7] transition-colors"
          >
            검색
          </button>
        </div>
        {isSearchMode && (
          <button
            onClick={onReset}
            className="border border-[#ccc] text-[#555] px-3 py-2 rounded-[10px] text-[0.9rem] hover:bg-[#f1f1f1] transition-colors"
          >
            초기화
          </button>
        )}
      </div>

      {/* 모바일 검색 오버레이 */}
      {overlayOpen && (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col md:hidden">
          {/* 상단 검색 입력 영역 */}
          <div className="flex items-center gap-2 px-3 py-3 border-b border-[#e9ecef]">
            <button
              onClick={() => setOverlayOpen(false)}
              className="w-10 h-10 flex items-center justify-center text-[#333] text-xl shrink-0 -ml-1"
            >
              ←
            </button>
            <div className="flex flex-1">
              <input
                autoFocus
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleOverlayKeyDown}
                placeholder="제목, 내용으로 검색..."
                className="flex-1 bg-[#f8f9fa] border border-[#e9ecef] rounded-l-[10px] px-3 py-2 text-[0.9rem] outline-none focus:border-[#0d6efd] transition-colors"
              />
              <button
                onClick={handleOverlaySearch}
                className="bg-[#0d6efd] text-white px-4 py-2 rounded-r-[10px] text-[0.9rem]"
              >
                검색
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* 추천 검색어 */}
            {tags.length > 0 && (
              <div className="px-4 pt-5">
                <p className="text-[0.85rem] font-bold text-[#111] mb-3">추천 검색어</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className="px-3 py-1.5 bg-[#f1f3f5] text-[#333] text-[0.85rem] rounded-full hover:bg-[#e9ecef] transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 인기 게시물 */}
            {popularContents.length > 0 && (
              <div className="px-4 pt-6 pb-8">
                <p className="text-[0.85rem] font-bold text-[#111] mb-3">인기 게시물</p>
                <ul>
                  {popularContents.map((content, index) => (
                    <li key={content.id}>
                      <button
                        onClick={() => { onSelectContent?.(content.id); setOverlayOpen(false) }}
                        className="w-full flex items-center gap-3 py-3 border-b border-[#f1f3f5] last:border-0 text-left"
                      >
                        <span className={`w-5 shrink-0 text-center text-sm font-bold ${
                          index === 0 ? 'text-[#ff4136]' :
                          index === 1 ? 'text-[#ff851b]' :
                          index === 2 ? 'text-[#ffb700]' : 'text-[#aaa]'
                        }`}>
                          {index + 1}
                        </span>
                        <img
                          src={content.thumbnailUrl ?? DEFAULT_LOGO}
                          alt=""
                          onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_LOGO }}
                          className="w-12 h-12 rounded-lg object-cover shrink-0 bg-[#f1f3f5]"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[0.85rem] font-semibold text-[#111] line-clamp-2 leading-snug">{content.title}</p>
                          <p className="text-[0.75rem] text-[#aaa] mt-0.5">{content.siteName}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
