'use client'

import { useState } from 'react'
import Header from '@/components/Header'

type ApplicationResult = {
  id: number
  postTitle: string
  status: string
  reviewNote: string | null
  createdAt: string
}

const statusLabel: Record<string, { label: string; cls: string }> = {
  pending:  { label: '검토중',  cls: 'bg-yellow-100 text-yellow-800' },
  accepted: { label: '합격',   cls: 'bg-green-100 text-green-800' },
  rejected: { label: '불합격', cls: 'bg-red-100 text-red-800' },
}

export default function CheckPage() {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [results, setResults] = useState<ApplicationResult[] | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(
        `/api/applications/check?name=${encodeURIComponent(name)}&contact=${encodeURIComponent(contact)}`
      )
      if (!res.ok) {
        const err = await res.json()
        alert(err.error ?? '조회에 실패했습니다.')
        return
      }
      const data = await res.json()
      setResults(data)
    } catch {
      alert('네트워크 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls =
    'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 bg-white'

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-lg mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">내 지원 결과 확인</h1>
        <p className="text-sm text-gray-500 mb-8">지원 시 입력한 이름과 연락처로 지원 내역을 조회할 수 있어요.</p>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">이름</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">연락처</label>
            <input
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="이메일 또는 전화번호"
              className={inputCls}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-600 text-white rounded-lg font-semibold text-sm hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {loading ? '조회 중...' : '지원 내역 조회'}
          </button>
        </form>

        {results !== null && (
          results.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-8">
              지원 내역이 없습니다.
            </div>
          ) : (
            <ul className="space-y-3">
              {results.map((a) => {
                const s = statusLabel[a.status] ?? { label: a.status, cls: 'bg-gray-100 text-gray-700' }
                return (
                  <li key={a.id} className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <span className="font-semibold text-gray-900 text-sm">{a.postTitle}</span>
                      <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${s.cls}`}>
                        {s.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">
                      지원일: {new Date(a.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                    {a.reviewNote && (
                      <p className="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">{a.reviewNote}</p>
                    )}
                  </li>
                )
              })}
            </ul>
          )
        )}
      </main>
    </div>
  )
}
