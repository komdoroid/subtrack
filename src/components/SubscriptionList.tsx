/**
 * SubscriptionList.tsx
 * ----------------------------------------
 * サブスクリプション一覧を表示するコンポーネント
 * - 編集・削除機能
 * - ページネーション機能
 * 更新日: 2025-01-XX
 * 更新内容: subscriptionsコレクションに対応、billingDayフィールドを使用
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/useAuth'
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc, serverTimestamp, Timestamp, FieldValue } from 'firebase/firestore'
import { db } from '@/firebase'
import { PencilIcon, TrashIcon } from 'lucide-react'

// 1ページあたりの表示件数
const ITEMS_PER_PAGE = 10

// 統一されたsubscriptionsコレクションの型定義
interface Subscription {
  id: string
  userId: string
  name: string
  price: number
  category: string
  billingDay: number
  isActive: boolean
  month: string | null
  createdFrom: string | null
  startDate: string
  endDate: string | null
  description: string | null
  createdAt: Timestamp
  updatedAt: Timestamp | FieldValue
}

interface EditModalProps {
  subscription: Subscription
  isOpen: boolean
  onClose: () => void
  onSave: (updatedData: Partial<Subscription>) => Promise<void>
}

// 請求日を表示用に変換する関数
const formatBillingDay = (billingDay: number): string => {
  return `${billingDay}日`
}

// 編集モーダルコンポーネント
const EditModal = ({ subscription, isOpen, onClose, onSave }: EditModalProps) => {
  const [name, setName] = useState(subscription.name)
  const [price, setPrice] = useState(subscription.price)
  const [category, setCategory] = useState(subscription.category)
  const [billingDay, setBillingDay] = useState(subscription.billingDay)

  // 請求日の選択肢（1〜31日）
  const billingDays = Array.from({ length: 31 }, (_, i) => i + 1)

  // カテゴリの選択肢
  const categories = [
    '動画配信',
    '音楽配信',
    'ゲーム',
    '学習',
    'ニュース',
    'クラウドストレージ',
    'その他'
  ]

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave({
      name,
      price: Number(price),
      category,
      billingDay: Number(billingDay),
      updatedAt: serverTimestamp()
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">サブスクリプションの編集</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">サービス名</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full border p-2 rounded"
                required
              />
            </label>
          </div>
          <div>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">金額</span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="mt-1 w-full border p-2 rounded"
                required
                min="0"
              />
            </label>
          </div>
          <div>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">カテゴリ</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full border p-2 rounded"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">請求日</span>
              <select
                value={billingDay}
                onChange={(e) => setBillingDay(Number(e.target.value))}
                className="mt-1 w-full border p-2 rounded"
              >
                {billingDays.map((day) => (
                  <option key={day} value={day}>
                    {day}日
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export const SubscriptionList = () => {
  const { user } = useAuth()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 現在契約中のサブスクリプションを取得
  const fetchSubscriptions = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const q = query(
        collection(db, 'subscriptions'),
        where('userId', '==', user.uid),
        where('isActive', '==', true),
        where('month', '==', null)
      )
      
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Subscription[]
      
      setSubscriptions(data)
      setError(null)
    } catch (err) {
      console.error('サブスクリプション取得エラー:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [user])

  // 初回読み込みとユーザー変更時の再取得
  useEffect(() => {
    fetchSubscriptions()
  }, [fetchSubscriptions])

  // デバッグ用のログ出力
  useEffect(() => {
    console.log('Auth User:', user)
    console.log('Subscriptions:', subscriptions)
    console.log('Loading:', loading)
    console.log('Error:', error)
  }, [user, subscriptions, loading, error])

  // ページネーションの計算
  const totalPages = Math.ceil(subscriptions.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedData = subscriptions.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // 合計金額の計算
  const totalPrice = subscriptions.reduce((sum, sub) => sum + sub.price, 0)

  // 削除処理
  const handleDelete = async (subscriptionId: string) => {
    if (!window.confirm('このサブスクリプションを削除してもよろしいですか？')) {
      return
    }

    try {
      await deleteDoc(doc(db, 'subscriptions', subscriptionId))
      // 画面の表示を更新
      fetchSubscriptions()
    } catch (err) {
      console.error('削除エラー:', err)
      alert('削除中にエラーが発生しました')
    }
  }

  // 編集処理
  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription)
    setIsModalOpen(true)
  }

  const handleSave = async (updatedData: Partial<Subscription>) => {
    if (!editingSubscription) {
      console.error('編集対象のサブスクリプションが見つかりません')
      return
    }

    try {
      await updateDoc(doc(db, 'subscriptions', editingSubscription.id), updatedData)
      fetchSubscriptions()
      setIsModalOpen(false)
      setEditingSubscription(null) // 編集完了後にnullに設定
    } catch (err) {
      console.error('更新エラー:', err)
      alert('更新中にエラーが発生しました')
    }
  }

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
                  支払日: {formatBillingDay(subscription.billingDay)}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    ¥{subscription.price.toLocaleString()}
                  </p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {subscription.category}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(subscription)}
                    className="p-2 text-gray-600 hover:text-blue-600"
                    title="編集"
                  >
                    <PencilIcon size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(subscription.id)}
                    className="p-2 text-gray-600 hover:text-red-600"
                    title="削除"
                  >
                    <TrashIcon size={18} />
                  </button>
                </div>
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

      {/* 編集モーダル */}
      {editingSubscription && (
        <EditModal
          subscription={editingSubscription}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingSubscription(null)
          }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
