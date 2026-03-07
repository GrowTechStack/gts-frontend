import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Navbar from './components/common/Navbar'
import FeedPage from './pages/FeedPage'
import ContentDetailPage from './pages/ContentDetailPage'
import AdminPage from './pages/AdminPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<FeedPage />} />
          <Route path="/contents/:id" element={<ContentDetailPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
        <footer className="mt-12 py-5 border-t border-[#dee2e6] text-[#6c757d] text-sm">
          <div className="max-w-[1140px] mx-auto px-4 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <a href="https://github.com/jun0x2dev" target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity">
                <img src="/img/Github.svg" alt="GitHub" width="22" height="22" />
              </a>
              <a href="https://velog.io/@jun0x2dev/posts" target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity">
                <img src="/img/Velog.svg" alt="Velog" width="22" height="22" />
              </a>
            </div>
            <div className="text-center sm:text-right space-y-1">
              <p>추가를 원하는 기술 블로그가 있다면 문의해 주세요 &nbsp;
                <a href="mailto:jun0x2.dev@gmail.com" className="text-[#0d6efd] hover:underline">jun0x2.dev@gmail.com</a>
              </p>
              <p>&copy; 2026 GrowTechStack. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
