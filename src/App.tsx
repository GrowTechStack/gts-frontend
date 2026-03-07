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
        <footer className="mt-12 py-5 border-t border-[#dee2e6] text-center text-[#6c757d] text-sm">
          <div className="max-w-[1140px] mx-auto px-4">
            <p>&copy; 2026 GrowTechStack. All rights reserved.</p>
          </div>
        </footer>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
