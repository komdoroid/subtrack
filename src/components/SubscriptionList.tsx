/**
 * SubscriptionList.tsx
 * ----------------------------------------
 * 作成日: 2025-05-26
 * 概要  : サブスクリプション一覧表示（現時点ではダミーデータ使用）
 * 補足  : 将来的に Firebase から取得するよう拡張予定
 */

'use client'

import { useEffect, useState } from 'react'

type Subscription = {
  id: string
  name: string
  price: number
  billingDate: string
}

export const SubscriptionList = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])

  useEffect(() => {
    // ダミーデータ（今後 Firebase から取得に置き換え）
    const dummy: Subscription[] = [
      {
        id: '1',
        name: 'Netflix',
        price: 990,
        billingDate: '2025-06-01',
      },
      {
        id: '2',
        name: 'Spotify',
        price: 480,
        billingDate: '2025-06-05',
      },
    ]
    setSubscriptions(dummy)
  }, [])

  return (
    <div className="w-full max-w-2xl mt-6">
      <h2 className="text-xl font-semibold mb-4">サブスクリプション一覧</h2>
      <ul className="space-y-3">
        {subscriptions.map((sub) => (
          <li
            key={sub.id}
            className="border rounded p-4 bg-white shadow-sm flex justify-between"
          >
            <div>
              <p className="font-bold">{sub.name}</p>
              <p className="text-sm text-gray-500">請求日: {sub.billingDate}</p>
            </div>
            <div className="text-right font-medium text-gray-700">
              ¥{sub.price.toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
