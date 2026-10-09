"use client"

import { ArrowRightIcon } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

import { NetworkGraph, type GraphAnimation, type GraphNode } from "@/components/diagrams/network-graph"
import { Button } from "@/components/ui/button"
import { Empty } from "@/components/ui/empty"
import { Stat, StatGroup, StatHint, StatLabel, StatValue } from "@/components/ui/stat"
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

      <StatGroup className="grid-cols-2">
        {stats.map((s) => (
          <Stat key={s.label}>
            <StatLabel>{s.label}</StatLabel>
            <StatValue className={cn(s.tick && "rf-tick")} key={s.tick ? s.value : undefined}>
              {s.value}
            </StatValue>
            {s.hint ? <StatHint className="truncate">{s.hint}</StatHint> : null}
          </Stat>
        ))}
      </StatGroup>

      <div className="grid gap-6 lg:grid-cols-[7fr_5fr] lg:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <section aria-labelledby="network-title" className="rounded-3xl border bg-card p-5 sm:p-6">
            <h2 id="network-title" className="text-lg font-bold">
              {app.network.title}
            </h2>
            {nodes.length === 0 ? (
              <Empty align="start" size="sm" className="mt-4">
                {app.network.empty}
              </Empty>
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
