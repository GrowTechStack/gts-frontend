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
      <div className="bg-page min-h-screen flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!content) {
    return (
      <div className="bg-page min-h-screen flex justify-center py-20 text-muted">
        콘텐츠를 찾을 수 없습니다.
      </div>
    )
  }

  const tags = content.tags ? content.tags.split(',').map((t) => t.trim()).filter(Boolean) : []
  const dateStr = new Date(content.publishedAt).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="bg-page min-h-screen">
      <div className="max-w-[1140px] mx-auto px-4 py-6">
        <div className="flex justify-center">
          <div className="w-full max-w-[768px]">
            {/* 뒤로가기 */}
            <nav className="mb-4">
              <Link to="/" className="text-muted text-sm hover:text-brand no-underline transition-colors">
                ← 목록으로 돌아가기
              </Link>
            </nav>

            <div className="bg-card rounded-xl border-0 shadow-sm p-6 md:p-10">
              {/* 썸네일 */}
              {content.thumbnailUrl && (
                <div className="mb-4">
                  <img
                    src={content.thumbnailUrl}
                    alt="thumbnail"
                    onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_THUMBNAIL }}
                    className="w-full max-h-[360px] object-cover rounded-xl border border-line-lt"
                  />
                </div>
              )}

              {/* 헤더 정보 */}
              <div className="mb-4">
                <div className="flex items-center mb-2 text-[0.85rem] text-muted">
                  <img
                    src={siteLogo}
                    alt="logo"
                    onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_LOGO }}
                    className="w-5 h-5 rounded-full object-cover border border-line-lt mr-1.5"
                  />
                  <span className="font-bold text-body mr-2">{content.siteName}</span>
                  <span className="mr-2 text-faint">·</span>
                  <span>{dateStr}</span>
                  <span className="mx-2 text-faint">·</span>
                  <span className="inline-flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    {content.viewCount}
                  </span>
                </div>
                <h1 className="text-2xl font-bold mb-3 text-heading leading-tight">{content.title}</h1>
                <div className="flex items-center gap-2 text-muted text-sm flex-wrap">
                  {tags.map((tag) => (
                    <span key={tag} className="text-[0.85rem] px-3 py-1 bg-page text-secondary border border-line-xs rounded-md font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <hr className="my-4 border-line-lt" />

              {/* AI 요약 뱃지 */}
              {content.aiSummarized && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[0.8rem] px-2.5 py-1 bg-brand-bg text-ai-text border border-ai-bd rounded-full font-semibold">
                    ✦ AI 요약
                  </span>
                  <small className="text-muted">이 내용은 AI가 원문을 요약한 것입니다.</small>
                </div>
              )}

              {/* 요약 본문 */}
              <div className="text-muted text-[1.05rem] leading-[1.8] mb-10 whitespace-pre-line">
                {content.summary ?? '해당 컨텐츠는 AI가 요약할 내용이 없습니다.'}
              </div>

              {/* 원문 보기 버튼 */}
              <div className="text-center mt-10 pt-6 border-t border-line-lt">
                <p className="text-muted text-sm mb-3">더 자세한 내용이 궁금하신가요?</p>
                <a
                  href={content.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-brand text-white px-10 py-3 rounded-lg font-bold text-base hover:bg-brand-h transition-colors no-underline"
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
