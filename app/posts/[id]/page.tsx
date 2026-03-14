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
  study: <IconBook size={16} />,
  club: <IconBuilding size={16} />,
  team: <IconUsers size={16} />,
}
const TYPE_LABELS: Record<string, string> = {
  study: '스터디', club: '동아리', team: '팀원모집',
}
const TYPE_GRADIENT: Record<string, string> = {
  study: 'from-indigo-700 via-indigo-600 to-violet-600',
  club: 'from-purple-700 via-purple-600 to-pink-600',
  team: 'from-blue-700 via-indigo-600 to-indigo-700',
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
  const gradient = TYPE_GRADIENT[post.type] ?? TYPE_GRADIENT.study

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        right={
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <IconArrowLeft size={14} />목록으로
          </Link>
        }
      />

      {/* ── HERO ── */}
      <div className={`bg-gradient-to-br ${gradient} pt-10 pb-16 px-4`}>
        <div className="max-w-5xl mx-auto">
          {/* 배지 row */}
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 text-white px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/30">
              {TYPE_ICONS[post.type]} {TYPE_LABELS[post.type] ?? post.type}
            </span>
            <span className="text-xs text-white/80 bg-white/15 px-3 py-1.5 rounded-full border border-white/20">
              {post.field}
            </span>
            {isClosed ? (
              <span className="text-xs bg-black/30 text-white/70 px-3 py-1.5 rounded-full font-medium border border-white/10">
                {isExpired ? '기간만료' : '모집마감'}
              </span>
            ) : (
              <>
                {daysLeft <= 3 && daysLeft >= 0 && (
                  <span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-bold bg-red-500/90 text-white border border-red-400/50">
                    <IconFlame size={12} /> 마감임박
                  </span>
                )}
                {spotsLeft <= 2 && spotsLeft > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-bold bg-amber-500/90 text-white border border-amber-400/50">
                    <IconAlertCircle size={12} /> 자리 {spotsLeft}개
                  </span>
                )}
              </>
            )}
          </div>

          {/* 제목 */}
          <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-6 tracking-tight">
            {post.title}
          </h1>

          {/* 핵심 메타 */}
          <div className="flex items-center gap-6 flex-wrap text-white/80 text-sm">
            <span className="flex items-center gap-2">
              <IconCalendar size={15} />
              <span>
                마감 {deadline.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                {!isExpired && <span className="ml-1.5 font-semibold text-white">D-{daysLeft}</span>}
              </span>
            </span>
            <span className="flex items-center gap-2">
              <IconCount size={15} />
              <span>
                {post.current} / {post.capacity}명 참여중
                <span className="ml-2 font-semibold text-white">{fillPct}%</span>
              </span>
            </span>
            <span className="text-white/50 text-xs">
              등록 {new Date(post.createdAt).toLocaleDateString('ko-KR')}
            </span>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-5xl mx-auto px-4 -mt-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">

          {/* ── 왼쪽: 메인 콘텐츠 ── */}
          <div className="space-y-5">

            {/* 포스터 (동아리일 때) */}
            {post.type === 'club' && post.poster && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 pt-6 pb-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">동아리 포스터</p>
                </div>
                <div className="flex items-center justify-center bg-gray-50 border-t border-gray-100">
                  <Image
                    src={post.poster}
                    alt="동아리 포스터"
                    width={900}
                    height={700}
                    className="w-full h-auto max-h-[520px] object-contain"
                    style={{ display: 'block' }}
                  />
                </div>
              </div>
            )}

            {/* 소개 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">소개</h2>
              <p className="text-gray-700 leading-[1.9] whitespace-pre-wrap text-[15px]">
                {post.description}
              </p>
            </div>

            {/* 모집 역할 (team) */}
            {post.type === 'team' && post.roles.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">모집 역할</h2>
                <div className="space-y-3">
                  {post.roles.map((role) => (
                    <div
                      key={role.id}
                      className="flex items-center justify-between px-5 py-4 bg-indigo-50 rounded-xl border border-indigo-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-400" />
                        <span className="font-semibold text-gray-800">{role.name}</span>
                      </div>
                      <span className="text-sm font-bold text-indigo-600 bg-white px-3 py-1.5 rounded-full border border-indigo-200 shadow-sm">
                        {role.count}명 모집
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── 오른쪽: 스티키 사이드바 ── */}
          <div className="space-y-4 lg:sticky lg:top-6">

            {/* 모집 현황 카드 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">모집 현황</h3>

              {/* 프로그레스 */}
              <div className="mb-5">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-3xl font-extrabold text-gray-900">{post.current}</span>
                  <span className="text-gray-400 text-sm mb-1">/ {post.capacity}명</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${fillPct}%`,
                      background: isClosed
                        ? '#D1D5DB'
                        : fillPct >= 80
                          ? '#EF4444'
                          : 'linear-gradient(90deg, #6366F1, #8B5CF6)',
                    }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5 text-right">{fillPct}% 채워졌어요</p>
              </div>

              {/* 마감일 */}
              <div className="flex items-center justify-between py-3.5 border-t border-gray-100">
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <IconCalendar size={14} /> 마감일
                </span>
                <span
                  className="text-sm font-bold"
                  style={!isClosed && daysLeft <= 3 ? { color: '#EF4444' } : { color: '#111827' }}
                >
                  {deadline.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                  {!isExpired && (
                    <span className="ml-1.5 text-xs font-semibold text-gray-400">D-{daysLeft}</span>
                  )}
                </span>
              </div>

              {/* 잔여 자리 */}
              <div className="flex items-center justify-between py-3.5 border-t border-gray-100">
                <span className="text-sm text-gray-500 flex items-center gap-2">
                  <IconCount size={14} /> 잔여 자리
                </span>
                <span className={`text-sm font-bold ${isClosed ? 'text-gray-400' : spotsLeft <= 2 ? 'text-amber-600' : 'text-gray-900'}`}>
                  {isClosed ? '마감' : `${spotsLeft}자리 남음`}
                </span>
              </div>

              {/* 등록일 */}
              <div className="flex items-center justify-between py-3.5 border-t border-gray-100">
                <span className="text-sm text-gray-500">등록일</span>
                <span className="text-sm text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </div>

            {/* 지원 카드 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <ApplyForm
                postId={post.id}
                roles={post.roles}
                isTeam={post.type === 'team'}
                isClosed={isClosed}
                applyMode={post.applyMode}
                applyLink={post.applyLink}
              />
            </div>

            {/* 지원 현황 링크 */}
            {post.applyMode === 'form' && (
              <Link
                href={`/posts/${post.id}/applications`}
                className="flex items-center justify-between w-full px-5 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all text-sm text-gray-500 hover:text-indigo-600"
              >
                <span className="flex items-center gap-2 font-medium">
                  <IconCount size={15} />
                  지원 현황 확인
                </span>
                <span className="text-indigo-600 font-extrabold text-lg">{post._count.applications}명</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
