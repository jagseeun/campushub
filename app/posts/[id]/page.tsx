import Link from 'next/link'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Header from '@/components/Header'
import { prisma } from '@/lib/prisma'

const TYPE_ICONS: Record<string, string> = {
  study: '📚',
  club: '🏫',
  team: '👥',
}

const TYPE_LABELS: Record<string, string> = {
  study: '스터디',
  club: '동아리',
  team: '팀원모집',
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
    include: { roles: true },
  })

  if (!post) notFound()

  const now = new Date()
  const deadline = new Date(post.deadline)
  const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const spotsLeft = post.capacity - post.current

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        right={
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← 목록으로
          </Link>
        }
      />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {post.type === 'club' && post.poster && (
            <div className="relative w-full h-64 bg-gray-100">
              <Image
                src={post.poster}
                alt="동아리 포스터"
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-sm font-medium bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                {TYPE_ICONS[post.type]} {TYPE_LABELS[post.type] ?? post.type}
              </span>
              {daysLeft <= 3 && daysLeft >= 0 && (
                <span className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded-full font-medium">
                  🔥 마감임박
                </span>
              )}
              {spotsLeft <= 2 && spotsLeft > 0 && (
                <span className="text-sm bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-medium">
                  ⚠ 자리 {spotsLeft}개 남음
                </span>
              )}
              {spotsLeft <= 0 && (
                <span className="text-sm bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-medium">
                  모집 마감
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-6">{post.title}</h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-xs text-gray-400 mb-1">분야</p>
                <p className="font-medium text-gray-800">{post.field}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">모집 인원</p>
                <p className="font-medium text-gray-800">
                  {post.current} / {post.capacity}명
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">마감일</p>
                <p className={`font-medium ${daysLeft <= 3 && daysLeft >= 0 ? 'text-red-500' : 'text-gray-800'}`}>
                  {deadline.toLocaleDateString('ko-KR')}
                  {daysLeft >= 0 && ` (D-${daysLeft})`}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">등록일</p>
                <p className="font-medium text-gray-800">
                  {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">소개</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{post.description}</p>
            </div>

            {post.type === 'team' && post.roles.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">모집 역할</h2>
                <div className="space-y-2">
                  {post.roles.map((role) => (
                    <div
                      key={role.id}
                      className="flex items-center justify-between px-4 py-3 bg-purple-50 rounded-lg"
                    >
                      <span className="font-medium text-purple-800">{role.name}</span>
                      <span className="text-sm text-purple-600 bg-white px-2.5 py-1 rounded-full border border-purple-200">
                        {role.count}명
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Link
                href="/"
                className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                목록으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
