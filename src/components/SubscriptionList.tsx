/**
 * SubscriptionList.tsx
 * ----------------------------------------
 * 作成日: 2025-05-26
 * 更新日: 2025-05-26
 * 概要  : Firestore から現在のユーザーのサブスクリプション一覧をリアルタイム取得・表示
 */

'use client'

import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/lib/useAuth'

type Subscription = {
  id: string
  name: string
  price: number
  billingDate: string
}

export const SubscriptionList = () => {
  const { user } = useAuth()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])

  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, 'subscriptions'),
      where('uid', '==', user.uid)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Subscription[]
      setSubscriptions(data)
    })

    return () => unsubscribe()
  }, [user])

  if (!user) return null
  if (!subscriptions.length) return <p>登録されたサブスクリプションはありません。</p>

  return (
    <div className="mt-6 w-full max-w-2xl">
      <h2 className="text-xl font-semibold mb-4">登録済みのサブスクリプション</h2>
      <ul className="space-y-4">
        {subscriptions.map((sub) => (
          <li key={sub.id} className="bg-white shadow p-4 rounded">
            <div className="font-bold text-lg">{sub.name}</div>
            <div className="text-sm text-gray-700">月額料金: ¥{sub.price}</div>
            <div className="text-sm text-gray-700">次回請求日: {sub.billingDate}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
