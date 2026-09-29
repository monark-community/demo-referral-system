"use client"

import { ChevronRightIcon } from "lucide-react"
import { useState } from "react"

import { t } from "@/i18n/t"
import { inviteStatus, reachedCount, sortedInvites } from "@/lib/demo/selectors"
import { useDemo } from "@/lib/demo/store"
import type { InviteStatus } from "@/lib/demo/types"
import { formatRelative, shortAddress } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { InviteeAvatar } from "./invitee-avatar"
import { MilestoneBar, StatusBadge } from "./status-badge"

type Filter = "all" | InviteStatus
const FILTERS: Filter[] = ["all", "opened", "joined", "active", "completed", "held"]

/** Every invite with its status and progress, filterable; a row opens the invite sheet. */
export function InviteList({ onOpen }: { onOpen: (id: string) => void }) {
  const demo = useDemo()
  const { app, locale } = useAppCopy()
  const [filter, setFilter] = useState<Filter>("all")
  if (!demo) return null
  const inv = app.invites
  const all = sortedInvites(demo)
  const counts = Object.fromEntries(FILTERS.map((f) => [f, f === "all" ? all.length : all.filter((i) => inviteStatus(i) === f).length]))
  const rows = filter === "all" ? all : all.filter((i) => inviteStatus(i) === filter)

  return (
    <section aria-labelledby="invites-title" className="rounded-3xl border bg-card">
      <div className="flex flex-col gap-3 border-b p-5 sm:p-6">
        <h2 id="invites-title" className="text-lg font-bold">
          {inv.title}
        </h2>
        <div role="group" aria-label={inv.filterLabel} className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={cn(
                "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-bold transition-colors duration-150",
                filter === f ? "border-foreground bg-foreground text-background" : "border-input text-foreground hover:bg-muted"
              )}
            >
              {inv.filters[f]}
              <span className={cn("text-xs tabular-nums", filter === f ? "text-background/80" : "text-muted-foreground")}>{counts[f]}</span>
            </button>
          ))}
        </div>
      </div>
      {all.length === 0 ? (
        <p className="m-5 rounded-2xl border border-dashed p-4 text-sm text-muted-foreground sm:m-6">{inv.empty}</p>
      ) : rows.length === 0 ? (
        <p className="m-5 rounded-2xl border border-dashed p-4 text-sm text-muted-foreground sm:m-6">{inv.emptyFilter}</p>
      ) : (
        <ul className="divide-y">
          {rows.map((i) => {
            const status = inviteStatus(i)
            const reached = reachedCount(i)
            const name = i.name || `${app.network.anonymous} ${shortAddress(i.address ?? "")}`
            const link = i.via ? demo.links.find((l) => l.id === i.via) : undefined
            return (
              <li key={i.id}>
                <button
                  type="button"
                  onClick={() => onOpen(i.id)}
                  className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors duration-150 hover:bg-muted/60 focus-visible:outline-offset-[-2px] sm:px-6"
                >
                  <InviteeAvatar name={i.name} address={i.address} />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="truncate font-bold">{name}</span>
                      <StatusBadge status={status} label={app.status[status]} />
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {status !== "opened" ? <MilestoneBar reached={reached} held={status === "held"} label={t(inv.progress, { count: reached })} /> : null}
                      <span>{t(inv.via, { channel: link?.label ?? inv.direct })}</span>
                      <span>{formatRelative(i.openedAt, locale)}</span>
                    </span>
                  </span>
                  <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="sr-only">{inv.details}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
