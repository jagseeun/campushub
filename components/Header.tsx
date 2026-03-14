import Link from 'next/link'
import { ReactNode } from 'react'

export default function Header({ right }: { right?: ReactNode }) {
  return (
    <header className="bg-[#F6F0E6] border-b border-[#E8DDD0] sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-brand-600">
          🎓 CampusHub
        </Link>
        {right}
      </div>
    </header>
  )
}
