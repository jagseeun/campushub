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
  study: <IconBook size={15} />,
  club:  <IconBuilding size={15} />,
  team:  <IconUsers size={15} />,
}
const TYPE_LABELS: Record<string, string> = {
  study: '스터디', club: '동아리', team: '팀원모집',
}
const TYPE_ACCENT: Record<string, string> = {
  study: '#6366F1',
  club:  '#8B5CF6',
  team:  '#3B82F6',
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

  const now      = new Date()
  const deadline = new Date(post.deadline)
  const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const spotsLeft = post.capacity - post.current
  const isExpired = daysLeft < 0
  const isFull    = spotsLeft <= 0
  const isClosed  = isExpired || isFull
  const fillPct   = Math.min(100, Math.round((post.current / post.capacity) * 100))
  const accent    = TYPE_ACCENT[post.type] ?? TYPE_ACCENT.study

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      <Header
        right={
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <IconArrowLeft size={14} /> 목록으로
          </Link>
        }
      />

      {/* ── 상단 타이틀 헤더 ── */}
      <div className="bg-white border-b border-gray-200" style={{ borderTop: `5px solid ${accent}` }}>
        <div className="max-w-5xl mx-auto px-6 py-10">
          {/* 배지 */}
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border"
              style={{ color: accent, background: `${accent}14`, borderColor: `${accent}35` }}
            >
              {TYPE_ICONS[post.type]} {TYPE_LABELS[post.type] ?? post.type}
            </span>
            <span className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
              {post.field}
            </span>
            {isClosed ? (
              <span className="text-xs bg-gray-100 text-gray-400 px-3 py-1.5 rounded-full font-semibold">
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
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight">
            {post.title}
          </h1>
        </div>
      </div>

      {/* ── 본문: 2컬럼 ── */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">

          {/* ── 왼쪽 콘텐츠 ── */}
          <div className="space-y-6">

            {/* 설명 */}
            <p className="text-gray-700 text-[16px] leading-[1.9] whitespace-pre-wrap px-1">
              {post.description}
            </p>

            {/* 포스터 (동아리) */}
            {post.type === 'club' && post.poster && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <Image
                  src={post.poster}
                  alt="포스터"
                  width={800}
                  height={1000}
                  className="w-full h-auto max-h-[500px] object-contain"
                  style={{ display: 'block' }}
                />
              </div>
            )}

            {/* 모집 역할 (팀) */}
            {post.type === 'team' && post.roles.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-7">
                <p className="text-sm font-bold text-gray-400 tracking-widest uppercase mb-5">모집 역할</p>
                <div className="space-y-3">
                  {post.roles.map((role) => (
                    <div
                      key={role.id}
                      className="flex items-center justify-between px-5 py-4 rounded-xl border"
                      style={{ borderColor: `${accent}30`, background: `${accent}08` }}
                    >
                      <span className="font-semibold text-gray-800 text-[15px]">{role.name}</span>
                      <span className="text-sm font-bold px-3 py-1 rounded-full bg-white border shadow-sm" style={{ color: accent, borderColor: `${accent}30` }}>
                        {role.count}명 모집
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── 오른쪽 스티키 카드 ── */}
          <div className="lg:sticky lg:top-6 space-y-4">

            {/* 모집 정보 */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-6">모집 정보</p>

              {/* 마감일 */}
              <div className="mb-5">
                <p className="text-sm text-gray-400 flex items-center gap-1.5 mb-1">
                  <IconCalendar size={13} /> 마감일
                </p>
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-2xl font-extrabold"
                    style={!isClosed && daysLeft <= 3 ? { color: '#EF4444' } : { color: '#111827' }}
                  >
                    {deadline.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                  </span>
                  {!isExpired && (
                    <span
                      className="text-sm font-bold px-2 py-0.5 rounded-full"
                      style={
                        daysLeft <= 3
                          ? { color: '#EF4444', background: '#FEF2F2' }
                          : { color: accent, background: `${accent}14` }
                      }
                    >
                      D-{daysLeft}
                    </span>
                  )}
                </div>
              </div>

              {/* 참여 인원 */}
              <div className="mb-5">
                <p className="text-sm text-gray-400 flex items-center gap-1.5 mb-1">
                  <IconCount size={13} /> 참여 인원
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-gray-900">{post.current}</span>
                  <span className="text-base text-gray-400">/ {post.capacity}명</span>
                </div>
              </div>

              {/* 프로그레스 */}
              <div className="mb-2">
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${fillPct}%`,
                      background: isClosed ? '#D1D5DB' : fillPct >= 80 ? '#EF4444' : accent,
                    }}
                  />
                </div>
                <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                  <span>{fillPct}% 채워졌어요</span>
                  <span className={isClosed ? 'text-gray-400' : spotsLeft <= 2 ? 'text-amber-500 font-bold' : ''}>
                    {isClosed ? '마감됨' : `${spotsLeft}자리 남음`}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-300 mt-5 pt-4 border-t border-gray-100">
                등록 {new Date(post.createdAt).toLocaleDateString('ko-KR')}
              </p>
            </div>

            {/* 지원 카드 */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <ApplyForm
                postId={post.id}
                roles={post.roles}
                isTeam={post.type === 'team'}
                isClosed={isClosed}
                applyMode={post.applyMode}
                applyLink={post.applyLink}
              />
            </div>

            {/* 지원 현황 */}
            {post.applyMode === 'form' && (
              <Link
                href={`/posts/${post.id}/applications`}
                className="flex items-center justify-between w-full px-5 py-4 bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <span className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                  <IconCount size={14} /> 지원 현황 확인
                </span>
                <span className="text-base font-bold text-gray-800">{post._count.applications}명 지원</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
