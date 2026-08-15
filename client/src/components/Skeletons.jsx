export function CatCardSkeleton() {
  return (
    <div className="bg-white rounded-lg p-4 md:p-6 shadow-card motion-safe:animate-pulse space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gray-200 shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-5 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>
    </div>
  )
}

export function VaccineRowSkeleton() {
  return (
    <div className="bg-white rounded-lg p-5 shadow-card flex items-center justify-between motion-safe:animate-pulse">
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-32" />
        <div className="h-3 bg-gray-200 rounded w-24" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-7 w-16 bg-gray-200 rounded-full" />
      </div>
    </div>
  )
}
