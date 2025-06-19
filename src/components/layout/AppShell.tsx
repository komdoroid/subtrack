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
import { Navbar } from '@/components/Navbar'
import {
  Home,
  ListOrdered,
  BarChart3,
  LogOut,
} from 'lucide-react' // lucide-react を導入済み想定
import { useRouter } from 'next/navigation'
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

  const handleLogout = async () => {
    await auth.signOut()
    router.push('/auth')
  }

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-darkBg">
      {/* 上部バー */}
      <Navbar />

      {/* 本体: Sidebar + Main */}
      <div className="flex flex-1">
        {/* ---- Sidebar ---- */}
        <aside
          className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900
                     border-r border-border dark:border-slate-700
                     p-4 space-y-4"
        >
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg
                         text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-800
                         transition-colors"
            >
              <Icon size={20} />
              <span className="font-medium">{label}</span>
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className="mt-auto flex items-center gap-3 px-3 py-2 rounded-lg
                       text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">ログアウト</span>
          </button>
        </aside>

        {/* ---- Main content ---- */}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        </div>
      </div>
    </AuthProvider>
  )
}
