/**
 * useSubscriptionData.ts
 * ----------------------------------------
 * サブスクリプションデータを取得・キャッシュするカスタムフック
 */

import { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'
import { generateMonthlyLogsIfNeeded } from '../firebase/generateMonthlyLogsIfNeeded'

interface SubscriptionTemplate {
  id: string
  userId: string
  name: string
  price: number
  billingDay: number
  category: string
  isActive: boolean
  createdAt: string
}

interface SubscriptionLog {
  id: string
  userId: string
  name: string
  price: number
  category: string
  billingDate: string
  month: string
  createdFrom: string
  createdAt: string
}

// 既存のサブスクリプションの型定義
interface OldSubscription {
  id: string
  userId: string
  name: string
  price: number
  billingDate: string
  category?: string
}

// キャッシュの有効期限（1時間）
const CACHE_EXPIRY = 60 * 60 * 1000

interface CacheData {
  timestamp: number
  data: SubscriptionLog[]
}

export const useSubscriptionData = (userId: string | undefined) => {
  const [data, setData] = useState<SubscriptionLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setLoading(false)
        return
      }

      try {
        // キャッシュキーの生成（ユーザーID + 年月）
        const currentMonth = new Date().toISOString().slice(0, 7)
        const CACHE_KEY = `subscription_data_${userId}_${currentMonth}`

        // キャッシュのチェック
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
          const cacheData: CacheData = JSON.parse(cached)
          const isExpired = Date.now() - cacheData.timestamp > CACHE_EXPIRY

          if (!isExpired) {
            setData(cacheData.data)
            setLoading(false)
            return
          }
        }

        // 月次ログの生成（既存のsubscriptionsコレクションからの移行処理も含む）
        await generateMonthlyLogsIfNeeded(userId)

        // 既存のsubscriptionsコレクションからのデータ取得
        const oldSubscriptionsQuery = query(
          collection(db, 'subscriptions'),
          where('userId', '==', userId)
        )
        const oldSubscriptionsSnapshot = await getDocs(oldSubscriptionsQuery)
        const oldSubscriptions = oldSubscriptionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          category: doc.data().category || 'その他', // カテゴリがない場合のフォールバック
        })) as OldSubscription[]

        // 新しいsubscriptionLogsからのデータ取得
        const logsQuery = query(
          collection(db, 'subscriptionLogs'),
          where('userId', '==', userId),
          where('month', '==', currentMonth)
        )
        const logsSnapshot = await getDocs(logsQuery)
        const logs = logsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as SubscriptionLog[]

        // 両方のデータをマージ
        const mergedData = [...logs]
        
        // 古いデータで、新しいログに存在しないものを追加
        oldSubscriptions.forEach(oldSub => {
          const exists = logs.some(log => log.name === oldSub.name)
          if (!exists) {
            mergedData.push({
              id: oldSub.id,
              userId: oldSub.userId,
              name: oldSub.name,
              price: oldSub.price,
              category: oldSub.category || 'その他',
              billingDate: oldSub.billingDate,
              month: currentMonth,
              createdFrom: oldSub.id,
              createdAt: new Date().toISOString()
            })
          }
        })

        // キャッシュの更新
        const cacheData: CacheData = {
          timestamp: Date.now(),
          data: mergedData
        }
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))

        setData(mergedData)
        setLoading(false)

      } catch (err) {
        console.error('Error fetching subscription data:', err)
        setError(err instanceof Error ? err : new Error('Unknown error'))
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  return { data, loading, error }
} 