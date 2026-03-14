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

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      <Header
        right={
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
            <IconArrowLeft size={14} />목록으로
          </Link>
        }
      />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 포스터 — 전체 표시 (잘림 없음) */}
        {post.type === 'club' && post.poster && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden mb-6 flex items-center justify-center">
            <Image
              src={post.poster}
              alt="동아리 포스터"
              width={800}
              height={600}
              className="w-full h-auto max-h-[480px] object-contain"
              style={{ display: 'block' }}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
          {/* ── 왼쪽: 메인 콘텐츠 ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 md:p-8">
              {/* 배지 row */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-brand-50 text-brand-700 px-3 py-1 rounded-full border border-brand-100">
                  {TYPE_ICONS[post.type]} {TYPE_LABELS[post.type] ?? post.type}
                </span>
                <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                  {post.field}
                </span>
                {isClosed ? (
                  <span className="text-xs bg-gray-100 text-gray-400 px-3 py-1 rounded-full font-medium">
                    {isExpired ? '기간만료' : '모집마감'}
                  </span>
                ) : (
                  <>
                    {daysLeft <= 3 && daysLeft >= 0 && (
                      <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-medium"
                        style={{ color: 'var(--color-urgent-text)', background: 'var(--color-urgent-bg)' }}>
                        <IconFlame size={12} /> 마감임박
                      </span>
                    )}
                    {spotsLeft <= 2 && spotsLeft > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-medium"
                        style={{ color: 'var(--color-warn-text)', background: 'var(--color-warn-bg)' }}>
                        <IconAlertCircle size={12} /> 자리 {spotsLeft}개
                      </span>
                    )}
                  </>
                )}
              </div>

              <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 leading-snug">
                {post.title}
              </h1>

              {/* 소개 */}
              <section className="mb-8">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">소개</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-[15px]">
                  {post.description}
                </p>
              </section>

              {/* 모집 역할 (team) */}
              {post.type === 'team' && post.roles.length > 0 && (
                <section>
                  <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">모집 역할</h2>
                  <div className="space-y-2">
                    {post.roles.map((role) => (
                      <div key={role.id} className="flex items-center justify-between px-4 py-3 bg-brand-50 rounded-xl border border-brand-100">
                        <span className="font-medium text-gray-800 text-sm">{role.name}</span>
                        <span className="text-xs font-semibold text-brand-600 bg-white px-2.5 py-1 rounded-full border border-brand-200">
                          {role.count}명 모집
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* ── 오른쪽: 사이드바 ── */}
          <div className="space-y-4">
            {/* 모집 정보 카드 */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">모집 정보</h3>

              <div className="space-y-3">
                {/* 마감일 */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 flex items-center gap-1.5">
                    <IconCalendar size={13} />마감일
                  </span>
                  <span className="text-sm font-semibold"
                    style={!isClosed && daysLeft <= 3 ? { color: 'var(--color-urgent-text)' } : { color: '#111827' }}>
                    {deadline.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                    {!isExpired && (
                      <span className="ml-1.5 text-xs font-normal text-gray-400">D-{daysLeft}</span>
                    )}
                  </span>
                </div>

                {/* 참여 인원 */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 flex items-center gap-1.5">
                    <IconCount size={13} />참여 인원
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {post.current} / {post.capacity}명
                  </span>
                </div>

                {/* 프로그레스 바 */}
                <div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${fillPct}%`,
                        background: isClosed ? '#D1D5DB' : fillPct >= 80 ? 'var(--color-urgent-bar)' : '#6366F1',
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1 text-right">{fillPct}% 찼어요</p>
                </div>

                {/* 등록일 */}
                <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                  <span className="text-xs text-gray-400">등록일</span>
                  <span className="text-xs text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>
            </div>

            {/* 지원하기 카드 */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <ApplyForm
                postId={post.id}
                roles={post.roles}
                isTeam={post.type === 'team'}
                isClosed={isClosed}
                applyMode={post.applyMode}
                applyLink={post.applyLink}
              />
            </div>

            {/* 지원 현황 링크 (form 모드일 때만) */}
            {post.applyMode === 'form' && (
              <Link
                href={`/posts/${post.id}/applications`}
                className="flex items-center justify-between w-full px-4 py-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-brand-200 transition-colors text-sm text-gray-500 hover:text-brand-600"
              >
                <span className="flex items-center gap-2">
                  <IconCount size={14} />
                  지원 현황 확인
                </span>
                <span className="text-brand-600 font-bold text-base">{post._count.applications}명</span>
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
