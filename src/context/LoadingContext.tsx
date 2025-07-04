'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { LoadingOverlay } from '@/components/ui/LoadingSpinner'

interface LoadingContextType {
  isLoading: boolean
  setLoading: (loading: boolean) => void
  showLoadingWithDelay: (delay?: number) => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export const useLoading = () => {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}

interface LoadingProviderProps {
  children: ReactNode
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const setLoading = (loading: boolean) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
    setIsLoading(loading)
  }

  // 遷移が早すぎる場合はローディングを表示しない（UX向上のため）
  const showLoadingWithDelay = (delay: number = 100) => {
    const id = setTimeout(() => {
      setIsLoading(true)
    }, delay)
    setTimeoutId(id)
  }

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading, showLoadingWithDelay }}>
      {children}
      {isLoading && <LoadingOverlay />}
    </LoadingContext.Provider>
  )
} 