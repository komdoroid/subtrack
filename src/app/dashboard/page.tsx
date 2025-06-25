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
import { DashboardSummary } from '@/components/DashboardSummary'

export default function DashboardPage() {
  const { user, loading } = useAuth(true)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    )
  }

  return (
    <AppShell>
      <div className="bg-gradient-to-br from-gray-50 to-white p-10 space-y-10 min-h-screen">
        <h2 className="text-3xl font-semibold text-gray-800 tracking-tight">
          ようこそ、{user?.email} さん！
        </h2>

        {/* 月別支出グラフ */}
        <SubscriptionChart />

        {/* 合計金額とサブスク一覧 */}
        <DashboardSummary />

        {/* 新規登録フォーム */}
        <SubscriptionForm />
      </div>
    </AppShell>
  )
}
