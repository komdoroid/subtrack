import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc } from 'firebase/firestore'
import { firebaseConfig } from '../firebase'

// Firebaseの初期化
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// ダミーデータを作成する関数
async function seedDummyData() {
  // ユーザーIDを設定（実際のユーザーIDに置き換えてください）
  const userId = 'YOUR_USER_ID'

  // 過去3か月分のダミーデータ
  const dummyPayments = [
    // 2か月前
    {
      userId,
      subscriptionId: 'netflix_dummy',
      subscriptionName: 'Netflix',
      amount: 1490,
      paymentDate: getDateString(-2, 15), // 2か月前の15日
      createdAt: new Date()
    },
    {
      userId,
      subscriptionId: 'spotify_dummy',
      subscriptionName: 'Spotify',
      amount: 980,
      paymentDate: getDateString(-2, 20), // 2か月前の20日
      createdAt: new Date()
    },
    // 1か月前
    {
      userId,
      subscriptionId: 'netflix_dummy',
      subscriptionName: 'Netflix',
      amount: 1490,
      paymentDate: getDateString(-1, 15), // 1か月前の15日
      createdAt: new Date()
    },
    {
      userId,
      subscriptionId: 'spotify_dummy',
      subscriptionName: 'Spotify',
      amount: 980,
      paymentDate: getDateString(-1, 20), // 1か月前の20日
      createdAt: new Date()
    },
    {
      userId,
      subscriptionId: 'amazon_dummy',
      subscriptionName: 'Amazon Prime',
      amount: 500,
      paymentDate: getDateString(-1, 25), // 1か月前の25日
      createdAt: new Date()
    },
    // 今月
    {
      userId,
      subscriptionId: 'netflix_dummy',
      subscriptionName: 'Netflix',
      amount: 1490,
      paymentDate: getDateString(0, 15), // 今月15日
      createdAt: new Date()
    }
  ]

  try {
    // payment_historyコレクションにダミーデータを追加
    for (const payment of dummyPayments) {
      await addDoc(collection(db, 'payment_history'), payment)
      console.log(`Added payment history for ${payment.subscriptionName} on ${payment.paymentDate}`)
    }

    // 現在のサブスクリプションデータ
    const currentSubscriptions = [
      {
        userId,
        name: 'Netflix',
        price: 1490,
        billingDate: getDateString(0, 15) // 今月15日
      },
      {
        userId,
        name: 'Spotify',
        price: 980,
        billingDate: getDateString(0, 20) // 今月20日（まだ支払われていない）
      },
      {
        userId,
        name: 'Amazon Prime',
        price: 500,
        billingDate: getDateString(0, 25) // 今月25日（まだ支払われていない）
      }
    ]

    // subscriptionsコレクションにデータを追加
    for (const subscription of currentSubscriptions) {
      await addDoc(collection(db, 'subscriptions'), subscription)
      console.log(`Added subscription for ${subscription.name}`)
    }

    console.log('Successfully added all dummy data!')
  } catch (error) {
    console.error('Error adding dummy data:', error)
  }
}

// 指定した月とdateの日付文字列を取得する関数
function getDateString(monthsOffset: number, date: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() + monthsOffset)
  d.setDate(date)
  return d.toISOString().split('T')[0]
}

// スクリプトを実行
seedDummyData() 