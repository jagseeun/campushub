'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

const FIELDS = ['개발', '디자인', '기획', '마케팅', '데이터', '기타']

type FilterKey = 'type' | 'filter' | 'field'

export default function FilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentType = searchParams.get('type')
  const currentFilter = searchParams.get('filter')
  const currentField = searchParams.get('field')
  const currentQ = searchParams.get('q')

  const buildQuery = useCallback(
    (updates: Partial<Record<FilterKey, string | null>>) => {
      const params = new URLSearchParams()
      if (currentQ) params.set('q', currentQ)

      const merged = {
        type: currentType,
        filter: currentFilter,
        field: currentField,
        ...updates,
      }

      Object.entries(merged).forEach(([key, value]) => {
        if (value) params.set(key, value)
      })

      return `/?${params.toString()}`
    },
    [currentType, currentFilter, currentField, currentQ]
  )

  const toggle = (key: FilterKey, value: string) => {
    const current =
      key === 'type' ? currentType : key === 'filter' ? currentFilter : currentField
    router.push(buildQuery({ [key]: current === value ? null : value }))
  }

  const chip = (key: FilterKey, value: string, label: string) => {
    const current =
      key === 'type' ? currentType : key === 'filter' ? currentFilter : currentField
    const active = current === value
    return (
      <button
        key={value}
        onClick={() => toggle(key, value)}
        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
          active
            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200'
            : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
        }`}
      >
        {label}
      </button>
    )
  }

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap gap-2">
        {chip('filter', 'deadline_soon', '🔥 마감임박')}
        {chip('filter', 'spots_soon', '⚡ 인원마감임박')}
        <span className="w-px bg-gray-200 self-stretch mx-1" />
        {chip('type', 'club', '🏫 동아리')}
        {chip('type', 'study', '📚 스터디')}
        {chip('type', 'team', '👥 팀원모집')}
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-gray-300 font-medium">분야</span>
        <span className="w-px h-3.5 bg-gray-200" />
        {FIELDS.map((f) => chip('field', f, f))}
      </div>
    </div>
  )
}
