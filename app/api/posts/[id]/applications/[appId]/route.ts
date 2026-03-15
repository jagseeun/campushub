import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; appId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const { id, appId } = await params
  const postId = parseInt(id)
  const applicationId = parseInt(appId)

  if (isNaN(postId) || isNaN(applicationId)) {
    return NextResponse.json({ error: '유효하지 않은 요청입니다.' }, { status: 400 })
  }

  const post = await prisma.post.findUnique({ where: { id: postId } })
  if (!post) {
    return NextResponse.json({ error: '게시물을 찾을 수 없습니다.' }, { status: 404 })
  }
  if (post.creatorId !== session.user.id) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
  }

  const body = await request.json()
  const { action, reviewNote } = body

  if (!['accept', 'reject', 'pending'].includes(action)) {
    return NextResponse.json({ error: '유효하지 않은 액션입니다.' }, { status: 400 })
  }

  const statusMap: Record<string, string> = {
    accept: 'accepted',
    reject: 'rejected',
    pending: 'pending',
  }

  const application = await prisma.application.update({
    where: { id: applicationId, postId },
    data: {
      status: statusMap[action],
      reviewNote: reviewNote?.trim() || null,
    },
  })

  return NextResponse.json(application)
}
