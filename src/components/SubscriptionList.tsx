/**
 * SubscriptionList.tsx
 * ----------------------------------------
 * 作成日: 2025-05-26
 * 更新日: 2025-05-26
 * 概要  : Firestore から現在のユーザーのサブスクリプション一覧をリアルタイム取得・表示 +
 *         月額料金の合計を表示
 */

'use client'

import { useEffect, useState, useMemo } from 'react'
import { collection, onSnapshot, query, where, doc, updateDoc, addDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/lib/useAuth'
import { SubscriptionItem } from './SubscriptionItem'

type Subscription = {
  id: string
  name: string
  price: number
  billingDate: string
}

export const SubscriptionList = () => {
  const { user } = useAuth()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])

  // 支出履歴を記録する
  const recordPaymentHistory = async (subscription: Subscription, paymentDate: Date) => {
    try {
      await addDoc(collection(db, 'payment_history'), {
        userId: user?.uid,
        subscriptionId: subscription.id,
        subscriptionName: subscription.name,
        amount: subscription.price,
        paymentDate: paymentDate.toISOString().split('T')[0],
        createdAt: new Date()
      })
    } catch (error) {
      console.error('支出履歴の記録に失敗しました:', error)
    }
  }

  // 請求日の更新が必要かチェックし、必要な場合は更新する
  const updateBillingDateIfNeeded = async (subscription: Subscription) => {
    const today = new Date()
    const billingDate = new Date(subscription.billingDate)
    
    if (billingDate < today) {
      // 支出履歴を記録
      await recordPaymentHistory(subscription, billingDate)

      // 次回請求日を計算（翌月の同日）
      const nextBillingDate = new Date(billingDate)
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)
      
      // 日付が存在しない場合（例：3/31 → 4/31）は月末に調整
      while (nextBillingDate.getMonth() > billingDate.getMonth() + 1) {
        nextBillingDate.setDate(nextBillingDate.getDate() - 1)
      }

      try {
        await updateDoc(doc(db, 'subscriptions', subscription.id), {
          billingDate: nextBillingDate.toISOString().split('T')[0]
        })
        console.log(`Updated billing date for ${subscription.name} to ${nextBillingDate.toISOString().split('T')[0]}`)
      } catch (error) {
        console.error('請求日の更新に失敗しました:', error)
      }
    }
  }

  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, 'subscriptions'),
      where('userId', '==', user.uid)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Subscription[]
      setSubscriptions(data)

      // 各サブスクリプションの請求日をチェック・更新
      data.forEach(updateBillingDateIfNeeded)
    })

    return () => unsubscribe()
  }, [user])

  const totalPrice = useMemo(() => {
    return subscriptions.reduce((sum, sub) => sum + (sub.price || 0), 0)
  }, [subscriptions])

  if (!user) return null
  if (!subscriptions.length) return <p>登録されたサブスクリプションはありません。</p>

  return (
    <div className="mt-6 w-full max-w-2xl">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">登録済みのサブスクリプション</h2>

      <div className="mb-4 text-lg font-bold text-blue-700">
        合計: ¥{totalPrice.toLocaleString()} / 月
      </div>

      <ul className="space-y-4">
        {subscriptions.map((sub) => (
          <SubscriptionItem 
            key={sub.id} 
            id={sub.id}
            name={sub.name}
            price={sub.price}
            billingDate={sub.billingDate}
          />
        ))}
      </ul>
    </div>
  )
}
