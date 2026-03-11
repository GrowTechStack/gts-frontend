import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import Navbar from './components/common/Navbar'
import FeedPage from './pages/FeedPage'
import ContentDetailPage from './pages/ContentDetailPage'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import { useTheme } from './hooks/useTheme'
import { useAuthStore } from './store/authStore'
import { getMe } from './api/auth'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

function AdminRoute() {
  const { user, accessToken } = useAuthStore()
  if (!accessToken) return <Navigate to="/login" replace />
  if (!user) return null
  if (user.role !== 'ADMIN') return <Navigate to="/" replace />
  return <AdminPage />
}

function AuthLoader() {
  const { accessToken, user, setUser } = useAuthStore()
  useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const u = await getMe()
      setUser(u)
      return u
    },
    enabled: !!accessToken && !user,
    retry: false,
    staleTime: Infinity,
  })
  return null
}

export default function App() {
  const { dark, toggle } = useTheme()

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthLoader />
        <Navbar dark={dark} onToggle={toggle} />
        <Routes>
          <Route path="/" element={<FeedPage />} />
          <Route path="/contents/:id" element={<ContentDetailPage />} />
          <Route path="/admin" element={<AdminRoute />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
        <footer className="mt-12 py-5 bg-page border-t border-line text-muted text-sm">
          <div className="max-w-[1140px] mx-auto px-4 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <a href="https://github.com/jun0x2dev" target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity">
                <img src="/img/Github.svg" alt="GitHub" width="22" height="22" className="dark:invert" />
              </a>
              <a href="https://velog.io/@jun0x2dev/posts" target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity">
                <img src="/img/Velog.svg" alt="Velog" width="22" height="22" className="dark:invert" />
              </a>
            </div>
            <div className="text-center sm:text-right space-y-1">
              <p>추가를 원하는 기술 블로그가 있다면 문의해 주세요 &nbsp;
                <a href="mailto:jun0x2.dev@gmail.com" className="text-brand hover:underline">jun0x2.dev@gmail.com</a>
              </p>
              <p>&copy; 2026 GrowTechStack. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
