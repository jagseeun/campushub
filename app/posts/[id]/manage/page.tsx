import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import ApplicationRow from '@/components/ApplicationRow'
import DeletePostButton from '@/components/DeletePostButton'
import { IconArrowLeft, IconUsers, IconCalendar, IconEdit } from '@/components/Icons'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export default async function ManagePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const numId = parseInt(id)
  if (isNaN(numId) || numId < 1) notFound()

  const session = await auth()
  if (!session?.user?.id) {
    redirect(`/api/auth/signin?callbackUrl=/posts/${numId}/manage`)
  }

  const post = await prisma.post.findUnique({
    where: { id: numId },
    include: {
      applications: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!post) notFound()
  if (post.creatorId !== session.user.id) {
    return (
      <div className="min-h-screen bg-[#F8F9FF] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 font-medium mb-2">접근 권한이 없습니다.</p>
          <Link href={`/posts/${numId}`} className="text-sm text-brand-600 hover:underline">
            게시글로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  const apps = post.applications

  const statusCounts = {
    pending: apps.filter((a) => a.status === 'pending').length,
    accepted: apps.filter((a) => a.status === 'accepted').length,
    rejected: apps.filter((a) => a.status === 'rejected').length,
  }

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      <Header
        right={
          <Link href={`/posts/${numId}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
            <IconArrowLeft size={14} />게시글로
          </Link>
        }
      />

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">지원자 관리</p>
              <h1 className="text-lg font-bold text-gray-900 leading-snug">{post.title}</h1>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/posts/${numId}/edit`}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <IconEdit size={13} />수정
              </Link>
              <DeletePostButton postId={numId} />
              <div className="text-right">
                <p className="text-3xl font-black text-brand-600 leading-none">{apps.length}</p>
                <p className="text-xs text-gray-400 mt-0.5">총 지원자</p>
              </div>
            </div>
          </div>

          {apps.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-6 text-xs">
              <span className="text-gray-400 flex items-center gap-1">
                <IconCalendar size={12} />
                최근 지원: {new Date(apps[0].createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
              <div className="flex items-center gap-3 ml-auto">
                <span className="text-gray-500">대기 <strong className="text-gray-800">{statusCounts.pending}</strong></span>
                <span className="text-green-600">합격 <strong>{statusCounts.accepted}</strong></span>
                <span className="text-red-500">불합격 <strong>{statusCounts.rejected}</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* 지원자 목록 */}
        {apps.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <IconUsers size={40} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium mb-1">아직 지원자가 없어요</p>
            <p className="text-sm text-gray-400">지원서가 들어오면 여기에 표시됩니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {apps.map((app, idx) => (
              <ApplicationRow
                key={app.id}
                app={{
                  ...app,
                  reviewNote: app.reviewNote ?? null,
                  createdAt: app.createdAt.toISOString(),
                }}
                postId={numId}
                idx={idx}
                total={apps.length}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
