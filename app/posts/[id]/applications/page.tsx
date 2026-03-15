import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { IconArrowLeft, IconUsers, IconCalendar } from '@/components/Icons'
import { prisma } from '@/lib/prisma'

export default async function ApplicationsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const numId = parseInt(id)
  if (isNaN(numId) || numId < 1) notFound()

  const post = await prisma.post.findUnique({
    where: { id: numId },
    include: {
      applications: { orderBy: { createdAt: 'desc' } },
    },
  })
  if (!post) notFound()

  const apps = post.applications

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
            <div>
              <p className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">지원 현황</p>
              <h1 className="text-lg font-bold text-gray-900 leading-snug">{post.title}</h1>
            </div>
            <div className="text-right shrink-0">
              <p className="text-3xl font-black text-brand-600 leading-none">{apps.length}</p>
              <p className="text-xs text-gray-400 mt-0.5">총 지원자</p>
            </div>
          </div>

          {apps.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <IconCalendar size={12} />
                최근 지원: {new Date(apps[0].createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
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
              <div key={app.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start gap-4">
                  {/* 번호 */}
                  <span className="shrink-0 w-8 h-8 rounded-full bg-brand-50 text-brand-600 text-sm font-bold flex items-center justify-center">
                    {apps.length - idx}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">{app.name}</span>
                        {app.roleWanted && (
                          <span className="text-xs bg-brand-50 text-brand-700 px-2.5 py-0.5 rounded-full font-medium border border-brand-100">
                            {app.roleWanted}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">
                        {new Date(app.createdAt).toLocaleDateString('ko-KR', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 mb-3 flex items-center gap-1.5">
                      <span className="font-medium text-gray-600">{app.contact}</span>
                    </p>

                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg px-4 py-3">
                      {app.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
