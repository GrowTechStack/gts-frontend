import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { signup } from '../api/auth'

function PrivacyPolicyModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-line-lt rounded-2xl w-full max-w-[560px] max-h-[80dvh] flex flex-col shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h2 className="text-base font-bold text-heading">개인정보처리방침</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-heading transition-colors text-xl leading-none"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5 space-y-5 text-sm text-secondary leading-relaxed">
          <p className="text-xs text-muted">최종 수정일: 2026년 3월 12일</p>

          <div>
            <h3 className="font-semibold text-heading mb-1">1. 수집하는 개인정보 항목</h3>
            <p>GrowTechStack(이하 "서비스")은 회원가입 시 다음의 개인정보를 수집합니다.</p>
            <ul className="mt-1.5 list-disc list-inside space-y-0.5 pl-2">
              <li>이메일 주소</li>
              <li>닉네임</li>
              <li>비밀번호 (암호화 저장)</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-heading mb-1">2. 개인정보 수집 및 이용 목적</h3>
            <ul className="list-disc list-inside space-y-0.5 pl-2">
              <li>회원 식별 및 서비스 이용</li>
              <li>서비스 관련 공지사항 전달</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-heading mb-1">3. 개인정보 보유 및 이용 기간</h3>
            <p>회원 탈퇴 시까지 보유하며, 탈퇴 즉시 파기합니다. 단, 관계 법령에 따라 일정 기간 보존이 필요한 경우 해당 기간 동안 보유할 수 있습니다.</p>
          </div>

          <div>
            <h3 className="font-semibold text-heading mb-1">4. 개인정보의 제3자 제공</h3>
            <p>서비스는 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다.</p>
          </div>

          <div>
            <h3 className="font-semibold text-heading mb-1">5. 개인정보 처리의 위탁</h3>
            <p>서비스는 현재 개인정보 처리 업무를 외부에 위탁하지 않습니다.</p>
          </div>

          <div>
            <h3 className="font-semibold text-heading mb-1">6. 이용자의 권리</h3>
            <p>이용자는 언제든지 자신의 개인정보를 조회하거나 수정, 삭제할 수 있습니다. 문의는 아래 연락처로 해주세요.</p>
          </div>

          <div>
            <h3 className="font-semibold text-heading mb-1">7. 개인정보 보호 책임자</h3>
            <p>이메일: <a href="mailto:jun0x2.dev@gmail.com" className="text-brand hover:underline">jun0x2.dev@gmail.com</a></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', passwordConfirm: '', nickname: '' })
  const [agreedToPrivacyPolicy, setAgreedToPrivacyPolicy] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => signup(form.email, form.password, form.nickname, agreedToPrivacyPolicy),
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
    if (!agreedToPrivacyPolicy) {
      setError('개인정보처리방침에 동의해 주세요.')
      return
    }
    mutation.mutate()
  }

  return (
    <div className="min-h-screen bg-page flex items-center justify-center px-4">
      {showPrivacy && <PrivacyPolicyModal onClose={() => setShowPrivacy(false)} />}
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
            <div className="flex items-start gap-2.5">
              <input
                id="privacy"
                type="checkbox"
                checked={agreedToPrivacyPolicy}
                onChange={(e) => setAgreedToPrivacyPolicy(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-brand cursor-pointer"
              />
              <label htmlFor="privacy" className="text-sm text-secondary leading-snug">
                <button
                  type="button"
                  onClick={() => setShowPrivacy(true)}
                  className="text-brand hover:underline cursor-pointer"
                >
                  개인정보처리방침
                </button>
                에 동의합니다. <span className="text-red-500">*</span>
              </label>
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
