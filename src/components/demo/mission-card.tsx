"use client"

import { CheckIcon, LinkIcon, LockIcon, ServerIcon, ShieldCheckIcon, ShieldXIcon, UserRoundCheckIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { useTx } from "@/lib/demo/chain"
import { seededAddress } from "@/lib/demo/ids"
import { applyMissionDone, applyReport, missionGate, startMission, type Tester } from "@/lib/demo/ops"
import { MISSION_TESTERS } from "@/lib/demo/program"
import { escrowLeft, type MissionState } from "@/lib/demo/selectors"
import { useDemo } from "@/lib/demo/store"
import type { Mission, VerifyMethod } from "@/lib/demo/types"
import { formatDate, formatNumber, formatReward, initials, shortAddress } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { RewardChip, rewardText } from "./mission-reward"
import { TxFeedback } from "./tx-feedback"

const VERIFY_ICONS: Record<VerifyMethod, typeof LinkIcon> = { onchain: LinkIcon, api: ServerIcon, organizer: UserRoundCheckIcon }

const STATUS_STYLES: Record<MissionState, string> = {
  available: "bg-primary/12 text-primary-ink",
  started: "bg-primary text-primary-foreground",
  completed: "bg-success/15 text-success",
  locked: "bg-muted text-muted-foreground",
  full: "bg-muted text-muted-foreground",
  yours: "bg-foreground text-background",
}

/**
 * One mission, in whatever state it is for you: open (start it), in progress
 * (the app reports completion, the trust gate decides), completed, locked by
 * your trust score, full, or yours (simulate completions to see the gate work).
 */
export function MissionCard({ mission, status, trust, highlight }: { mission: Mission; status: MissionState; trust: number; highlight?: boolean }) {
  const demo = useDemo()
  const { app, locale } = useAppCopy()
  const c = app.missions
  const tx = useTx()
  const [result, setResult] = useState<{ text: string; ok: boolean } | null>(null)
  if (!demo) return null

  const VerifyIcon = VERIFY_ICONS[mission.verify]
  const reward = rewardText(mission.reward, locale, c)
  const progress = demo.progress[mission.id]
  const filledPct = Math.min(100, Math.round((mission.filled / mission.spots) * 100))
  const appSigner = { name: mission.app, address: seededAddress(`app:${mission.app}`) }

  // You did the task: the app reports it, the mission contract checks your trust and pays.
  const complete = () => {
    setResult(null)
    void tx.run(
      {
        title: app.summaries.missionDone,
        signer: appSigner,
        rows: [
          { label: app.summaries.missionBy, value: mission.app },
          { label: app.summaries.missionWallet, value: shortAddress(demo.wallet.address) },
          { label: app.summaries.missionReward, value: reward },
        ],
      },
      (hash) => {
        applyMissionDone(mission.id, hash)
        setResult({ text: t(c.done, { reward }), ok: true })
      },
      { check: () => missionGate(mission.id) }
    )
  }

  // Your mission: a tester completes it, and the trust gate pays or refuses them.
  const report = (tester: Tester) => {
    setResult(null)
    const who = tester === "verified" ? MISSION_TESTERS.verified.name : shortAddress(MISSION_TESTERS.farmed.address)
    const score = MISSION_TESTERS[tester].trust
    void tx.run(
      {
        title: app.summaries.missionDone,
        signer: appSigner,
        rows: [
          { label: app.summaries.missionBy, value: mission.app },
          { label: app.summaries.missionWallet, value: who },
          { label: app.summaries.missionReward, value: reward },
        ],
      },
      (hash) => {
        const paid = applyReport(mission.id, tester, hash)
        if (!paid) setResult({ text: t(c.yours.refusedDone, { score, min: mission.minTrust }), ok: false })
        else if (tester === "farmed") setResult({ text: t(c.yours.paidFarmed, { reward }), ok: false })
        else setResult({ text: t(c.yours.paid, { name: who, reward }), ok: true })
      }
    )
  }

  return (
    <li
      className={cn("rounded-3xl border bg-card p-5 sm:p-6", highlight && "rf-pop border-primary ring-1 ring-primary", status === "locked" && "bg-card/60")}
      aria-labelledby={`mission-${mission.id}`}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-primary text-sm font-extrabold"
        >
          {initials(mission.app)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">{mission.app}</p>
          <h3 id={`mission-${mission.id}`} className="font-bold leading-snug">
            {mission.title}
          </h3>
        </div>
        <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-bold", STATUS_STYLES[status])}>{c.status[status]}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <RewardChip reward={mission.reward} locale={locale} copy={c} />
        <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold">
          <VerifyIcon className="size-3.5 text-muted-foreground" aria-hidden="true" />
          {c.verify[mission.verify]}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
            status === "locked" && "border-warning/60 text-warning"
          )}
        >
          <ShieldCheckIcon className="size-3.5" aria-hidden="true" />
          {mission.minTrust > 0 ? t(c.minTrust, { score: mission.minTrust }) : c.noMinimum}
        </span>
      </div>

      <div className="mt-4">
        <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
          <div className="h-full rounded-full bg-primary transition-[width] duration-250 ease-out" style={{ width: `${filledPct}%` }} />
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          {t(c.spots, { filled: formatNumber(mission.filled, locale), spots: formatNumber(mission.spots, locale) })}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t pt-4">
        {status === "available" ? (
          <Button variant="outline" className="self-start" onClick={() => startMission(mission.id)}>
            {t(c.start, { app: mission.app })}
          </Button>
        ) : null}

        {status === "started" ? (
          <>
            <p className="text-sm text-muted-foreground">{t(c.startedNote, { app: mission.app })}</p>
            <Button className="self-start" onClick={complete} disabled={tx.busy}>
              {t(c.simulate, { app: mission.app })}
            </Button>
          </>
        ) : null}

        {status === "completed" && !result && progress?.completedAt ? (
          <p className="flex items-center gap-2 text-sm font-semibold text-success">
            <CheckIcon className="size-4" aria-hidden="true" />
            {t(c.completedOn, { date: formatDate(progress.completedAt, locale) })}
          </p>
        ) : null}

        {status === "locked" ? (
          <div className="flex flex-col gap-1 text-sm">
            <p className="flex items-center gap-2 font-semibold">
              <LockIcon className="size-4 text-warning" aria-hidden="true" />
              {t(c.lockedNote, { min: mission.minTrust, score: trust })}
            </p>
            <p className="text-muted-foreground">
              {c.lockedHint}{" "}
              <Link href={href(locale, "/app/invite")} className="font-bold text-primary-ink underline underline-offset-4">
                {c.trust.invite}
              </Link>
            </p>
          </div>
        ) : null}

        {status === "full" ? <p className="text-sm text-muted-foreground">{c.fullNote}</p> : null}

        {status === "yours" ? (
          <>
            <p className="text-sm font-semibold">
              {mission.reward.kind === "token" ? t(c.yours.escrow, { amount: formatReward(escrowLeft(mission), locale) }) : c.yours.noEscrow}
              {mission.refused ? <span className="text-destructive"> · {t(c.yours.refused, { count: mission.refused })}</span> : null}
            </p>
            {mission.filled < mission.spots ? (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">{c.yours.report}</p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => report("verified")} disabled={tx.busy}>
                    <UserRoundCheckIcon aria-hidden="true" />
                    {t(c.yours.verified, { name: MISSION_TESTERS.verified.name.split(" ")[0]!, score: MISSION_TESTERS.verified.trust })}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => report("farmed")} disabled={tx.busy}>
                    <ShieldXIcon aria-hidden="true" />
                    {t(c.yours.farmed, { score: MISSION_TESTERS.farmed.trust })}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{c.fullNote}</p>
            )}
          </>
        ) : null}

        {result ? (
          <p
            role="status"
            className={cn(
              "flex items-start gap-2.5 rounded-2xl border p-3.5 text-sm font-semibold",
              result.ok ? "border-success/40 bg-success/10" : "border-warning/50 bg-warning/10"
            )}
          >
            {result.ok ? (
              <CheckIcon className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
            ) : (
              <ShieldXIcon className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
            )}
            {result.text}
          </p>
        ) : null}

        <TxFeedback
          state={tx.state}
          pendingLabel={c.pending}
          onRetry={status === "started" ? complete : undefined}
          onDismiss={tx.reset}
        />
      </div>
    </li>
  )
}
