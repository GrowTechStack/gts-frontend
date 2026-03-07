interface Props {
  tags: string[]
  selectedTag: string | null
  onSelectTag: (tag: string | null) => void
}

export default function TagNavigation({ tags, selectedTag, onSelectTag }: Props) {
  return (
    <div className="flex gap-2.5 overflow-x-auto mb-4 mt-2 pb-1 scrollbar-hide [scrollbar-width:none]">
      <button
        onClick={() => onSelectTag(null)}
        className={`px-4 py-1.5 rounded-full border text-[0.95rem] font-medium whitespace-nowrap transition-all ${
          selectedTag === null
            ? 'bg-[#0d6efd] border-[#0d6efd] text-white'
            : 'bg-white border-[#dee2e6] text-[#6c757d] hover:border-[#0d6efd] hover:text-[#0d6efd]'
        }`}
      >
        전체
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => onSelectTag(tag)}
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
  )
}
