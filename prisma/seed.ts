import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'
dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.role.deleteMany()
  await prisma.post.deleteMany()

  const now = new Date()
  const inTwoDays = new Date(now)
  inTwoDays.setDate(inTwoDays.getDate() + 2)
  const inThreeDays = new Date(now)
  inThreeDays.setDate(inThreeDays.getDate() + 3)
  const inTenDays = new Date(now)
  inTenDays.setDate(inTenDays.getDate() + 10)
  const inTwoWeeks = new Date(now)
  inTwoWeeks.setDate(inTwoWeeks.getDate() + 14)
  const inMonth = new Date(now)
  inMonth.setDate(inMonth.getDate() + 30)

  await prisma.post.createMany({
    data: [
      {
        type: 'study',
        title: 'Next.js 14 App Router 스터디 모집',
        field: '개발',
        capacity: 6,
        current: 4,
        deadline: inTwoDays,
        description: 'Next.js 14의 App Router를 함께 공부할 스터디원을 모집합니다. 매주 토요일 2시간 진행 예정입니다. 기초적인 React 지식이 있으신 분이면 누구나 참여 가능합니다.',
      },
      {
        type: 'club',
        title: '교내 사진 동아리 신입 부원 모집',
        field: '기타',
        capacity: 10,
        current: 7,
        deadline: inThreeDays,
        description: '사진에 관심 있는 분들을 환영합니다! 매달 출사 진행 및 전시회 참여 기회를 제공합니다. 카메라 유무 무관하게 지원 가능합니다.',
        poster: null,
      },
      {
        type: 'team',
        title: '졸업 작품 팀원 모집 (웹 서비스)',
        field: '개발',
        capacity: 4,
        current: 2,
        deadline: inTenDays,
        description: '학교 내 중고 거래 플랫폼 개발을 위한 팀원을 모집합니다. 프론트엔드와 백엔드 개발자가 필요합니다.',
      },
      {
        type: 'study',
        title: '알고리즘 코딩테스트 스터디',
        field: '개발',
        capacity: 8,
        current: 3,
        deadline: inTwoWeeks,
        description: '취업 준비를 위한 코딩테스트 스터디입니다. 백준 골드 이상 문제를 매일 1문제씩 풀고 주 1회 온라인으로 풀이를 공유합니다.',
      },
      {
        type: 'club',
        title: 'UI/UX 디자인 스터디 동아리',
        field: '디자인',
        capacity: 12,
        current: 5,
        deadline: inTwoWeeks,
        description: 'Figma를 활용한 UI/UX 디자인을 공부하는 동아리입니다. 매주 수요일 저녁 7시에 진행됩니다. 디자인 전공자뿐만 아니라 관심 있는 모든 분 환영!',
      },
      {
        type: 'team',
        title: '앱 개발 공모전 팀원 모집',
        field: '개발',
        capacity: 5,
        current: 3,
        deadline: inMonth,
        description: '대학생 앱 개발 공모전 참가를 위한 팀원을 모집합니다. AI 기반 학습 보조 앱을 개발할 예정입니다.',
      },
      {
        type: 'study',
        title: '마케팅 전략 스터디 모집',
        field: '마케팅',
        capacity: 6,
        current: 2,
        deadline: inMonth,
        description: '디지털 마케팅과 브랜드 전략을 함께 공부할 스터디원을 모집합니다. 케이스 스터디 중심으로 진행됩니다.',
      },
      {
        type: 'team',
        title: '데이터 분석 프로젝트 팀원 모집',
        field: '데이터',
        capacity: 4,
        current: 1,
        deadline: inTwoWeeks,
        description: '학교 식당 만족도 분석 프로젝트를 진행할 팀원을 모집합니다. Python과 데이터 시각화 경험이 있으신 분을 우대합니다.',
      },
    ],
  })

  // Add roles for team posts
  const teamPosts = await prisma.post.findMany({ where: { type: 'team' } })

  for (const post of teamPosts) {
    if (post.title.includes('졸업 작품')) {
      await prisma.role.createMany({
        data: [
          { name: '프론트엔드', count: 1, postId: post.id },
          { name: '백엔드', count: 1, postId: post.id },
        ],
      })
    } else if (post.title.includes('앱 개발')) {
      await prisma.role.createMany({
        data: [
          { name: 'iOS/Android 개발', count: 1, postId: post.id },
          { name: 'AI/ML 엔지니어', count: 1, postId: post.id },
        ],
      })
    } else if (post.title.includes('데이터 분석')) {
      await prisma.role.createMany({
        data: [
          { name: '데이터 분석가', count: 2, postId: post.id },
          { name: '데이터 엔지니어', count: 1, postId: post.id },
        ],
      })
    }
  }

  console.log('Seed data created successfully!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
