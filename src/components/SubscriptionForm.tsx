/**
 * SubscriptionForm.tsx
 * ----------------------------------------
 * 作成日: 2025-05-26
 * 概要  : サブスクリプション新規登録フォーム（Firestore保存対応）
 * 更新日: 2025-01-XX
 * 更新内容: 統一されたsubscriptionsコレクションに対応
 * 補足  : 現在契約中のサブスクリプション（month: null, isActive: true）を登録
 */

'use client'

import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/lib/useAuth'

type FormErrors = {
  name?: string
  price?: string
  category?: string
  billingDate?: string
  startDate?: string
}

export const SubscriptionForm = () => {
  const [name, setName] = useState('')
  const [price, setPrice] = useState<number>(0)
  const [category, setCategory] = useState('')
  const [billingDate, setBillingDate] = useState('')
  const [startDate, setStartDate] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { user } = useAuth()

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

  /** 入力チェック ― 問題がなければ true */
  const validate = (): boolean => {
    const next: FormErrors = {}
    if (!name.trim()) next.name = 'サービス名を入力してください'
    if (isNaN(price) || price < 0) next.price = '月額料金は 0 以上の数値で入力してください'
    if (!category) next.category = 'カテゴリを選択してください'
    if (!billingDate) next.billingDate = '次回請求日を選択してください'
    if (!startDate) next.startDate = '利用開始日を選択してください'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  // 日付から請求日（日）を抽出
  const getBillingDayFromDate = (dateString: string): number => {
    if (!dateString) return 1
    const date = new Date(dateString)
    return date.getDate()
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) {
      alert('ログインしてください')
      return
    }
    if (!validate()) return

    setLoading(true)
    setSuccess(false)
    
    try {
      await addDoc(collection(db, 'subscriptions'), {
        userId: user.uid,
        name: name.trim(),
        price: Number(price),
        category: category,
        billingDay: getBillingDayFromDate(billingDate),
        isActive: true,
        month: null, // 現在契約中のためnull
        createdFrom: null,
        startDate: startDate,
        endDate: null, // 契約中のためnull
        description: description.trim() || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      // 成功通知
      setSuccess(true)
      
      // 入力リセット
      setName('')
      setPrice(0)
      setCategory('')
      setBillingDate('')
      setStartDate('')
      setDescription('')
      setErrors({})
      
      // 3秒後に成功メッセージを消す
      setTimeout(() => setSuccess(false), 3000)
      
    } catch (err) {
      console.error('登録に失敗しました:', err)
      alert('登録に失敗しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-white rounded-2xl shadow-md p-6 transition duration-200 hover:shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        新しいサブスクリプションを登録
      </h3>

      {/* 成功メッセージ */}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-green-600 text-sm">サブスクリプションが正常に登録されました！</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* サービス名 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            サービス名 *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: Netflix"
            className={`border rounded p-2 w-full ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
        </div>

        {/* 月額料金 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            月額料金 *
          </label>
          <input
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            placeholder="0"
            className={`border rounded p-2 w-full ${
              errors.price ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.price && <p className="text-sm text-red-600 mt-1">{errors.price}</p>}
        </div>

        {/* カテゴリ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            カテゴリ *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`border rounded p-2 w-full ${
              errors.category ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">カテゴリを選択</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category}</p>}
        </div>

        {/* 次回請求日 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            次回請求日 *
          </label>
          <input
            type="date"
            value={billingDate}
            onChange={(e) => setBillingDate(e.target.value)}
            className={`border rounded p-2 w-full ${
              errors.billingDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.billingDate && <p className="text-sm text-red-600 mt-1">{errors.billingDate}</p>}
        </div>

        {/* 利用開始日 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            利用開始日 *
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={`border rounded p-2 w-full ${
              errors.startDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.startDate && <p className="text-sm text-red-600 mt-1">{errors.startDate}</p>}
        </div>

        {/* 説明 */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            メモ・備考（任意）
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="メモや備考があれば入力してください"
            rows={4}
            className="border rounded p-2 w-full border-gray-300"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-fit disabled:opacity-50"
        >
          {loading ? '登録中...' : '登録'}
        </button>
      </form>
    </section>
  )
}
