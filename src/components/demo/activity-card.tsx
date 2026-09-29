"use client"

import { BanIcon, CircleAlertIcon, LinkIcon, PlusIcon, SparklesIcon, UserCheckIcon, WalletIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { t } from "@/i18n/t"
import { useDemo } from "@/lib/demo/store"
import type { Activity } from "@/lib/demo/types"
import { formatDateTime, formatRelative, formatReward, shortHash } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"

const ICONS = {
  registered: UserCheckIcon,
  recorded: PlusIcon,
  held: CircleAlertIcon,
  milestone: SparklesIcon,
  claimed: WalletIcon,
  blocked: BanIcon,
  linkCreated: LinkIcon,
} as const

/** The on-chain history as the indexer sees it (plus reverted attempts and link changes). */
export function ActivityCard() {
  const demo = useDemo()
  const { app, locale } = useAppCopy()
  const [all, setAll] = useState(false)
  if (!demo) return null
  const a = app.activity
  const items = all ? demo.activity : demo.activity.slice(0, 6)

  const describe = (x: Activity): string => {
    const name = x.name || a.anonymous
    switch (x.kind) {
      case "registered":
        return a.registered
      case "recorded":
        return t(a.recorded, { name })
      case "held":
        return t(a.held, { name, trust: x.trust ?? 0 })
      case "milestone":
        return t(a.milestone, { name, milestone: x.milestone ? app.milestones[x.milestone].label : "" })
      case "claimed":
        return t(a.claimed, { amount: formatReward(x.amount ?? "0", locale) })
      case "blocked":
        return t(a.blocked[x.reason ?? "self"], { name })
      case "linkCreated":
        return t(a.linkCreated, { label: x.label ?? "" })
    }
  }

  return (
    <section aria-labelledby="activity-title" className="rounded-3xl border bg-card p-5 sm:p-6">
      <h2 id="activity-title" className="text-lg font-bold">
        {a.title}
      </h2>
      {demo.activity.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">{a.empty}</p>
      ) : (
        <ol className="mt-4 flex flex-col gap-3.5">
          {items.map((x) => {
            const Icon = ICONS[x.kind]
            return (
              <li key={x.id} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                    x.kind === "blocked" && "bg-destructive/10 text-destructive",
                    x.kind === "held" && "bg-warning/15 text-warning",
                    (x.kind === "milestone" || x.kind === "recorded") && "bg-primary/15 text-primary-ink",
                    (x.kind === "registered" || x.kind === "claimed" || x.kind === "linkCreated") && "bg-muted text-foreground"
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    {describe(x)}
                    {x.kind === "milestone" && x.points ? <span className="ml-1.5 text-xs font-bold text-primary-ink">{t(a.milestoneGain, { points: x.points })}</span> : null}
                  </p>
                  <p className="flex flex-wrap gap-x-2 text-xs text-muted-foreground">
                    <time dateTime={x.at} title={formatDateTime(x.at, locale)}>
                      {formatRelative(x.at, locale)}
                    </time>
                    {x.hash ? (
                      <span className="font-mono" title={`${app.tx.hash}: ${x.hash}`}>
                        {shortHash(x.hash)}
                      </span>
                    ) : null}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      )}
      {demo.activity.length > 6 ? (
        <Button variant="link" className="mt-4" onClick={() => setAll((v) => !v)} aria-expanded={all}>
          {all ? a.less : a.more}
        </Button>
      ) : null}
    </section>
  )
}
