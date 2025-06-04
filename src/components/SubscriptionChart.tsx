/**
 * SubscriptionChart.tsx
 * ----------------------------------------
 * 作成日: 2025-06-02
 * 概要  : 過去12ヶ月分の月別サブスク支出を棒グラフ表示（0円月も含む）
 */

'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/lib/useAuth'

type PaymentHistory = {
  amount: number
  paymentDate: string // 'YYYY-MM-DD'
}

type MonthlyData = {
  month: string // 'YYYY-MM'
  total: number
}

// 📅 過去12か月分の年月配列を生成
const generateLast12Months = (): string[] => {
  const result: string[] = []
  const today = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const month = d.toISOString().slice(0, 7) // 'YYYY-MM'
    result.push(month)
  }
  return result
}

export const SubscriptionChart = () => {
  const { user } = useAuth()
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])

  useEffect(() => {
    if (!user) return

    // 過去12ヶ月分のデータを取得
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 11)
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

      // 過去12ヶ月分のデータを生成（支払いがない月は0円）
      const months = generateLast12Months()
      const fullData: MonthlyData[] = months.map((month) => ({
        month,
        total: totals[month] || 0,
      }))

      setMonthlyData(fullData)
    })

    return () => unsubscribe()
  }, [user])

  if (!user) return null
  if (!monthlyData.length) return <p>データがありません。</p>

  return (
    <div className="w-full max-w-3xl mx-auto mt-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">月別合計支出グラフ（直近12ヶ月）</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={monthlyData}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total" fill="#3B82F6" barSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
