import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { POST_TYPES, FIELDS } from '@/types'

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const { id } = await params
  const numId = parseInt(id)
  if (isNaN(numId) || numId < 1) {
    return NextResponse.json({ error: '유효하지 않은 ID입니다.' }, { status: 400 })
  }

  const post = await prisma.post.findUnique({ where: { id: numId } })
  if (!post) return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 })
  if (post.creatorId !== session.user.id) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
  }

  const body = await request.json()
  const { type, title, field, capacity, current, deadline, description, poster, roles, applyMode, applyLink, showApplicantCount } = body

  if (!type || !(POST_TYPES as readonly string[]).includes(type))
    return NextResponse.json({ error: '유효하지 않은 모집 유형입니다.' }, { status: 400 })
  if (!title?.trim())
    return NextResponse.json({ error: '제목을 입력해주세요.' }, { status: 400 })
  if (!field || !(FIELDS as readonly string[]).includes(field))
    return NextResponse.json({ error: '유효하지 않은 분야입니다.' }, { status: 400 })
  if (!deadline || isNaN(new Date(deadline).getTime()))
    return NextResponse.json({ error: '유효한 마감일을 입력해주세요.' }, { status: 400 })
  if (!Number.isInteger(Number(capacity)) || Number(capacity) < 1)
    return NextResponse.json({ error: '모집 인원은 1명 이상이어야 합니다.' }, { status: 400 })
  if (Number(current) < 0 || Number(current) > Number(capacity))
    return NextResponse.json({ error: '현재 인원이 유효하지 않습니다.' }, { status: 400 })
  if (!description?.trim())
    return NextResponse.json({ error: '소개를 입력해주세요.' }, { status: 400 })

  const updated = await prisma.$transaction(async (tx) => {
    if (type === 'team') {
      await tx.role.deleteMany({ where: { postId: numId } })
    }
    return tx.post.update({
      where: { id: numId },
      data: {
        type,
        title: title.trim(),
        field,
        capacity: Number(capacity),
        current: Number(current),
        deadline: new Date(deadline),
        description: description.trim(),
        poster: type === 'club' && poster?.trim() ? poster.trim() : null,
        applyMode: applyMode === 'link' ? 'link' : 'form',
        applyLink: applyMode === 'link' && applyLink?.trim() ? applyLink.trim() : null,
        showApplicantCount: showApplicantCount !== false,
        roles: type === 'team' && Array.isArray(roles) && roles.length > 0
          ? { create: roles.map((r: { name: string; count: number }) => ({ name: r.name, count: Number(r.count) })) }
          : undefined,
      },
      include: { roles: true },
    })
  })

  return NextResponse.json(updated)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
  }

  const { id } = await params
  const numId = parseInt(id)
  if (isNaN(numId) || numId < 1) {
    return NextResponse.json({ error: '유효하지 않은 ID입니다.' }, { status: 400 })
  }

  const post = await prisma.post.findUnique({ where: { id: numId } })
  if (!post) return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 })
  if (post.creatorId !== session.user.id) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 })
  }

  await prisma.post.delete({ where: { id: numId } })
  return NextResponse.json({ ok: true })
}
