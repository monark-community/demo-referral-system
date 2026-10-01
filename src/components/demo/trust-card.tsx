"use client"

import { UserPlusIcon } from "lucide-react"
import Link from "next/link"

import { TrustGauge } from "@/components/diagrams/trust-gauge"
import { Button } from "@/components/ui/button"
import { InfoTip } from "@/components/ui/info-tip"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { TRUST_BASE, TRUST_THRESHOLD } from "@/lib/demo/program"
import { yourTrust } from "@/lib/demo/selectors"
import { useDemo } from "@/lib/demo/store"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"

/** Network Trust, made personal: your own score, built from your wallet and your connections. */
export function TrustCard() {
  const demo = useDemo()
  const { app, locale } = useAppCopy()
  if (!demo) return null
  const c = app.missions.trust
  const { score, signals } = yourTrust(demo)
  const held = score < TRUST_THRESHOLD

  return (
    <section aria-labelledby="your-trust-title" className="rounded-3xl border bg-card p-5 sm:p-6">
      <div className="-my-1.5 flex items-center justify-between gap-2">
        <h2 id="your-trust-title" className="text-lg font-bold">
          {c.title}
        </h2>
        <InfoTip label={c.why}>{c.whyBody}</InfoTip>
      </div>
      <TrustGauge key={score} score={score} held={held} label={app.trust.title} status={held ? app.trust.held : app.trust.eligible} className="rf-tick mx-auto mt-4 w-40" />
      <ul className="mt-4 flex flex-col gap-1.5 text-sm">
        <li className="flex justify-between gap-3 text-muted-foreground">
          <span>{app.trust.base}</span>
          <span className="font-mono tabular-nums">{TRUST_BASE}</span>
        </li>
        {signals.map((sig) => (
          <li key={sig.key} className="flex justify-between gap-3">
            <span>{t(app.trust.signals[sig.key], sig.vars)}</span>
            <span className={cn("font-mono font-bold tabular-nums", sig.impact >= 0 ? "text-success" : "text-warning")}>
              {sig.impact >= 0 ? `+${sig.impact}` : `−${Math.abs(sig.impact)}`}
            </span>
          </li>
        ))}
      </ul>
      <Button asChild variant="outline" className="mt-5 w-full">
        <Link href={href(locale, "/app/invite")}>
          <UserPlusIcon aria-hidden="true" />
          {c.invite}
        </Link>
      </Button>
    </section>
  )
}
