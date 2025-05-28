/**
 * page.tsx (root)
 * ----------------------------------------
 * 作成日: 2025-05-26
 * 概要  : 仮のトップページ（将来的にLP等へ）
 */

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <h1 className="text-2xl font-bold text-gray-800">
        ようこそ SubTrack（仮）へ！<br />
        <a href="/auth" className="text-blue-500 underline">
          ログインページへ
        </a>
      </h1>
    </main>
  )
}
