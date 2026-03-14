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

      {/* ── 상단 컬러 스트라이프 ── */}
      <div style={{ height: 4, background: accent }} />

      {/* ── 메인 패널 (한 화면에 핵심 정보 전부) ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10 items-start">

            {/* ── 왼쪽: 포스트 정보 ── */}
            <div>
              {/* 배지 */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border"
                  style={{ color: accent, background: `${accent}12`, borderColor: `${accent}30` }}
                >
                  {TYPE_ICONS[post.type]} {TYPE_LABELS[post.type] ?? post.type}
                </span>
                <span className="text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200">
                  {post.field}
                </span>
                {isClosed ? (
                  <span className="text-xs bg-gray-100 text-gray-400 px-2.5 py-1 rounded-full font-medium">
                    {isExpired ? '기간만료' : '모집마감'}
                  </span>
                ) : (
                  <>
                    {daysLeft <= 3 && daysLeft >= 0 && (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold bg-red-50 text-red-500 border border-red-200">
                        <IconFlame size={11} /> 마감임박
                      </span>
                    )}
                    {spotsLeft <= 2 && spotsLeft > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold bg-amber-50 text-amber-600 border border-amber-200">
                        <IconAlertCircle size={11} /> 자리 {spotsLeft}개
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* 제목 */}
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-snug mb-4 tracking-tight">
                {post.title}
              </h1>

              {/* 설명 */}
              <p className="text-gray-600 text-[15px] leading-relaxed whitespace-pre-wrap">
                {post.description}
              </p>

              {/* 모집 역할 (team) */}
              {post.type === 'team' && post.roles.length > 0 && (
                <div className="mt-7">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">모집 역할</p>
                  <div className="flex flex-wrap gap-2">
                    {post.roles.map((role) => (
                      <div
                        key={role.id}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm"
                        style={{ borderColor: `${accent}40`, background: `${accent}08` }}
                      >
                        <span className="font-semibold text-gray-800">{role.name}</span>
                        <span className="font-bold text-xs" style={{ color: accent }}>{role.count}명</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── 오른쪽: 메타 + 지원 ── */}
            <div className="space-y-3 lg:sticky lg:top-6">

              {/* 모집 현황 */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                {/* 마감/인원 2열 */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                      <IconCalendar size={11} /> 마감일
                    </p>
                    <p
                      className="text-sm font-bold"
                      style={!isClosed && daysLeft <= 3 ? { color: '#EF4444' } : { color: '#111827' }}
                    >
                      {deadline.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                    </p>
                    {!isExpired && (
                      <p className="text-xs font-semibold mt-0.5" style={daysLeft <= 3 ? { color: '#EF4444' } : { color: accent }}>
                        D-{daysLeft}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                      <IconCount size={11} /> 참여 인원
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      {post.current} / {post.capacity}명
                    </p>
                    <p className={`text-xs font-semibold mt-0.5 ${isClosed ? 'text-gray-400' : spotsLeft <= 2 ? 'text-amber-500' : 'text-gray-400'}`}>
                      {isClosed ? '마감' : `${spotsLeft}자리 남음`}
                    </p>
                  </div>
                </div>

                {/* 프로그레스 */}
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${fillPct}%`,
                      background: isClosed
                        ? '#D1D5DB'
                        : fillPct >= 80
                          ? '#EF4444'
                          : accent,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5 text-right">{fillPct}%</p>

                {/* 등록일 */}
                <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-200">
                  등록일 {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                </p>
              </div>

              {/* 지원하기 */}
              <div className="rounded-2xl border border-gray-100 bg-white p-4">
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
                  className="flex items-center justify-between w-full px-4 py-3 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all text-sm"
                >
                  <span className="flex items-center gap-2 text-gray-500">
                    <IconCount size={13} /> 지원 현황
                  </span>
                  <span className="font-bold text-gray-900">{post._count.applications}명 지원</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 포스터 (동아리, 스크롤 영역) ── */}
      {post.type === 'club' && post.poster && (
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <Image
              src={post.poster}
              alt="동아리 포스터"
              width={960}
              height={720}
              className="w-full h-auto object-contain"
              style={{ display: 'block' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
