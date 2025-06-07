'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'

export default function AuthPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      if (isLogin) {
        // ログイン
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        // 新規登録
        await createUserWithEmailAndPassword(auth, email, password)
      }

      // ログイン後にダッシュボードへリダイレクト
      router.push('/dashboard')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('エラーが発生しました')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          {isLogin ? 'ログイン' : '新規登録'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">メールアドレス</span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full border p-2 rounded text-gray-800"
                placeholder="example@example.com"
              />
            </label>
          </div>

          <div className="space-y-1">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">パスワード</span>
              <input
                type="password"
                name="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full border p-2 rounded text-gray-800"
                placeholder="8文字以上で入力してください"
                minLength={8}
              />
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
          >
            {isLogin ? 'ログイン' : '登録'}
          </button>

          <div className="text-center text-sm">
            <p className="text-gray-600">
              {isLogin ? 'アカウントをお持ちでないですか？' : 'すでにアカウントをお持ちですか？'}
            </p>
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-500 hover:text-blue-600 underline mt-1"
            >
              {isLogin ? '新規登録' : 'ログイン'}はこちら
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
