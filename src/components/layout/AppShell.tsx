/**
 * AppShell.tsx
 * ----------------------------------------
 * 作成日: 2025-06-03
 * 概要  : 全ページ共通のレイアウト。
 *         - 上部: 既存 <Navbar />
 *         - 左側: Sidebar (アイコン＋リンク)
 *         - 右側: メインコンテンツ (children)
 *
 * 使い方:
 *   <AppShell>
 *      <YourPageContent />
 *   </AppShell>
 *
 * これにより "プロフェッショナル & シンプル" な 2 カラム UI が統一される。
 */

'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  ListOrdered,
  BarChart3,
  LogOut,
} from 'lucide-react' // lucide-react を導入済み想定
import { auth } from '@/firebase'
import { AuthProvider } from '@/context/AuthContext'

type Props = {
  children: ReactNode
}

/** サイドバー内のリンク情報 */
const navItems = [
  { href: '/dashboard', icon: Home, label: 'ダッシュボード' },
  { href: '/list', icon: ListOrdered, label: '一覧' },
  { href: '/analytics', icon: BarChart3, label: '分析' },
]

export const AppShell = ({ children }: Props) => {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    await auth.signOut()
    router.push('/auth')
  }

  return (
    <AuthProvider>
      <div className="flex min-h-screen font-sans">
        {/* ---- Sidebar ---- */}
        <aside className="w-64 bg-slate-900 text-white p-6 space-y-6 shadow-lg">
          <h1 className="text-2xl font-bold tracking-tight">SubTrack</h1>
          <nav className="space-y-2 text-sm">
            {navItems.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-slate-800 text-white' 
                      : 'hover:bg-slate-800'
                  }`}
                >
                  <Icon size={18} className="text-white" />
                  <span className="font-medium">{label}</span>
                </Link>
              )
            })}
          </nav>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-red-400 text-sm mt-10 hover:text-red-300 transition-colors"
          >
            <LogOut size={18} />
            <span className="font-medium">ログアウト</span>
          </button>
        </aside>

        {/* ---- Main content ---- */}
        <main className="flex-1">{children}</main>
      </div>
    </AuthProvider>
  )
}
