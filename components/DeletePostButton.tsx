'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconTrash } from './Icons'

export default function DeletePostButton({ postId }: { postId: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm('모집글을 삭제하면 모든 지원자 데이터도 함께 삭제됩니다. 삭제하시겠습니까?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' })
      if (!res.ok) {
        alert((await res.json()).error ?? '삭제에 실패했습니다.')
        return
      }
      router.push('/')
    } catch {
      alert('네트워크 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors font-medium disabled:opacity-40"
    >
      <IconTrash size={13} />삭제
    </button>
  )
}
