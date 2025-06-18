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
import { PrimaryButton } from './ui/PrimaryButton'

type FormErrors = {
  name?: string
  price?: string
  category?: string
  billingDay?: string
  startDate?: string
}

export const SubscriptionForm = () => {
  const [name, setName] = useState('')
  const [price, setPrice] = useState<number>(0)
  const [category, setCategory] = useState('')
  const [billingDay, setBillingDay] = useState<number>(1)
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

  // 請求日の選択肢（1〜31日）
  const billingDays = Array.from({ length: 31 }, (_, i) => i + 1)

  /** 入力チェック ― 問題がなければ true */
  const validate = (): boolean => {
    const next: FormErrors = {}
    if (!name.trim()) next.name = 'サービス名を入力してください'
    if (isNaN(price) || price < 0) next.price = '月額料金は 0 以上の数値で入力してください'
    if (!category) next.category = 'カテゴリを選択してください'
    if (billingDay < 1 || billingDay > 31) next.billingDay = '請求日は 1〜31 の間で選択してください'
    if (!startDate) next.startDate = '利用開始日を選択してください'
    setErrors(next)
    return Object.keys(next).length === 0
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
        billingDay: Number(billingDay),
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
      setBillingDay(1)
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
    <form onSubmit={handleSubmit} className="bg-white shadow p-6 rounded w-full max-w-2xl">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        新しいサブスクリプションを登録
      </h2>

      {/* 成功メッセージ */}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-green-600 text-sm">サブスクリプションが正常に登録されました！</p>
        </div>
      )}

      {/* サービス名 */}
      <div className="mb-4">
        <label className="block mb-1 font-medium text-gray-800">サービス名 *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: Netflix"
          className={`w-full border rounded p-2 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
      </div>

      {/* 月額料金 */}
      <div className="mb-4">
        <label className="block mb-1 font-medium text-gray-800">月額料金（円） *</label>
        <input
          type="number"
          min={0}
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          placeholder="例: 1490"
          className={`w-full border rounded p-2 ${
            errors.price ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.price && <p className="text-sm text-red-600 mt-1">{errors.price}</p>}
      </div>

      {/* カテゴリ */}
      <div className="mb-4">
        <label className="block mb-1 font-medium text-gray-800">カテゴリ *</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={`w-full border rounded p-2 ${
            errors.category ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">カテゴリを選択してください</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category}</p>}
      </div>

      {/* 請求日 */}
      <div className="mb-4">
        <label className="block mb-1 font-medium text-gray-800">請求日 *</label>
        <select
          value={billingDay}
          onChange={(e) => setBillingDay(Number(e.target.value))}
          className={`w-full border rounded p-2 ${
            errors.billingDay ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          {billingDays.map((day) => (
            <option key={day} value={day}>
              {day}日
            </option>
          ))}
        </select>
        {errors.billingDay && <p className="text-sm text-red-600 mt-1">{errors.billingDay}</p>}
      </div>

      {/* 利用開始日 */}
      <div className="mb-4">
        <label className="block mb-1 font-medium text-gray-800">利用開始日 *</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className={`w-full border rounded p-2 ${
            errors.startDate ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.startDate && (
          <p className="text-sm text-red-600 mt-1">{errors.startDate}</p>
        )}
      </div>

      {/* 説明 */}
      <div className="mb-6">
        <label className="block mb-1 font-medium text-gray-800">説明（任意）</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="メモや備考があれば入力してください"
          rows={3}
          className="w-full border border-gray-300 rounded p-2"
        />
      </div>

      <PrimaryButton
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? '登録中...' : '登録する'}
      </PrimaryButton>
    </form>
  )
}
