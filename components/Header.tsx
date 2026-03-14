import Link from 'next/link'
import { ReactNode } from 'react'

export default function Header({ right }: { right?: ReactNode }) {
  return (
    <header className="bg-[#f8f8fc] border-b border-gray-100 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-indigo-600">
          🎓 CampusHub
        </Link>
        {right}
      </div>
    </header>
  )
}
