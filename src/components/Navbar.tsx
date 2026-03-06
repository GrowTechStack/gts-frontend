import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#dee2e6]">
      <div className="max-w-[1140px] mx-auto px-4 h-14 flex items-center">
        <Link to="/" className="text-[#0d6efd] font-bold text-lg mr-6">
          GrowTechStack
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-[#555] text-sm hover:text-[#0d6efd] transition-colors">
            최신 피드
          </Link>
        </div>
      </div>
    </nav>
  )
}
