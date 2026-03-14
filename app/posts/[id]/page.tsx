import Link from 'next/link'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Header from '@/components/Header'
import ApplyForm from '@/components/ApplyForm'
import {
  IconArrowLeft, IconBook, IconBuilding, IconUsers,
  IconFlame, IconAlertCircle, IconCalendar, IconUsers as IconCount,
} from '@/components/Icons'
import { prisma } from '@/lib/prisma'

const TYPE_ICONS: Record<string, React.ReactNode> = {
  study: <IconBook size={14} />,
  club: <IconBuilding size={14} />,
  team: <IconUsers size={14} />,
}
const TYPE_LABELS: Record<string, string> = {
  study: '스터디', club: '동아리', team: '팀원모집',
}
const TYPE_ACCENT: Record<string, string> = {
  study: '#6366F1',
  club: '#8B5CF6',
  team: '#3B82F6',
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const numId = parseInt(id)
  if (isNaN(numId) || numId < 1) notFound()

  const post = await prisma.post.findUnique({
    where: { id: numId },
    include: { roles: true, _count: { select: { applications: true } } },
  })
  if (!post) notFound()

  const now = new Date()
  const deadline = new Date(post.deadline)
  const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const spotsLeft = post.capacity - post.current
  const isExpired = daysLeft < 0
  const isFull = spotsLeft <= 0
  const isClosed = isExpired || isFull
  const fillPct = Math.min(100, Math.round((post.current / post.capacity) * 100))
  const accent = TYPE_ACCENT[post.type] ?? TYPE_ACCENT.study

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        right={
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <IconArrowLeft size={14} />목록으로
          </Link>
        }
      />

      <div style={{ height: 4, background: accent }} />

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">

        {/* ── 제목 카드 ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          {/* 배지 */}
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border"
              style={{ color: accent, background: `${accent}12`, borderColor: `${accent}30` }}
            >
              {TYPE_ICONS[post.type]} {TYPE_LABELS[post.type] ?? post.type}
            </span>
            <span className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
              {post.field}
            </span>
            {isClosed ? (
              <span className="text-xs bg-gray-100 text-gray-400 px-3 py-1.5 rounded-full font-medium">
                {isExpired ? '기간만료' : '모집마감'}
              </span>
            ) : (
              <>
                {daysLeft <= 3 && daysLeft >= 0 && (
                  <span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-bold bg-red-50 text-red-500 border border-red-200">
                    <IconFlame size={11} /> 마감임박
                  </span>
                )}
                {spotsLeft <= 2 && spotsLeft > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-bold bg-amber-50 text-amber-600 border border-amber-200">
                    <IconAlertCircle size={11} /> 자리 {spotsLeft}개
                  </span>
                )}
              </>
            )}
          </div>

          {/* 제목 */}
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-snug mb-5 tracking-tight">
            {post.title}
          </h1>

          {/* 설명 */}
          <p className="text-gray-600 text-base leading-[1.85] whitespace-pre-wrap">
            {post.description}
          </p>
        </div>

        {/* ── 포스터 (동아리) ── */}
        {post.type === 'club' && post.poster && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <Image
              src={post.poster}
              alt="동아리 포스터"
              width={800}
              height={1000}
              className="w-full h-auto max-h-[480px] object-contain"
              style={{ display: 'block' }}
            />
          </div>
        )}

        {/* ── 모집 역할 (team) ── */}
        {post.type === 'team' && post.roles.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">모집 역할</p>
            <div className="space-y-2.5">
              {post.roles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between px-5 py-3.5 rounded-xl border"
                  style={{ borderColor: `${accent}30`, background: `${accent}08` }}
                >
                  <span className="font-semibold text-gray-800">{role.name}</span>
                  <span className="text-sm font-bold" style={{ color: accent }}>{role.count}명 모집</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 모집 정보 + 지원 ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
          {/* 통계 3열 */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-xs text-gray-400 mb-1.5 flex items-center gap-1">
                <IconCalendar size={12} /> 마감일
              </p>
              <p
                className="text-base font-bold"
                style={!isClosed && daysLeft <= 3 ? { color: '#EF4444' } : { color: '#111827' }}
              >
                {deadline.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
              </p>
              {!isExpired && (
                <p className="text-sm font-bold mt-0.5" style={{ color: !isClosed && daysLeft <= 3 ? '#EF4444' : accent }}>
                  D-{daysLeft}
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1.5 flex items-center gap-1">
                <IconCount size={12} /> 참여 인원
              </p>
              <p className="text-base font-bold text-gray-900">{post.current}명</p>
              <p className="text-sm text-gray-400 mt-0.5">/ {post.capacity}명</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1.5">잔여 자리</p>
              <p className={`text-base font-bold ${isClosed ? 'text-gray-400' : spotsLeft <= 2 ? 'text-amber-500' : 'text-gray-900'}`}>
                {isClosed ? '마감' : `${spotsLeft}자리`}
              </p>
              <p className="text-sm text-gray-400 mt-0.5">{fillPct}% 참여</p>
            </div>
          </div>

          {/* 프로그레스 바 */}
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-6">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${fillPct}%`,
                background: isClosed ? '#D1D5DB' : fillPct >= 80 ? '#EF4444' : accent,
              }}
            />
          </div>

          {/* 지원 */}
          <ApplyForm
            postId={post.id}
            roles={post.roles}
            isTeam={post.type === 'team'}
            isClosed={isClosed}
            applyMode={post.applyMode}
            applyLink={post.applyLink}
          />

          {/* 지원 현황 링크 */}
          {post.applyMode === 'form' && (
            <Link
              href={`/posts/${post.id}/applications`}
              className="flex items-center justify-between mt-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-100 transition-all text-sm"
            >
              <span className="flex items-center gap-2 text-gray-500 font-medium">
                <IconCount size={13} /> 지원 현황 확인
              </span>
              <span className="font-bold text-gray-800">{post._count.applications}명 지원</span>
            </Link>
          )}

          <p className="text-xs text-gray-300 mt-4 text-right">
            등록 {new Date(post.createdAt).toLocaleDateString('ko-KR')}
          </p>
        </div>

      </div>
    </div>
  )
}
