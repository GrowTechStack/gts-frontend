import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getContent } from '../api/contents'
import { getRssSources } from '../api/rss'

const DEFAULT_LOGO = '/img/default-logo.svg'
const DEFAULT_THUMBNAIL = '/img/default-thumbnail.svg'

export default function ContentDetailPage() {
  const { id } = useParams<{ id: string }>()

  const { data: content, isLoading } = useQuery({
    queryKey: ['content', id],
    queryFn: () => getContent(Number(id)),
    enabled: !!id,
  })

  const { data: rssSources = [] } = useQuery({
    queryKey: ['rss-sources'],
    queryFn: getRssSources,
    staleTime: 1000 * 60 * 10,
  })

  const siteLogo = rssSources.find((s) => s.siteName === content?.siteName)?.logoUrl ?? DEFAULT_LOGO

  if (isLoading) {
    return (
      <div className="bg-[#f8f9fa] min-h-screen flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#0d6efd] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!content) {
    return (
      <div className="bg-[#f8f9fa] min-h-screen flex justify-center py-20 text-[#888]">
        콘텐츠를 찾을 수 없습니다.
      </div>
    )
  }

  const tags = content.tags ? content.tags.split(',').map((t) => t.trim()).filter(Boolean) : []
  const dateStr = new Date(content.publishedAt).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="bg-[#f8f9fa] min-h-screen">
      <div className="max-w-[1140px] mx-auto px-4 py-6">
        <div className="flex justify-center">
          <div className="w-full" style={{ maxWidth: 768 }}>
            {/* 뒤로가기 */}
            <nav className="mb-4">
              <Link to="/" className="text-[#6c757d] text-sm hover:text-[#0d6efd] no-underline transition-colors">
                ← 목록으로 돌아가기
              </Link>
            </nav>

            <div className="bg-white rounded-xl border-0 shadow-sm p-6 md:p-10">
              {/* 썸네일 */}
              {content.thumbnailUrl && (
                <div className="mb-4">
                  <img
                    src={content.thumbnailUrl}
                    alt="thumbnail"
                    onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_THUMBNAIL }}
                    className="w-full max-h-[360px] object-cover rounded-xl border border-[#e9ecef]"
                  />
                </div>
              )}

              {/* 헤더 정보 */}
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <img
                    src={siteLogo}
                    alt="logo"
                    onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_LOGO }}
                    className="w-5 h-5 rounded-full object-cover border border-[#e9ecef] mr-2"
                  />
                  <span className="text-[0.8rem] bg-[#0d6efd]/10 text-[#0d6efd] px-2 py-0.5 rounded font-medium mr-2">
                    {content.siteName}
                  </span>
                  <small className="text-[#6c757d] text-sm">{dateStr}</small>
                </div>
                <h1 className="text-2xl font-bold mb-3 text-[#111] leading-tight">{content.title}</h1>
                <div className="flex items-center gap-2 text-[#6c757d] text-sm flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    {content.viewCount}
                  </span>
                  {tags.map((tag) => (
                    <span key={tag} className="text-[0.85rem] px-3 py-1 bg-[#f8f9fa] text-[#666] border border-[#eee] rounded-md font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <hr className="my-4 border-[#e9ecef]" />

              {/* AI 요약 뱃지 */}
              {content.aiSummarized && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[0.8rem] px-2.5 py-1 bg-[#f0f4ff] text-[#4a6cf7] border border-[#d0dcff] rounded-full font-semibold">
                    ✦ AI 요약
                  </span>
                  <small className="text-[#6c757d]">이 내용은 AI가 원문을 요약한 것입니다.</small>
                </div>
              )}

              {/* 요약 본문 */}
              <div className="text-[#6c757d] text-[1.05rem] leading-[1.8] mb-10 whitespace-pre-line">
                {content.summary ?? '해당 컨텐츠는 AI가 요약할 내용이 없습니다.'}
              </div>

              {/* 원문 보기 버튼 */}
              <div className="text-center mt-10 pt-6 border-t border-[#e9ecef]">
                <p className="text-[#6c757d] text-sm mb-3">더 자세한 내용이 궁금하신가요?</p>
                <a
                  href={content.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-[#0d6efd] text-white px-10 py-3 rounded-lg font-bold text-base hover:bg-[#0b5ed7] transition-colors no-underline"
                >
                  원문 보기
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
