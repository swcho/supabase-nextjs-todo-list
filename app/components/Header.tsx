'use client'

import { useSupabaseClient } from '@/lib/initSupabase'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header({ user }: { user: any }) {
  const pathname = usePathname()!
  const supabase = useSupabaseClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header className="border-b">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <nav className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className={`text-sm ${
                pathname === '/' 
                  ? 'text-black font-medium' 
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              내 할일
            </Link>
            <Link
              href="/teams"
              className={`text-sm ${
                pathname.startsWith('/teams')
                  ? 'text-black font-medium'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              팀 관리
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-600 hover:text-black"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-black"
              >
                로그인
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}