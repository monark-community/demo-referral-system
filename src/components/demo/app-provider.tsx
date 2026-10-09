"use client"

import Image from "next/image"
import { createContext, useContext, useEffect, useMemo, type ComponentProps, type ReactNode } from "react"

import { Toaster } from "@/components/ui/sonner"
import { TxFeedback } from "@/components/ui/tx-feedback"
import { WalletPrompt } from "@/components/ui/wallet-prompt"
import type { Dictionary } from "@/i18n"
import { intlLocale, type Locale } from "@/i18n/config"
import { estimateFee } from "@/lib/demo/chain"
import { NETWORK_NAME } from "@/lib/demo/program"
import { initDemo, useDemo, usePrompt } from "@/lib/demo/store"
import type { TxState } from "@/lib/demo/types"

export interface AppCopy {
  locale: Locale
  app: Dictionary["app"]
  join: Dictionary["join"]
  seed: Dictionary["seed"]
  disclaimer: string
  demoBadge: string
}

const AppContext = createContext<AppCopy | null>(null)

export function useAppCopy(): AppCopy {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useAppCopy must be used inside <AppProvider>")
  return ctx
}

export function AppProvider({ value, children }: { value: AppCopy; children: ReactNode }) {
  useEffect(() => {
    initDemo(value.seed)
  }, [value.seed])

  return (
    <AppContext.Provider value={value}>
      {children}
      <DemoWalletPrompt />
      <Toaster
        // Top-right, just under the sticky 64px header: page titles are
        // left-aligned and the network graph sits in the left column, so that
        // corner stays clear while a referral or reward animates. On phones
        // sonner goes full width, just below the header.
        position="top-right"
        offset={{ top: 80, right: 24 }}
        mobileOffset={{ top: 72, left: 16, right: 16 }}
      />
    </AppContext.Provider>
  )
}

/** The simulated wallet's confirmation dialog, driven by the store's pending signature request. Closing it counts as a rejection. */
function DemoWalletPrompt() {
  const prompt = usePrompt()
  const demo = useDemo()
  const { app, disclaimer, locale } = useAppCopy()
  const p = app.prompt
  // A fresh fee estimate per request.
  const fee = useMemo(() => (prompt ? estimateFee() : 0), [prompt])
  const signer = prompt?.summary.signer ?? (demo ? { name: demo.wallet.name, address: demo.wallet.address } : undefined)

  return (
    <WalletPrompt
      open={!!prompt}
      onConfirm={() => prompt?.resolve(true)}
      onReject={() => prompt?.resolve(false)}
      site={
        <>
          <Image src="/brand/monark-mark.svg" alt="" width={20} height={20} unoptimized />
          {p.site}
        </>
      }
      title={prompt?.summary.title ?? p.title}
      description={p.title}
      account={signer}
      accountLabel={p.signer}
      rows={prompt?.summary.rows ?? []}
      network={NETWORK_NAME}
      fee={`${fee.toLocaleString(intlLocale[locale], { maximumFractionDigits: 5 })} tETH`}
      noFee={prompt?.summary.noFee}
      // The testnet notice lives here, and only here: once per transaction (brand guidelines §11).
      disclaimer={disclaimer}
      warning
      confirmLabel={p.confirm}
      rejectLabel={p.reject}
      networkLabel={p.network}
      feeLabel={p.fee}
      noFeeLabel={p.noFee}
      closeLabel={app.close}
    />
  )
}

/** One transaction's lifecycle (TxFeedback from @monark/ui) with the app's strings. */
export function AppTxFeedback({
  state,
  pendingLabel,
  confirmedLabel,
  ...props
}: Omit<ComponentProps<typeof TxFeedback>, "phase" | "hash" | "error"> & {
  state: TxState
  pendingLabel?: string
  confirmedLabel?: string
}) {
  const { app } = useAppCopy()
  const tx = app.tx
  return (
    <TxFeedback
      phase={state.phase}
      hash={state.hash}
      error={state.error}
      signingLabel={tx.signing}
      pendingLabel={pendingLabel ?? tx.pending}
      pendingStatusLabel={tx.pending}
      confirmedLabel={confirmedLabel ?? tx.confirmed}
      failedLabel={tx.failed}
      reasons={{ rejected: tx.rejected, reverted: tx.reverted, self: tx.self, loop: tx.loop, duplicate: tx.duplicate }}
      retryLabel={tx.retry}
      dismissLabel={tx.dismiss}
      {...props}
    />
  )
}
