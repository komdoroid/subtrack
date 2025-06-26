'use client'

import Link from "next/link"
import { useAuth } from '@/context/AuthContext'

export default function LandingPage() {
  const { user, loading } = useAuth()

  return (
    <div className="min-h-screen bg-white text-gray-800">
      {/* ヒーローセクション */}
      <section className="px-6 py-20 text-center bg-gradient-to-br from-blue-50 to-white">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          サブスクを見える化し、<br className="hidden md:inline" />賢く管理。
        </h1>
        <p className="text-lg text-gray-600 mb-6 max-w-xl mx-auto">
          SubTrackはあなたのすべてのサブスクリプションを一元管理し、支出の最適化を支援します。
        </p>
        
        {/* 認証状態に応じたボタン表示 */}
        {loading ? (
          <div className="inline-block bg-gray-400 text-white font-semibold px-6 py-3 rounded-full">
            読み込み中...
          </div>
        ) : user ? (
          <Link href="/dashboard">
            <button className="inline-block bg-blue-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-blue-700 transition">
              ダッシュボードに戻る
            </button>
          </Link>
        ) : (
          <div className="flex justify-center gap-4">
            <Link href="/auth">
              <button className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-full hover:bg-blue-700 transition">
                今すぐ始める（無料）
              </button>
            </Link>
            <Link href="/auth">
              <button className="border border-blue-600 text-blue-600 font-semibold px-6 py-3 rounded-full hover:bg-blue-50 transition">
                ログイン
              </button>
            </Link>
          </div>
        )}
      </section>

      {/* 機能セクション */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-10 text-center">主な機能</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
            <div className="text-2xl mb-3">📝</div>
            <h3 className="font-semibold text-lg mb-2">サブスクリプション登録</h3>
            <p className="text-sm text-gray-600">サービス名、カテゴリ、金額、開始日、支払日などを簡単に登録可能。</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
            <div className="text-2xl mb-3">📊</div>
            <h3 className="font-semibold text-lg mb-2">支出ダッシュボード</h3>
            <p className="text-sm text-gray-600">今月の支出合計やサービスごとの金額を一目で確認。</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
            <div className="text-2xl mb-3">📈</div>
            <h3 className="font-semibold text-lg mb-2">分析グラフ</h3>
            <p className="text-sm text-gray-600">月別推移やカテゴリ別割合をグラフで可視化。</p>
          </div>
        </div>
      </section>

      {/* 追加機能の紹介 */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-50 p-6 rounded-xl shadow">
            <div className="text-2xl mb-3">⏰</div>
            <h3 className="font-semibold text-lg mb-2">自動月次更新</h3>
            <p className="text-sm text-gray-600">
              サブスクの支払日は毎月同じ？ならば自動で翌月分を記録。手間ゼロで続けられます。
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-xl shadow">
            <div className="text-2xl mb-3">🔍</div>
            <h3 className="font-semibold text-lg mb-2">高度なフィルタリング</h3>
            <p className="text-sm text-gray-600">
              カテゴリ、月、価格、キーワードでサブスクを絞り込み、管理を効率化。
            </p>
          </div>
        </div>
      </section>

      {/* 利用ステップ */}
      <section className="px-6 py-16 bg-gray-50">
        <h2 className="text-2xl font-bold mb-10 text-center">始め方は簡単</h2>
        <ol className="space-y-6 max-w-2xl mx-auto text-gray-700">
          <li className="flex items-start gap-4">
            <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shrink-0">1</span>
            <div>
              <strong>アカウント登録</strong> - メールアドレスですぐに登録。
            </div>
          </li>
          <li className="flex items-start gap-4">
            <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shrink-0">2</span>
            <div>
              <strong>サブスク登録</strong> - 利用中のサービスを記録。
            </div>
          </li>
          <li className="flex items-start gap-4">
            <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shrink-0">3</span>
            <div>
              <strong>支出分析</strong> - グラフで支出傾向を確認し最適化！
            </div>
          </li>
        </ol>
        
        {/* CTA */}
        <div className="text-center mt-12">
          {!loading && !user && (
            <Link href="/auth">
              <button className="bg-blue-600 text-white font-semibold px-8 py-4 rounded-full hover:bg-blue-700 transition text-lg">
                無料で始める
              </button>
            </Link>
          )}
        </div>
      </section>

      {/* フッター */}
      <footer className="text-center text-sm text-gray-500 py-6 border-t">
        &copy; 2025 SubTrack. All rights reserved.
      </footer>
    </div>
  )
}
