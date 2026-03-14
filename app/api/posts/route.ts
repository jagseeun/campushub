import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { POST_TYPES, FIELDS } from '@/types'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const field = searchParams.get('field')
  const filter = searchParams.get('filter')
  const q = searchParams.get('q')

  const now = new Date()
  const where: Prisma.PostWhereInput = {}

  if (type && (POST_TYPES as readonly string[]).includes(type)) {
    where.type = type
  }
  if (field && (FIELDS as readonly string[]).includes(field)) {
    where.field = field
  }
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

  const result =
    filter === 'spots_soon'
      ? posts.filter((p) => p.capacity - p.current <= 2 && p.current < p.capacity)
      : posts

  return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { type, title, field, capacity, current, deadline, description, poster, roles } = body

  // 필수값 검증
  if (!type || !(POST_TYPES as readonly string[]).includes(type)) {
    return NextResponse.json({ error: '유효하지 않은 모집 유형입니다.' }, { status: 400 })
  }
  if (!title?.trim()) {
    return NextResponse.json({ error: '제목을 입력해주세요.' }, { status: 400 })
  }
  if (!field || !(FIELDS as readonly string[]).includes(field)) {
    return NextResponse.json({ error: '유효하지 않은 분야입니다.' }, { status: 400 })
  }
  if (!deadline || isNaN(new Date(deadline).getTime())) {
    return NextResponse.json({ error: '유효한 마감일을 입력해주세요.' }, { status: 400 })
  }
  if (!Number.isInteger(Number(capacity)) || Number(capacity) < 1) {
    return NextResponse.json({ error: '모집 인원은 1명 이상이어야 합니다.' }, { status: 400 })
  }
  if (Number(current) < 0 || Number(current) > Number(capacity)) {
    return NextResponse.json({ error: '현재 인원이 유효하지 않습니다.' }, { status: 400 })
  }
  if (!description?.trim()) {
    return NextResponse.json({ error: '소개를 입력해주세요.' }, { status: 400 })
  }

  const post = await prisma.post.create({
    data: {
      type,
      title: title.trim(),
      field,
      capacity: Number(capacity),
      current: Number(current),
      deadline: new Date(deadline),
      description: description.trim(),
      poster: type === 'club' && poster?.trim() ? poster.trim() : null,
      roles:
        type === 'team' && Array.isArray(roles) && roles.length > 0
          ? { create: roles.map((r: { name: string; count: number }) => ({ name: r.name, count: Number(r.count) })) }
          : undefined,
    },
    include: { roles: true },
  })

  return NextResponse.json(post, { status: 201 })
}
