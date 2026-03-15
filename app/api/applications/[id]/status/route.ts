import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const appId = parseInt(id)
  const token = request.nextUrl.searchParams.get('token')

  if (isNaN(appId) || !token) {
    return NextResponse.json({ error: '유효하지 않은 요청입니다.' }, { status: 400 })
  }

  const application = await prisma.application.findUnique({
    where: { id: appId },
    include: { post: { select: { title: true } } },
  })

  if (!application || application.statusToken !== token) {
    return NextResponse.json({ error: '접근 권한이 없습니다.' }, { status: 403 })
  }

  return NextResponse.json({
    status: application.status,
    reviewNote: application.reviewNote,
    postTitle: application.post.title,
  })
}
