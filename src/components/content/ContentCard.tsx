import { Link } from 'react-router-dom'
import type { Content } from '../../types'

const DEFAULT_THUMBNAIL = '/img/default-thumbnail.svg'
const DEFAULT_LOGO = '/img/default-logo.svg'

interface Props {
  content: Content
  siteLogos: Record<string, string>
  isRead: boolean
  onRead: (id: number) => void
  compact?: boolean
}

export default function ContentCard({ content, siteLogos, isRead, onRead, compact = false }: Props) {
  const tags = content.tags ? content.tags.split(',').map((t) => t.trim()).filter(Boolean) : []
  const logo = siteLogos[content.siteName] ?? DEFAULT_LOGO
  const dateStr = new Date(content.publishedAt).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div
      className={`rounded-xl border border-line-lt mb-5 transition-all duration-200 hover:border-brand hover:shadow-[0_8px_24px_var(--shadow-card)] ${isRead ? 'bg-read-bg opacity-80' : 'bg-card'}`}
    >
      <div className="p-4 md:p-5 flex items-center gap-0">
        <div className="flex-1 min-w-0">
          {/* 제목 */}
          <h5 className="mb-2">
            <Link
              to={`/contents/${content.id}`}
              onClick={() => onRead(content.id)}
              className={`no-underline text-[1.05rem] leading-[1.4] tracking-[-0.02em] hover:text-brand transition-colors line-clamp-2 ${isRead ? 'text-read-text font-medium' : 'text-heading font-bold'}`}
            >
              {content.title}
            </Link>
          </h5>

          {/* 요약 */}
          {!compact && content.summary && (
            <p className="text-secondary text-[0.875rem] leading-[1.55] mb-3 line-clamp-2">
              {content.summary}
            </p>
          )}

          {/* 태그 */}
          {!compact && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-0">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[0.85rem] px-3 py-1 bg-page text-secondary border border-line-xs rounded-md font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* 메타바 */}
          <div className="flex items-center text-[0.85rem] text-muted mt-5">
            <img
              src={logo}
              alt="logo"
              onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_LOGO }}
              className="w-5 h-5 rounded-full object-cover border border-surface mr-1.5"
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
        </div>

        {/* 썸네일 */}
        <div className={`${compact ? 'hidden' : 'hidden md:block'} w-[140px] h-[95px] ml-5 shrink-0`}>
          <img
            src={content.thumbnailUrl ?? DEFAULT_THUMBNAIL}
            alt="thumbnail"
            onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_THUMBNAIL }}
            className="w-full h-full object-cover rounded-lg border border-line-lt bg-surface"
          />
        </div>
      </div>
    </div>
  )
}
