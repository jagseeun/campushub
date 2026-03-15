'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { IconCheckCircle, IconAlertCircle } from '@/components/Icons'

type StatusData = {
  status: string
  reviewNote: string | null
  postTitle: string
}

function ClockIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

export default function ApplicationStatusPage({
  params,
}: {
  params: { id: string }
}) {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const { id } = params

  const [data, setData] = useState<StatusData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setError('유효하지 않은 링크입니다.')
      setLoading(false)
      return
    }
    fetch(`/api/applications/${id}/status?token=${token}`)
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error ?? '결과를 불러올 수 없습니다.')
        }
        return res.json()
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id, token])

  return (
    <div className="min-h-screen bg-[#F8F9FF] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="text-xl font-bold text-brand-600">CampusHub</Link>
          <p className="text-sm text-gray-400 mt-1">지원 결과 확인</p>
        </div>

        {loading && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-gray-400 text-sm">불러오는 중...</p>
          </div>
        )}

        {error && (
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center">
            <IconAlertCircle size={40} className="text-red-400 mx-auto mb-3" />
            <p className="text-gray-700 font-medium mb-1">접근할 수 없어요</p>
            <p className="text-sm text-gray-400">{error}</p>
          </div>
        )}

        {data && (
          <div className={`bg-white rounded-2xl border shadow-sm p-8 text-center ${
            data.status === 'accepted'
              ? 'border-green-100'
              : data.status === 'rejected'
              ? 'border-gray-200'
              : 'border-blue-100'
          }`}>
            <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wide">{data.postTitle}</p>

            {data.status === 'pending' && (
              <>
                <ClockIcon size={48} />
                <div className="mt-4">
                  <p className="text-lg font-bold text-gray-800 mb-1">검토 중입니다</p>
                  <p className="text-sm text-gray-400">아직 결과가 나오지 않았어요. 조금만 기다려주세요.</p>
                </div>
              </>
            )}

            {data.status === 'accepted' && (
              <>
                <IconCheckCircle size={48} className="text-green-500 mx-auto mt-4" />
                <div className="mt-4">
                  <p className="text-xl font-bold text-green-700 mb-1">합격을 축하드려요! 🎉</p>
                  <p className="text-sm text-gray-500">함께하게 되어 기쁩니다.</p>
                  {data.reviewNote && (
                    <div className="mt-4 bg-green-50 border border-green-100 rounded-lg p-3 text-sm text-green-800 text-left">
                      {data.reviewNote}
                    </div>
                  )}
                </div>
              </>
            )}

            {data.status === 'rejected' && (
              <>
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mt-4">
                  <IconAlertCircle size={24} className="text-gray-400" />
                </div>
                <div className="mt-4">
                  <p className="text-lg font-bold text-gray-700 mb-1">아쉽게도 이번엔 함께하지 못했어요</p>
                  <p className="text-sm text-gray-400">다음 기회에 또 도전해보세요.</p>
                  {data.reviewNote && (
                    <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-600 text-left">
                      {data.reviewNote}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        <p className="text-center text-xs text-gray-300 mt-6">
          이 링크는 본인만 알고 있어야 합니다
        </p>
      </div>
    </div>
  )
}
