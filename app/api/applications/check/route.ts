import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get('name')?.trim()
  const contact = request.nextUrl.searchParams.get('contact')?.trim()

  if (!name || !contact) {
    return NextResponse.json({ error: '이름과 연락처를 모두 입력해주세요.' }, { status: 400 })
  }

  const applications = await prisma.application.findMany({
    where: { name, contact },
    include: { post: { select: { title: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const result = applications.map((a) => ({
    id: a.id,
    postTitle: a.post.title,
    status: a.status,
    reviewNote: a.reviewNote,
    createdAt: a.createdAt,
  }))

  return NextResponse.json(result)
}
