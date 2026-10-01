import { CircleAlertIcon } from "lucide-react"

import type { InviteStatus } from "@/lib/demo/types"
import { cn } from "@/lib/utils"

/** Invite status as a labelled pill (colour is never the only signal). */
export function StatusBadge({ status, label, className }: { status: InviteStatus; label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold whitespace-nowrap",
        status === "opened" && "border-dashed text-muted-foreground",
        status === "joined" && "border-transparent bg-secondary text-foreground",
        status === "active" && "border-primary/50 bg-primary/10 text-primary-ink",
        status === "completed" && "border-transparent bg-primary text-primary-foreground",
        status === "held" && "border-warning/50 bg-warning/10 text-warning",
        className
      )}
    >
      {status === "held" ? <CircleAlertIcon className="size-3" aria-hidden="true" /> : null}
      {label}
    </span>
  )
}

/** Four-segment milestone progress. */
export function MilestoneBar({ reached, held, label }: { reached: number; held?: boolean; label: string }) {
  return (
    <span className="flex items-center gap-1" role="img" aria-label={label}>
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={cn("h-1.5 w-5 rounded-full", i < reached ? (held ? "bg-warning" : "bg-primary") : "bg-border")}
        />
      ))}
    </span>
  )
}
