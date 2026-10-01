"use client"

import { ArrowRightIcon, CheckIcon, CircleAlertIcon, PartyPopperIcon, XCircleIcon } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

import { TrustGauge } from "@/components/diagrams/trust-gauge"
import { Button } from "@/components/ui/button"
import { WalletAvatar } from "@/components/ui/wallet"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { useTx } from "@/lib/demo/chain"
import { randomAddress } from "@/lib/demo/ids"
import { applyReferral, logBlocked, referralRule, registerOpen } from "@/lib/demo/ops"
import { ALREADY_MEMBER, burstSignals, FRIEND_NAMES, friendSignals, PERSONAS, YOU, YOUR_REFERRER, type PersonaId } from "@/lib/demo/program"
import { trustScore } from "@/lib/demo/selectors"
import { useDemo } from "@/lib/demo/store"
import type { BlockReason, Invite, TrustSignal } from "@/lib/demo/types"
import { shortAddress } from "@/lib/format"
import { cn } from "@/lib/utils"

import { AppLoading } from "./app-frame"
import { useAppCopy } from "./app-provider"
import { TxFeedback } from "./tx-feedback"

interface Candidate {
  name: string
  address: string
  signals: TrustSignal[]
}

function freshFriend(used: string[]): Candidate {
  const pool = FRIEND_NAMES.filter((n) => !used.includes(n))
  const name = (pool.length ? pool : FRIEND_NAMES)[Math.floor(Math.random() * (pool.length || FRIEND_NAMES.length))]!
  return { name, address: randomAddress(), signals: friendSignals() }
}

/** Flow 3: what an invitee sees when they open an ambassador's link, and what the contract does when they accept. */
export function JoinView({ code }: { code: string }) {
  const demo = useDemo()
  const { app, join, locale } = useAppCopy()
  const params = useSearchParams()
  const via = params?.get("via") ?? null
  const tx = useTx()
  const [persona, setPersona] = useState<PersonaId>("friend")
  const [friend, setFriend] = useState<Candidate | null>(null)
  const [burst, setBurst] = useState<Candidate | null>(null)
  const [result, setResult] = useState<Invite | null>(null)
  const counted = useRef(false)
  const [linkId, setLinkId] = useState<string | null>(null)

  const valid = !!demo && demo.code === code && demo.registered

  // Count the open once (off-chain analytics) and prepare the two generated personas.
  useEffect(() => {
    if (!valid || counted.current || !demo) return
    counted.current = true
    setLinkId(registerOpen(via))
    setFriend(freshFriend(demo.invites.map((i) => i.name)))
    setBurst({ name: "", address: randomAddress(), signals: burstSignals() })
  }, [valid, via, demo])

  const candidates = useMemo<Record<PersonaId, Candidate | null>>(
    () => ({
      friend,
      self: demo ? { name: YOU.name, address: demo.wallet.address, signals: [] } : null,
      loop: { name: YOUR_REFERRER.name, address: YOUR_REFERRER.address, signals: [] },
      duplicate: { name: ALREADY_MEMBER.name, address: ALREADY_MEMBER.address, signals: [] },
      burst,
    }),
    [friend, burst, demo]
  )

  if (!demo) return <AppLoading label={join.loading} />
  if (demo.code !== code) {
    return (
      <section className="mx-auto flex max-w-lg flex-col items-center gap-4 py-12 text-center">
        <CircleAlertIcon className="size-10 text-warning" aria-hidden="true" />
        <h1 className="text-2xl font-extrabold tracking-display">{join.unknown.title}</h1>
        <Button asChild>
          <Link href={href(locale, "/app")}>{join.unknown.cta}</Link>
        </Button>
      </section>
    )
  }
  if (!demo.registered) {
    return (
      <section className="mx-auto flex max-w-lg flex-col items-center gap-4 py-12 text-center">
        <CircleAlertIcon className="size-10 text-warning" aria-hidden="true" />
        <p className="text-lg font-semibold">{join.notRegistered}</p>
        <Button asChild>
          <Link href={href(locale, "/app")}>{join.unknown.cta}</Link>
        </Button>
      </section>
    )
  }

  const c = join.card
  const inviter = "Amara"
  const link = linkId ? demo.links.find((l) => l.id === linkId) : undefined
  const current = candidates[persona]
  const blocked = tx.state.phase === "failed" && tx.state.error && ["self", "loop", "duplicate"].includes(tx.state.error)

  const accept = () => {
    if (!current) return
    const displayName = current.name || `${app.network.anonymous} ${shortAddress(current.address)}`
    void tx.run(
      {
        title: app.summaries.accept,
        rows: [
          { label: app.summaries.acceptInviter, value: YOU.name },
          { label: app.summaries.acceptProgram, value: app.program },
        ],
        signer: { name: displayName, address: current.address },
      },
      (hash) => {
        const invite = applyReferral({ name: current.name, address: current.address, via: linkId, signals: current.signals }, hash)
        setResult(invite)
      },
      {
        // The contract's hard rules run when the block is mined; a revert is still visible to the indexer.
        check: () => {
          const reason: BlockReason | null = referralRule(current.address)
          if (reason) logBlocked(reason, current.name)
          return reason
        },
      }
    )
  }

  const again = () => {
    tx.reset()
    setResult(null)
    setPersona("friend")
    setFriend(freshFriend([...demo.invites.map((i) => i.name)]))
    setBurst({ name: "", address: randomAddress(), signals: burstSignals() })
  }

  const score = result ? trustScore(result) : 0
  const held = result ? score < 50 : false

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-[7fr_5fr] lg:items-start">
        {/* The invitation */}
        <section aria-labelledby="join-title" className="rounded-3xl border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <WalletAvatar address={demo.wallet.address} size={48} />
            <div>
              <p className="eyebrow text-primary-ink">{c.eyebrow}</p>
              <p className="text-sm text-muted-foreground">{t(c.program, { program: app.program })}</p>
            </div>
          </div>
          <h1 id="join-title" className="mt-5 text-3xl font-extrabold tracking-display sm:text-4xl">
            {t(c.title, { name: inviter })}
          </h1>
          <p className="mt-3 text-muted-foreground">{t(c.body, { name: inviter })}</p>
          {link ? <p className="mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold">{t(c.via, { channel: link.label })}</p> : null}

          <h2 className="mt-6 text-sm font-bold">{c.what}</h2>
          <ol className="mt-3 flex flex-col gap-2.5">
            {c.steps.map((step, i) => (
              <li key={step} className="flex gap-3 text-sm">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-primary text-xs font-bold">{i + 1}</span>
                <span className="pt-0.5">{t(step, { name: inviter })}</span>
              </li>
            ))}
          </ol>

          {result ? (
            <div role="status" className={cn("mt-7 rounded-2xl border p-5", held ? "border-warning/50 bg-warning/10" : "border-success/40 bg-success/10")}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <p className="flex items-center gap-2 text-lg font-extrabold">
                    {held ? <CircleAlertIcon className="size-5 text-warning" aria-hidden="true" /> : <PartyPopperIcon className="size-5 text-success" aria-hidden="true" />}
                    {held ? join.result.heldTitle : join.result.joinedTitle}
                  </p>
                  <p className="mt-1 text-sm">{held ? t(join.result.heldBody, { score }) : t(join.result.joinedBody, { name: inviter })}</p>
                </div>
                <TrustGauge score={score} held={held} label={app.trust.title} status={held ? app.trust.held : app.trust.eligible} className="w-32 shrink-0 self-center" />
              </div>
              <TxFeedback state={tx.state} className="mt-3" />
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Button asChild>
                  <Link href={href(locale, "/app")}>
                    {join.result.dashboard}
                    <ArrowRightIcon aria-hidden="true" />
                  </Link>
                </Button>
                <Button variant="outline" onClick={again}>
                  {join.result.again}
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-7 flex flex-col gap-3">
              <a href="#persona-title" className="inline-flex min-h-11 items-center self-start text-sm font-semibold text-primary-ink underline underline-offset-4 lg:hidden">
                {join.personas.label} · {join.personas[persona].title}
              </a>
              <Button size="lg" className="w-full sm:w-auto sm:self-start" onClick={accept} disabled={tx.busy || !current}>
                <CheckIcon aria-hidden="true" />
                {c.accept}
              </Button>
              <p className="text-xs text-muted-foreground">{c.privacy}</p>
              <TxFeedback state={tx.state} onRetry={blocked ? undefined : accept} onDismiss={tx.reset} />
              {blocked ? (
                <Button variant="outline" size="sm" className="self-start" onClick={again}>
                  <XCircleIcon aria-hidden="true" />
                  {join.result.again}
                </Button>
              ) : null}
            </div>
          )}
        </section>

        {/* Demo persona picker */}
        <section aria-labelledby="persona-title" className="rounded-3xl border border-dashed bg-secondary/40 p-5 sm:p-6">
          <h2 id="persona-title" className="text-lg font-bold">
            {join.personas.title}
          </h2>
          <div role="radiogroup" aria-label={join.personas.label} className="mt-4 flex flex-col gap-2">
            {PERSONAS.map((id) => {
              const p = join.personas[id]
              const cand = candidates[id]
              const checked = persona === id
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  disabled={tx.busy || !!result}
                  onClick={() => {
                    setPersona(id)
                    tx.reset()
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border bg-card p-3 text-left transition-colors duration-150 disabled:opacity-60",
                    checked ? "border-primary ring-2 ring-primary/40" : "hover:bg-muted/60"
                  )}
                >
                  <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-full border-2", checked ? "border-primary" : "border-input")}>
                    {checked ? <span className="size-2.5 rounded-full bg-primary" /> : null}
                  </span>
                  {cand ? <WalletAvatar address={cand.address} size={32} /> : <span className="size-8 shrink-0 rounded-full bg-muted" />}
                  <span className="min-w-0">
                    <span className="block font-bold">{p.title}</span>
                    <span className="block text-xs text-muted-foreground">{t(p.body, { name: friend?.name ?? "" })}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
