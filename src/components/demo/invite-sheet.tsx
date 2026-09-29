"use client"

import { CheckIcon, CircleDashedIcon, ShieldCheckIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { TrustGauge } from "@/components/diagrams/trust-gauge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { WalletAddress } from "@/components/ui/wallet"
import { t } from "@/i18n/t"
import { useTx } from "@/lib/demo/chain"
import { applyMilestone } from "@/lib/demo/ops"
import { MILESTONES, TRUST_BASE } from "@/lib/demo/program"
import { inviteStatus, isHeld, nextMilestone, trustScore, yourRank } from "@/lib/demo/selectors"
import { getDemo, useDemo } from "@/lib/demo/store"
import { formatDate, formatReward, shortAddress, shortHash } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { InviteeAvatar } from "./invitee-avatar"
import { StatusBadge } from "./status-badge"
import { TxFeedback } from "./tx-feedback"

/** Everything about one invite: status, trust score and signals, milestone timeline, and the next-milestone simulation. */
export function InviteSheet({ inviteId, onClose }: { inviteId: string | null; onClose: () => void }) {
  const demo = useDemo()
  const { app, locale } = useAppCopy()
  const tx = useTx()
  const invite = demo?.invites.find((i) => i.id === inviteId) ?? null
  const { reset } = tx
  const [done, setDone] = useState<{ inviteId: string; title: string; detail?: string; held: boolean } | null>(null)

  // A different invite starts with a clean transaction state.
  useEffect(() => {
    reset()
  }, [inviteId, reset])

  const s = app.sheet
  const displayName = invite ? invite.name || `${app.network.anonymous} ${shortAddress(invite.address ?? "")}` : ""
  const status = invite ? inviteStatus(invite) : "opened"
  const held = invite ? isHeld(invite) : false
  const score = invite ? trustScore(invite) : 0
  const next = invite ? nextMilestone(invite) : null
  const link = invite?.via ? demo?.links.find((l) => l.id === invite.via) : undefined

  const simulate = () => {
    if (!invite || !next) return
    const def = MILESTONES.find((m) => m.id === next)!
    const label = app.milestones[next].label
    const before = getDemo() ? yourRank(getDemo()!) : 0
    setDone(null)
    void tx.run(
      {
        title: app.summaries.milestone,
        rows: [
          { label: app.summaries.milestoneWho, value: displayName },
          { label: app.summaries.milestoneWhat, value: label },
          {
            label: app.summaries.milestoneReward,
            value: held ? s.heldReward : [t(s.pointsReward, { points: def.points }), def.reward !== "0" ? formatReward(def.reward, locale) : null].filter(Boolean).join(" · "),
          },
        ],
      },
      (hash) => {
        applyMilestone(invite.id, next, hash)
        // Reported inside the sheet (not as a toast), so nothing covers the timeline it describes.
        if (held) {
          setDone({ inviteId: invite.id, title: t(s.heldDone, { milestone: label, name: displayName }), held: true })
          return
        }
        const after = getDemo() ? yourRank(getDemo()!) : 0
        setDone({
          inviteId: invite.id,
          title: t(s.milestoneDone, { milestone: label, name: displayName }),
          detail: [t(s.pointsGained, { points: def.points }), after && after < before ? t(s.movedUp, { rank: after }) : ""].filter(Boolean).join(" "),
          held: false,
        })
      }
    )
  }

  return (
    <Sheet open={!!invite} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" closeLabel={app.close} className="w-full gap-0 overflow-y-auto p-0 sm:max-w-md">
        {invite ? (
          <>
            <SheetHeader className="gap-3 border-b px-5 pt-5 pb-4 text-left sm:px-6">
              <div className="flex items-center gap-3 pr-10">
                <InviteeAvatar name={invite.name} address={invite.address} size={44} />
                <div className="min-w-0">
                  <SheetTitle className="truncate text-xl font-extrabold">{displayName}</SheetTitle>
                  <SheetDescription asChild>
                    <div className="mt-1">
                      <StatusBadge status={status} label={app.status[status]} />
                    </div>
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="flex flex-col gap-6 px-5 py-5 sm:px-6">
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                <dt className="text-muted-foreground">{s.address}</dt>
                <dd className="text-right">{invite.address ? <WalletAddress address={invite.address} /> : <span className="text-muted-foreground">{s.noWallet}</span>}</dd>
                <dt className="text-muted-foreground">{s.came}</dt>
                <dd className="text-right font-semibold">{link ? link.label : app.invites.direct}</dd>
                <dt className="text-muted-foreground">{s.opened}</dt>
                <dd className="text-right">{formatDate(invite.openedAt, locale)}</dd>
                {invite.hash ? (
                  <>
                    <dt className="text-muted-foreground">{s.record}</dt>
                    <dd className="text-right font-mono text-xs" title={invite.hash}>
                      {shortHash(invite.hash)}
                    </dd>
                  </>
                ) : null}
              </dl>

              {status === "opened" ? (
                <p className="rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">{t(s.openedNote, { name: displayName })}</p>
              ) : (
                <section aria-labelledby="trust-h" className="rounded-2xl border p-4">
                  <h3 id="trust-h" className="sr-only">
                    {app.trust.title}
                  </h3>
                  <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                    <TrustGauge score={score} held={held} label={app.trust.title} status={held ? app.trust.held : app.trust.eligible} className="w-36 shrink-0" />
                    <ul className="flex w-full flex-col gap-1.5 text-sm">
                      <li className="flex justify-between gap-3 text-muted-foreground">
                        <span>{app.trust.base}</span>
                        <span className="font-mono tabular-nums">{TRUST_BASE}</span>
                      </li>
                      {invite.signals.map((sig) => (
                        <li key={sig.key} className="flex justify-between gap-3">
                          <span>{t(app.trust.signals[sig.key], sig.vars)}</span>
                          <span className={cn("font-mono font-bold tabular-nums", sig.impact >= 0 ? "text-success" : "text-warning")}>
                            {sig.impact >= 0 ? `+${sig.impact}` : `−${Math.abs(sig.impact)}`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {held ? <p className="mt-3 text-sm text-warning">{s.heldNote}</p> : null}
                </section>
              )}

              <section aria-labelledby="ms-h">
                <h3 id="ms-h" className="text-sm font-bold">
                  {s.milestonesTitle}
                </h3>
                <ol className="mt-3 flex flex-col">
                  {MILESTONES.map((m, i) => {
                    const at = invite.milestones[m.id]
                    return (
                      <li key={m.id} className="relative flex gap-3 pb-4 last:pb-0">
                        {i < MILESTONES.length - 1 ? (
                          <span aria-hidden="true" className={cn("absolute top-7 bottom-0 left-3 w-0.5", at ? "bg-primary" : "bg-border")} />
                        ) : null}
                        <span
                          className={cn(
                            "relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full",
                            at ? (held ? "bg-warning text-background" : "bg-primary text-primary-foreground") : "border-2 border-border bg-background text-muted-foreground"
                          )}
                        >
                          {at ? <CheckIcon className="size-3.5" aria-hidden="true" /> : <CircleDashedIcon className="size-3" aria-hidden="true" />}
                        </span>
                        <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-3">
                          <div>
                            <p className="text-sm font-bold">{app.milestones[m.id].label}</p>
                            <p className="text-xs text-muted-foreground">{at ? formatDate(at, locale) : s.waiting}</p>
                          </div>
                          <p className={cn("text-xs font-bold", at ? (held ? "text-warning" : "text-primary-ink") : "text-muted-foreground")}>
                            {held && at
                              ? s.heldReward
                              : [t(s.pointsReward, { points: m.points }), m.reward !== "0" ? t(s.plusReward, { amount: formatReward(m.reward, locale) }) : null].filter(Boolean).join(" · ")}
                          </p>
                        </div>
                      </li>
                    )
                  })}
                </ol>
              </section>

              {done && done.inviteId === invite.id ? (
                <p
                  role="status"
                  className={cn(
                    "flex items-start gap-2.5 rounded-2xl border p-4 text-sm",
                    done.held ? "border-warning/50 bg-warning/10" : "border-success/40 bg-success/10"
                  )}
                >
                  <CheckIcon className={cn("mt-0.5 size-4 shrink-0", done.held ? "text-warning" : "text-success")} aria-hidden="true" />
                  <span>
                    <span className="block font-bold">{done.title}</span>
                    {done.detail ? <span className="block">{done.detail}</span> : null}
                  </span>
                </p>
              ) : null}

              {next ? (
                <section aria-labelledby="sim-h" className="rounded-2xl border bg-secondary/50 p-4">
                  <h3 id="sim-h" className="flex items-center gap-2 text-sm font-bold">
                    <ShieldCheckIcon className="size-4 text-primary" aria-hidden="true" />
                    {s.simulateTitle}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.simulateBody}</p>
                  <Button className="mt-3 w-full sm:w-auto" onClick={simulate} disabled={tx.busy}>
                    {app.milestones[next].action}
                  </Button>
                  <TxFeedback state={tx.state} className="mt-3" onRetry={simulate} onDismiss={tx.reset} />
                </section>
              ) : status === "completed" ? (
                <p className="rounded-2xl border bg-secondary/50 p-4 text-sm font-semibold">{t(s.completeNote, { name: displayName })}</p>
              ) : null}
              {!next && tx.state.phase === "confirmed" ? <TxFeedback state={tx.state} /> : null}
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
