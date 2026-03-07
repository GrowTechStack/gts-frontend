interface Props {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  first: boolean
  last: boolean
}

export default function Pagination({ currentPage, totalPages, onPageChange, first, last }: Props) {
  if (totalPages <= 1) return null

  const start = Math.max(0, Math.min(currentPage - 2, totalPages - 5))
  const end = Math.min(totalPages - 1, start + 4)
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  return (
    <nav className="mt-5 mb-5">
      <ul className="flex justify-center items-center gap-1">
        <li>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={first}
            className="px-3 py-1.5 text-muted text-sm disabled:opacity-40 hover:text-brand transition-colors"
          >
            이전
          </button>
        </li>
        {pages.map((i) => (
          <li key={i}>
            <button
              onClick={() => onPageChange(i)}
              className={`w-9 h-9 rounded-full text-sm transition-colors ${
                i === currentPage
                  ? 'bg-brand text-white'
                  : 'text-muted hover:text-brand'
              }`}
            >
              {i + 1}
            </button>
          </li>
        ))}
        <li>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={last}
            className="px-3 py-1.5 text-muted text-sm disabled:opacity-40 hover:text-brand transition-colors"
          >
            다음
          </button>
        </li>
      </ul>
    </nav>
  )
}
