import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#dee2e6]">
      <div className="max-w-[1140px] mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="text-[#0d6efd] font-bold text-lg">
          GrowTechStack
        </Link>
        <span className="text-[#555] text-sm">국내 IT 기업 기술 블로그 모음</span>
      </div>
    </nav>
  )
}
