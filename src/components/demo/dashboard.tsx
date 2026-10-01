"use client"

import { ArrowRightIcon } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

import { NetworkGraph, type GraphAnimation, type GraphNode } from "@/components/diagrams/network-graph"
import { Button } from "@/components/ui/button"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { clearLastEvent } from "@/lib/demo/ops"
import { PROGRAM } from "@/lib/demo/program"
import { inviteStatus, reachedCount, totals, yourRank } from "@/lib/demo/selectors"
import { useDemo } from "@/lib/demo/store"
import { formatDate, formatNumber, formatReward, initials } from "@/lib/format"
import { cn } from "@/lib/utils"

import { ActivityCard } from "./activity-card"
import { useAppCopy } from "./app-provider"
import { InviteList } from "./invite-list"
import { InviteSheet } from "./invite-sheet"
import { RegisterCard } from "./register-card"
import { RewardsCard } from "./rewards-card"

/** Flow 3/4/5 home: the ambassador dashboard. */
export function Dashboard() {
  const demo = useDemo()
  const { app, locale } = useAppCopy()
  const [openId, setOpenId] = useState<string | null>(null)
  const [animation, setAnimation] = useState<GraphAnimation | null>(null)

  // Play the latest contract event once, when the graph is visible (not behind the invite sheet).
  const lastEvent = demo?.lastEvent
  useEffect(() => {
    if (!lastEvent || openId) return
    if (Date.now() - lastEvent.at > 60_000) {
      clearLastEvent()
      return
    }
    const start = window.setTimeout(() => {
      setAnimation({ kind: lastEvent.kind, nodeId: lastEvent.inviteId, points: lastEvent.points, key: lastEvent.at })
      clearLastEvent()
    }, 250)
    return () => window.clearTimeout(start)
  }, [lastEvent, openId])

  useEffect(() => {
    if (!animation) return
    const end = window.setTimeout(() => setAnimation(null), 2200)
    return () => window.clearTimeout(end)
  }, [animation])

  if (!demo) return null
  if (!demo.registered) return <RegisterCard />

  const d = app.dashboard
  const tot = totals(demo)
  const rank = yourRank(demo)
  const nodes: GraphNode[] = [...demo.invites]
    .sort((a, b) => a.openedAt.localeCompare(b.openedAt))
    .map((i) => ({
      id: i.id,
      initials: i.name ? initials(i.name) : "0x",
      name: i.name ? i.name.split(" ")[0]! : `${i.address?.slice(0, 6) ?? ""}…`,
      status: inviteStatus(i),
      progress: reachedCount(i),
    }))

  const stats: { label: string; value: string; hint?: string; tick?: boolean }[] = [
    { label: app.stats.points, value: formatNumber(tot.points, locale), tick: true },
    { label: app.stats.rank, value: t(app.stats.rankValue, { rank, total: PROGRAM.ambassadors }) },
    { label: app.stats.verified, value: formatNumber(tot.verified, locale), hint: t(app.stats.verifiedHint, { opened: tot.opened }) },
    { label: app.stats.claimable, value: formatReward(tot.claimable, locale) },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-display sm:text-4xl">{d.title}</h1>
          <p className="mt-1 text-muted-foreground">{t(d.subtitle, { program: app.program, date: formatDate(PROGRAM.endsAt, locale) })}</p>
        </div>
        <Button asChild variant="outline" className="self-start sm:self-auto">
          <Link href={href(locale, "/app/invite")}>
            {d.shareCta}
            <ArrowRightIcon aria-hidden="true" />
          </Link>
        </Button>
      </div>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border bg-card p-4">
            <dt className="text-sm text-muted-foreground">{s.label}</dt>
            <dd className={cn("mt-1 text-2xl font-extrabold tabular-nums sm:text-[1.7rem]", s.tick && "rf-tick")} key={s.tick ? s.value : undefined}>
              {s.value}
            </dd>
            {s.hint ? <dd className="mt-0.5 truncate text-xs text-muted-foreground">{s.hint}</dd> : null}
          </div>
        ))}
      </dl>

      <div className="grid gap-6 lg:grid-cols-[7fr_5fr] lg:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <section aria-labelledby="network-title" className="rounded-3xl border bg-card p-5 sm:p-6">
            <h2 id="network-title" className="text-lg font-bold">
              {app.network.title}
            </h2>
            {nodes.length === 0 ? (
              <p className="mt-4 rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">{app.network.empty}</p>
            ) : (
              <>
                <NetworkGraph
                  nodes={nodes}
                  youLabel={app.network.you}
                  animation={animation}
                  onSelect={setOpenId}
                  openLabel={(n) => t(app.network.open, { name: n.name })}
                  rewardLabel={(p) => t(app.network.reward, { points: p })}
                  className="mt-2"
                />
                <ul className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span aria-hidden="true" className="w-6 border-t-2 border-dashed border-muted-foreground/70" />
                    {app.network.legend.opened}
                  </li>
                  <li className="flex items-center gap-2">
                    <span aria-hidden="true" className="w-6 border-t-2 border-primary" />
                    {app.network.legend.joined}
                  </li>
                  <li className="flex items-center gap-2">
                    <span aria-hidden="true" className="size-3.5 rounded-full border-2 border-primary border-r-border border-b-border" />
                    {app.network.legend.progress}
                  </li>
                  <li className="flex items-center gap-2">
                    <span aria-hidden="true" className="w-6 border-t-2 border-dashed border-warning" />
                    {app.network.legend.held}
                  </li>
                </ul>
              </>
            )}
          </section>
          <InviteList onOpen={setOpenId} />
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <RewardsCard />
          <ActivityCard />
        </div>
      </div>

      <InviteSheet inviteId={openId} onClose={() => setOpenId(null)} />
    </div>
  )
}
