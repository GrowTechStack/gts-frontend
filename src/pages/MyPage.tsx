import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { withdraw, logout } from '../api/auth'
import { useAuthStore } from '../store/authStore'

export default function MyPage() {
  const navigate = useNavigate()
  const { user, logout: clearAuth } = useAuthStore()
  const [showConfirm, setShowConfirm] = useState(false)

  const withdrawMutation = useMutation({
    mutationFn: withdraw,
    onSuccess: async () => {
      try {
        await logout()
      } finally {
        clearAuth()
        navigate('/')
      }
    },
  })

  if (!user) return null

  const providerLabel = user.provider === 'LOCAL' ? '이메일' : user.provider

  return (
    <div className="min-h-screen bg-page flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        <h1 className="text-2xl font-bold text-heading mb-8">마이페이지</h1>

        <div className="bg-card border border-line rounded-xl p-6 space-y-4 mb-6">
          <div>
            <p className="text-xs text-muted mb-1">닉네임</p>
            <p className="text-sm text-heading font-medium">{user.nickname}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">이메일</p>
            <p className="text-sm text-heading">{user.email}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">가입 방식</p>
            <p className="text-sm text-heading">{providerLabel}</p>
          </div>
        </div>

        <button
          onClick={() => setShowConfirm(true)}
          className="text-xs text-muted hover:text-red-500 transition-colors underline underline-offset-2"
        >
          회원탈퇴
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
          <div className="bg-card border border-line rounded-xl p-6 w-full max-w-[320px]">
            <h2 className="text-base font-semibold text-heading mb-2">정말 탈퇴하시겠어요?</h2>
            <p className="text-sm text-muted mb-6">탈퇴 후 계정 정보는 복구되지 않습니다.</p>
            {withdrawMutation.isError && (
              <p className="text-xs text-red-500 mb-4">오류가 발생했습니다. 다시 시도해 주세요.</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2 text-sm border border-line rounded-lg text-muted hover:text-heading transition-colors"
                disabled={withdrawMutation.isPending}
              >
                취소
              </button>
              <button
                onClick={() => withdrawMutation.mutate()}
                className="flex-1 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                disabled={withdrawMutation.isPending}
              >
                {withdrawMutation.isPending ? '처리 중...' : '탈퇴하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
