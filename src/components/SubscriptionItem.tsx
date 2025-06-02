/**
 * SubscriptionItem.tsx
 * ----------------------------------------
 * 作成日: 2025-05-26
 * 概要  : サブスクリプション1件分の表示・編集・削除コンポーネント（編集モーダルあり）
 */

'use client'

import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebase'

type Props = {
  id: string
  name: string
  price: number
  billingDate: string
}

export const SubscriptionItem = ({ id, name, price, billingDate }: Props) => {
  const [isOpen, setIsOpen] = useState(false)
  const [editedName, setEditedName] = useState(name)
  const [editedPrice, setEditedPrice] = useState(price)
  const [editedDate, setEditedDate] = useState(billingDate)
  const [errors, setErrors] = useState<{ name?: string; price?: string; billingDate?: string }>({})

  //　バリデーション関数
  const validate = () => {
    const newErrors: typeof errors = {}
    if (!editedName.trim()) newErrors.name = '名前を入力してください'
    if (isNaN(editedPrice) || editedPrice < 0) newErrors.price = '月額料金は0以上の数値で入力してください'
    // if (!editedDate) newErrors.billingDate = '請求日を入力してください'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  const handleUpdate = async () => {
    if (!validate()) return
    try {
      await updateDoc(doc(db, 'subscriptions', id), {
        name: editedName,
        price: editedPrice,
        billingDate: editedDate,
      })
      setIsOpen(false)
    } catch (error) {
      console.error('更新に失敗しました:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('このサブスクリプションを削除しますか？')) return
    try {
      await deleteDoc(doc(db, 'subscriptions', id))
    } catch (error) {
      console.error('削除に失敗しました:', error)
    }
  }

  return (
    <>
      <li className="bg-white shadow p-4 rounded text-gray-800">
        <div className="font-bold text-lg">{name}</div>
        <div className="text-sm text-gray-700">月額料金: ¥{price}</div>
        <div className="text-sm text-gray-700">次回請求日: {billingDate}</div>
        <div className="mt-2 flex gap-2">
          <button onClick={() => setIsOpen(true)} className="text-blue-600 text-sm underline">
            編集
          </button>
          <button onClick={handleDelete} className="text-red-600 text-sm underline">
            削除
          </button>
        </div>
      </li>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg shadow p-6 w-full max-w-md">
            <Dialog.Title className="text-lg font-bold mb-4 text-gray-800">編集: {name}</Dialog.Title>
            <div className="space-y-4">
              <input
                className="border p-2 w-full text-gray-800"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
              />
              {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
              <input
                type="number"
                className="border p-2 w-full text-gray-800"
                value={editedPrice}
                onChange={(e) => setEditedPrice(Number(e.target.value))}
              />
              {errors.price && <p className="text-red-600 text-sm">{errors.price}</p>}
              <input
                type="date"
                className="border p-2 w-full text-gray-800"
                value={editedDate}
                onChange={(e) => setEditedDate(e.target.value)}
              />
              {errors.billingDate && <p className="text-red-600 text-sm">{errors.billingDate}</p>}
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1 bg-gray-300 rounded"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                >
                  保存
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  )
}
