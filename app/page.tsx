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
  const isFiltered = !!(params.type || params.field || params.filter || params.q)

  return (
    <div className="min-h-screen bg-[#F6F0E6]">
      <Header
        right={
          <Link
            href="/posts/new"
            className="bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors shadow-sm shadow-brand-200"
          >
            + 모집글 작성
          </Link>
        }
      />

      <main className="max-w-6xl mx-auto px-4 pb-16">
        {/* Hero */}
        <div className="relative bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 rounded-3xl overflow-hidden mt-6 mb-6 px-8 py-10">
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                'radial-gradient(ellipse at 90% 10%, #C2A484 0%, transparent 55%), radial-gradient(ellipse at 10% 90%, #F0E6DA 0%, transparent 40%)',
            }}
          />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <p className="text-brand-200 text-sm font-medium mb-1">CampusHub</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-2">
                캠퍼스의 모든 모집,<br className="hidden sm:block" /> 한 곳에서
              </h1>
              <p className="text-brand-200 text-sm">동아리 · 스터디 · 팀원을 지금 찾아보세요</p>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <p className="text-5xl font-black text-white leading-none">{posts.length}</p>
              <p className="text-brand-200 text-sm mt-1">
                {isFiltered ? '검색 결과' : '현재 모집 중'}
              </p>
            </div>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="mb-6 space-y-3">
          <Suspense>
            <SearchBar />
          </Suspense>
          <Suspense>
            <FilterBar />
          </Suspense>
        </div>

        {/* Grid */}
        {posts.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg font-bold text-gray-700 mb-1">결과가 없어요</p>
            <p className="text-sm text-gray-400">다른 키워드나 필터를 시도해보세요</p>
            {isFiltered && (
              <Link href="/" className="inline-block mt-6 text-sm text-brand-600 hover:underline font-medium">
                필터 초기화
              </Link>
            )}
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
