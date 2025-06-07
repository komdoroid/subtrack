/**
 * useAuth.ts
 * ----------------------------------------
 * 作成日: 2025-05-26
 * 概要  : Firebase 認証状態を監視し、未ログイン時は /auth へリダイレクトするカスタムフック
 * 補足  : 各ページでログイン状態を制御するために使用。App Router 環境に対応。
 */

import { useEffect, useState } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { auth } from '@/firebase'

/**
 * useAuth
 * @param protect - true の場合は未認証ユーザーを /auth にリダイレクトする
 * @returns ログイン中のユーザー情報とローディング状態
 */
export function useAuth(protect: boolean = true) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    console.log('useAuth: Starting auth state monitoring')
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('useAuth: Auth state changed', {
        currentUser: currentUser ? {
          uid: currentUser.uid,
          email: currentUser.email,
        } : null,
        protect,
      })

      setUser(currentUser)
      setLoading(false)

      if (protect && !currentUser) {
        console.log('useAuth: Redirecting to /auth due to no user')
        router.push('/auth')
      }
    })

    return () => {
      console.log('useAuth: Cleaning up auth state monitoring')
      unsubscribe()
    }
  }, [protect, router])

  return { user, loading }
}
