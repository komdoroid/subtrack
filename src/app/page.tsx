import Link from "next/link"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white px-6 py-12 md:px-20 lg:px-40">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          サブスク、見える化しよう
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          毎月のサブスクリプション、いくら使ってるか把握できていますか？
          <br />
          このアプリなら、支払いをカレンダーで追えて、費用も自動で集計されます。
        </p>

        <div className="flex justify-center gap-4">
          <Link href="/dashboard">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-xl text-lg hover:bg-blue-700 transition">
              ダッシュボードを見る
            </button>
          </Link>
          <Link href="/auth">
            <button className="px-6 py-3 border border-blue-600 text-blue-600 rounded-xl text-lg hover:bg-blue-50 transition">
              ログイン
            </button>
          </Link>
        </div>
      </div>

      <section className="mt-20 grid gap-12 md:grid-cols-2">
        <div className="p-6 bg-gray-50 rounded-xl shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            📊 支払いの可視化
          </h2>
          <p className="text-gray-600">
            月ごとの合計・カテゴリ別割合をグラフで見える化。無駄な出費に気づけます。
          </p>
        </div>
        <div className="p-6 bg-gray-50 rounded-xl shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            ⏰ 自動で翌月に繰り越し
          </h2>
          <p className="text-gray-600">
            サブスクの支払日は毎月同じ？ならば自動で翌月分を記録。手間ゼロで続けられます。
          </p>
        </div>
      </section>

      <footer className="mt-20 text-center text-gray-400 text-sm">
        © 2025 Subtrack — All rights reserved.
      </footer>
    </main>
  )
}
