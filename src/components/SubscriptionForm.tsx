/**
 * SubscriptionForm.tsx
 * ----------------------------------------
 * 作成日: 2025-05-26
 * 概要  : サブスクリプション新規登録フォーム（Firestore保存対応）
 * 補足  : 保存後、一覧更新は未対応（次ステップ）
 */

'use client'

import { useState } from 'react'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/lib/useAuth'

export const SubscriptionForm = () => {
  const [name, setName] = useState('')
  const [price, setPrice] = useState<number>(0)
  const [billingDate, setBillingDate] = useState('')
  const [errors, setErrors] = useState<{ name?: string; price?: string; billingDate?: string }>({})
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const validate = () => {
    const newErrors: typeof errors = {}
    if (!name.trim()) newErrors.name = '名前を入力してください'
    if (isNaN(price) || price < 0) newErrors.price = '月額料金は0以上の数値で入力してください'
    if (!billingDate) newErrors.billingDate = '請求日を選択してください'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      alert('ログインしてください')
      return
    }
    if (!validate()) return

    try {
      await addDoc(collection(db, 'subscriptions'), {
        userId: user.uid,
        name,
        price,
        billingDate
      })

      // 入力リセット
      setName('')
      setPrice(0)
      setBillingDate('')
      setErrors({})
    } catch (error) {
      console.error('登録に失敗しました:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow p-6 rounded w-full max-w-2xl">
      <h2 className="text-xl font-semibold mb-4">新しいサブスクリプションを追加</h2>

      <div className="mb-4">
        <label className="block mb-1 font-medium">サービス名</label>
        <input
          type="text"
          value={name}
          className="w-full border border-gray-300 rounded p-2"
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">月額料金（円）</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          required
          className="w-full border border-gray-300 rounded p-2"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">次回請求日</label>
        <input
          type="date"
          value={billingDate}
          onChange={(e) => setBillingDate(e.target.value)}
          required
          className="w-full border border-gray-300 rounded p-2"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? '登録中...' : '登録する'}
      </button>
    </form>
  )
}
