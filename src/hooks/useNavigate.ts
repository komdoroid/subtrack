'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useLoading } from '@/context/LoadingContext'

export const useNavigate = () => {
  const router = useRouter()
  const pathname = usePathname()
  const { showLoadingWithDelay, setLoading } = useLoading()

  const navigate = (url: string, options?: { replace?: boolean }) => {
    // 現在のパスと同じ場合はローディングを表示しない
    if (pathname === url) {
      return
    }

    // 外部リンクの場合はローディングを表示しない
    if (url.startsWith('http') || url.startsWith('mailto')) {
      if (options?.replace) {
        router.replace(url)
      } else {
        router.push(url)
      }
      return
    }

    // ローディングを表示
    showLoadingWithDelay(50)

    // ナビゲーション実行
    if (options?.replace) {
      router.replace(url)
    } else {
      router.push(url)
    }

    // ページがロードされたらローディングを非表示（少し遅延を入れる）
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }

  return { navigate, router }
} 