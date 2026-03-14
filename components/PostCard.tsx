'use client'

import Link from 'next/link'
import type { Post } from '@/types'

const TYPE_LABELS: Record<string, string> = {
  study: '스터디',
  club: '동아리',
  team: '팀원모집',
}

const TYPE_ICONS: Record<string, string> = {
  study: '📚',
  club: '🏫',
  team: '👥',
}

export default function PostCard({ post }: { post: Post }) {
  const now = new Date()
  const deadline = new Date(post.deadline)
  const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const spotsLeft = post.capacity - post.current
  const fillPct = Math.min(100, Math.round((post.current / post.capacity) * 100))

  const isDeadlineSoon = daysLeft <= 3 && daysLeft >= 0
  const isSpotsSoon = spotsLeft <= 2 && spotsLeft > 0
  const isFull = spotsLeft <= 0

  const formattedDeadline = deadline.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  })

  return (
    <Link href={`/posts/${post.id}`}>
      <div className="group bg-white rounded-2xl border border-gray-100 p-5 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50 transition-all duration-200 h-full flex flex-col">

        {/* Top row: type badge + status */}
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
            {TYPE_ICONS[post.type]} {TYPE_LABELS[post.type] ?? post.type}
          </span>
          <div className="flex items-center gap-1.5">
            {isFull ? (
              <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-medium">마감</span>
            ) : (
              <>
                {isDeadlineSoon && (
                  <span className="text-xs text-rose-500 bg-rose-50 px-2.5 py-1 rounded-full font-bold">D-{daysLeft}</span>
                )}
                {isSpotsSoon && (
                  <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full font-medium">{spotsLeft}자리</span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 text-[15px] leading-snug mb-2 line-clamp-2">
          {post.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed flex-1 mb-4">
          {post.description}
        </p>

        {/* Footer */}
        <div className="space-y-3">
          {/* Field + capacity count */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
              {post.field}
            </span>
            <span className="text-xs text-gray-400">
              <span className="text-gray-700 font-bold">{post.current}</span>
              {' / '}{post.capacity}명 참여 중
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isFull ? 'bg-gray-300' : fillPct >= 80 ? 'bg-rose-400' : 'bg-indigo-500'
              }`}
              style={{ width: `${fillPct}%` }}
            />
          </div>

          {/* Deadline */}
          <p className={`text-xs ${isDeadlineSoon && !isFull ? 'text-rose-500 font-semibold' : 'text-gray-400'}`}>
            📅 {formattedDeadline} 마감
            {!isFull && daysLeft >= 0 && !isDeadlineSoon && ` · D-${daysLeft}`}
          </p>
        </div>
      </div>
    </Link>
  )
}
