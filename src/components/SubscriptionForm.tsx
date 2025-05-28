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
  const [price, setPrice] = useState('')
  const [billingDate, setBillingDate] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      alert('ログインしてください')
      return
    }

    try {
      setLoading(true)
      await addDoc(collection(db, 'subscriptions'), {
        uid: user.uid,
        name,
        price: Number(price),
        billingDate,
        createdAt: new Date().toISOString(),
      })

      // フォーム初期化
      setName('')
      setPrice('')
      setBillingDate('')
      alert('登録しました！')
    } catch (error) {
      console.error('保存に失敗しました:', error)
      alert('保存に失敗しました')
    } finally {
      setLoading(false)
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
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border border-gray-300 rounded p-2"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">月額料金（円）</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
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
