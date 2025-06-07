/**
 * SubscriptionList.tsx
 * ----------------------------------------
 * サブスクリプション一覧を表示するコンポーネント
 * - ページネーション機能付き
 * - ローディング状態の表示
 * - エラーハンドリング
 */

'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/useAuth'
import { useSubscriptionData } from '@/lib/hooks/useSubscriptionData'

// 1ページあたりの表示件数
const ITEMS_PER_PAGE = 10

export const SubscriptionList = () => {
  const { user } = useAuth()
  const { data: subscriptions, loading, error } = useSubscriptionData(user?.uid)

  // デバッグ用のログ出力
  useEffect(() => {
    console.log('Auth User:', user)
    console.log('Subscriptions:', subscriptions)
    console.log('Loading:', loading)
    console.log('Error:', error)
  }, [user, subscriptions, loading, error])

  const [currentPage, setCurrentPage] = useState(1)

  // ページネーションの計算
  const totalPages = Math.ceil(subscriptions.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedData = subscriptions.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // 合計金額の計算
  const totalPrice = subscriptions.reduce((sum, sub) => sum + sub.price, 0)

  // ローディング表示
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // エラー表示
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        <p>エラーが発生しました: {error.message}</p>
        <p className="text-sm mt-2">詳細はコンソールを確認してください。</p>
      </div>
    )
  }

  // データが空の場合
  if (subscriptions.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>サブスクリプションが登録されていません</p>
        <p className="text-sm mt-2">
          ユーザーID: {user?.uid || 'Not authenticated'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 合計金額の表示 */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold text-gray-900">今月の合計</h2>
        <p className="text-2xl font-bold text-blue-600">
          ¥{totalPrice.toLocaleString()} / 月
        </p>
      </div>

      {/* サブスクリプション一覧 */}
      <div className="bg-white rounded-lg shadow divide-y">
        {paginatedData.map((subscription) => (
          <div
            key={subscription.id}
            className="p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {subscription.name}
                </h3>
                <p className="text-sm text-gray-500">
                  支払日: {subscription.billingDate}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  ¥{subscription.price.toLocaleString()}
                </p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {subscription.category}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            前へ
          </button>
          <span className="px-4 py-2">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            次へ
          </button>
        </div>
      )}
    </div>
  )
}
