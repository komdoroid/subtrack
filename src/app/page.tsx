'use client'

import { useEffect, useState } from 'react'
import Link from "next/link"
import { useAuth } from '@/context/AuthContext'

const sections = ['hero', 'features', 'additional', 'how', 'faq', 'cta']

export default function LandingPage() {
  const { user, loading } = useAuth()
  const [activeSection, setActiveSection] = useState('hero')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.4 }
    )

    sections.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-white text-gray-800 font-inter scroll-smooth">
      {/* ヘッダー / ナビゲーション */}
      <header className="flex justify-between items-center px-6 py-4 shadow-sm sticky top-0 bg-white z-50">
        <a href="#hero" className="flex items-center space-x-2">
          <img 
            src="/icons/icon-512.png" 
            alt="SubTrack" 
            className="w-8 h-8"
          />
          <span className="text-xl font-bold text-indigo-900">SubTrack</span>
        </a>
        <nav className="hidden md:flex space-x-4 text-sm">
          <a href="#features" className={`transition-colors ${activeSection === 'features' ? 'text-indigo-700 font-semibold underline' : 'hover:text-indigo-700'}`}>機能</a>
          <a href="#how" className={`transition-colors ${activeSection === 'how' ? 'text-indigo-700 font-semibold underline' : 'hover:text-indigo-700'}`}>使い方</a>
          <a href="#faq" className={`transition-colors ${activeSection === 'faq' ? 'text-indigo-700 font-semibold underline' : 'hover:text-indigo-700'}`}>FAQ</a>
          <a href="#cta" className={`transition-colors ${activeSection === 'cta' ? 'text-indigo-700 font-semibold underline' : 'hover:text-indigo-700'}`}>始める</a>
          <Link href="/auth" className="bg-indigo-700 text-white px-4 py-2 rounded hover:bg-indigo-800 transition">ログイン</Link>
        </nav>
        {/* モバイル用ログインボタン */}
        <div className="md:hidden">
          <Link href="/auth" className="bg-indigo-700 text-white px-4 py-2 rounded hover:bg-indigo-800 transition">ログイン</Link>
        </div>
      </header>

      {/* セクション 1. ヒーローセクション */}
      <section id="hero" className="text-center px-6 py-20 bg-gradient-to-br from-indigo-50 to-white opacity-0 animate-fade-in">
        <h2 className="text-4xl md:text-5xl font-bold text-indigo-900 mb-4 animate-pulse">あなたのサブスク、見える化しよう。</h2>
        <p className="text-lg text-gray-700 mb-6 max-w-xl mx-auto">無料で使える、簡単・安全なサブスクリプション管理アプリ。</p>
        
        {/* 認証状態に応じたボタン表示 */}
        {loading ? (
          <div className="inline-block bg-gray-400 text-white font-semibold px-6 py-3 rounded-lg">
            読み込み中...
          </div>
        ) : user ? (
          <Link href="/dashboard">
            <button className="bg-indigo-700 text-white px-6 py-3 rounded-lg text-lg hover:bg-indigo-800 transition">
              ダッシュボードに戻る
            </button>
          </Link>
        ) : (
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/auth">
              <button className="bg-indigo-700 text-white px-6 py-3 rounded-lg text-lg hover:bg-indigo-800 transition">
                無料で始める
              </button>
            </Link>
            <Link href="/auth">
              <button className="border border-indigo-700 text-indigo-700 px-6 py-3 rounded-lg text-lg hover:bg-indigo-50 transition">
                ログイン
              </button>
            </Link>
          </div>
        )}
        
        <div className="mt-10 h-72 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 animate-slide-up opacity-0">
          [ここにアプリのスクリーンショット]
        </div>
      </section>

      {/* セクション 2. 主な機能 */}
      <section id="features" className="px-6 py-16 opacity-0 animate-fade-in">
        <h3 className="text-2xl font-bold text-indigo-900 mb-6 text-center">主な機能</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-slide-up opacity-0 max-w-5xl mx-auto">
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

      {/* セクション 3. 追加機能 */}
      <section id="additional" className="px-6 py-16 bg-indigo-50 opacity-0 animate-fade-in">
        <h3 className="text-2xl font-bold text-indigo-900 mb-6 text-center">さらに便利な機能</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-up opacity-0 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="text-2xl mb-3">⏰</div>
            <h3 className="font-semibold text-lg mb-2">自動月次更新</h3>
            <p className="text-sm text-gray-600">
              サブスクの支払日は毎月同じ？ならば自動で翌月分を記録。手間ゼロで続けられます。
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="text-2xl mb-3">🔍</div>
            <h3 className="font-semibold text-lg mb-2">高度なフィルタリング</h3>
            <p className="text-sm text-gray-600">
              カテゴリ、月、価格、キーワードでサブスクを絞り込み、管理を効率化。
            </p>
          </div>
        </div>
      </section>

      {/* セクション 4. 使い方 */}
      <section id="how" className="px-6 py-16 opacity-0 animate-fade-in">
        <h3 className="text-2xl font-bold text-indigo-900 mb-6 text-center">始め方は簡単</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up opacity-0 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="bg-indigo-100 text-indigo-800 rounded-full w-16 h-16 flex items-center justify-center font-bold text-xl mx-auto mb-4">1</div>
            <h4 className="font-semibold text-lg mb-2">アカウント登録</h4>
            <p className="text-sm text-gray-600">メールアドレスですぐに登録</p>
          </div>
          <div className="text-center">
            <div className="bg-indigo-100 text-indigo-800 rounded-full w-16 h-16 flex items-center justify-center font-bold text-xl mx-auto mb-4">2</div>
            <h4 className="font-semibold text-lg mb-2">サブスク登録</h4>
            <p className="text-sm text-gray-600">利用中のサービスを記録</p>
          </div>
          <div className="text-center">
            <div className="bg-indigo-100 text-indigo-800 rounded-full w-16 h-16 flex items-center justify-center font-bold text-xl mx-auto mb-4">3</div>
            <h4 className="font-semibold text-lg mb-2">支出分析</h4>
            <p className="text-sm text-gray-600">グラフで支出傾向を確認し最適化！</p>
          </div>
        </div>
      </section>

      {/* セクション 5. FAQ */}
      <section id="faq" className="px-6 py-16 bg-indigo-50 opacity-0 animate-fade-in">
        <h3 className="text-2xl font-bold text-indigo-900 mb-6 text-center">よくある質問</h3>
        <div className="space-y-4 animate-slide-up opacity-0 max-w-3xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow">
            <h4 className="font-semibold mb-2">本当に無料で使えますか？</h4>
            <p className="text-sm text-gray-600">はい、完全無料でご利用いただけます。追加料金は一切かかりません。</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <h4 className="font-semibold mb-2">データは安全に管理されますか？</h4>
            <p className="text-sm text-gray-600">Firebaseを使用したセキュアなデータ管理で、あなたの情報を安全に保護します。</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            <h4 className="font-semibold mb-2">どんなサブスクでも管理できますか？</h4>
            <p className="text-sm text-gray-600">Netflix、Spotify、Adobe Creative Cloud など、あらゆるサブスクリプションサービスに対応しています。</p>
          </div>
        </div>
      </section>

      {/* セクション 6. CTA */}
      <section id="cta" className="text-center px-6 py-20 bg-indigo-700 text-white opacity-0 animate-fade-in">
        <h3 className="text-3xl font-bold mb-4">今すぐ無料で使ってみる</h3>
        <p className="mb-6">サブスク管理、今日からもっと簡単に。</p>
        {loading ? (
          <div className="inline-block bg-gray-400 text-white font-semibold px-6 py-3 rounded-lg">
            読み込み中...
          </div>
        ) : user ? (
          <Link href="/dashboard">
            <button className="bg-white text-indigo-700 px-6 py-3 rounded-lg text-lg hover:bg-gray-100 transition">
              ダッシュボードに戻る
            </button>
          </Link>
        ) : (
          <Link href="/auth">
            <button className="bg-white text-indigo-700 px-6 py-3 rounded-lg text-lg hover:bg-gray-100 transition">
              無料で始める
            </button>
          </Link>
        )}
      </section>

      {/* フッター */}
      <footer className="text-center text-sm text-gray-500 py-6 border-t">
        &copy; 2025 SubTrack. All rights reserved.
      </footer>
    </div>
  )
}
