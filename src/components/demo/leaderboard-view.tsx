"use client"

import { CircleAlertIcon, TriangleAlertIcon } from "lucide-react"
import { useState } from "react"

import { WalletAvatar } from "@/components/ui/wallet"
import { t } from "@/i18n/t"
import { leaderboard } from "@/lib/demo/selectors"
import { useDemo } from "@/lib/demo/store"
import { formatNumber, shortAddress } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"

const ROW = 72

/**
 * Signature moment 3: flip between verified outcomes and raw clicks, and
 * watch the rows reorder (each row slides to its new place).
 */
export function LeaderboardView() {
  const demo = useDemo()
  const { app, locale } = useAppCopy()
  const [by, setBy] = useState<"points" | "clicks">("points")
  if (!demo) return null
  const l = app.leaderboard
  const ranked = leaderboard(demo, by)
  // Stable DOM order (by id) so rows animate to their new rank instead of re-mounting.
  const stable = [...ranked].sort((a, b) => a.id.localeCompare(b.id))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-display sm:text-4xl">{l.title}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{t(l.lead, { program: app.program })}</p>
        </div>
        <div role="radiogroup" aria-label={l.toggleLabel} className="inline-flex self-start rounded-full border bg-card p-1">
          {(["points", "clicks"] as const).map((k) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={by === k}
              onClick={() => setBy(k)}
              className={cn(
                "inline-flex h-10 items-center rounded-full px-4 text-sm font-bold transition-colors duration-150",
                by === k ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {k === "points" ? l.byPoints : l.byClicks}
            </button>
          ))}
        </div>
      </div>

      <p
        aria-live="polite"
        className={cn(
          "flex items-start gap-2 rounded-2xl border p-4 text-sm",
          by === "clicks" ? "border-warning/50 bg-warning/10" : "bg-card text-muted-foreground"
        )}
      >
        {by === "clicks" ? <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" /> : null}
        {by === "clicks" ? l.clicksWarning : l.pointsNote}
      </p>

      <section className="overflow-hidden rounded-3xl border bg-card">
        <div className="grid grid-cols-[3rem_1fr_5.5rem] items-center gap-3 border-b px-4 py-3 text-xs font-bold text-muted-foreground sm:grid-cols-[3.5rem_1fr_6rem_6rem_6rem] sm:px-6">
          <span>{l.headers.rank}</span>
          <span>{l.headers.ambassador}</span>
          <span className={cn("text-right", by === "points" ? "text-foreground" : "hidden sm:block")}>{l.headers.points}</span>
          <span className="hidden text-right sm:block">{l.headers.verified}</span>
          <span className={cn("text-right", by === "clicks" ? "text-foreground" : "hidden sm:block")}>{l.headers.clicks}</span>
        </div>
        {/* Screen readers get the list in rank order; the animated list below is visual only. */}
        <ol aria-label={t(l.listLabel, { by: by === "points" ? l.byPoints : l.byClicks })} className="sr-only">
          {ranked.map((r) => (
            <li key={r.id}>
              {`#${r.rank} ${r.name || l.unnamed}${r.isYou ? ` (${l.you})` : ""}${r.flagged ? `, ${l.flagged}` : ""}: ${l.headers.points} ${formatNumber(r.points, locale)}, ${l.headers.verified} ${formatNumber(r.verified, locale)}, ${l.headers.clicks} ${formatNumber(r.clicks, locale)}`}
            </li>
          ))}
        </ol>
        <div aria-hidden="true" className="relative" style={{ height: ranked.length * ROW }}>
          {stable.map((r) => (
            <div
              key={r.id}
              className={cn(
                "absolute inset-x-0 grid grid-cols-[3rem_1fr_5.5rem] items-center gap-3 border-b px-4 transition-[top] duration-250 ease-out sm:grid-cols-[3.5rem_1fr_6rem_6rem_6rem] sm:px-6",
                r.isYou && "bg-primary/10",
                r.flagged && by === "clicks" && "bg-warning/10"
              )}
              style={{ top: (r.rank - 1) * ROW, height: ROW }}
            >
              <span className={cn("text-lg font-extrabold tabular-nums", r.rank <= 3 ? "text-primary-ink" : "text-muted-foreground")}>#{r.rank}</span>
              <span className="flex min-w-0 items-center gap-3">
                <WalletAvatar address={r.address} size={32} />
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-x-2">
                    <span className="truncate font-bold">{r.name || l.unnamed}</span>
                    {r.isYou ? <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">{l.you}</span> : null}
                  </span>
                  {r.flagged ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-warning">
                      <CircleAlertIcon className="size-3" aria-hidden="true" />
                      {l.flagged}
                    </span>
                  ) : (
                    <span className="block truncate font-mono text-xs text-muted-foreground">{shortAddress(r.address)}</span>
                  )}
                </span>
              </span>
              <span className={cn("text-right tabular-nums", by === "points" ? "text-lg font-extrabold" : "hidden text-muted-foreground sm:block")}>
                {formatNumber(r.points, locale)}
              </span>
              <span className="hidden text-right text-muted-foreground tabular-nums sm:block">{formatNumber(r.verified, locale)}</span>
              <span className={cn("text-right tabular-nums", by === "clicks" ? "text-lg font-extrabold" : "hidden text-muted-foreground sm:block")}>
                {formatNumber(r.clicks, locale)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
