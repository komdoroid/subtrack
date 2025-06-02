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
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          {isLogin ? 'ログイン' : '新規登録'}
        </h2>

        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border p-2 rounded text-gray-800"
        />
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border p-2 rounded text-gray-800"
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
        >
          {isLogin ? 'ログイン' : '登録'}
        </button>

        <p className="text-center text-sm">
          {isLogin ? 'アカウントをお持ちでないですか？' : 'すでにアカウントをお持ちですか？'}{' '}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-500 underline"
          >
            {isLogin ? '新規登録' : 'ログイン'}はこちら
          </button>
        </p>
      </form>
    </div>
  )
}
