'use client'

import Link from 'next/link'
import type { Post } from '@/types'

const TYPE_ICONS: Record<string, string> = {
  study: '📚',
  club: '🏫',
  team: '👥',
}

const TYPE_LABELS: Record<string, string> = {
  study: '스터디',
  club: '동아리',
  team: '팀원모집',
}

const TYPE_COLORS: Record<string, string> = {
  study: 'bg-blue-100 text-blue-700',
  club: 'bg-green-100 text-green-700',
  team: 'bg-purple-100 text-purple-700',
}

export default function PostCard({ post }: { post: Post }) {
  const now = new Date()
  const deadline = new Date(post.deadline)
  const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const spotsLeft = post.capacity - post.current

  const isDeadlineSoon = daysLeft <= 3 && daysLeft >= 0
  const isSpotsSoon = spotsLeft <= 2 && spotsLeft > 0
  const isFull = spotsLeft <= 0

  const formattedDeadline = deadline.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
  })

  return (
    <Link href={`/posts/${post.id}`}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${TYPE_COLORS[post.type] ?? 'bg-gray-100 text-gray-700'}`}>
            {TYPE_ICONS[post.type]} {TYPE_LABELS[post.type] ?? post.type}
          </span>
          <div className="flex gap-1.5 flex-wrap justify-end">
            {isFull ? (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                모집 마감
              </span>
            ) : (
              <>
                {isDeadlineSoon && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                    🔥 마감임박
                  </span>
                )}
                {isSpotsSoon && (
                  <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                    ⚠ 자리 {spotsLeft}개 남음
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        <h3 className="font-semibold text-gray-900 text-base mb-2 line-clamp-2 flex-1">
          {post.title}
        </h3>

        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{post.description}</p>

        <div className="mt-auto space-y-1.5 text-sm text-gray-600">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400">📌</span>
            <span>{post.field}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400">👤</span>
            <span>
              {post.current} / {post.capacity}명
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400">📅</span>
            <span className={isDeadlineSoon ? 'text-red-500 font-medium' : ''}>
              {formattedDeadline} 마감
              {daysLeft >= 0 && ` (D-${daysLeft})`}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
