/**
 * page.tsx (Subscription List)
 * ----------------------------------------
 * 作成日: 2024-03-21
 * 概要  : 全てのサブスクリプションを一覧表示するページ
 * 更新日: 2025-01-XX
 * 更新内容: billingDateとmonthの表示改善、フィルター機能の修正
 */

'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/useAuth'
import { useSubscriptionData } from '@/lib/hooks/useSubscriptionData'
import { Pencil, Trash2, Filter, X, Loader2 } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { collection, doc, deleteDoc, updateDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/firebase'


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

// 日付の表示を整形する関数
const formatDateDisplay = (date: string | null | undefined): string => {
  if (!date || date === 'null') return '未設定'
  return date
}

// 現在の月から過去12ケ月を生成（降順）
const generatePastMonths = (count: number): string[] => {
  const months: string[] = []
  const today = new Date()

  for (let i = 0; i < count; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const displayStr = `${date.getFullYear()}年${date.getMonth() + 1}月`
    months.push(displayStr)
  }
  return months
}

const selectableMonths = ['現在', ...generatePastMonths(12)]

export default function SubscriptionListPage() {
  const { user, loading: authLoading } = useAuth()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([])
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    searchQuery: '',
    month: ''
  })

  // サブスクリプションデータを取得
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

  // フィルタリング処理
  useEffect(() => {
    if (!subscriptions) return

    let filtered = [...subscriptions]

    // カテゴリフィルター
    if (filters.category) {
      filtered = filtered.filter(sub => sub.category === filters.category)
    }

    // 価格範囲フィルター
    if (filters.minPrice) {
      filtered = filtered.filter(sub => sub.price >= Number(filters.minPrice))
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(sub => sub.price <= Number(filters.maxPrice))
    }

    // 検索クエリ
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(sub =>
        sub.name.toLowerCase().includes(query) ||
        sub.category.toLowerCase().includes(query)
      )
    }

    setFilteredSubscriptions(filtered)
  }, [subscriptions, filters])

  // フィルタークリア
  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      searchQuery: '',
      month: ''
    })
  }

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

  // 認証中またはユーザーが未定義の場合はローディング表示
  if (authLoading || !user) {
    return (
      <AppShell>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>読み込み中...</span>
          </div>
        </div>
      </AppShell>
    )
  }

  // データ読み込み中の場合はローディング表示
  if (loading) {
    return (
      <AppShell>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>データを読み込み中...</span>
          </div>
        </div>
      </AppShell>
    )
  }

  const uniqueCategories = Array.from(new Set(subscriptions?.map(sub => sub.category) || []))

  return (
    <AppShell>
      <div className="bg-gradient-to-br from-gray-50 to-white p-8 space-y-10 min-h-screen">
        <h2 className="text-2xl font-semibold text-gray-800">登録済みサブスクリプション一覧</h2>

        {/* フィルターセクション */}
        <section className="bg-white p-4 rounded-xl shadow-md space-y-4">
          <h3 className="text-lg font-semibold">フィルター</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select 
              className="border border-gray-300 p-2 rounded-lg"
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="">カテゴリを選択</option>
              {uniqueCategories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select 
              className="border border-gray-300 p-2 rounded-lg"
              value={filters.month}
              onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}
            >
              <option value="">月を選択</option>
              {selectableMonths.map(month => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
            <input 
              type="number" 
              placeholder="最小価格" 
              className="border border-gray-300 p-2 rounded-lg"
              value={filters.minPrice}
              onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
            />
            <input 
              type="number" 
              placeholder="最大価格" 
              className="border border-gray-300 p-2 rounded-lg"
              value={filters.maxPrice}
              onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
            />
            <input 
              type="text" 
              placeholder="キーワード検索" 
              className="border border-gray-300 p-2 rounded-lg"
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button 
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200"
            >
              <X size={16} /> クリア
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
              <Filter size={16} /> フィルター適用
            </button>
          </div>
        </section>

        {/* サブスク一覧セクション */}
        <section>
          {filteredSubscriptions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {subscriptions?.length === 0 ? '登録されたサブスクリプションがありません' : '条件に一致するサブスクリプションがありません'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSubscriptions.map((subscription) => (
                <div key={subscription.id} className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition">
                  <div className="font-semibold text-gray-800">{subscription.name}</div>
                  <div className="text-sm text-gray-500">
                    カテゴリ: {subscription.category} / 金額: ¥{subscription.price.toLocaleString()} / 支払日: 毎月{subscription.billingDay}日
                  </div>
                  <div className="text-sm text-gray-400">
                    期間: {formatDateDisplay(subscription.startDate)}〜{subscription.endDate ? formatDateDisplay(subscription.endDate) : '（継続中）'}
                  </div>
                  <div className="mt-3 flex gap-4 text-sm">
                    <button 
                      onClick={() => handleEdit(subscription)}
                      className="text-blue-500 hover:text-blue-700" 
                      aria-label="編集"
                    >
                      <Pencil size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(subscription.id)}
                      className="text-red-500 hover:text-red-700" 
                      aria-label="削除"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

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
    </AppShell>
  )
} 