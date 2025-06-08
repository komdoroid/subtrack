/**
 * page.tsx (Subscription List)
 * ----------------------------------------
 * 作成日: 2024-03-21
 * 概要  : 全てのサブスクリプションを一覧表示するページ
 */

'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/useAuth'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PencilIcon, TrashIcon, Loader2Icon } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'

interface Subscription {
  id: string
  userId: string
  name: string
  price: number
  category: string
  billingDate: string
  month: string
}

export default function SubscriptionListPage() {
  const { user, loading: authLoading } = useAuth(true)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!user) return

      try {
        const q = query(
          collection(db, 'subscriptionLogs'),
          where('userId', '==', user.uid)
        )
        const querySnapshot = await getDocs(q)
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Subscription[]

        setSubscriptions(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching subscriptions:', err)
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchSubscriptions()
  }, [user])

  // 編集ボタンのハンドラー（仮実装）
  const handleEdit = (subscription: Subscription) => {
    console.log('Edit subscription:', subscription)
    // TODO: 編集モーダルを表示する処理を実装
  }

  // 削除ボタンのハンドラー（仮実装）
  const handleDelete = (subscription: Subscription) => {
    console.log('Delete subscription:', subscription)
    // TODO: 削除確認ダイアログを表示する処理を実装
  }

  if (authLoading || loading) {
    return (
      <AppShell>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center gap-2 text-gray-600">
            <Loader2Icon className="h-6 w-6 animate-spin" />
            <span>読み込み中...</span>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="container mx-auto py-8 px-4">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">すべてのサブスクリプション</CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                <p>エラーが発生しました: {error.message}</p>
                <p className="text-sm mt-2">詳細はコンソールを確認してください。</p>
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                登録されたデータがありません
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {subscriptions.map((subscription) => (
                  <Card key={subscription.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {subscription.name}
                          </h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {subscription.category}
                          </span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">
                          ¥{subscription.price.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500 space-y-1 mb-4">
                        <p>支払日: {subscription.billingDate}</p>
                        <p>対象月: {subscription.month}</p>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(subscription)}
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          編集
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(subscription)}
                        >
                          <TrashIcon className="h-4 w-4 mr-1" />
                          削除
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
} 