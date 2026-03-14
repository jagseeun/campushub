import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const numId = parseInt(id)

  if (isNaN(numId) || numId < 1) {
    return NextResponse.json({ error: '유효하지 않은 ID입니다.' }, { status: 400 })
  }

  const post = await prisma.post.findUnique({
    where: { id: numId },
    include: { roles: true },
  })

  if (!post) {
    return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 })
  }

  return NextResponse.json(post)
}
