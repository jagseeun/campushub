'use client'

import { useState } from 'react'
import Link from 'next/link'
import { IconSend, IconCheckCircle, IconX } from './Icons'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.origin + text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-md border border-brand-300 text-brand-600 hover:bg-brand-50 transition-colors"
    >
      {copied ? '복사됨!' : '복사'}
    </button>
  )
}

type Props = {
  postId: number
  roles: { id: number; name: string; count: number }[]
  isTeam: boolean
  isClosed: boolean
  applyMode: string
  applyLink: string | null
}

export default function ApplyForm({ postId, roles, isTeam, isClosed, applyMode, applyLink }: Props) {
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', contact: '', roleWanted: '', message: '' })
  const [resultLink, setResultLink] = useState<string | null>(null)

  const inputCls =
    'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 bg-white'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch(`/api/posts/${postId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error ?? '지원에 실패했습니다.')
        return
      }
      const data = await res.json()
      if (data.id && data.statusToken) {
        setResultLink(`/applications/${data.id}/status?token=${data.statusToken}`)
      }
      setSubmitted(true)
    } catch {
      alert('네트워크 오류가 발생했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (isClosed) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-gray-400 text-sm font-medium">
        이 모집은 마감되었습니다
      </div>
    )
  }

  // 외부 링크 모드
  if (applyMode === 'link') {
    return (
      <a
        href={applyLink ?? '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 bg-brand-600 text-white rounded-xl font-semibold text-sm hover:bg-brand-700 transition-colors"
      >
        <IconSend size={15} />
        외부 폼으로 지원하기
      </a>
    )
  }

  if (submitted) {
    return (
      <div className="p-6 bg-brand-50 border border-brand-100 rounded-xl text-center">
        <IconCheckCircle size={36} className="text-brand-500 mx-auto mb-2" />
        <p className="font-bold text-brand-800 mb-1">지원 완료!</p>
        <p className="text-sm text-brand-600 mb-4">지원서가 성공적으로 제출되었습니다.</p>
        {resultLink && (
          <div className="bg-white border border-brand-200 rounded-lg p-3 space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-2">결과 확인 링크</p>
              <div className="flex items-center gap-2">
                <Link
                  href={resultLink}
                  className="flex-1 text-sm font-semibold text-brand-600 hover:text-brand-700 underline underline-offset-2 truncate text-left"
                >
                  결과 확인하기 →
                </Link>
                <CopyButton text={resultLink} />
              </div>
            </div>
            <p className="text-xs text-gray-400">
              링크를 잃어버려도 이름 + 연락처로 다시 찾을 수 있어요.{' '}
              <Link href="/applications/check" className="text-brand-500 hover:underline font-medium">
                내 지원 결과 확인하기
              </Link>
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full py-3 bg-brand-600 text-white rounded-xl font-semibold text-sm hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
        >
          <IconSend size={15} />
          지원하기
        </button>
      ) : (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center justify-between">
            <span className="text-gray-800 font-semibold text-sm">지원서 작성</span>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <IconX size={15} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-5 space-y-4 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>이름 *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="홍길동"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>연락처 *</label>
                <input
                  required
                  value={form.contact}
                  onChange={(e) => setForm((p) => ({ ...p, contact: e.target.value }))}
                  placeholder="이메일 또는 전화번호"
                  className={inputCls}
                />
              </div>
            </div>
            {isTeam && roles.length > 0 && (
              <div>
                <label className={labelCls}>지원 역할 *</label>
                <select
                  required
                  value={form.roleWanted}
                  onChange={(e) => setForm((p) => ({ ...p, roleWanted: e.target.value }))}
                  className={inputCls}
                >
                  <option value="">역할을 선택하세요</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.name}>{r.name} ({r.count}명 모집)</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className={labelCls}>지원 메시지 *</label>
              <textarea
                required
                rows={4}
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                placeholder="자기소개 및 지원 동기를 작성해주세요"
                className={`${inputCls} resize-none`}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-brand-600 text-white rounded-lg font-semibold text-sm hover:bg-brand-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              <IconSend size={14} />
              {submitting ? '제출 중...' : '지원서 제출'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
