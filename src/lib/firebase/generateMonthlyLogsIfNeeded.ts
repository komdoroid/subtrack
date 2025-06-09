/**
 * generateMonthlyLogsIfNeeded.ts
 * ----------------------------------------
 * サブスクリプションテンプレートを元に、今月の履歴データを生成する関数
 * Sparkプラン（無料プラン）を考慮した実装
 * 
 * @param userId - 認証済みユーザーのUID
 * @returns Promise<void>
 */

import { db } from '@/firebase'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  writeBatch,
} from 'firebase/firestore'

// 型定義
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
  userId: string
  name: string
  price: number
  category: string
  billingDate: string
  month: string
  createdFrom: string
  createdAt: string
}

// 最後の実行日時を保存するためのキー
const LAST_EXECUTION_KEY = 'last_monthly_log_generation'

/**
 * 本日分の生成が必要かどうかをチェック
 */
const shouldExecute = (): boolean => {
  const lastExecution = localStorage.getItem(LAST_EXECUTION_KEY)
  if (!lastExecution) return true

  const lastDate = new Date(lastExecution)
  const today = new Date()
  
  return lastDate.getDate() !== today.getDate()
}

/**
 * 指定された年月の末日を取得
 */
const getLastDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate()
}

/**
 * billingDayを考慮して支払日を算出（末日丸め込み対応）
 */
const calculateBillingDate = (year: number, month: number, billingDay: number): string => {
  const lastDay = getLastDayOfMonth(year, month)
  const actualDay = Math.min(billingDay, lastDay)
  
  return `${year}-${String(month).padStart(2, '0')}-${String(actualDay).padStart(2, '0')}`
}

/**
 * 今月の履歴データを生成する関数
 */
export const generateMonthlyLogsIfNeeded = async (userId: string): Promise<void> => {
  // 本日分が既に実行済みの場合はスキップ
  if (!shouldExecute()) {
    console.log('Monthly logs already generated today')
    return
  }

  try {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    const currentMonthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`

    // 1回のクエリでテンプレートとログを取得（読み取り回数の最適化）
    const [templateSnapshots, existingLogs] = await Promise.all([
      getDocs(query(
        collection(db, 'subscriptionTemplates'),
        where('userId', '==', userId),
        where('isActive', '==', true)
      )),
      getDocs(query(
        collection(db, 'subscriptionLogs'),
        where('userId', '==', userId),
        where('month', '==', currentMonthStr)
      ))
    ])

    // 既存ログのマップを作成
    const existingLogMap = new Map(
      existingLogs.docs.map(doc => [doc.data().createdFrom, true])
    )

    // 生成が必要なログのみを抽出
    const logsToGenerate = templateSnapshots.docs
      .filter(doc => !existingLogMap.has(doc.id))
      .map(doc => {
        const template = { id: doc.id, ...doc.data() } as SubscriptionTemplate
        const billingDate = calculateBillingDate(
          currentYear,
          currentMonth,
          template.billingDay
        )

        return {
          userId: template.userId,
          name: template.name,
          price: template.price,
          category: template.category,
          billingDate,
          month: currentMonthStr,
          createdFrom: template.id,
          createdAt: new Date().toISOString()
        }
      })

    // 生成が必要なログがある場合のみ書き込み
    if (logsToGenerate.length > 0) {
      const batch = writeBatch(db)
      logsToGenerate.forEach(log => {
        const newLogRef = doc(collection(db, 'subscriptionLogs'))
        batch.set(newLogRef, log)
      })
      await batch.commit()
      console.log(`Generated ${logsToGenerate.length} logs for ${currentMonthStr}`)
    } else {
      console.log('No new logs needed for', currentMonthStr)
    }

    // 実行日時を保存
    localStorage.setItem(LAST_EXECUTION_KEY, new Date().toISOString())

  } catch (error) {
    console.error('Error generating monthly logs:', error)
    throw error
  }
} 