import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const postId = parseInt(id)

  if (isNaN(postId) || postId < 1) {
    return NextResponse.json({ error: '유효하지 않은 게시물입니다.' }, { status: 400 })
  }

  const post = await prisma.post.findUnique({ where: { id: postId } })
  if (!post) {
    return NextResponse.json({ error: '게시물을 찾을 수 없습니다.' }, { status: 404 })
  }

  const now = new Date()
  if (post.deadline < now || post.current >= post.capacity) {
    return NextResponse.json({ error: '마감된 모집입니다.' }, { status: 400 })
  }

  const body = await request.json()
  const { name, contact, roleWanted, message } = body

  if (!name?.trim()) return NextResponse.json({ error: '이름을 입력해주세요.' }, { status: 400 })
  if (!contact?.trim()) return NextResponse.json({ error: '연락처를 입력해주세요.' }, { status: 400 })
  if (!message?.trim()) return NextResponse.json({ error: '지원 메시지를 입력해주세요.' }, { status: 400 })

  // 중복 지원 체크
  const existing = await prisma.application.findFirst({
    where: { postId, contact: contact.trim() },
  })
  if (existing) {
    return NextResponse.json({ error: '이미 이 모집에 지원하셨습니다.' }, { status: 409 })
  }

  const statusToken = randomBytes(32).toString('hex')

  const application = await prisma.application.create({
    data: {
      postId,
      name: name.trim(),
      contact: contact.trim(),
      roleWanted: roleWanted?.trim() || null,
      message: message.trim(),
      statusToken,
    },
  })

  return NextResponse.json({ ...application, statusToken }, { status: 201 })
}
