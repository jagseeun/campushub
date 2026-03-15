export type Role = {
  id: number
  name: string
  count: number
}

export type Post = {
  id: number
  type: string
  title: string
  field: string
  poster: string | null
  capacity: number
  current: number
  deadline: string
  description: string
  applyMode: string
  applyLink: string | null
  creatorId: string | null
  showApplicantCount: boolean
  roles: Role[]
  createdAt: string
}

export type Application = {
  id: number
  postId: number
  name: string
  contact: string
  roleWanted: string | null
  message: string
  status: string           // "pending" | "accepted" | "rejected"
  reviewNote: string | null
  statusToken: string
  createdAt: string
}

export const POST_TYPES = ['club', 'study', 'team'] as const
export type PostType = (typeof POST_TYPES)[number]

export const FIELDS = ['개발', '디자인', '기획', '마케팅', '데이터', '기타'] as const
