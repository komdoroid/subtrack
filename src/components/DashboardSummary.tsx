/**
 * DashboardSummary.tsx
 * ----------------------------------------
 * 作成日: 2025-06-24
 * 概要  : ダッシュボード用のサマリーコンポーネント
 *         - 今月の合計金額表示（展開可能）
 *         - サブスクリプション一覧（グリッド表示）
 */

'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/useAuth'
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

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
  createdAt: any
  updatedAt: any
}

interface EditModalProps {
  subscription: Subscription
  isOpen: boolean
  onClose: () => void
  onSave: (updatedData: Partial<Subscription>) => Promise<void>
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

export const DashboardSummary = () => {
  const { user } = useAuth()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  // 現在契約中のサブスクリプションを取得
  const fetchSubscriptions = async () => {
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
    } catch (error) {
      console.error('データ取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubscriptions()
  }, [user])

  // 削除機能
  const handleDelete = async (subscriptionId: string) => {
    if (!confirm('本当に削除しますか？')) return
    
    try {
      await deleteDoc(doc(db, 'subscriptions', subscriptionId))
      await fetchSubscriptions() // リロード
    } catch (error) {
      console.error('削除エラー:', error)
      alert('削除に失敗しました')
    }
  }

  // 編集機能
  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription)
    setIsModalOpen(true)
  }

  const handleSave = async (updatedData: Partial<Subscription>) => {
    if (!editingSubscription) return
    
    try {
      await updateDoc(doc(db, 'subscriptions', editingSubscription.id), updatedData)
      await fetchSubscriptions() // リロード
    } catch (error) {
      console.error('更新エラー:', error)
      alert('更新に失敗しました')
    }
  }

  if (loading) {
    return (
      <section className="bg-white rounded-xl shadow p-6">
        <div className="text-gray-600">データを読み込み中...</div>
      </section>
    )
  }

  const totalAmount = subscriptions.reduce((sum, sub) => sum + sub.price, 0)

  return (
    <section 
      className="bg-white rounded-xl shadow p-6 cursor-pointer transition hover:shadow-md" 
      onClick={() => setShowDetails(!showDetails)}
    >
      <div className="flex flex-col items-center text-center">
        <h3 className="text-lg font-semibold text-gray-700">今月の合計</h3>
        <div className="flex items-center gap-2 text-blue-600 font-bold text-3xl mt-2">
          ¥{totalAmount.toLocaleString()}
          {showDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>
      
      {showDetails && (
        <div className="mt-6 space-y-4" onClick={(e) => e.stopPropagation()}>
          {subscriptions.length === 0 ? (
            <div className="text-gray-600 text-center">サブスクリプションが登録されていません。</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subscriptions.map((subscription) => (
                <div
                  key={subscription.id}
                  className="p-4 border rounded bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-800">
                        {subscription.name} - ¥{subscription.price.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        支払日: {subscription.billingDay}日 ・ カテゴリ: {subscription.category}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(subscription)
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(subscription.id)
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
    </section>
  )
} 