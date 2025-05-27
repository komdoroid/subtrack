/**
 * page.tsx (Dashboard)
 * ----------------------------------------
 * 作成日: 2025-05-26
 * 概要  : ログイン後のユーザーに表示される仮のダッシュボード画面
 * 補足  : useAuth() を使用してログイン状態を確認、未ログイン時は /auth にリダイレクト
 */

'use client'

import { useAuth } from '@/lib/useAuth'

export default function DashboardPage() {
  const { user, loading } = useAuth(true)

  if (loading) {
    return <div className="p-8">読み込み中...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">ようこそ、{user?.email} さん！</h1>
      <p className="text-gray-600">これはログイン済みユーザー向けのダッシュボードです。</p>
    </div>
  )
}
