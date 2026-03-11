import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { logout } from '../../api/auth'

interface Props {
  dark: boolean
  onToggle: () => void
}

export default function Navbar({ dark, onToggle }: Props) {
  const navigate = useNavigate()
  const { user, accessToken, logout: clearAuth } = useAuthStore()

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      clearAuth()
      navigate('/')
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-line">
      <div className="max-w-[1140px] mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="text-brand font-bold text-lg">
          GrowTechStack
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-secondary text-sm hidden sm:block">국내 IT 기업 기술 블로그 모음</span>

          {accessToken ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-secondary hidden sm:block">{user?.nickname}</span>
              <button
                onClick={handleLogout}
                className="text-xs px-3 py-1.5 border border-line rounded-lg text-muted hover:text-heading hover:border-brand transition-colors"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs px-3 py-1.5 border border-line rounded-lg text-muted hover:text-heading hover:border-brand transition-colors"
              >
                로그인
              </Link>
              <Link
                to="/signup"
                className="text-xs px-3 py-1.5 bg-brand text-white rounded-lg hover:bg-brand-h transition-colors font-semibold"
              >
                회원가입
              </Link>
            </div>
          )}

          <button
            onClick={onToggle}
            aria-label="테마 전환"
            className="w-8 h-8 flex items-center justify-center text-muted hover:text-heading transition-colors"
          >
            {dark ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  )
}
