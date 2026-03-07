interface Props {
  value: string
  onChange: (value: string) => void
  onSearch: () => void
  onReset: () => void
  isSearchMode: boolean
}

export default function SearchBar({ value, onChange, onSearch, onReset, isSearchMode }: Props) {
  return (
    <div className="mb-3 flex gap-2">
      <div className="flex flex-1">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onSearch() }}
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
  )
}
