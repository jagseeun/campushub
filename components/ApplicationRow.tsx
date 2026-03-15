'use client'

import { useState } from 'react'

type App = {
  id: number
  name: string
  contact: string
  roleWanted: string | null
  message: string
  status: string
  reviewNote: string | null
  createdAt: string
}

type Props = {
  app: App
  postId: number
  idx: number
  total: number
}

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  pending:  { label: '대기중',  cls: 'bg-gray-100 text-gray-500' },
  accepted: { label: '합격',    cls: 'bg-green-100 text-green-700' },
  rejected: { label: '불합격',  cls: 'bg-red-50 text-red-500' },
}

export default function ApplicationRow({ app, postId, idx, total }: Props) {
  const [status, setStatus] = useState(app.status)
  const [note, setNote] = useState(app.reviewNote ?? '')
  const [saving, setSaving] = useState(false)

  const update = async (action: 'accept' | 'reject' | 'pending') => {
    setSaving(true)
    try {
      const res = await fetch(`/api/posts/${postId}/applications/${app.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reviewNote: note }),
      })
      if (res.ok) {
        setStatus(action === 'accept' ? 'accepted' : action === 'reject' ? 'rejected' : 'pending')
      } else {
        const err = await res.json()
        alert(err.error ?? '처리 중 오류가 발생했습니다.')
      }
    } catch {
      alert('네트워크 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const badge = STATUS_BADGE[status] ?? STATUS_BADGE.pending
  const decided = status !== 'pending'

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 ${
      status === 'accepted' ? 'border-green-100' :
      status === 'rejected' ? 'border-red-100' :
      'border-gray-100'
    }`}>
      <div className="flex items-start gap-4">
        <span className="shrink-0 w-8 h-8 rounded-full bg-brand-50 text-brand-600 text-sm font-bold flex items-center justify-center">
          {total - idx}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900">{app.name}</span>
              {app.roleWanted && (
                <span className="text-xs bg-brand-50 text-brand-700 px-2.5 py-0.5 rounded-full font-medium border border-brand-100">
                  {app.roleWanted}
                </span>
              )}
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${badge.cls}`}>
                {badge.label}
              </span>
            </div>
            <span className="text-xs text-gray-400 shrink-0">
              {new Date(app.createdAt).toLocaleDateString('ko-KR', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </span>
          </div>

          <p className="text-xs text-gray-400 mb-3">
            <span className="font-medium text-gray-600">{app.contact}</span>
          </p>

          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg px-4 py-3 mb-3">
            {app.message}
          </p>

          {!decided ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="메모 (선택사항)"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => update('accept')}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-40 transition-colors"
                >
                  합격
                </button>
                <button
                  onClick={() => update('reject')}
                  disabled={saving}
                  className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 disabled:opacity-40 transition-colors"
                >
                  불합격
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {note && (
                <p className="text-xs text-gray-400 italic flex-1">메모: {note}</p>
              )}
              <button
                onClick={() => update('pending')}
                disabled={saving}
                className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 disabled:opacity-40 transition-colors"
              >
                재검토
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
