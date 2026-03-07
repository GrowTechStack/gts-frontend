import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getRssSources, addRssSource, updateRssSource, deleteRssSource,
  triggerCollect, triggerCollectOne, getLogs, getFailureLogs,
  getCollectionStatus, stopCollection, startCollection, resummary,
  getAccessStats,
} from '../api/rss'
import type { RssSource } from '../types'

const DEFAULT_LOGO = '/img/default-logo.svg'

type Tab = 'sources' | 'logs'
type LogFilter = 'all' | 'failures'

type EditState = {
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

  const { data: accessStats } = useQuery({
    queryKey: ['access-stats'],
    queryFn: getAccessStats,
    refetchInterval: 30_000,
  })

  const { data: collectionRunning = true } = useQuery({
    queryKey: ['collection-status'],
    queryFn: getCollectionStatus,
  })

  const toggleCollectionMutation = useMutation({
    mutationFn: () => collectionRunning ? stopCollection() : startCollection(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection-status'] })
      showToast(collectionRunning ? '수집이 중지되었습니다.' : '수집이 시작되었습니다.')
    },
    onError: () => showToast('상태 변경 중 오류가 발생했습니다.'),
  })

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

  const collectOneMutation = useMutation({
    mutationFn: ({ sourceId, full }: { sourceId: number; full: boolean }) => triggerCollectOne(sourceId, full),
    onSuccess: (data) => {
      showToast(data.success ? `${data.data}개의 콘텐츠를 수집했습니다!` : '수집 오류가 발생했습니다.')
      queryClient.invalidateQueries({ queryKey: ['contents'] })
    },
    onError: () => showToast('수집 중 오류가 발생했습니다.'),
  })

  const resummaryMutation = useMutation({
    mutationFn: resummary,
    onSuccess: (count) => showToast(`${count}개의 콘텐츠에 요약 요청을 전송했습니다.`),
    onError: () => showToast('재요약 요청 중 오류가 발생했습니다.'),
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
    if (!window.confirm(`${full ? '전체' : '최근 2일'} 수집을 실행하시겠습니까?`)) return
    collectMutation.mutate(full)
  }

  const handleCollectOne = (source: RssSource, full: boolean) => {
    if (!window.confirm(`[${source.siteName}] ${full ? '전체' : '최근 2일'} 수집을 실행하시겠습니까?`)) return
    collectOneMutation.mutate({ sourceId: source.id, full })
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

  const activeSources = sources.filter((s) => s.active).length

  return (
    <div className="bg-[#f4f6f9] min-h-screen">
      <div className="max-w-[1140px] mx-auto px-4 py-8">

        {/* 페이지 제목 */}
        <h1 className="text-2xl font-bold text-[#111] mb-6">관리자 대시보드</h1>

        {/* 접속 통계 카드 */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: '현재 접속자', value: accessStats?.activeNow, unit: '명', desc: '최근 5분' },
            { label: '오늘 방문자', value: accessStats?.todayUv, unit: '명', desc: 'UV' },
            { label: '이번달 방문자', value: accessStats?.monthUv, unit: '명', desc: 'UV' },
          ].map(({ label, value, unit, desc }) => (
            <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-[#e9ecef]">
              <p className="text-xs font-semibold text-[#888] mb-1">{label}</p>
              <p className="text-2xl font-bold text-[#111]">
                {value != null ? value.toLocaleString() : '—'}
                <span className="text-sm font-normal text-[#888] ml-1">{unit}</span>
              </p>
              <p className="text-xs text-[#aaa] mt-0.5">{desc}</p>
            </div>
          ))}
        </div>

        {/* 상단 카드 영역 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

          {/* 수집 상태 카드 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e9ecef]">
            <div className="flex items-center gap-1.5 mb-3">
              <p className="text-xs font-semibold text-[#888] uppercase tracking-wide">수집 상태</p>
              <div className="relative group">
                <span className="w-4 h-4 rounded-full bg-[#e9ecef] text-[#888] text-[10px] font-bold flex items-center justify-center cursor-default select-none">?</span>
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 bg-[#212529] text-white text-xs rounded-xl p-3.5 shadow-xl invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-150 z-50 pointer-events-none">
                  {/* 말풍선 꼬리 */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-[#212529]" />
                  <p className="font-bold mb-2 text-[#e9ecef]">활성화/비활성화 제어 범위</p>
                  <ul className="space-y-1.5 text-[#ccc]">
                    <li><span className="text-white font-semibold">스케줄러</span> — 매시간 실행 전 체크, 비활성 시 skip</li>
                    <li><span className="text-white font-semibold">수동 수집</span> — 실행 전 체크, 비활성 시 즉시 차단</li>
                    <li><span className="text-white font-semibold">AI 요약 소비</span> — 비활성 시 Kafka consumer pause</li>
                  </ul>
                  <hr className="border-[#444] my-2.5" />
                  <p className="font-bold mb-1.5 text-[#e9ecef]">수집 중 중지 시</p>
                  <p className="text-[#ccc]">현재 출처 수집 완료 후 나머지 출처부터 중단</p>
                  <hr className="border-[#444] my-2.5" />
                  <p className="font-bold mb-1.5 text-[#e9ecef]">미요약 재처리 중 중지 시</p>
                  <p className="text-[#ccc]">메시지 전송 루프는 멈추지 않고 AI 소비만 pause</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${collectionRunning ? 'bg-[#28a745] shadow-[0_0_0_3px_rgba(40,167,69,0.2)]' : 'bg-[#aaa]'}`} />
                <div>
                  <p className="text-base font-bold text-[#111]">
                    {collectionRunning ? '수집 활성화' : '수집 비활성화'}
                  </p>
                  <p className="text-xs text-[#888]">활성 출처 {activeSources}개 / 전체 {sources.length}개</p>
                </div>
              </div>
              <button
                onClick={() => toggleCollectionMutation.mutate()}
                disabled={toggleCollectionMutation.isPending}
                className={`px-4 py-2 text-sm font-bold rounded-lg disabled:opacity-50 transition-colors ${
                  collectionRunning
                    ? 'bg-[#fff0f0] text-[#dc3545] border border-[#ffc9c9] hover:bg-[#ffe0e0]'
                    : 'bg-[#f0fff4] text-[#28a745] border border-[#b2f2bb] hover:bg-[#d3f9d8]'
                }`}
              >
                {collectionRunning ? '중지' : '시작'}
              </button>
            </div>
          </div>

          {/* 수집 작업 카드 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e9ecef]">
            <p className="text-xs font-semibold text-[#888] uppercase tracking-wide mb-3">수집 작업</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCollect(false)}
                disabled={collectMutation.isPending || !collectionRunning}
                className="flex-1 min-w-[100px] px-3 py-2 bg-[#0d6efd] text-white text-sm font-bold rounded-lg hover:bg-[#0b5ed7] disabled:opacity-40 transition-colors"
              >
                최근 2일 수집
              </button>
              <button
                onClick={() => handleCollect(true)}
                disabled={collectMutation.isPending || !collectionRunning}
                className="flex-1 min-w-[100px] px-3 py-2 border border-[#0d6efd] text-[#0d6efd] text-sm font-bold rounded-lg hover:bg-[#f0f4ff] disabled:opacity-40 transition-colors"
              >
                전체 수집
              </button>
              <button
                onClick={() => {
                  if (!window.confirm('요약이 없는 콘텐츠에 AI 요약 요청을 전송하시겠습니까?')) return
                  resummaryMutation.mutate()
                }}
                disabled={resummaryMutation.isPending}
                className="flex-1 min-w-[100px] px-3 py-2 border border-[#6f42c1] text-[#6f42c1] text-sm font-bold rounded-lg hover:bg-[#f5f0ff] disabled:opacity-40 transition-colors"
              >
                미요약 재처리
              </button>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex gap-1 mb-4 bg-white rounded-xl p-1 shadow-sm border border-[#e9ecef] w-fit">
          {(['sources', 'logs'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 text-sm font-semibold rounded-lg transition-colors ${
                tab === t
                  ? 'bg-[#0d6efd] text-white shadow-sm'
                  : 'text-[#6c757d] hover:text-[#212529]'
              }`}
            >
              {t === 'sources' ? 'RSS 출처 관리' : '수집 로그'}
            </button>
          ))}
        </div>

        {/* 탭: RSS 출처 관리 */}
        {tab === 'sources' && (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-[#e9ecef] mb-5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#f1f3f5] bg-[#f8f9fa]">
                      <th className="py-3 pl-5 text-left text-xs font-semibold text-[#888] uppercase tracking-wide w-16">로고</th>
                      <th className="py-3 text-left text-xs font-semibold text-[#888] uppercase tracking-wide">사이트명</th>
                      <th className="py-3 text-left text-xs font-semibold text-[#888] uppercase tracking-wide">RSS URL</th>
                      <th className="py-3 text-center text-xs font-semibold text-[#888] uppercase tracking-wide">상태</th>
                      <th className="py-3 text-center text-xs font-semibold text-[#888] uppercase tracking-wide">수집</th>
                      <th className="py-3 text-center text-xs font-semibold text-[#888] uppercase tracking-wide pr-5">작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sources.map((source) => (
                      <tr key={source.id} className="border-b border-[#f8f9fa] hover:bg-[#fafbff] transition-colors">
                        <td className="py-3 pl-5">
                          <img
                            src={source.logoUrl ?? DEFAULT_LOGO}
                            alt="logo"
                            onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_LOGO }}
                            className="w-7 h-7 rounded-lg object-contain bg-[#f8f9fa] border border-[#eee] p-0.5"
                          />
                        </td>
                        <td className="py-3 font-semibold text-[#111]">{source.siteName}</td>
                        <td className="py-3 text-[#6c757d] text-xs max-w-[280px] truncate">{source.rssUrl}</td>
                        <td className="py-3 text-center">
                          <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold ${
                            source.active
                              ? 'bg-[#f0fff4] text-[#28a745]'
                              : 'bg-[#f8f9fa] text-[#aaa]'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${source.active ? 'bg-[#28a745]' : 'bg-[#ccc]'}`} />
                            {source.active ? '활성' : '비활성'}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleCollectOne(source, false)}
                              disabled={collectOneMutation.isPending || !collectionRunning}
                              className="text-xs px-2.5 py-1.5 border border-[#0d6efd] text-[#0d6efd] rounded-lg hover:bg-[#f0f4ff] disabled:opacity-40 transition-colors"
                            >
                              2일 수집
                            </button>
                            <button
                              onClick={() => handleCollectOne(source, true)}
                              disabled={collectOneMutation.isPending || !collectionRunning}
                              className="text-xs px-2.5 py-1.5 border border-[#6c757d] text-[#6c757d] rounded-lg hover:bg-[#f8f9fa] disabled:opacity-40 transition-colors"
                            >
                              전체 수집
                            </button>
                          </div>
                        </td>
                        <td className="py-3 text-center pr-5">
                          <button
                            onClick={() => openEdit(source)}
                            className="text-xs px-3 py-1.5 border border-[#dee2e6] text-[#555] rounded-lg hover:border-[#0d6efd] hover:text-[#0d6efd] mr-1.5 transition-colors"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDelete(source.id)}
                            className="text-xs px-3 py-1.5 border border-[#dee2e6] text-[#555] rounded-lg hover:border-[#dc3545] hover:text-[#dc3545] transition-colors"
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

            {/* 새 출처 등록 */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#e9ecef] p-5">
              <p className="text-sm font-bold text-[#111] mb-4">새 출처 등록</p>
              <form
                onSubmit={(e) => { e.preventDefault(); addMutation.mutate() }}
                className="flex flex-wrap gap-3 items-end"
              >
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-xs font-semibold mb-1.5 text-[#555]">사이트 이름</label>
                  <input
                    type="text"
                    value={addForm.siteName}
                    onChange={(e) => setAddForm((f) => ({ ...f, siteName: e.target.value }))}
                    placeholder="예: 토스 테크"
                    required
                    className="w-full border border-[#e9ecef] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d6efd] transition-colors"
                  />
                </div>
                <div className="flex-[2] min-w-[200px]">
                  <label className="block text-xs font-semibold mb-1.5 text-[#555]">RSS URL</label>
                  <input
                    type="url"
                    value={addForm.rssUrl}
                    onChange={(e) => setAddForm((f) => ({ ...f, rssUrl: e.target.value }))}
                    placeholder="https://..."
                    required
                    className="w-full border border-[#e9ecef] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d6efd] transition-colors"
                  />
                </div>
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-xs font-semibold mb-1.5 text-[#555]">로고 아이콘 URL</label>
                  <input
                    type="url"
                    value={addForm.logoUrl}
                    onChange={(e) => setAddForm((f) => ({ ...f, logoUrl: e.target.value }))}
                    placeholder="https://.../favicon.ico"
                    className="w-full border border-[#e9ecef] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d6efd] transition-colors"
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
          </>
        )}

        {/* 탭: 수집 로그 */}
        {tab === 'logs' && (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-xs text-[#888]">최대 50건 표시</p>
              <div className="flex gap-1.5 bg-white rounded-xl p-1 shadow-sm border border-[#e9ecef]">
                <button
                  onClick={() => setLogFilter('all')}
                  className={`text-xs px-4 py-1.5 rounded-lg font-semibold transition-colors ${
                    logFilter === 'all'
                      ? 'bg-[#212529] text-white'
                      : 'text-[#6c757d] hover:text-[#212529]'
                  }`}
                >
                  전체
                </button>
                <button
                  onClick={() => setLogFilter('failures')}
                  className={`text-xs px-4 py-1.5 rounded-lg font-semibold transition-colors ${
                    logFilter === 'failures'
                      ? 'bg-[#dc3545] text-white'
                      : 'text-[#6c757d] hover:text-[#212529]'
                  }`}
                >
                  실패만 보기
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#e9ecef] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#f1f3f5] bg-[#f8f9fa]">
                      <th className="py-3 pl-5 text-left text-xs font-semibold text-[#888] uppercase tracking-wide">사이트명</th>
                      <th className="py-3 text-center text-xs font-semibold text-[#888] uppercase tracking-wide">결과</th>
                      <th className="py-3 text-center text-xs font-semibold text-[#888] uppercase tracking-wide">수집 수</th>
                      <th className="py-3 text-left text-xs font-semibold text-[#888] uppercase tracking-wide">시작 시간</th>
                      <th className="py-3 text-left text-xs font-semibold text-[#888] uppercase tracking-wide">소요 시간</th>
                      <th className="py-3 text-left text-xs font-semibold text-[#888] uppercase tracking-wide pr-5">오류 메시지</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logsLoading ? (
                      <tr>
                        <td colSpan={6} className="text-center text-[#888] py-12 text-sm">로그를 불러오는 중...</td>
                      </tr>
                    ) : logs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center text-[#888] py-12 text-sm">로그가 없습니다.</td>
                      </tr>
                    ) : logs.map((log) => {
                      const start = log.startTime ? new Date(log.startTime) : null
                      const end = log.endTime ? new Date(log.endTime) : null
                      const duration = start && end ? ((end.getTime() - start.getTime()) / 1000).toFixed(1) + 's' : '-'
                      return (
                        <tr key={log.id} className="border-b border-[#f8f9fa] hover:bg-[#fafbff] transition-colors">
                          <td className="py-3 pl-5 font-semibold text-[#111]">{log.siteName}</td>
                          <td className="py-3 text-center">
                            <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold ${
                              log.success ? 'bg-[#f0fff4] text-[#28a745]' : 'bg-[#fff5f5] text-[#dc3545]'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${log.success ? 'bg-[#28a745]' : 'bg-[#dc3545]'}`} />
                              {log.success ? '성공' : '실패'}
                            </span>
                          </td>
                          <td className="py-3 text-center font-mono text-[#555]">{log.collectedCount}</td>
                          <td className="py-3 text-[#555] text-xs">{start ? start.toLocaleString('ko-KR') : '-'}</td>
                          <td className="py-3 text-[#888] text-xs font-mono">{duration}</td>
                          <td className="py-3 text-xs pr-5 max-w-[200px] truncate text-[#dc3545]" title={log.errorMessage ?? ''}>
                            {log.errorMessage
                              ? log.errorMessage.substring(0, 50) + (log.errorMessage.length > 50 ? '...' : '')
                              : <span className="text-[#ccc]">—</span>
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
          className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setEditState(null) }}
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-[480px] shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h5 className="text-base font-bold text-[#111]">출처 정보 수정</h5>
              <button onClick={() => setEditState(null)} className="w-8 h-8 flex items-center justify-center rounded-full text-[#888] hover:bg-[#f1f3f5] transition-colors text-lg leading-none">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-[#555]">사이트 이름</label>
                <input
                  type="text"
                  value={editState.siteName}
                  onChange={(e) => setEditState((s) => s && ({ ...s, siteName: e.target.value }))}
                  className="w-full border border-[#e9ecef] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d6efd] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-[#555]">RSS URL</label>
                <input
                  type="url"
                  value={editState.rssUrl}
                  onChange={(e) => setEditState((s) => s && ({ ...s, rssUrl: e.target.value }))}
                  className="w-full border border-[#e9ecef] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d6efd] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-[#555]">로고 아이콘 URL</label>
                <input
                  type="url"
                  value={editState.logoUrl}
                  onChange={(e) => setEditState((s) => s && ({ ...s, logoUrl: e.target.value }))}
                  className="w-full border border-[#e9ecef] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#0d6efd] transition-colors"
                />
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  id="editActive"
                  checked={editState.active}
                  onChange={(e) => setEditState((s) => s && ({ ...s, active: e.target.checked }))}
                  className="w-4 h-4 accent-[#0d6efd]"
                />
                <span className="text-sm font-semibold text-[#555]">활성화 여부</span>
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setEditState(null)}
                className="px-4 py-2 text-sm text-[#555] border border-[#dee2e6] rounded-lg hover:bg-[#f8f9fa] transition-colors"
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
        <div className="fixed bottom-6 right-6 bg-[#212529] text-white text-sm px-5 py-3 rounded-xl shadow-2xl z-[99999]">
          {toast}
        </div>
      )}
    </div>
  )
}
