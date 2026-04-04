import { Skeleton } from "@/components/ui/skeleton";

const ProductSkeleton = () => (
  <div className="rounded-lg border bg-card shadow-sm">
    <Skeleton className="aspect-[4/5] w-full rounded-t-lg rounded-b-none" />
    <div className="p-4 space-y-2">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-5 w-1/3" />
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8 }: { count?: number }) => (
  <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ProductSkeleton key={i} />
    ))}
  </div>
);

export default ProductSkeleton;
