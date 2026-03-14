# CampusHub

캠퍼스 내 동아리, 스터디, 팀원 모집을 위한 커뮤니티 플랫폼입니다.

## 주요 기능

- **동아리 모집** - 동아리 홍보 및 부원 모집
- **스터디 모집** - 스터디 그룹 생성 및 모집
- **팀원 모집** - 프로젝트/대회 팀원 모집 (역할별 인원 설정)
- 모집 유형, 분야별 필터링
- 마감 임박 / 인원 마감 임박 알림
- 제목·설명 전체 검색

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Backend | Next.js API Routes |
| ORM | Prisma 7 |
| Database | PostgreSQL |

## 시작하기

### 사전 요구사항

- Node.js 18+
- PostgreSQL

### 설치

```bash
git clone https://github.com/jagseeun/campushub.git
cd campushub
npm install
```

### 환경변수 설정

`.env` 파일을 생성하고 아래 내용을 입력합니다.

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/campushub"
```

### 데이터베이스 설정

```bash
# 마이그레이션 실행
npx prisma migrate dev

# 샘플 데이터 삽입 (선택)
npx ts-node prisma/seed.ts
```

### 개발 서버 실행

```bash
npm run dev
```

`http://localhost:3000` 에서 확인할 수 있습니다.

## 프로젝트 구조

```
campushub/
├── app/
│   ├── page.tsx              # 홈 (모집글 목록)
│   ├── api/posts/            # REST API
│   └── posts/
│       ├── new/              # 모집글 작성
│       └── [id]/             # 모집글 상세
├── components/
│   ├── Header.tsx
│   ├── PostCard.tsx
│   ├── FilterBar.tsx
│   └── SearchBar.tsx
├── lib/
│   └── prisma.ts
├── types/
│   └── index.ts
└── prisma/
    ├── schema.prisma
    └── seed.ts
```

## API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/posts` | 모집글 목록 조회 |
| POST | `/api/posts` | 모집글 작성 |
| GET | `/api/posts/[id]` | 모집글 상세 조회 |

### GET /api/posts 쿼리 파라미터

| 파라미터 | 설명 |
|----------|------|
| `type` | `club` \| `study` \| `team` |
| `field` | `개발` \| `디자인` \| `기획` \| `마케팅` \| `데이터` \| `기타` |
| `q` | 검색어 (제목, 설명) |
| `filter` | `deadline_soon` (3일 이내) \| `spots_soon` (2자리 이하) |
