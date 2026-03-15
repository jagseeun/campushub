'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import Link from 'next/link'
import Header from '@/components/Header'
import {
  IconArrowLeft, IconPlus, IconX, IconBook, IconBuilding,
  IconUsers, IconUpload, IconSend,
} from '@/components/Icons'
import { POST_TYPES, FIELDS } from '@/types'

type Role = { id: string; name: string; count: number }

export default function NewPostPage() {
  const router = useRouter()
  const { status } = useSession()
  const roleIdCounter = useRef(0)
  const newRole = (): Role => ({ id: String(++roleIdCounter.current), name: '', count: 1 })

  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [type, setType] = useState<'club' | 'study' | 'team'>('study')
  const [applyMode, setApplyMode] = useState<'form' | 'link'>('form')
  const [posterPreview, setPosterPreview] = useState<string | null>(null)
  const [roles, setRoles] = useState<Role[]>([newRole()])
  const [showApplicantCount, setShowApplicantCount] = useState(true)
  const [form, setForm] = useState({
    title: '', field: '개발', capacity: 5, current: 0,
    deadline: '', description: '', poster: '', applyLink: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn()
    }
  }, [status])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) { alert((await res.json()).error ?? '업로드 실패'); return }
      const { url } = await res.json()
      setForm((p) => ({ ...p, poster: url }))
      setPosterPreview(url)
    } catch { alert('업로드 중 오류가 발생했습니다.') }
    finally { setUploadingImage(false) }
  }

  const addRole = () => setRoles((prev) => [...prev, newRole()])
  const removeRole = (id: string) => setRoles((prev) => prev.filter((r) => r.id !== id))
  const updateRole = (id: string, field: 'name' | 'count', value: string | number) =>
    setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (applyMode === 'link' && !form.applyLink.trim()) {
      alert('외부 폼 URL을 입력해주세요.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type, ...form,
          capacity: Number(form.capacity),
          current: Number(form.current),
          roles: type === 'team' ? roles.map(({ name, count }) => ({ name, count })) : [],
          poster: type === 'club' ? form.poster : null,
          applyMode,
          applyLink: applyMode === 'link' ? form.applyLink : null,
          showApplicantCount,
        }),
      })
      if (!res.ok) { alert((await res.json()).error ?? '제출 실패'); return }
      router.push(`/posts/${(await res.json()).id}`)
    } catch { alert('네트워크 오류가 발생했습니다.') }
    finally { setSubmitting(false) }
  }

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 bg-white'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5'

  const TYPE_OPTIONS = [
    { value: 'study', label: '스터디', icon: <IconBook size={15} /> },
    { value: 'club', label: '동아리', icon: <IconBuilding size={15} /> },
    { value: 'team', label: '팀원모집', icon: <IconUsers size={15} /> },
  ] as const

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-[#F8F9FF] flex items-center justify-center">
        <p className="text-gray-400 text-sm">로그인 확인 중...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      <Header
        right={
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
            <IconArrowLeft size={14} />취소
          </Link>
        }
      />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-6">모집글 작성</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 모집 유형 */}
            <div>
              <label className={labelCls}>모집 유형</label>
              <div className="flex gap-2">
                {TYPE_OPTIONS.map((t) => (
                  <button key={t.value} type="button" onClick={() => setType(t.value)}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                      type === t.value
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
                    }`}>
                    {t.icon}{t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 제목 */}
            <div>
              <label className={labelCls}>제목</label>
              <input name="title" value={form.title} onChange={handleChange} required
                placeholder="모집 제목을 입력하세요" className={inputCls} />
            </div>

            {/* 분야 + 마감일 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>분야</label>
                <select name="field" value={form.field} onChange={handleChange} className={inputCls}>
                  {FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>마감일</label>
                <input type="date" name="deadline" value={form.deadline} onChange={handleChange}
                  required min={new Date().toISOString().split('T')[0]} className={inputCls} />
              </div>
            </div>

            {/* 모집 인원 + 현재 인원 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>모집 인원</label>
                <input type="number" name="capacity" value={form.capacity} onChange={handleChange}
                  min={1} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>현재 인원</label>
                <input type="number" name="current" value={form.current} onChange={handleChange}
                  min={0} max={form.capacity} required className={inputCls} />
              </div>
            </div>

            {/* 지원자 수 공개 여부 */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-700">지원자 수 공개</p>
                <p className="text-xs text-gray-400 mt-0.5">지원자 수를 모집 글에 표시합니다</p>
              </div>
              <button
                type="button"
                onClick={() => setShowApplicantCount((v) => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  showApplicantCount ? 'bg-brand-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    showApplicantCount ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* 포스터 (동아리) */}
            {type === 'club' && (
              <div>
                <label className={labelCls}>포스터 이미지 (선택)</label>
                {posterPreview ? (
                  <div className="relative">
                    <img src={posterPreview} alt="미리보기"
                      className="w-full h-auto max-h-64 object-contain rounded-lg border border-gray-200 bg-gray-50" />
                    <button type="button"
                      onClick={() => { setPosterPreview(null); setForm((p) => ({ ...p, poster: '' })) }}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-50">
                      <IconX size={14} className="text-gray-500" />
                    </button>
                  </div>
                ) : (
                  <label className={`${inputCls} flex flex-col items-center justify-center h-32 cursor-pointer border-dashed hover:border-brand-300 hover:bg-brand-50 transition-colors`}>
                    {uploadingImage ? <span className="text-sm text-gray-500">업로드 중...</span> : (
                      <>
                        <IconUpload size={24} className="text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">클릭하여 이미지 업로드</span>
                        <span className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, WEBP · 최대 5MB</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handlePosterUpload}
                      className="hidden" disabled={uploadingImage} />
                  </label>
                )}
              </div>
            )}

            {/* 역할 (팀원모집) */}
            {type === 'team' && (
              <div>
                <label className={labelCls}>모집 역할</label>
                <div className="bg-brand-50 rounded-xl p-4 space-y-2.5">
                  <div className="grid gap-2 px-0.5" style={{ gridTemplateColumns: '1fr 88px 32px' }}>
                    <span className="text-xs font-medium text-gray-400">역할명</span>
                    <span className="text-xs font-medium text-gray-400 text-center">인원수</span>
                    <span />
                  </div>
                  {roles.map((role) => (
                    <div key={role.id} className="grid gap-2 items-center" style={{ gridTemplateColumns: '1fr 88px 32px' }}>
                      <input value={role.name} onChange={(e) => updateRole(role.id, 'name', e.target.value)}
                        placeholder="예: 프론트엔드" required
                        className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400" />
                      <div className="relative">
                        <input type="number" value={role.count}
                          onChange={(e) => updateRole(role.id, 'count', Number(e.target.value))}
                          min={1}
                          className="w-full border border-gray-200 bg-white rounded-lg px-3 py-2 pr-7 text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400" />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">명</span>
                      </div>
                      {roles.length > 1 ? (
                        <button type="button" onClick={() => removeRole(role.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors">
                          <IconX size={14} />
                        </button>
                      ) : <span />}
                    </div>
                  ))}
                  <button type="button" onClick={addRole}
                    className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 font-medium pt-1">
                    <IconPlus size={14} />역할 추가
                  </button>
                </div>
              </div>
            )}

            {/* 소개 */}
            <div>
              <label className={labelCls}>소개</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                required rows={5} placeholder="모집 내용을 자세히 작성해주세요"
                className={`${inputCls} resize-none`} />
            </div>

            {/* ── 지원 방식 선택 ── */}
            <div>
              <label className={labelCls}>지원 방식</label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setApplyMode('form')}
                  className={`flex flex-col items-start gap-1 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                    applyMode === 'form'
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}>
                  <span className={`text-sm font-semibold ${applyMode === 'form' ? 'text-brand-700' : 'text-gray-700'}`}>
                    기본 지원 폼
                  </span>
                  <span className="text-xs text-gray-400">CampusHub 내장 폼으로 지원 받기</span>
                </button>
                <button type="button" onClick={() => setApplyMode('link')}
                  className={`flex flex-col items-start gap-1 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                    applyMode === 'link'
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}>
                  <span className={`text-sm font-semibold ${applyMode === 'link' ? 'text-brand-700' : 'text-gray-700'}`}>
                    외부 폼 링크
                  </span>
                  <span className="text-xs text-gray-400">Google Forms 등 외부 링크로 연결</span>
                </button>
              </div>

              {applyMode === 'link' && (
                <div className="mt-3">
                  <div className="relative">
                    <IconSend size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      name="applyLink"
                      value={form.applyLink}
                      onChange={handleChange}
                      required={applyMode === 'link'}
                      placeholder="https://forms.google.com/..."
                      className={`${inputCls} pl-9`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 pt-2">
              <Link href="/"
                className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium text-center hover:bg-gray-50 transition-colors">
                취소
              </Link>
              <button type="submit" disabled={submitting}
                className="flex-1 py-3 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors">
                {submitting ? '제출 중...' : '모집글 등록'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
