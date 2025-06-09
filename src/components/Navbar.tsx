/**
 * Navbar.tsx
 * ----------------------------------------
 * 作成日: 2025-05-26
 * 概要  : 認証済みユーザー向けナビゲーションバー（ログアウト機能付き）
 * 補足  : 任意のページで共通表示。ログアウトすると /auth に遷移。
 */

'use client'

import { signOut } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { auth } from '@/firebase'

export function Navbar() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push('/auth')
    } catch (error) {
      console.error('ログアウトエラー:', error)
    }
  }

  return (
    <header className="w-full dark:bg-slate-900 shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">SubTrack</h1>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
      >
        ログアウト
      </button>
    </header>
  )
}
