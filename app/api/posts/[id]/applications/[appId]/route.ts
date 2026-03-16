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

  const existing = await prisma.application.findUnique({
    where: { id: applicationId, postId },
    select: { status: true },
  })
  if (!existing) {
    return NextResponse.json({ error: '지원서를 찾을 수 없습니다.' }, { status: 404 })
  }

  const newStatus = statusMap[action]
  const wasAccepted = existing.status === 'accepted'
  const willBeAccepted = newStatus === 'accepted'

  if (willBeAccepted && !wasAccepted && post.current >= post.capacity) {
    return NextResponse.json({ error: '모집 인원이 이미 마감되었습니다.' }, { status: 400 })
  }

  const currentDelta = willBeAccepted && !wasAccepted ? 1
    : !willBeAccepted && wasAccepted ? -1
    : 0

  const [application] = await prisma.$transaction([
    prisma.application.update({
      where: { id: applicationId, postId },
      data: {
        status: newStatus,
        reviewNote: reviewNote?.trim() || null,
      },
    }),
    ...(currentDelta !== 0 ? [prisma.post.update({
      where: { id: postId },
      data: { current: { increment: currentDelta } },
    })] : []),
  ])

  return NextResponse.json(application)
}
