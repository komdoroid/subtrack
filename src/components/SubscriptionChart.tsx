/**
 * SubscriptionChart.tsx
 * ----------------------------------------
 * 作成日: 2025-06-02
 * 概要  : 過去6ヶ月分の月別サブスク支出と今月の予定支出を棒グラフ表示
 * 更新日: 2025-01-XX
 * 更新内容: 統一されたsubscriptionsコレクションに対応
 */

'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/lib/useAuth'
import { TooltipProps } from 'recharts'
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'

// 新しいデータ構造に対応した型定義
type Subscription = {
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
  createdAt: string // timestamp
  updatedAt: string // timestamp
}

type MonthlyData = {
  month: string // 'YYYY-MM'
  actual: number // 実績値
  planned?: number // 予定支出（今月のみ）
}

// 📅 過去6か月分の年月配列を生成
const generateLast6Months = (): string[] => {
  const result: string[] = []
  const today = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const month = d.toISOString().slice(0, 7) // 'YYYY-MM'
    result.push(month)
  }
  // 今月も追加
  result.push(today.toISOString().slice(0, 7))
  return result
}

// 月の表示名を整形する関数
const formatMonthLabel = (month: string): string => {
  const [year, monthNum] = month.split('-')
  return `${year}年${Number(monthNum)}月`
}

// カスタムツールチップ
const CustomTooltip = ({ 
  active, 
  payload, 
  label 
}: TooltipProps<ValueType, NameType>) => {
  if (!active || !payload || !payload.length) return null
  
  return (
    <div className="bg-white p-3 border rounded shadow">
      <p className="font-bold mb-2">{label}</p>
      {payload.map((item, index) => (
        <p key={index} className="text-sm" style={{ color: item.color }}>
          {item.name}: ¥{item.value?.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

export const SubscriptionChart = () => {
  const { user } = useAuth()
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])

  useEffect(() => {
    if (!user) return

    // subscriptionsコレクションからデータを取得
    const q = query(
      collection(db, 'subscriptions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'asc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const subscriptions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Subscription[]

      // 実績支出の計算（monthが存在する履歴データ）
      const historicalData = subscriptions.filter(sub => sub.month !== null)
      const actualTotals: Record<string, number> = {}

      for (const subscription of historicalData) {
        const month = subscription.month!
        actualTotals[month] = (actualTotals[month] || 0) + subscription.price
      }

      // 今月の予定支出の計算（isActive: true かつ monthがnullまたは存在しない）
      const currentSubscriptions = subscriptions.filter(sub => 
        sub.isActive && (sub.month === null || sub.month === undefined)
      )
      const currentMonthTotal = currentSubscriptions.reduce((sum, sub) => sum + sub.price, 0)

      // 過去6ヶ月分と今月のデータを生成
      const months = generateLast6Months()
      const currentMonth = new Date().toISOString().slice(0, 7)

      const fullData: MonthlyData[] = months.map((month) => ({
        month: formatMonthLabel(month),
        actual: actualTotals[month] || 0,
        ...(month === currentMonth ? { planned: currentMonthTotal } : {})
      }))

      setMonthlyData(fullData)
    })

    return () => unsubscribe()
  }, [user])

  if (!user) return null
  if (!monthlyData.length) return <p>データがありません。</p>

  return (
    <section className="bg-white p-6 rounded-2xl shadow-md">
      <h3 className="font-semibold text-lg mb-3">月別支出推移（直近6ヶ月）</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={monthlyData}>
          <XAxis 
            dataKey="month" 
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
            tick={{fontSize: 12}}
          />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="actual" 
            fill="#3B82F6" 
            barSize={30}
            name="実績"
          />
          <Bar 
            dataKey="planned" 
            fill="#10B981" 
            barSize={30}
            name="予定"
          />
        </BarChart>
      </ResponsiveContainer>
    </section>
  )
}