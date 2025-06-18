/**
 * useSubscriptionData.ts
 * ----------------------------------------
 * サブスクリプションデータを取得・キャッシュするカスタムフック
 * 更新日: 2025-01-XX
 * 更新内容: subscriptionsコレクションのみを使用、全サブスクリプションを一括取得
 */

import { useState, useEffect, useCallback } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'

// 統一されたsubscriptionsコレクションの型定義
interface Subscription {
  id: string
  userId: string
  name: string
  price: number
  category: string
  billingDay: number
  isActive: boolean
  month: string | null // 'YYYY-MM'形式、履歴の場合に使用
  createdFrom: string | null
  startDate: string
  endDate: string | null
  description: string | null
  createdAt: any // timestamp
  updatedAt: any // timestamp
}

// 戻り値の型定義（既存のSubscriptionLogとの互換性を保つ）
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

  const fetchData = useCallback(async () => {
    // userIdが未定義の場合は早期リターン
    if (!userId) {
      setData([])
      setLoading(false)
      setError(null)
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

      // subscriptionsコレクションから全データを一括取得
      const subscriptionsQuery = query(
        collection(db, 'subscriptions'),
        where('userId', '==', userId)
      )
      const snapshot = await getDocs(subscriptionsQuery)
      const allSubscriptions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Subscription[]

      // データの変換と統合
      const mergedData: SubscriptionLog[] = []

      allSubscriptions.forEach(sub => {
        // monthがnullの場合は現在契約中として扱い、当月として設定
        const month = sub.month || currentMonth
        
        // 重複チェック（同じ名前で同じ月のデータが既に存在する場合はスキップ）
        const exists = mergedData.some(existing => 
          existing.name === sub.name && existing.month === month
        )
        
        if (!exists) {
          mergedData.push({
            id: sub.id,
            userId: sub.userId,
            name: sub.name,
            price: sub.price,
            category: sub.category,
            billingDate: sub.startDate, // startDateをbillingDateとして使用
            month: month,
            createdFrom: sub.createdFrom || sub.id,
            createdAt: sub.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
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
  }, [userId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, mutate: fetchData }
} 