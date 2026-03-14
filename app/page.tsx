import { Suspense } from 'react'
import Link from 'next/link'
import PostCard from '@/components/PostCard'
import FilterBar from '@/components/FilterBar'
import SearchBar from '@/components/SearchBar'
import Header from '@/components/Header'
import { prisma } from '@/lib/prisma'
import { POST_TYPES, FIELDS } from '@/types'
import { Prisma } from '@prisma/client'

async function getPosts(searchParams: Record<string, string>) {
  const { type, field, filter, q } = searchParams
  const now = new Date()
  const where: Prisma.PostWhereInput = {}

  if (type && (POST_TYPES as readonly string[]).includes(type)) where.type = type
  if (field && (FIELDS as readonly string[]).includes(field)) where.field = field
  if (q?.trim()) {
    where.OR = [
      { title: { contains: q.trim(), mode: 'insensitive' } },
      { description: { contains: q.trim(), mode: 'insensitive' } },
    ]
  }
  if (filter === 'deadline_soon') {
    const threeDaysLater = new Date(now)
    threeDaysLater.setDate(threeDaysLater.getDate() + 3)
    where.deadline = { gte: now, lte: threeDaysLater }
  }

  const posts = await prisma.post.findMany({
    where,
    include: { roles: true },
    orderBy: { createdAt: 'desc' },
  })

  const filtered =
    filter === 'spots_soon'
      ? posts.filter((p) => p.capacity - p.current <= 2 && p.current < p.capacity)
      : posts

  // Date → string 직렬화 (클라이언트 컴포넌트로 전달 전)
  return filtered.map((p) => ({
    ...p,
    deadline: p.deadline.toISOString(),
    createdAt: p.createdAt.toISOString(),
  }))
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params = await searchParams
  const posts = await getPosts(params)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        right={
          <Link
            href="/posts/new"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            + 모집글 작성
          </Link>
        }
      />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">모집 공고</h1>
          <p className="text-gray-500 text-sm">동아리, 스터디, 팀원을 찾아보세요</p>
        </div>

        <div className="mb-6 space-y-4">
          <Suspense>
            <SearchBar />
          </Suspense>
          <Suspense>
            <FilterBar />
          </Suspense>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">😕</p>
            <p className="text-lg font-medium">모집 공고가 없습니다</p>
            <p className="text-sm mt-1">다른 필터를 시도해보세요</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
