'use client'

interface PullToRefreshIndicatorProps {
  isRefreshing: boolean
  pullDistance: number
  threshold: number
  style: React.CSSProperties
}

export function PullToRefreshIndicator({
  isRefreshing,
  pullDistance,
  threshold,
  style
}: PullToRefreshIndicatorProps) {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-center bg-white/90 backdrop-blur-sm transition-transform duration-200"
      style={style}
    >
      <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
        {isRefreshing ? (
          <>
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Refreshing...</span>
          </>
        ) : pullDistance >= threshold ? (
          <>
            <div className="w-4 h-4 text-green-500">↓</div>
            <span>Release to refresh</span>
          </>
        ) : (
          <>
            <div className="w-4 h-4 text-gray-400">↓</div>
            <span>Pull to refresh</span>
          </>
        )}
      </div>
    </div>
  )
}
