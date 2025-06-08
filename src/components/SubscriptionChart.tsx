/**
 * SubscriptionChart.tsx
 * ----------------------------------------
 * 作成日: 2025-06-02
 * 概要  : 過去6ヶ月分の月別サブスク支出と今月の予定支出を棒グラフ表示
 */

'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/lib/useAuth'
import { useSubscriptionData } from '@/lib/hooks/useSubscriptionData'

type PaymentHistory = {
  amount: number
  paymentDate: string // 'YYYY-MM-DD'
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
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="bg-white p-3 border rounded shadow">
      <p className="font-bold mb-2">{label}</p>
      {payload.map((item: any, index: number) => (
        <p key={index} className="text-sm" style={{ color: item.color }}>
          {item.name}: ¥{item.value.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

export const SubscriptionChart = () => {
  const { user } = useAuth()
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const { data: currentSubscriptions } = useSubscriptionData(user?.uid)

  useEffect(() => {
    if (!user) return

    // 過去6ヶ月分のデータを取得
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 5)
    startDate.setDate(1)
    startDate.setHours(0, 0, 0, 0)

    const q = query(
      collection(db, 'payment_history'),
      where('userId', '==', user.uid),
      where('paymentDate', '>=', startDate.toISOString().split('T')[0]),
      orderBy('paymentDate', 'asc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const payments = snapshot.docs.map((doc) => doc.data() as PaymentHistory)
      const totals: Record<string, number> = {}

      // 支払い履歴から月別合計を計算
      for (const payment of payments) {
        const month = payment.paymentDate.slice(0, 7)
        totals[month] = (totals[month] || 0) + payment.amount
      }

      // 過去6ヶ月分と今月のデータを生成
      const months = generateLast6Months()
      const currentMonth = new Date().toISOString().slice(0, 7)
      const currentMonthTotal = currentSubscriptions?.reduce((sum, sub) => sum + sub.price, 0) || 0

      const fullData: MonthlyData[] = months.map((month) => ({
        month: formatMonthLabel(month),
        actual: totals[month] || 0,
        ...(month === currentMonth ? { planned: currentMonthTotal } : {})
      }))

      setMonthlyData(fullData)
    })

    return () => unsubscribe()
  }, [user, currentSubscriptions])

  if (!user) return null
  if (!monthlyData.length) return <p>データがありません。</p>

  return (
    <div className="w-full max-w-3xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">月別支出推移（直近6ヶ月）</h2>
        <div className="text-right">
          <p className="text-sm text-gray-600">今月の予定支出</p>
          <p className="text-2xl font-bold text-blue-600">
            ¥{monthlyData[monthlyData.length - 1]?.planned?.toLocaleString() || '0'}
          </p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
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
    </div>
  )
}