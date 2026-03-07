import { useState, useRef } from 'react'
import type { RssSource } from '../../types'

const DEFAULT_LOGO = '/img/default-logo.svg'

interface HoverInfo {
  source: RssSource
  x: number
  y: number
}

interface Props {
  sources: RssSource[]
  selectedSites: Set<string>
  onToggle: (name: string) => void
  onReset: () => void
}

interface SourceItemProps {
  source: RssSource
  inModal?: boolean
  selectedSites: Set<string>
  onToggle: (name: string) => void
  onMouseEnter: (e: React.MouseEvent<HTMLDivElement>, source: RssSource) => void
  onMouseLeave: () => void
}

function SourceItem({ source, inModal = false, selectedSites, onToggle, onMouseEnter, onMouseLeave }: SourceItemProps) {
  return (
    <div
      className="cursor-pointer rounded-lg"
      onClick={() => onToggle(source.siteName)}
      onMouseEnter={(e) => onMouseEnter(e, source)}
      onMouseLeave={onMouseLeave}
    >
      <div
        className={`source-item flex items-center py-2 border-b border-[#f1f3f5] last:border-0 text-[0.85rem] rounded-lg px-1 transition-colors ${
          selectedSites.has(source.siteName)
            ? 'bg-[#f0f4ff]'
            : 'hover:bg-[#f8f9fa]'
        }`}
      >
        <img
          src={source.logoUrl ?? DEFAULT_LOGO}
          alt="logo"
          onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_LOGO }}
          className="w-[18px] h-[18px] rounded-full object-cover border border-[#e9ecef] mr-2 shrink-0"
        />
        {inModal ? (
          <div className="flex-1 min-w-0">
            <div
              className={`text-[0.85rem] font-semibold ${selectedSites.has(source.siteName) ? 'text-[#0d6efd]' : 'text-[#333]'}`}
            >
              {source.siteName}
            </div>
            <div className="text-[0.75rem] text-[#aaa] mt-0.5">
              포스트 {source.postCount ?? 0}개 · 조회 {(source.totalViewCount ?? 0).toLocaleString()}회
            </div>
          </div>
        ) : (
          <span className={`flex-1 ${selectedSites.has(source.siteName) ? 'text-[#0d6efd] font-semibold' : 'text-[#333]'}`}>
            {source.siteName}
          </span>
        )}
        {source.active && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#28a745] ml-auto shrink-0" />
        )}
      </div>
    </div>
  )
}

export default function SourceSidebar({ sources, selectedSites, onToggle, onReset }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showHover = (e: React.MouseEvent<HTMLDivElement>, source: RssSource) => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    const el = e.currentTarget.querySelector('.source-item') as HTMLElement | null
    if (!el) return
    const rect = el.getBoundingClientRect()
    setHoverInfo({ source, x: rect.left, y: rect.bottom })
  }

  const hideHover = () => {
    hideTimer.current = setTimeout(() => setHoverInfo(null), 150)
  }

  return (
    <>
      <div className="hidden xl:block w-[220px] shrink-0 sticky top-[80px] self-start">
        <div className="bg-white border border-[#e9ecef] rounded-xl p-4">
          <div className="text-[0.8rem] font-bold text-[#888] uppercase tracking-[0.05em] mb-3">
            인기 기술 블로그
          </div>

          {sources.slice(0, 5).map((source) => (
            <SourceItem
              key={source.id}
              source={source}
              selectedSites={selectedSites}
              onToggle={onToggle}
              onMouseEnter={showHover}
              onMouseLeave={hideHover}
            />
          ))}

          {sources.length > 5 && (
            <button
              onClick={() => setModalOpen(true)}
              className="w-full mt-2.5 text-[0.8rem] text-[#666] bg-[#f8f9fa] border border-[#e9ecef] rounded-lg py-1.5 hover:bg-[#e9ecef] transition-colors"
            >
              전체보기 ({sources.length}개) →
            </button>
          )}

          {selectedSites.size > 0 && (
            <button
              onClick={onReset}
              className="w-full mt-2 text-[0.78rem] text-[#0d6efd] bg-[#f0f4ff] border border-[#c7d9ff] rounded-lg py-1.5 hover:bg-[#dce8ff] transition-colors"
            >
              ✕ 필터 초기화
            </button>
          )}
        </div>
      </div>

      {/* 전체보기 모달 */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false) }}
        >
          <div className="bg-white rounded-2xl p-6 w-[360px] max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-base font-bold text-[#111]">인기 기술 블로그</span>
              <button onClick={() => setModalOpen(false)} className="text-[#888] text-xl leading-none">✕</button>
            </div>
            {sources.map((source) => (
              <SourceItem
                key={source.id}
                source={source}
                inModal
                selectedSites={selectedSites}
                onToggle={onToggle}
                onMouseEnter={showHover}
                onMouseLeave={hideHover}
              />
            ))}
          </div>
        </div>
      )}

      {/* 호버 카드 */}
      {hoverInfo && (
        <div
          className="fixed z-[10000] w-[220px] bg-white border border-[#e9ecef] rounded-xl p-3.5 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
          style={{ left: hoverInfo.x, top: hoverInfo.y }}
          onMouseEnter={() => { if (hideTimer.current) clearTimeout(hideTimer.current) }}
          onMouseLeave={() => setHoverInfo(null)}
        >
          <div className="flex items-center mb-2.5">
            <img
              src={hoverInfo.source.logoUrl ?? DEFAULT_LOGO}
              alt="logo"
              onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_LOGO }}
              className="w-7 h-7 rounded-full object-cover border border-[#e9ecef] mr-2 shrink-0"
            />
            <span className="text-[0.9rem] font-bold text-[#111]">{hoverInfo.source.siteName}</span>
          </div>
          <hr className="border-[#f1f3f5] my-2" />
          <div className="flex justify-between text-[0.8rem] text-[#444] mb-1">
            <span className="text-[#aaa]">포스트</span>
            <span>{hoverInfo.source.postCount}개</span>
          </div>
          <div className="flex justify-between text-[0.8rem] text-[#444] mb-1">
            <span className="text-[#aaa]">총 조회수</span>
            <span>{(hoverInfo.source.totalViewCount ?? 0).toLocaleString()}회</span>
          </div>
          {hoverInfo.source.latestPublishedAt && (
            <div className="flex justify-between text-[0.8rem] text-[#444] mb-1">
              <span className="text-[#aaa]">마지막 포스트</span>
              <span>
                {new Date(hoverInfo.source.latestPublishedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric' })}
              </span>
            </div>
          )}
          <a
            href={hoverInfo.source.siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-2.5 text-center text-[0.8rem] text-[#0d6efd] bg-[#f0f4ff] rounded-lg py-1.5 hover:bg-[#dce8ff] transition-colors no-underline"
          >
            방문하기 →
          </a>
        </div>
      )}
    </>
  )
}
