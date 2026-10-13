"use client";

/**
 * Abstract dashboard frame — reads as product UI without photography.
 * Describes: visitor throughput + complaint queue at a glance.
 */
export function DashboardMockup() {
  return (
    <figure
      className="mx-auto w-full max-w-xl select-none"
      aria-label="Product interface preview: operations overview with visitor analytics and complaint queue"
    >
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_22px_50px_-12px_rgba(15,23,42,0.14)] ring-1 ring-slate-900/[0.04]">
        <div className="flex h-9 items-center gap-2 border-b border-slate-200 bg-slate-50 px-3">
          <span className="size-2.5 rounded-full bg-slate-300" />
          <span className="size-2.5 rounded-full bg-slate-300" />
          <span className="size-2.5 rounded-full bg-slate-300" />
          <span className="ml-2 flex-1 truncate text-center text-[10px] font-medium tracking-wide text-slate-500">
            app.societysphere.com / operations
          </span>
        </div>
        <div className="flex min-h-[280px] sm:min-h-[320px]">
          <div className="hidden w-36 shrink-0 border-r border-slate-100 bg-slate-50/80 sm:block">
            <div className="space-y-2 p-3">
              <div className="h-2 w-16 rounded bg-slate-200" />
              <div className="h-2 w-20 rounded bg-slate-200" />
              <div className="h-2 w-14 rounded bg-slate-200" />
              <div className="mt-4 h-2 w-12 rounded bg-emerald-600/30" />
              <div className="h-2 w-20 rounded bg-slate-200" />
            </div>
          </div>
          <div className="min-w-0 flex-1 p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Today
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  Visitor & gate activity
                </div>
              </div>
              <div className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-600">
                Last updated 09:42
              </div>
            </div>
            <div className="mb-5 rounded-md border border-slate-100 bg-slate-50/60 p-3">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Today&apos;s visitor stats
              </div>
              <div className="flex h-24 items-end justify-between gap-1.5 px-1">
                {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                  <div
                    key={i}
                    className="w-full max-w-[14%] rounded-sm bg-emerald-600/85"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-[9px] text-slate-500">
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
              </div>
            </div>
            <div className="rounded-md border border-slate-200 bg-white p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Pending complaints
                </span>
                <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold text-amber-800 ring-1 ring-amber-200">
                  4 open
                </span>
              </div>
              <ul className="space-y-2">
                {[
                  "Lift — scheduled inspection",
                  "Water pressure — Block B",
                  "Parking allocation dispute",
                ].map((label) => (
                  <li
                    key={label}
                    className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 last:border-0 last:pb-0"
                  >
                    <span className="truncate text-[11px] text-slate-700">
                      {label}
                    </span>
                    <span className="shrink-0 text-[9px] font-medium text-slate-400">
                      SLA 48h
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-xs text-slate-500">
        Representative layout. Actual screens vary by role and configuration.
      </figcaption>
    </figure>
  );
}
