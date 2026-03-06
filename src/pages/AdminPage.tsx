import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getRssSources, addRssSource, updateRssSource, deleteRssSource,
  triggerCollect, getLogs, getFailureLogs,
} from '../api/rss'
import type { RssSource } from '../types'

const DEFAULT_LOGO = '/img/default-logo.svg'

type Tab = 'sources' | 'logs'
type LogFilter = 'all' | 'failures'

interface EditState {
  id: number
  siteName: string
  rssUrl: string
  logoUrl: string
  active: boolean
}

export default function AdminPage() {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<Tab>('sources')
  const [logFilter, setLogFilter] = useState<LogFilter>('all')
  const [toast, setToast] = useState<string | null>(null)
  const [editState, setEditState] = useState<EditState | null>(null)
  const [addForm, setAddForm] = useState({ siteName: '', rssUrl: '', logoUrl: '' })

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const { data: sources = [] } = useQuery({
    queryKey: ['rss-sources'],
    queryFn: getRssSources,
  })

  const { data: logs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['logs', logFilter],
    queryFn: logFilter === 'failures' ? getFailureLogs : getLogs,
    enabled: tab === 'logs',
  })

  const collectMutation = useMutation({
    mutationFn: (full: boolean) => triggerCollect(full),
    onSuccess: (data) => {
      showToast(data.success ? `${data.data}개의 콘텐츠를 수집했습니다!` : '수집 오류가 발생했습니다.')
      queryClient.invalidateQueries({ queryKey: ['contents'] })
    },
    onError: () => showToast('수집 중 오류가 발생했습니다.'),
  })

  const addMutation = useMutation({
    mutationFn: () => addRssSource({ ...addForm, active: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rss-sources'] })
      setAddForm({ siteName: '', rssUrl: '', logoUrl: '' })
      showToast('출처가 등록되었습니다.')
    },
  })

  const updateMutation = useMutation({
    mutationFn: () => updateRssSource(editState!.id, {
      siteName: editState!.siteName,
      rssUrl: editState!.rssUrl,
      logoUrl: editState!.logoUrl,
      active: editState!.active,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rss-sources'] })
      setEditState(null)
      showToast('수정되었습니다.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteRssSource(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rss-sources'] })
      showToast('삭제되었습니다.')
    },
  })

  const handleCollect = (full: boolean) => {
    const label = full ? '전체 수집' : '최근 2일 수집'
    if (!window.confirm(`${label}을 실행하시겠습니까?`)) return
    collectMutation.mutate(full)
  }

  const handleDelete = (id: number) => {
    if (!window.confirm('삭제하시겠습니까?')) return
    deleteMutation.mutate(id)
  }

  const openEdit = (source: RssSource) => {
    setEditState({
      id: source.id,
      siteName: source.siteName,
      rssUrl: source.rssUrl,
      logoUrl: source.logoUrl ?? '',
      active: source.active,
    })
  }

  return (
    <div className="bg-[#f8f9fa] min-h-screen">
      <div className="max-w-[1140px] mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#111]">관리자</h2>
          <div className="flex gap-2">
            <button
              onClick={() => handleCollect(false)}
              disabled={collectMutation.isPending}
              className="px-4 py-2 bg-[#0d6efd] text-white text-sm font-bold rounded-lg hover:bg-[#0b5ed7] disabled:opacity-50 transition-colors"
            >
              최근 2일 수집
            </button>
            <button
              onClick={() => handleCollect(true)}
              disabled={collectMutation.isPending}
              className="px-4 py-2 border border-[#0d6efd] text-[#0d6efd] text-sm font-bold rounded-lg hover:bg-[#f0f4ff] disabled:opacity-50 transition-colors"
            >
              전체 수집
            </button>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex border-b border-[#dee2e6] mb-4">
          {(['sources', 'logs'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                tab === t
                  ? 'border-[#0d6efd] text-[#212529]'
                  : 'border-transparent text-[#6c757d] hover:text-[#212529]'
              }`}
            >
              {t === 'sources' ? 'RSS 출처 관리' : '수집 로그'}
            </button>
          ))}
        </div>

        {/* 탭: RSS 출처 관리 */}
        {tab === 'sources' && (
          <>
            <div className="bg-white rounded-xl shadow-sm border-0 mb-6 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#f8f9fa] text-[#555]">
                    <tr>
                      <th className="ps-4 py-3 text-left pl-5 w-20">로고</th>
                      <th className="py-3 text-left font-semibold">사이트명</th>
                      <th className="py-3 text-left font-semibold">RSS URL</th>
                      <th className="py-3 text-left font-semibold">상태</th>
                      <th className="py-3 text-center font-semibold">작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sources.map((source) => (
                      <tr key={source.id} className="border-t border-[#f1f3f5] hover:bg-[#fafafa]">
                        <td className="pl-5 py-3">
                          <img
                            src={source.logoUrl ?? DEFAULT_LOGO}
                            alt="logo"
                            onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_LOGO }}
                            className="w-6 h-6 rounded object-contain bg-[#f8f9fa] border border-[#eee]"
                          />
                        </td>
                        <td className="py-3 font-bold text-[#111]">{source.siteName}</td>
                        <td className="py-3 text-[#6c757d] text-xs max-w-[300px] truncate">{source.rssUrl}</td>
                        <td className="py-3">
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                            source.active ? 'bg-[#198754] text-white' : 'bg-[#6c757d] text-white'
                          }`}>
                            {source.active ? '활성' : '비활성'}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <button
                            onClick={() => openEdit(source)}
                            className="text-xs px-3 py-1 border border-[#0d6efd] text-[#0d6efd] rounded hover:bg-[#f0f4ff] mr-1 transition-colors"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDelete(source.id)}
                            className="text-xs px-3 py-1 border border-[#dc3545] text-[#dc3545] rounded hover:bg-[#fff5f5] transition-colors"
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 새 출처 등록 폼 */}
            <div>
              <h5 className="font-bold mb-3 text-[#111]">새 출처 등록</h5>
              <div className="bg-white rounded-xl shadow-sm p-5">
                <form
                  onSubmit={(e) => { e.preventDefault(); addMutation.mutate() }}
                  className="flex flex-wrap gap-3 items-end"
                >
                  <div className="flex-1 min-w-[140px]">
                    <label className="block text-xs font-bold mb-1 text-[#555]">사이트 이름</label>
                    <input
                      type="text"
                      value={addForm.siteName}
                      onChange={(e) => setAddForm((f) => ({ ...f, siteName: e.target.value }))}
                      placeholder="예: 토스 테크"
                      required
                      className="w-full border border-[#e9ecef] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d6efd]"
                    />
                  </div>
                  <div className="flex-[2] min-w-[200px]">
                    <label className="block text-xs font-bold mb-1 text-[#555]">RSS URL</label>
                    <input
                      type="url"
                      value={addForm.rssUrl}
                      onChange={(e) => setAddForm((f) => ({ ...f, rssUrl: e.target.value }))}
                      placeholder="https://..."
                      required
                      className="w-full border border-[#e9ecef] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d6efd]"
                    />
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <label className="block text-xs font-bold mb-1 text-[#555]">로고 아이콘 URL</label>
                    <input
                      type="url"
                      value={addForm.logoUrl}
                      onChange={(e) => setAddForm((f) => ({ ...f, logoUrl: e.target.value }))}
                      placeholder="https://.../favicon.ico"
                      className="w-full border border-[#e9ecef] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d6efd]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={addMutation.isPending}
                    className="px-5 py-2 bg-[#212529] text-white text-sm font-bold rounded-lg hover:bg-[#3a3f44] disabled:opacity-50 transition-colors"
                  >
                    등록하기
                  </button>
                </form>
              </div>
            </div>
          </>
        )}

        {/* 탭: 수집 로그 */}
        {tab === 'logs' && (
          <>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[#6c757d] text-sm">최대 50건 표시</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setLogFilter('all')}
                  className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                    logFilter === 'all'
                      ? 'bg-[#6c757d] text-white border-[#6c757d]'
                      : 'border-[#6c757d] text-[#6c757d] hover:bg-[#f8f9fa]'
                  }`}
                >
                  전체
                </button>
                <button
                  onClick={() => setLogFilter('failures')}
                  className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                    logFilter === 'failures'
                      ? 'bg-[#dc3545] text-white border-[#dc3545]'
                      : 'border-[#dc3545] text-[#dc3545] hover:bg-[#fff5f5]'
                  }`}
                >
                  실패만 보기
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#f8f9fa] text-[#555]">
                    <tr>
                      <th className="py-3 pl-5 text-left font-semibold">사이트명</th>
                      <th className="py-3 text-center font-semibold">결과</th>
                      <th className="py-3 text-center font-semibold">수집 수</th>
                      <th className="py-3 text-left font-semibold">시작 시간</th>
                      <th className="py-3 text-left font-semibold">소요 시간</th>
                      <th className="py-3 text-left font-semibold">오류 메시지</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logsLoading ? (
                      <tr>
                        <td colSpan={6} className="text-center text-[#888] py-8">로그를 불러오는 중...</td>
                      </tr>
                    ) : logs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center text-[#888] py-8">로그가 없습니다.</td>
                      </tr>
                    ) : logs.map((log) => {
                      const start = log.startTime ? new Date(log.startTime) : null
                      const end = log.endTime ? new Date(log.endTime) : null
                      const duration = start && end ? ((end.getTime() - start.getTime()) / 1000).toFixed(1) + 's' : '-'
                      return (
                        <tr key={log.id} className="border-t border-[#f1f3f5] hover:bg-[#fafafa]">
                          <td className="py-3 pl-5 font-bold text-[#111]">{log.siteName}</td>
                          <td className="py-3 text-center">
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                              log.success ? 'bg-[#198754] text-white' : 'bg-[#dc3545] text-white'
                            }`}>
                              {log.success ? '성공' : '실패'}
                            </span>
                          </td>
                          <td className="py-3 text-center text-[#555]">{log.collectedCount}</td>
                          <td className="py-3 text-[#555]">
                            {start ? start.toLocaleString('ko-KR') : '-'}
                          </td>
                          <td className="py-3 text-[#6c757d]">{duration}</td>
                          <td className="py-3 text-[#dc3545] text-xs max-w-[200px] truncate" title={log.errorMessage ?? ''}>
                            {log.errorMessage
                              ? log.errorMessage.substring(0, 50) + (log.errorMessage.length > 50 ? '...' : '')
                              : <span className="text-[#aaa]">-</span>
                            }
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 수정 모달 */}
      {editState && (
        <div
          className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) setEditState(null) }}
        >
          <div className="bg-white rounded-2xl p-6 w-[480px] shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h5 className="text-base font-bold text-[#111]">출처 정보 수정</h5>
              <button onClick={() => setEditState(null)} className="text-[#888] text-xl leading-none">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1 text-[#555]">사이트 이름</label>
                <input
                  type="text"
                  value={editState.siteName}
                  onChange={(e) => setEditState((s) => s && ({ ...s, siteName: e.target.value }))}
                  className="w-full border border-[#e9ecef] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d6efd]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-[#555]">RSS URL</label>
                <input
                  type="url"
                  value={editState.rssUrl}
                  onChange={(e) => setEditState((s) => s && ({ ...s, rssUrl: e.target.value }))}
                  className="w-full border border-[#e9ecef] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d6efd]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-[#555]">로고 아이콘 URL</label>
                <input
                  type="url"
                  value={editState.logoUrl}
                  onChange={(e) => setEditState((s) => s && ({ ...s, logoUrl: e.target.value }))}
                  className="w-full border border-[#e9ecef] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d6efd]"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editActive"
                  checked={editState.active}
                  onChange={(e) => setEditState((s) => s && ({ ...s, active: e.target.checked }))}
                  className="w-4 h-4 accent-[#0d6efd]"
                />
                <label htmlFor="editActive" className="text-sm font-bold text-[#555]">활성화 여부</label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setEditState(null)}
                className="px-4 py-2 text-sm bg-[#6c757d] text-white rounded-lg hover:bg-[#5c636a] transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => updateMutation.mutate()}
                disabled={updateMutation.isPending}
                className="px-4 py-2 text-sm bg-[#0d6efd] text-white font-bold rounded-lg hover:bg-[#0b5ed7] disabled:opacity-50 transition-colors"
              >
                수정 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 토스트 알림 */}
      {toast && (
        <div className="fixed bottom-5 right-5 bg-[#333] text-white text-sm px-5 py-3 rounded-xl shadow-2xl z-[99999] animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  )
}
