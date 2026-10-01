"use client"

import { CheckIcon, PlusIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { t } from "@/i18n/t"
import { sortedMissions, yourTrust } from "@/lib/demo/selectors"
import { getDemo, useDemo } from "@/lib/demo/store"

import { useAppCopy } from "./app-provider"
import { CreateMissionSheet } from "./create-mission-sheet"
import { MissionCard } from "./mission-card"
import { RewardsCard } from "./rewards-card"
import { TrustCard } from "./trust-card"

/**
 * The reward layer in the demo: missions from apps in the Monark family, gated
 * by your own trust score, plus "Create a mission" for the builder's side.
 */
export function MissionsView() {
  const demo = useDemo()
  const { app } = useAppCopy()
  const c = app.missions
  const [creating, setCreating] = useState(false)
  const [sheetKey, setSheetKey] = useState(0)
  const [published, setPublished] = useState<{ id: string; title: string } | null>(null)
  // The order a visitor first saw, so a card doesn't jump away the moment its state changes.
  // Missions published since then go first. (Rendered only once the demo has loaded.)
  const [firstOrder] = useState(() => {
    const s = getDemo()
    return s ? sortedMissions(s).map((m) => m.mission.id) : []
  })

  if (!demo) return null
  const trust = yourTrust(demo).score
  const rank = new Map(firstOrder.map((id, i) => [id, i]))
  const items = sortedMissions(demo).sort((a, b) => (rank.get(a.mission.id) ?? -1) - (rank.get(b.mission.id) ?? -1))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-display sm:text-4xl">{c.title}</h1>
          <p className="mt-1 text-muted-foreground">{c.subtitle}</p>
        </div>
        <Button className="self-start sm:self-auto" onClick={() => {
            setSheetKey((k) => k + 1)
            setCreating(true)
          }}
        >
          <PlusIcon aria-hidden="true" />
          {c.create}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[7fr_5fr] lg:items-start">
        <section aria-labelledby="missions-list-title" className="flex min-w-0 flex-col gap-4">
          <h2 id="missions-list-title" className="sr-only">
            {c.listTitle}
          </h2>
          {published ? (
            <p role="status" className="flex items-start gap-2.5 rounded-2xl border border-success/40 bg-success/10 p-4 text-sm font-semibold">
              <CheckIcon className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
              {t(c.form.published, { title: published.title })}
            </p>
          ) : null}
          <ul className="flex flex-col gap-4">
            {items.map(({ mission, status }) => (
              <MissionCard key={mission.id} mission={mission} status={status} trust={trust} highlight={mission.id === published?.id} />
            ))}
          </ul>
        </section>
        <div className="flex min-w-0 flex-col gap-6">
          <TrustCard />
          <RewardsCard />
        </div>
      </div>

      <CreateMissionSheet
        key={sheetKey}
        open={creating}
        onOpenChange={setCreating}
        onPublished={(id, title) => {
          setPublished({ id, title })
          setCreating(false)
        }}
      />
    </div>
  )
}
