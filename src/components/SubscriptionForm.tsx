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
import { PrimaryButton } from './ui/PrimaryButton'

type FormErrors = {
  name?: string
  price?: string
  billingDate?: string
}

export const SubscriptionForm = () => {
  const [name, setName] = useState('')
  const [price, setPrice] = useState<number>(0)
  const [billingDate, setBillingDate] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  /** 入力チェック ― 問題がなければ true */
  const validate = (): boolean => {
    const next: FormErrors = {}
    if (!name.trim()) next.name = '名前を入力してください'
    if (isNaN(price) || price < 0) next.price = '月額料金は 0 以上の数値で入力してください'
    if (!billingDate) next.billingDate = '請求日を選択してください'
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
    } catch (err) {
      console.error('登録に失敗しました:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow p-6 rounded w-full max-w-2xl">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        新しいサブスクリプションを追加
      </h2>

      {/* サービス名 */}
      <div className="mb-4">
        <label className="block mb-1 font-medium text-gray-800">サービス名</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full border rounded p-2 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
      </div>

      {/* 月額料金 */}
      <div className="mb-4">
        <label className="block mb-1 font-medium text-gray-800">月額料金（円）</label>
        <input
          type="number"
          min={0}
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className={`w-full border rounded p-2 ${
            errors.price ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.price && <p className="text-sm text-red-600 mt-1">{errors.price}</p>}
      </div>

      {/* 次回請求日 */}
      <div className="mb-4">
        <label className="block mb-1 font-medium text-gray-800">次回請求日</label>
        <input
          type="date"
          value={billingDate}
          onChange={(e) => setBillingDate(e.target.value)}
          className={`w-full border rounded p-2 ${
            errors.billingDate ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.billingDate && (
          <p className="text-sm text-red-600 mt-1">{errors.billingDate}</p>
        )}
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
