import * as React from "react"

import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "glass-card bg-card/80 text-card-foreground flex flex-col gap-4 rounded-xl border border-white/5 py-4 shadow-sm text-sm transition-all duration-300 hover:border-white/10 hover:shadow-lg",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({
  className,
  icon: Icon,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  icon?: React.ComponentType<{ className?: string }>
}) {
  const childArray = React.Children.toArray(children)
  const action = childArray.find(
    (c) => React.isValidElement(c) && (c.props as { "data-slot"?: string })?.["data-slot"] === "card-action"
  )
  const rest = childArray.filter((c) => c !== action)

  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex flex-wrap items-start justify-between gap-2 px-4 [.border-b]:pb-4",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2 min-w-0">
        {Icon && (
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-500 dark:text-blue-400">
            <Icon className="size-3.5" />
          </div>
        )}
        <div className="min-w-0 space-y-0.5">{rest}</div>
      </div>
      {action}
    </div>
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold text-sm", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-xs", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-4", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-4 [.border-t]:pt-4", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
