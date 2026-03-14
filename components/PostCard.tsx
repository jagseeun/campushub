'use client'

import Link from 'next/link'
import type { Post } from '@/types'
import { IconBook, IconBuilding, IconUsers, IconCalendar, IconFlame, IconZap } from './Icons'

const TYPE_LABELS: Record<string, string> = {
  study: '스터디',
  club: '동아리',
  team: '팀원모집',
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  study: <IconBook size={13} />,
  club: <IconBuilding size={13} />,
  team: <IconUsers size={13} />,
}

export default function PostCard({ post }: { post: Post }) {
  const now = new Date()
  const deadline = new Date(post.deadline)
  const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const spotsLeft = post.capacity - post.current
  const fillPct = Math.min(100, Math.round((post.current / post.capacity) * 100))

  const isExpired = daysLeft < 0
  const isDeadlineSoon = daysLeft <= 3 && daysLeft >= 0
  const isSpotsSoon = spotsLeft <= 2 && spotsLeft > 0
  const isFull = spotsLeft <= 0
  const isClosed = isExpired || isFull

  const formattedDeadline = deadline.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  })

  return (
    <Link href={`/posts/${post.id}`}>
      <div className={`group bg-white rounded-2xl border p-5 hover:shadow-xl transition-all duration-200 h-full flex flex-col ${
        isClosed
          ? 'border-gray-200 opacity-60 hover:shadow-none'
          : 'border-indigo-100 hover:border-brand-300 hover:shadow-brand-50'
      }`}>

        {/* Top row: type badge + status */}
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700">
            {TYPE_ICONS[post.type]} {TYPE_LABELS[post.type] ?? post.type}
          </span>
          <div className="flex items-center gap-1.5">
            {isClosed ? (
              <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
                {isExpired ? '기간만료' : '마감'}
              </span>
            ) : (
              <>
                {isDeadlineSoon && (
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold" style={{ color: 'var(--color-urgent-text)', background: 'var(--color-urgent-bg)' }}>
                    <IconFlame size={11} />D-{daysLeft}
                  </span>
                )}
                {isSpotsSoon && (
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium" style={{ color: 'var(--color-warn-text)', background: 'var(--color-warn-bg)' }}>
                    <IconZap size={11} />{spotsLeft}자리
                  </span>
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
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
              {post.field}
            </span>
            <span className="text-xs text-gray-400">
              <span className="text-gray-700 font-bold">{post.current}</span>
              {' / '}{post.capacity}명
            </span>
          </div>

          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isClosed ? 'bg-gray-300' : fillPct >= 80 ? 'bg-[var(--color-urgent-bar)]' : 'bg-brand-500'
              }`}
              style={{ width: `${fillPct}%` }}
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <IconCalendar size={12} />
            <span className={isDeadlineSoon && !isClosed ? 'font-semibold' : ''} style={isDeadlineSoon && !isClosed ? { color: 'var(--color-urgent-text)' } : undefined}>
              {formattedDeadline} 마감
              {!isClosed && !isDeadlineSoon && ` · D-${daysLeft}`}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
