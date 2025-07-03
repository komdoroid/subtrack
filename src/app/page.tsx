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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 text-gray-800 font-inter scroll-smooth">
      {/* ヘッダー / ナビゲーション */}
      <header className="flex justify-between items-center px-6 py-4 shadow-lg backdrop-blur-sm sticky top-0 bg-white/90 z-50">
        <a href="#hero" className="flex items-center space-x-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/icons/icon-512.png" 
            alt="SubTrack" 
            className="w-10 h-10"
          />
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">SubTrack</span>
        </a>
        <nav className="hidden md:flex space-x-6 text-sm">
          <a href="#features" className={`transition-all duration-300 ${activeSection === 'features' ? 'text-indigo-700 font-semibold' : 'hover:text-indigo-700 hover:scale-105'}`}>機能</a>
          <a href="#how" className={`transition-all duration-300 ${activeSection === 'how' ? 'text-indigo-700 font-semibold' : 'hover:text-indigo-700 hover:scale-105'}`}>使い方</a>
          <a href="#faq" className={`transition-all duration-300 ${activeSection === 'faq' ? 'text-indigo-700 font-semibold' : 'hover:text-indigo-700 hover:scale-105'}`}>FAQ</a>
          <a href="#cta" className={`transition-all duration-300 ${activeSection === 'cta' ? 'text-indigo-700 font-semibold' : 'hover:text-indigo-700 hover:scale-105'}`}>始める</a>
          <Link href="/auth" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg">ログイン</Link>
        </nav>
        {/* モバイル用ログインボタン */}
        <div className="md:hidden">
          <Link href="/auth" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg">ログイン</Link>
        </div>
      </header>

      {/* セクション 1. ヒーローセクション */}
      <section id="hero" className="text-center px-6 py-16 bg-gradient-to-br from-indigo-50 via-purple-50 to-white relative overflow-hidden">
        {/* 背景の装飾要素 */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full blur-3xl opacity-30"></div>
        
        <div className="relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">あなたのサブスク、見える化しよう。</h2>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">無料で使える、簡単・安全なサブスクリプション管理アプリ。支出を可視化して、賢くサブスクを管理しましょう。</p>
          
          {/* 認証状態に応じたボタン表示 */}
          {loading ? (
            <div className="inline-block bg-gray-400 text-white font-semibold px-8 py-4 rounded-full">
              読み込み中...
            </div>
          ) : user ? (
            <Link href="/dashboard">
              <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-xl">
                ダッシュボードに戻る
              </button>
            </Link>
          ) : (
            <div className="flex justify-center gap-4 flex-wrap">
              <Link href="/auth">
                <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-xl">
                  無料で始める
                </button>
              </Link>
              <Link href="/auth">
                <button className="border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-full text-lg hover:bg-indigo-600 hover:text-white transition-all duration-300 hover:scale-105 shadow-lg">
                  ログイン
                </button>
              </Link>
            </div>
          )}
          
          <div className="mt-12 relative">
            <div className="h-64 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-2xl flex items-center justify-center text-gray-500 shadow-2xl border border-white/50 backdrop-blur-sm">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-lg font-semibold">ダッシュボードプレビュー</p>
                <p className="text-sm">美しいグラフでサブスクを管理</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* セクション 2. 主な機能 */}
      <section id="features" className="px-6 py-12 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 to-purple-50/50"></div>
        <div className="relative z-10">
          <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-8 text-center">主な機能</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-white/50">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-800">サブスクリプション登録</h3>
              <p className="text-gray-600 leading-relaxed">サービス名、カテゴリ、金額、開始日、支払日などを簡単に登録可能。</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-white/50">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-800">支出ダッシュボード</h3>
              <p className="text-gray-600 leading-relaxed">今月の支出合計やサービスごとの金額を一目で確認。</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-white/50">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-800">分析グラフ</h3>
              <p className="text-gray-600 leading-relaxed">月別推移やカテゴリ別割合をグラフで可視化。</p>
            </div>
          </div>
        </div>
      </section>

      {/* セクション 3. 追加機能 */}
      <section id="additional" className="px-6 py-12 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full blur-3xl opacity-20"></div>
        <div className="relative z-10">
          <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-8 text-center">さらに便利な機能</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-white/50">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-800">自動月次更新</h3>
              <p className="text-gray-600 leading-relaxed">
                サブスクの支払日は毎月同じ？ならば自動で翌月分を記録。手間ゼロで続けられます。
              </p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-white/50">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-800">高度なフィルタリング</h3>
              <p className="text-gray-600 leading-relaxed">
                カテゴリ、月、価格、キーワードでサブスクを絞り込み、管理を効率化。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* セクション 4. 使い方 */}
      <section id="how" className="px-6 py-12 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-indigo-50"></div>
        <div className="relative z-10">
          <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-8 text-center">始め方は簡単</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full w-20 h-20 flex items-center justify-center font-bold text-2xl mx-auto mb-6 shadow-xl group-hover:scale-110 transition-all duration-300">1</div>
              <h4 className="font-bold text-xl mb-3 text-gray-800">アカウント登録</h4>
              <p className="text-gray-600 leading-relaxed">メールアドレスですぐに登録。簡単で安全です。</p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-full w-20 h-20 flex items-center justify-center font-bold text-2xl mx-auto mb-6 shadow-xl group-hover:scale-110 transition-all duration-300">2</div>
              <h4 className="font-bold text-xl mb-3 text-gray-800">サブスク登録</h4>
              <p className="text-gray-600 leading-relaxed">利用中のサービスを記録。詳細な分析が可能に。</p>
            </div>
            <div className="text-center group">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-full w-20 h-20 flex items-center justify-center font-bold text-2xl mx-auto mb-6 shadow-xl group-hover:scale-110 transition-all duration-300">3</div>
              <h4 className="font-bold text-xl mb-3 text-gray-800">支出分析</h4>
              <p className="text-gray-600 leading-relaxed">グラフで支出傾向を確認し最適化！</p>
            </div>
          </div>
        </div>
      </section>

      {/* セクション 5. FAQ */}
      <section id="faq" className="px-6 py-12 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-8 text-center">よくある質問</h3>
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/50">
            <h4 className="font-bold text-lg mb-3 text-gray-800">本当に無料で使えますか？</h4>
            <p className="text-gray-600 leading-relaxed">はい、完全無料でご利用いただけます。追加料金は一切かかりません。</p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/50">
            <h4 className="font-bold text-lg mb-3 text-gray-800">データは安全に管理されますか？</h4>
            <p className="text-gray-600 leading-relaxed">Firebaseを使用したセキュアなデータ管理で、あなたの情報を安全に保護します。</p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/50">
            <h4 className="font-bold text-lg mb-3 text-gray-800">どんなサブスクでも管理できますか？</h4>
            <p className="text-gray-600 leading-relaxed">Netflix、Spotify、Adobe Creative Cloud など、あらゆるサブスクリプションサービスに対応しています。</p>
          </div>
        </div>
      </section>

      {/* セクション 6. CTA */}
      <section id="cta" className="text-center px-6 py-16 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-black/10"></div>
        <div className="relative z-10">
          <h3 className="text-4xl font-bold mb-6">今すぐ無料で使ってみる</h3>
          <p className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed">サブスク管理、今日からもっと簡単に。あなたの支出を賢く管理しましょう。</p>
          {loading ? (
            <div className="inline-block bg-white/20 text-white font-semibold px-8 py-4 rounded-full">
              読み込み中...
            </div>
          ) : user ? (
            <Link href="/dashboard">
              <button className="bg-white text-indigo-600 px-8 py-4 rounded-full text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-xl font-semibold">
                ダッシュボードに戻る
              </button>
            </Link>
          ) : (
            <Link href="/auth">
              <button className="bg-white text-indigo-600 px-8 py-4 rounded-full text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-xl font-semibold">
                無料で始める
              </button>
            </Link>
          )}
        </div>
      </section>

      {/* フッター */}
      <footer className="text-center text-sm text-gray-500 py-6 border-t bg-gradient-to-r from-slate-50 to-indigo-50">
        &copy; 2025 SubTrack. All rights reserved.
      </footer>
    </div>
  )
}
