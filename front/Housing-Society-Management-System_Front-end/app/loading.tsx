import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6 rounded-2xl border bg-card p-8 shadow-lg">
          {/* Logo placeholder */}
          <div className="flex justify-center">
            <Skeleton className="size-14 rounded-2xl" />
          </div>

          {/* Title */}
          <div className="flex justify-center">
            <Skeleton className="h-6 w-56" />
          </div>

          {/* Dashboard widget skeletons */}
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-xl border bg-muted/30 p-4"
              >
                <Skeleton className="size-6 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="flex justify-center">
            <Skeleton className="h-2 w-32 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
