'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { IconFlame, IconZap, IconBuilding, IconBook, IconUsers } from './Icons'

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
      const merged = { type: currentType, filter: currentFilter, field: currentField, ...updates }
      Object.entries(merged).forEach(([key, value]) => { if (value) params.set(key, value) })
      return `/?${params.toString()}`
    },
    [currentType, currentFilter, currentField, currentQ]
  )

  const toggle = (key: FilterKey, value: string) => {
    const current = key === 'type' ? currentType : key === 'filter' ? currentFilter : currentField
    router.push(buildQuery({ [key]: current === value ? null : value }))
  }

  const chip = (key: FilterKey, value: string, label: React.ReactNode) => {
    const current = key === 'type' ? currentType : key === 'filter' ? currentFilter : currentField
    const active = current === value
    return (
      <button
        key={String(value)}
        onClick={() => toggle(key, value)}
        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap transition-all ${
          active
            ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
            : 'bg-white text-gray-500 border-gray-200 hover:border-brand-300 hover:text-brand-600'
        }`}
      >
        {label}
      </button>
    )
  }

  return (
    <div className="space-y-2">
      {/* 빠른 필터 + 유형 — 가로 스크롤 */}
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex items-center gap-2 min-w-max">
          {chip('filter', 'deadline_soon', <><IconFlame size={12} />마감임박</>)}
          {chip('filter', 'spots_soon', <><IconZap size={12} />인원마감임박</>)}
          <span className="w-px h-4 bg-gray-200 mx-0.5 shrink-0" />
          {chip('type', 'club', <><IconBuilding size={12} />동아리</>)}
          {chip('type', 'study', <><IconBook size={12} />스터디</>)}
          {chip('type', 'team', <><IconUsers size={12} />팀원모집</>)}
        </div>
      </div>

      {/* 분야 필터 — 가로 스크롤 */}
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex items-center gap-2 min-w-max">
          <span className="text-xs text-gray-400 font-medium shrink-0">분야</span>
          <span className="w-px h-3.5 bg-gray-200 shrink-0" />
          {FIELDS.map((f) => chip('field', f, f))}
        </div>
      </div>
    </div>
  )
}
