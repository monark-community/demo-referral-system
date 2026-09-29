"use client"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { TokenAmount } from "@/components/ui/token-amount"
import { intlLocale } from "@/i18n/config"
import { t } from "@/i18n/t"
import { useTx } from "@/lib/demo/chain"
import { applyClaim } from "@/lib/demo/ops"
import { PROGRAM, REWARD_DECIMALS, REWARD_SYMBOL } from "@/lib/demo/program"
import { totals } from "@/lib/demo/selectors"
import { getDemo, useDemo } from "@/lib/demo/store"
import { formatReward, shortAddress } from "@/lib/format"

import { useAppCopy } from "./app-provider"
import { Disclaimer } from "./disclaimer"
import { TxFeedback } from "./tx-feedback"

/** Claimable, claimed and held tUSDC, with the claim transaction (flow 5). */
export function RewardsCard() {
  const demo = useDemo()
  const { app, locale, disclaimer } = useAppCopy()
  const tx = useTx()
  if (!demo) return null
  const r = app.rewards
  const tot = totals(demo)
  const claimable = tot.claimable

  const claim = () => {
    const amount = getDemo() ? totals(getDemo()!).claimable : 0n
    if (amount <= 0n) return
    const text = formatReward(amount, locale)
    void tx.run(
      {
        title: app.summaries.claim,
        rows: [
          { label: app.summaries.claimAmount, value: text },
          { label: app.summaries.claimTo, value: shortAddress(demo.wallet.address) },
        ],
        movesValue: true,
      },
      (hash) => {
        applyClaim(amount, hash)
        toast.success(t(r.done, { amount: text }))
      }
    )
  }

  const used = BigInt(PROGRAM.poolUsed) + BigInt(demo.claimed) - 15_000_000n

  return (
    <section aria-labelledby="rewards-title" className="rounded-3xl border bg-card p-5 sm:p-6">
      <h2 id="rewards-title" className="text-lg font-bold">
        {r.title}
      </h2>
      <div className="mt-4">
        <p className="text-sm text-muted-foreground">{r.claimable}</p>
        <TokenAmount
          value={claimable}
          decimals={REWARD_DECIMALS}
          symbol={REWARD_SYMBOL}
          fractionDigits={2}
          locale={intlLocale[locale]}
          className="mt-1 text-3xl font-extrabold"
        />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-muted/60 p-3">
          <dt className="text-muted-foreground">{r.claimed}</dt>
          <dd className="mt-0.5 font-bold tabular-nums">{formatReward(demo.claimed, locale)}</dd>
        </div>
        <div className="rounded-2xl bg-muted/60 p-3">
          <dt className="text-muted-foreground">{r.held}</dt>
          <dd className="mt-0.5 font-bold tabular-nums text-warning">{formatReward(tot.held, locale)}</dd>
        </div>
      </dl>
      {claimable > 0n || tx.state.phase !== "idle" ? (
        <div className="mt-5 flex flex-col gap-3">
          {claimable > 0n ? (
            <Button size="lg" className="w-full" onClick={claim} disabled={tx.busy}>
              {t(r.claim, { amount: formatReward(claimable, locale) })}
            </Button>
          ) : null}
          <TxFeedback state={tx.state} pendingLabel={r.pending} onRetry={claimable > 0n ? claim : undefined} onDismiss={tx.reset} />
          <Disclaimer text={disclaimer} />
        </div>
      ) : (
        <p className="mt-5 rounded-2xl border border-dashed p-4 text-sm text-muted-foreground">{r.empty}</p>
      )}
      <p className="mt-4 text-xs text-muted-foreground">
        {t(r.pool, { used: formatReward(used, locale), total: formatReward(PROGRAM.poolTotal, locale) })}
      </p>
    </section>
  )
}
