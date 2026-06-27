import React from 'react'

const Skeleton = ({ className = '' }) => (
  <div className={`animate-shimmer rounded-lg ${className}`} />
)

const SkeletonText = ({ lines = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
      />
    ))}
  </div>
)

const SkeletonStatCard = ({ icon = false }) => (
  <div className="card">
    <div className="flex items-start gap-4">
      {icon && <Skeleton className="h-12 w-12 rounded-2xl flex-shrink-0" />}
      <div className="flex-1">
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-7 w-28" />
      </div>
    </div>
  </div>
)

const SkeletonDashboard = () => (
  <div className="space-y-6">
    <Skeleton className="h-8 w-64" />
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <SkeletonStatCard key={i} icon />
        ))}
    </div>
    <div className="card">
      <Skeleton className="h-5 w-48 mb-4" />
      <Skeleton className="h-60 w-full rounded-xl" />
    </div>
    <div className="card">
      <Skeleton className="h-5 w-40 mb-4" />
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className="flex gap-4 py-3 border-b border-gray-50 last:border-0"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
    </div>
  </div>
)

const SkeletonTable = ({ rows = 5, cols = 6 }) => (
  <div className="card">
    <div className="flex gap-3 mb-5">
      <Skeleton className="h-10 flex-1 rounded-xl" />
      <Skeleton className="h-10 w-48 rounded-xl" />
    </div>
    <div className="border-b border-gray-100 pb-3 mb-1">
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {Array(cols)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={`h-${i}`} className="h-3" />
          ))}
      </div>
    </div>
    {Array(rows)
      .fill(0)
      .map((_, i) => (
        <div key={i} className="py-3 border-b border-gray-50 last:border-0">
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {Array(cols)
              .fill(0)
              .map((_, j) => (
                <Skeleton key={j} className="h-4" />
              ))}
          </div>
        </div>
      ))}
  </div>
)

const SkeletonProductCard = () => (
  <div className="card">
    <Skeleton className="aspect-square w-full rounded-xl mb-4" />
    <Skeleton className="h-4 w-3/4 mb-1" />
    <Skeleton className="h-3 w-1/2 mb-3" />
    <div className="flex justify-between items-center">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-5 w-24 mb-1" />
    </div>
    <div className="flex justify-between items-center mt-3">
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-8 w-24 rounded-xl" />
    </div>
  </div>
)

const SkeletonCatalog = () => (
  <div className="space-y-6">
    <div className="flex justify-between">
      <div>
        <Skeleton className="h-8 w-48 mb-1" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-36 rounded-xl" />
    </div>
    <div className="flex gap-3">
      <Skeleton className="h-10 flex-1 rounded-xl" />
      <Skeleton className="h-10 w-52 rounded-xl" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array(8)
        .fill(0)
        .map((_, i) => (
          <SkeletonProductCard key={i} />
        ))}
    </div>
  </div>
)

const SkeletonOrderCard = () => (
  <div className="border border-gray-100 rounded-2xl p-4">
    <div className="flex justify-between items-start">
      <div>
        <Skeleton className="h-5 w-28 mb-1" />
        <Skeleton className="h-3 w-32" />
      </div>
      <div className="text-right">
        <Skeleton className="h-5 w-16 rounded-full mb-1 ml-auto" />
        <Skeleton className="h-5 w-28" />
      </div>
    </div>
    <div className="mt-3 pt-3 border-t border-gray-50">
      <Skeleton className="h-3 w-3/4 mb-1" />
      <Skeleton className="h-3 w-1/2" />
    </div>
    <div className="flex gap-2 mt-3">
      <Skeleton className="h-8 w-20 rounded-lg" />
      <Skeleton className="h-8 w-24 rounded-lg" />
    </div>
  </div>
)

const SkeletonOrderList = () => (
  <div className="space-y-6">
    <Skeleton className="h-8 w-40" />
    <div className="card">
      <Skeleton className="h-10 w-48 mb-4 rounded-xl" />
      <div className="space-y-3">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <SkeletonOrderCard key={i} />
          ))}
      </div>
    </div>
  </div>
)

const SkeletonDeliveryCard = () => (
  <div className="card">
    <div className="flex justify-between items-start gap-4">
      <div className="flex-1">
        <Skeleton className="h-5 w-28 mb-2" />
        <Skeleton className="h-4 w-40 mb-1" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4 mt-1" />
      </div>
      <Skeleton className="h-5 w-20 rounded-full" />
    </div>
    <div className="mt-3 pt-3 border-t border-gray-100">
      <Skeleton className="h-3 w-3/4 mb-1" />
      <Skeleton className="h-3 w-1/2" />
    </div>
    <div className="flex gap-2 mt-4">
      <Skeleton className="h-9 w-36 rounded-xl" />
      <Skeleton className="h-9 w-28 rounded-lg" />
    </div>
  </div>
)

const SkeletonDeliveryList = () => (
  <div className="space-y-6">
    <Skeleton className="h-8 w-48" />
    <div className="space-y-4">
      {Array(3)
        .fill(0)
        .map((_, i) => (
          <SkeletonDeliveryCard key={i} />
        ))}
    </div>
  </div>
)

const CHART_HEIGHTS = Array(12).fill(0).map(() => 30 + Math.random() * 70)

const SkeletonChart = () => {
  return (
    <div className="card">
      <Skeleton className="h-5 w-52 mb-6" />
      <div className="flex items-end gap-2 h-48">
        {CHART_HEIGHTS.map((height, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  )
}

const SkeletonReports = () => (
  <div className="space-y-6">
    <div className="flex justify-between">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-10 w-32 rounded-xl" />
    </div>
    <SkeletonChart />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card">
        <Skeleton className="h-5 w-40 mb-4" />
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="flex justify-between py-2 border-b border-gray-50 last:border-0"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="w-6 h-6 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
      </div>
      <div className="card">
        <Skeleton className="h-5 w-40 mb-4" />
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
    </div>
  </div>
)

const SkeletonTracking = () => (
  <div className="space-y-6 max-w-2xl mx-auto">
    <div className="flex items-center gap-3">
      <Skeleton className="w-6 h-6 rounded" />
      <Skeleton className="h-7 w-48" />
    </div>
    <div className="card">
      <Skeleton className="h-6 w-36 mb-1" />
      <Skeleton className="h-4 w-28" />
    </div>
    <div className="card">
      <Skeleton className="h-4 w-40 mb-6" />
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3">
            <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
            <div>
              <Skeleton className="h-4 w-36 mb-1" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
    </div>
  </div>
)

const SkeletonStock = () => (
  <div className="space-y-6">
    <Skeleton className="h-8 w-48" />
    <div className="card">
      <div className="border-b border-gray-100 pb-3 mb-1">
        <div className="grid grid-cols-5 gap-4">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={`h-${i}`} className="h-3" />
            ))}
        </div>
      </div>
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="py-3 border-b border-gray-50 last:border-0">
            <div className="grid grid-cols-5 gap-4 items-center">
              <div className="flex items-center gap-2">
                <Skeleton className="w-4 h-4" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-4 w-16" />
              <div className="flex gap-2">
                <Skeleton className="h-7 w-20 rounded-lg" />
                <Skeleton className="h-7 w-20 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
    </div>
  </div>
)

export {
  Skeleton,
  SkeletonText,
  SkeletonStatCard,
  SkeletonTable,
  SkeletonProductCard,
  SkeletonDashboard,
  SkeletonCatalog,
  SkeletonOrderCard,
  SkeletonOrderList,
  SkeletonDeliveryCard,
  SkeletonDeliveryList,
  SkeletonChart,
  SkeletonReports,
  SkeletonTracking,
  SkeletonStock,
}
