/**
 * useSubscriptionData.ts
 * ----------------------------------------
 * サブスクリプションデータを取得・キャッシュするカスタムフック
 * 更新日: 2025-01-XX
 * 更新内容: 統一されたsubscriptionsコレクションに対応
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

      // 1. 月別履歴データの取得（monthが'YYYY-MM'形式のもの）
      const historicalQuery = query(
        collection(db, 'subscriptions'),
        where('userId', '==', userId),
        where('month', '==', currentMonth)
      )
      const historicalSnapshot = await getDocs(historicalQuery)
      const historicalData = historicalSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Subscription[]

      // 2. 現在契約中データの取得（monthがnullまたは未定義でisActive: true）
      const currentQuery = query(
        collection(db, 'subscriptions'),
        where('userId', '==', userId),
        where('isActive', '==', true)
      )
      const currentSnapshot = await getDocs(currentQuery)
      const currentData = currentSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Subscription[]

      // 現在契約中のデータから、monthがnullまたは未定義のものを抽出
      const activeSubscriptions = currentData.filter(sub => 
        sub.month === null || sub.month === undefined
      )

      // 3. データの統合と変換
      const mergedData: SubscriptionLog[] = []

      // 履歴データを追加
      historicalData.forEach(sub => {
        mergedData.push({
          id: sub.id,
          userId: sub.userId,
          name: sub.name,
          price: sub.price,
          category: sub.category,
          billingDate: sub.startDate, // startDateをbillingDateとして使用
          month: sub.month!,
          createdFrom: sub.createdFrom || sub.id,
          createdAt: sub.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        })
      })

      // 現在契約中のデータを追加（履歴に存在しないもののみ）
      activeSubscriptions.forEach(sub => {
        const existsInHistory = historicalData.some(hist => hist.name === sub.name)
        if (!existsInHistory) {
          mergedData.push({
            id: sub.id,
            userId: sub.userId,
            name: sub.name,
            price: sub.price,
            category: sub.category,
            billingDate: sub.startDate, // startDateをbillingDateとして使用
            month: currentMonth,
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