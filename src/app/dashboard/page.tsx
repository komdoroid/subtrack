/**
 * page.tsx (Dashboard)
 * ----------------------------------------
 * 作成日: 2025-05-26
 * 概要  : ログイン後のユーザーに表示される仮のダッシュボード画面
 * 補足  : useAuth() を使用してログイン状態を確認、未ログイン時は /auth にリダイレクト
 */

'use client'

import { useAuth } from '@/lib/useAuth'
import { AppShell } from '@/components/layout/AppShell'
import { SubscriptionList } from '@/components/SubscriptionList'
import { SubscriptionForm } from '@/components/SubscriptionForm'
import { SubscriptionChart } from '@/components/SubscriptionChart'

export default function DashboardPage() {
  const { user, loading } = useAuth(true)

  if (loading) {
    return <div className="p-8">読み込み中...</div>
  }

  return (
    <AppShell>
      <main className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">ようこそ、{user?.email} さん！</h1>
        <SubscriptionChart />
        <SubscriptionList />
        <SubscriptionForm />
      </main>
    </AppShell>
  )
}
