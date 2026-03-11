import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { login } from '../api/auth'
import { useAuthStore } from '../store/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setTokens, setUser } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => login(form.email, form.password),
    onSuccess: (tokens) => {
      setTokens(tokens.accessToken, tokens.refreshToken)
      navigate('/')
    },
    onError: () => setError('이메일 또는 비밀번호가 올바르지 않습니다.'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    mutation.mutate()
  }

  return (
    <div className="min-h-screen bg-page flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        <div className="bg-card border border-line-lt rounded-2xl p-8 shadow-sm">
          <h1 className="text-xl font-bold text-heading mb-6">로그인</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5">이메일</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="example@email.com"
                required
                className="w-full border border-line rounded-lg px-3 py-2.5 text-sm bg-page text-heading outline-none focus:border-brand transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5">비밀번호</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="비밀번호 입력"
                required
                className="w-full border border-line rounded-lg px-3 py-2.5 text-sm bg-page text-heading outline-none focus:border-brand transition-colors"
              />
            </div>
            {error && <p className="text-[0.8rem] text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full py-2.5 bg-brand text-white text-sm font-bold rounded-lg hover:bg-brand-h disabled:opacity-50 transition-colors"
            >
              {mutation.isPending ? '로그인 중...' : '로그인'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-muted">
            계정이 없으신가요?{' '}
            <Link to="/signup" className="text-brand hover:underline font-semibold">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
