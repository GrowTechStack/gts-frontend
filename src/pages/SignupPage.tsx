import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { signup } from '../api/auth'

export default function SignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', passwordConfirm: '', nickname: '' })
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => signup(form.email, form.password, form.nickname),
    onSuccess: () => navigate('/login', { state: { registered: true } }),
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message
      setError(msg ?? '회원가입 중 오류가 발생했습니다.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (form.password !== form.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
    mutation.mutate()
  }

  return (
    <div className="min-h-screen bg-page flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        <div className="bg-card border border-line-lt rounded-2xl p-8 shadow-sm">
          <h1 className="text-xl font-bold text-heading mb-6">회원가입</h1>
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
              <label className="block text-xs font-semibold text-secondary mb-1.5">비밀번호 <span className="text-muted font-normal">(8자 이상)</span></label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="8자 이상 입력"
                required
                minLength={8}
                className="w-full border border-line rounded-lg px-3 py-2.5 text-sm bg-page text-heading outline-none focus:border-brand transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5">비밀번호 확인</label>
              <input
                type="password"
                value={form.passwordConfirm}
                onChange={(e) => setForm((f) => ({ ...f, passwordConfirm: e.target.value }))}
                placeholder="비밀번호 재입력"
                required
                className="w-full border border-line rounded-lg px-3 py-2.5 text-sm bg-page text-heading outline-none focus:border-brand transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5">닉네임 <span className="text-muted font-normal">(2~20자)</span></label>
              <input
                type="text"
                value={form.nickname}
                onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))}
                placeholder="닉네임 입력"
                required
                minLength={2}
                maxLength={20}
                className="w-full border border-line rounded-lg px-3 py-2.5 text-sm bg-page text-heading outline-none focus:border-brand transition-colors"
              />
            </div>
            {error && <p className="text-[0.8rem] text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full py-2.5 bg-brand text-white text-sm font-bold rounded-lg hover:bg-brand-h disabled:opacity-50 transition-colors"
            >
              {mutation.isPending ? '가입 중...' : '회원가입'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-muted">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="text-brand hover:underline font-semibold">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
