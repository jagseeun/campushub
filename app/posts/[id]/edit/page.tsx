import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import EditPostForm from '@/components/EditPostForm'
import Header from '@/components/Header'
import Link from 'next/link'
import { IconArrowLeft } from '@/components/Icons'
import type { Prisma } from '@prisma/client'

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const numId = parseInt(id)
  if (isNaN(numId) || numId < 1) notFound()

  const session = await auth()
  if (!session?.user?.id) {
    redirect(`/api/auth/signin?callbackUrl=/posts/${numId}/edit`)
  }

  const post = await prisma.post.findUnique({
    where: { id: numId },
    include: { roles: true },
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

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      <Header
        right={
          <Link href={`/posts/${numId}/manage`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
            <IconArrowLeft size={14} />취소
          </Link>
        }
      />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <EditPostForm post={post} />
      </main>
    </div>
  )
}
