/**
 * PrimaryButton.tsx
 * ----------------------------------------
 * 作成日: 2025-06-03
 * 概要  : アプリ全体で再利用する「主要アクション」ボタン。
 *         配色・影・フォーカスリングを共通化し、洗練された印象を統一。
 */

import { ButtonHTMLAttributes } from 'react'
import { clsx } from 'clsx' // Tailwind + 可読性向上のため

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** true なら幅いっぱい＝フォーム送信ボタンなどに便利 */
  fullWidth?: boolean
}

/**
 * 使用例:
 * <PrimaryButton onClick={save}>保存する</PrimaryButton>
 */
export const PrimaryButton = ({
  children,
  fullWidth = false,
  className,
  ...props
}: Props) => {
  return (
    <button
      {...props}
      className={clsx(
        'inline-flex items-center justify-center',
        'bg-primary text-white font-semibold',
        'rounded-lg shadow-sm',
        'px-4 py-2',
        'hover:bg-primary/90',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'transition-colors',
        fullWidth && 'w-full',
        className
      )}
    >
      {children}
    </button>
  )
}
