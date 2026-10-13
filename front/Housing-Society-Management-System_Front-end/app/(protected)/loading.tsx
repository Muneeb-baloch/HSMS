import { Skeleton } from "@/components/ui/skeleton";

export default function ProtectedLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex justify-center">
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl bg-muted/30 p-3"
            >
              <Skeleton className="size-5 rounded" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <Skeleton className="h-2 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}
