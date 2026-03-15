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

  const now       = new Date()
  const deadline  = new Date(post.deadline)
  const daysLeft  = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const spotsLeft = post.capacity - post.current
  const isExpired = daysLeft < 0
  const isFull    = spotsLeft <= 0
  const isClosed  = isExpired || isFull
  const fillPct   = Math.min(100, Math.round((post.current / post.capacity) * 100))
  const accent    = TYPE_ACCENT[post.type] ?? TYPE_ACCENT.study
  const hasPoster = post.type === 'club' && !!post.poster

  // 배지 행 (공통)
  const badges = (
    <div className="flex items-center gap-2 flex-wrap">
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
  )

  // 정보 통계 블록 (공통)
  const statsBlock = (
    <>
      {/* 마감일 행 */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
            <IconCalendar size={12} /> 마감일
          </p>
          <p
            className="text-2xl font-extrabold"
            style={!isClosed && daysLeft <= 3 ? { color: '#EF4444' } : { color: '#111827' }}
          >
            {deadline.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
          </p>
        </div>
        {!isExpired && (
          <span
            className="text-sm font-bold px-3 py-1.5 rounded-full"
            style={daysLeft <= 3
              ? { color: '#EF4444', background: '#FEF2F2' }
              : { color: accent, background: `${accent}14` }}
          >
            D-{daysLeft}
          </span>
        )}
      </div>

      {/* 인원 + 진행바 */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400 flex items-center gap-1">
            <IconCount size={13} /> 참여 인원
          </span>
          <span className="font-bold text-gray-900">{post.current} / {post.capacity}명</span>
        </div>
        <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${fillPct}%`,
              background: isClosed ? '#D1D5DB' : fillPct >= 80 ? '#EF4444' : accent,
            }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-xs text-gray-400">
          <span>{fillPct}% 채워졌어요</span>
          <span className={!isClosed && spotsLeft <= 2 ? 'text-amber-500 font-bold' : ''}>
            {isClosed ? '마감됨' : `${spotsLeft}자리 남음`}
          </span>
        </div>
      </div>

      {/* 모집 역할 */}
      {post.roles.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-3">모집 역할</p>
          <div className="flex flex-wrap gap-2">
            {post.roles.map((role) => (
              <div
                key={role.id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-gray-50 text-sm"
                style={{ borderColor: `${accent}30` }}
              >
                <span className="font-semibold text-gray-800">{role.name}</span>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ color: accent, background: `${accent}14` }}
                >
                  {role.count}명
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )

  if (hasPoster) {
    // ── 매거진 레이아웃 (포스터 있음) ──
    return (
      <div className="min-h-screen bg-[#F5F6FA] md:h-screen md:flex md:flex-col">
        <Header
          right={
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              <IconArrowLeft size={14} /> 목록으로
            </Link>
          }
        />

        {/* 모바일: 세로 스택 (페이지 스크롤) / 데스크톱: 좌우 분할 (사이드바 내부 스크롤) */}
        <div className="flex flex-col md:flex-row md:flex-1 md:overflow-hidden">
          {/* 포스터 영역 */}
          <div
            className="flex items-center justify-center relative overflow-hidden py-10 md:py-0 md:flex-1"
            style={{ background: `linear-gradient(135deg, ${accent}12 0%, #eef0f5 45%, ${accent}09 100%)` }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: 'radial-gradient(circle, #00000009 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            />
            <div className="relative z-10 w-full max-w-[260px] sm:max-w-[320px] md:max-w-[420px] aspect-[3/4]">
              <Image
                src={post.poster!}
                alt="포스터"
                fill
                sizes="(max-width: 640px) 260px, (max-width: 768px) 320px, 420px"
                className="object-contain"
                style={{ filter: 'drop-shadow(0 20px 48px rgba(0,0,0,0.22))' }}
              />
            </div>
          </div>

          {/* 사이드바 — 모바일: 자연 높이 / 데스크톱: 내부 스크롤 */}
          <div className="w-full md:w-[480px] bg-white border-t md:border-t-0 md:border-l border-gray-200 md:flex md:flex-col md:flex-shrink-0">
            <div
              className="h-1 shrink-0"
              style={{ background: `linear-gradient(90deg, ${accent}, ${accent}80)` }}
            />

            <div className="md:flex-1 md:overflow-y-auto md:min-h-0">
              <div className="px-5 md:px-8 pt-6 md:pt-7 pb-6 border-b border-gray-100">
                {badges}
                <h1 className="text-2xl md:text-[1.65rem] font-extrabold text-gray-900 leading-tight tracking-tight mt-4 mb-2.5">
                  {post.title}
                </h1>
                <p className="text-gray-400 text-[13px] leading-relaxed whitespace-pre-wrap">
                  {post.description}
                </p>
              </div>

              <div className="px-5 md:px-8 py-6 space-y-5 border-b border-gray-100">
                {statsBlock}
              </div>

              <div className="px-5 md:px-8 py-6 space-y-2">
                <ApplyForm
                  postId={post.id}
                  roles={post.roles}
                  isTeam={post.type === 'team'}
                  isClosed={isClosed}
                  applyMode={post.applyMode}
                  applyLink={post.applyLink}
                />
                {post.applyMode === 'form' && (
                  <Link
                    href={`/posts/${post.id}/applications`}
                    className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <span className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                      <IconCount size={13} /> 지원 현황 확인
                    </span>
                    <span className="text-sm font-bold text-gray-600">{post._count.applications}명 지원</span>
                  </Link>
                )}
              </div>

              <p className="px-5 md:px-8 pb-8 text-xs text-gray-300">
                등록 {new Date(post.createdAt).toLocaleDateString('ko-KR')}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── 대시보드 레이아웃 (포스터 없음) ──
  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      <Header
        right={
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <IconArrowLeft size={14} /> 목록으로
          </Link>
        }
      />

      {/* 헤더 밴드 */}
      <div className="bg-white border-b border-gray-200" style={{ borderTop: `4px solid ${accent}` }}>
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-5">
          {badges}
          <h1 className="text-2xl font-extrabold text-gray-900 leading-tight tracking-tight mt-4 mb-2">
            {post.title}
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-wrap max-w-2xl">
            {post.description}
          </p>
        </div>
      </div>

      {/* 본문 2컬럼 */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">

          {/* 모집 정보 카드 */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden lg:sticky lg:top-6">
            <div className="h-1 rounded-t-2xl" style={{ background: accent }} />
            <div className="p-6">
              <p className="text-xs font-bold text-gray-400 tracking-widest uppercase mb-5">모집 정보</p>
              <div className="space-y-5">
                {statsBlock}
              </div>
              <p className="text-xs text-gray-300 pt-5 mt-5 border-t border-gray-100">
                등록 {new Date(post.createdAt).toLocaleDateString('ko-KR')}
              </p>
            </div>
          </div>

          {/* 지원 카드 */}
          <div className="lg:sticky lg:top-6 space-y-3">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="h-1 rounded-t-2xl" style={{ background: accent }} />
              <div className="p-6">
                <ApplyForm
                  postId={post.id}
                  roles={post.roles}
                  isTeam={post.type === 'team'}
                  isClosed={isClosed}
                  applyMode={post.applyMode}
                  applyLink={post.applyLink}
                />
              </div>
            </div>

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
