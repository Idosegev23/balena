'use client'

import { useEffect, useRef, useState } from 'react'

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void
  threshold?: number
  disabled?: boolean
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  disabled = false
}: UsePullToRefreshOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const startY = useRef<number>(0)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (disabled || !elementRef.current) return

    const element = elementRef.current
    let touchStartY = 0
    let isAtTop = false

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY
      startY.current = touchStartY
      isAtTop = element.scrollTop === 0
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isAtTop || isRefreshing) return

      const touchY = e.touches[0].clientY
      const deltaY = touchY - touchStartY

      if (deltaY > 0 && element.scrollTop === 0) {
        e.preventDefault()
        const distance = Math.min(deltaY * 0.5, threshold * 1.5)
        setPullDistance(distance)
      }
    }

    const handleTouchEnd = async () => {
      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true)
        try {
          await onRefresh()
        } finally {
          setIsRefreshing(false)
        }
      }
      setPullDistance(0)
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd)

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [onRefresh, threshold, disabled, isRefreshing, pullDistance])

  const pullToRefreshStyles = {
    transform: `translateY(${Math.max(0, pullDistance - 60)}px)`,
    height: '60px',
    opacity: pullDistance > 0 ? 1 : 0
  }

  return {
    elementRef,
    isRefreshing,
    pullDistance,
    pullToRefreshStyles,
    threshold
  }
}
