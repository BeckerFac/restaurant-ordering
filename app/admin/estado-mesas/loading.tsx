import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="bg-white dark:bg-gray-950 border-b mb-6 pb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center">
            <Skeleton className="h-10 w-10 rounded-full mr-3" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Skeleton className="h-10 w-full md:w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <Skeleton className="h-24 flex-1" />
        <Skeleton className="h-24 flex-1" />
        <Skeleton className="h-24 flex-1" />
      </div>

      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-8 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array(8)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
      </div>
    </div>
  )
}
