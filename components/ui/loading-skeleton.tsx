export function CourseCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 w-20 mb-3"></div>
          <div className="h-6 bg-gray-200 w-3/4 mb-2"></div>
        </div>
      </div>
      <div className="h-4 bg-gray-200 w-full mb-2"></div>
      <div className="h-4 bg-gray-200 w-2/3 mb-6"></div>
      <div className="flex items-center justify-between text-sm">
        <div className="h-3 bg-gray-200 w-24"></div>
        <div className="h-8 bg-gray-200 w-20"></div>
      </div>
    </div>
  );
}

export function DashboardStatSkeleton() {
  return (
    <div className="bg-white border border-gray-200 p-8 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-3 bg-gray-200 w-32 mb-4"></div>
          <div className="h-8 bg-gray-200 w-16"></div>
        </div>
        <div className="w-12 h-12 bg-gray-200"></div>
      </div>
    </div>
  );
}
