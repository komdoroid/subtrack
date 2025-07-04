'use client'

import React from 'react'
import Link, { LinkProps } from 'next/link'
import { usePathname } from 'next/navigation'
import { useLoading } from '@/context/LoadingContext'

interface NavigationLinkProps extends LinkProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export const NavigationLink: React.FC<NavigationLinkProps> = ({ 
  children, 
  className, 
  onClick,
  href,
  ...props 
}) => {
  const pathname = usePathname()
  const { showLoadingWithDelay, setLoading } = useLoading()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // 現在のパスと同じ場合はローディングを表示しない
    if (pathname === href.toString()) {
      return
    }

    // 外部リンクの場合はローディングを表示しない
    if (typeof href === 'string' && (href.startsWith('http') || href.startsWith('mailto'))) {
      return
    }

    // ローディングを表示（少し遅延を入れて、瞬時の遷移の場合は表示しない）
    showLoadingWithDelay(50)

    // ユーザー定義のonClickも実行
    if (onClick) {
      onClick()
    }

    // ページがロードされたらローディングを非表示（少し遅延を入れる）
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }

  return (
    <Link 
      href={href} 
      {...props} 
      className={className}
      onClick={handleClick}
    >
      {children}
    </Link>
  )
} 