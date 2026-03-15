import Link from 'next/link'
import { ReactNode } from 'react'
import { IconGradCap } from './Icons'
import AuthButton from './AuthButton'

export default function Header({ right }: { right?: ReactNode }) {
  return (
    <header className="bg-white border-b border-indigo-100 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-brand-600">
          <IconGradCap size={22} />
          CampusHub
        </Link>
        <div className="flex items-center gap-3">
          {right}
          <Link href="/applications/check" className="text-sm text-gray-500 hover:text-brand-600 transition-colors hidden sm:block">
            내 지원 결과
          </Link>
          <AuthButton />
        </div>
      </div>
    </header>
  )
}
