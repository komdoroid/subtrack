/**
 * SubscriptionItem.tsx
 * ----------------------------------------
 * 作成日: 2025-05-26
 * 概要  : サブスクリプション1件分の表示・編集コンポーネント
 */

'use client'

import { useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase'

type Props = {
  id: string
  name: string
  price: number
  billingDate: string
}

export const SubscriptionItem = ({ id, name, price, billingDate }: Props) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(name)
  const [editedPrice, setEditedPrice] = useState(price)
  const [editedDate, setEditedDate] = useState(billingDate)

  const handleUpdate = async () => {
    try {
      const ref = doc(db, 'subscriptions', id)
      await updateDoc(ref, {
        name: editedName,
        price: editedPrice,
        billingDate: editedDate,
      })
      setIsEditing(false)
    } catch (error) {
      console.error('更新に失敗しました:', error)
    }
  }

  return (
    <li className="bg-white shadow p-4 rounded">
      {isEditing ? (
        <div className="space-y-2">
          <input
            className="border p-2 w-full"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
          />
          <input
            type="number"
            className="border p-2 w-full"
            value={editedPrice}
            onChange={(e) => setEditedPrice(Number(e.target.value))}
          />
          <input
            type="date"
            className="border p-2 w-full"
            value={editedDate}
            onChange={(e) => setEditedDate(e.target.value)}
          />
          <div className="flex gap-2">
            <button onClick={handleUpdate} className="px-3 py-1 bg-blue-500 text-white rounded">
              保存
            </button>
            <button onClick={() => setIsEditing(false)} className="px-3 py-1 bg-gray-300 rounded">
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="font-bold text-lg">{name}</div>
          <div className="text-sm text-gray-700">月額料金: ¥{price}</div>
          <div className="text-sm text-gray-700">次回請求日: {billingDate}</div>
          <button onClick={() => setIsEditing(true)} className="mt-2 text-blue-600 text-sm underline">
            編集
          </button>
        </div>
      )}
    </li>
  )
}
