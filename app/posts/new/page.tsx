'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { POST_TYPES, FIELDS } from '@/types'

type Role = {
  id: string // 안정적인 key용
  name: string
  count: number
}

let roleIdCounter = 0
const newRole = (): Role => ({ id: String(++roleIdCounter), name: '', count: 1 })

export default function NewPostPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [type, setType] = useState<'club' | 'study' | 'team'>('study')
  const [roles, setRoles] = useState<Role[]>([newRole()])
  const [form, setForm] = useState({
    title: '',
    field: '개발',
    capacity: 5,
    current: 0,
    deadline: '',
    description: '',
    poster: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const addRole = () => setRoles((prev) => [...prev, newRole()])
  const removeRole = (id: string) => setRoles((prev) => prev.filter((r) => r.id !== id))
  const updateRole = (id: string, field: 'name' | 'count', value: string | number) => {
    setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const body = {
      type,
      ...form,
      capacity: Number(form.capacity),
      current: Number(form.current),
      roles: type === 'team' ? roles.map(({ name, count }) => ({ name, count })) : [],
      poster: type === 'club' ? form.poster : null,
    }

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json()
        alert(err.error ?? '제출에 실패했습니다.')
        return
      }

      const post = await res.json()
      router.push(`/posts/${post.id}`)
    } catch {
      alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputCls =
    'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1.5'

  const TYPE_LABELS = { study: '📚 스터디', club: '🏫 동아리', team: '👥 팀원모집' }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        right={
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← 취소
          </Link>
        }
      />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-6">모집글 작성</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={labelCls}>모집 유형</label>
              <div className="flex gap-2">
                {POST_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                      type === t
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    {TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>제목</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="모집 제목을 입력하세요"
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>분야</label>
                <select name="field" value={form.field} onChange={handleChange} className={inputCls}>
                  {FIELDS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>마감일</label>
                <input
                  type="date"
                  name="deadline"
                  value={form.deadline}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>모집 인원</label>
                <input
                  type="number"
                  name="capacity"
                  value={form.capacity}
                  onChange={handleChange}
                  min={1}
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>현재 인원</label>
                <input
                  type="number"
                  name="current"
                  value={form.current}
                  onChange={handleChange}
                  min={0}
                  max={form.capacity}
                  required
                  className={inputCls}
                />
              </div>
            </div>

            {type === 'club' && (
              <div>
                <label className={labelCls}>포스터 이미지 URL (선택)</label>
                <input
                  name="poster"
                  value={form.poster}
                  onChange={handleChange}
                  placeholder="https://..."
                  className={inputCls}
                />
              </div>
            )}

            {type === 'team' && (
              <div>
                <label className={labelCls}>모집 역할</label>
                <div className="space-y-2">
                  {roles.map((role) => (
                    <div key={role.id} className="flex gap-2">
                      <input
                        value={role.name}
                        onChange={(e) => updateRole(role.id, 'name', e.target.value)}
                        placeholder="역할명 (예: 프론트엔드)"
                        required
                        className={`${inputCls} flex-1`}
                      />
                      <input
                        type="number"
                        value={role.count}
                        onChange={(e) => updateRole(role.id, 'count', Number(e.target.value))}
                        min={1}
                        className={`${inputCls} w-20`}
                      />
                      {roles.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRole(role.id)}
                          className="px-2.5 text-red-400 hover:text-red-600 border border-gray-200 rounded-lg"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addRole}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    + 역할 추가
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className={labelCls}>소개</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={5}
                placeholder="모집 내용을 자세히 작성해주세요"
                className={`${inputCls} resize-none`}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Link
                href="/"
                className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium text-center hover:bg-gray-50 transition-colors"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? '제출 중...' : '모집글 등록'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
