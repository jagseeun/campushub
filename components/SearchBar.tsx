'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { IconSearch } from './Icons'

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') ?? '')

  useEffect(() => {
    setValue(searchParams.get('q') ?? '')
  }, [searchParams])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (value.trim()) {
      params.set('q', value.trim())
    } else {
      params.delete('q')
    }
    router.push(`/?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="동아리, 스터디, 팀원 모집 검색..."
        className="w-full px-4 py-3 pl-11 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 text-sm"
      />
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
        <IconSearch size={16} />
      </span>
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-brand-700 transition-colors"
      >
        검색
      </button>
    </form>
  )
}
