/**
 * page.tsx (Subscription List)
 * ----------------------------------------
 * 作成日: 2024-03-21
 * 概要  : 全てのサブスクリプションを一覧表示するページ
 */

'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/useAuth'
import { useSubscriptionData } from '@/lib/hooks/useSubscriptionData'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PencilIcon, TrashIcon, Loader2Icon, FilterIcon } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
  const { data: subscriptions, loading, error } = useSubscriptionData(user?.uid)
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([])
  const [filters, setFilters] = useState({
    category: 'all',
    minPrice: '',
    maxPrice: '',
    searchQuery: '',
    month: 'all'  // 月フィルターを追加
  })

  // フィルタリング処理
  useEffect(() => {
    if (!subscriptions) return

    let filtered = [...subscriptions]

    // カテゴリフィルター
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(sub => sub.category === filters.category)
    }

    // 月フィルター
    if (filters.month && filters.month !== 'all') {
      filtered = filtered.filter(sub => sub.month === filters.month)
    }

    // 価格範囲フィルター
    if (filters.minPrice) {
      filtered = filtered.filter(sub => sub.price >= Number(filters.minPrice))
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(sub => sub.price <= Number(filters.maxPrice))
    }

    // 検索クエリ
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(sub =>
        sub.name.toLowerCase().includes(query) ||
        sub.category.toLowerCase().includes(query)
      )
    }

    setFilteredSubscriptions(filtered)
  }, [subscriptions, filters])

  // 編集ボタンのハンドラー
  const handleEdit = (subscription: Subscription) => {
    console.log('Edit subscription:', subscription)
    // TODO: 編集モーダルを表示する処理を実装
  }

  // 削除ボタンのハンドラー
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

  const uniqueCategories = Array.from(new Set(subscriptions?.map(sub => sub.category) || []))
  const uniqueMonths = Array.from(new Set(subscriptions?.map(sub => sub.month) || []))
    .sort((a, b) => b.localeCompare(a)) // 月を降順にソート

  return (
    <AppShell>
      <div className="container mx-auto py-8 px-4">
        <Card className="mb-8 bg-gray-50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl text-gray-900">すべてのサブスクリプション</CardTitle>
            <div className="flex items-center gap-2">
              <FilterIcon className="h-5 w-5 text-gray-900" />
              <span className="text-sm text-gray-900">フィルター</span>
            </div>
          </CardHeader>
          <CardContent>
            {/* フィルターセクション */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm">
              <div>
                <Label htmlFor="category" className="text-gray-900">カテゴリ</Label>
                <Select
                  value={filters.category}
                  onValueChange={(value: string) => setFilters(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="bg-white text-gray-400 border-gray-200 hover:bg-gray-50">
                    <SelectValue placeholder="カテゴリを選択" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all" className="text-gray-900 hover:bg-gray-50">すべて</SelectItem>
                    {uniqueCategories.map(category => (
                      <SelectItem key={category} value={category} className="text-gray-900 hover:bg-gray-50">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="month" className="text-gray-900">月</Label>
                <Select
                  value={filters.month}
                  onValueChange={(value: string) => setFilters(prev => ({ ...prev, month: value }))}
                >
                  <SelectTrigger className="bg-white text-gray-400 border-gray-200 hover:bg-gray-50">
                    <SelectValue placeholder="月を選択" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all" className="text-gray-900 hover:bg-gray-50">All</SelectItem>
                    {uniqueMonths.map(month => (
                      <SelectItem key={month} value={month} className="text-gray-900 hover:bg-gray-50">
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="minPrice" className="text-gray-900">最小価格</Label>
                <Input
                  id="minPrice"
                  type="number"
                  placeholder="¥0"
                  value={filters.minPrice}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                  className="bg-white text-gray-900 border-gray-200 hover:bg-gray-50 focus:bg-white"
                />
              </div>
              <div>
                <Label htmlFor="maxPrice" className="text-gray-900">最大価格</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  placeholder="¥999,999"
                  value={filters.maxPrice}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                  className="bg-white text-gray-900 border-gray-200 hover:bg-gray-50 focus:bg-white"
                />
              </div>
              <div>
                <Label htmlFor="search" className="text-gray-900">検索</Label>
                <Input
                  id="search"
                  type="text"
                  placeholder="サービス名で検索..."
                  value={filters.searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                  className="bg-white text-gray-900 border-gray-200 hover:bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            {error ? (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                <p>エラーが発生しました: {error.message}</p>
                <p className="text-sm mt-2">詳細はコンソールを確認してください。</p>
              </div>
            ) : filteredSubscriptions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {subscriptions?.length === 0 ? '登録されたデータがありません' : '条件に一致するサブスクリプションがありません'}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredSubscriptions.map((subscription) => (
                  <Card key={subscription.id} className="overflow-hidden bg-gray-50">
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
                          size="icon"
                          onClick={() => handleEdit(subscription)}
                          className="bg-white hover:bg-gray-100 text-gray-700 hover:text-gray-600 hover:border-gray-600 transition-colors"
                        >
                          <PencilIcon className="h-4 w-4" />
                          <span className="sr-only">編集</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(subscription)}
                          className="bg-white hover:bg-red-50 text-gray-700 hover:text-red-600 hover:border-red-600 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                          <span className="sr-only">削除</span>
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