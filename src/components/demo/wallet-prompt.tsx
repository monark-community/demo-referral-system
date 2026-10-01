"use client"

import Image from "next/image"
import { useMemo } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { NetworkBadge } from "@/components/ui/network-badge"
import { WalletAddress, WalletAvatar } from "@/components/ui/wallet"
import { intlLocale } from "@/i18n/config"
import { estimateFee } from "@/lib/demo/chain"
import { NETWORK_NAME } from "@/lib/demo/program"
import { useDemo, usePrompt } from "@/lib/demo/store"

import { useAppCopy } from "./app-provider"
import { Disclaimer } from "./disclaimer"

/** The simulated wallet's confirmation sheet. Closing it counts as a rejection. */
export function WalletPrompt() {
  const prompt = usePrompt()
  const demo = useDemo()
  const { app, disclaimer, locale } = useAppCopy()
  const p = app.prompt
  // A fresh fee estimate per request.
  const fee = useMemo(() => (prompt ? estimateFee() : 0), [prompt])
  const feeText = `${fee.toLocaleString(intlLocale[locale], { maximumFractionDigits: 5 })} tETH`
  const signer = prompt?.summary.signer ?? (demo ? { name: demo.wallet.name, address: demo.wallet.address } : null)

  return (
    <Dialog open={!!prompt} onOpenChange={(open) => !open && prompt?.resolve(false)}>
      <DialogContent closeLabel={app.close} className="gap-5 sm:max-w-md">
        <DialogHeader className="gap-1 text-left">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <Image src="/brand/monark-mark.svg" alt="" width={20} height={20} unoptimized className="size-5" />
            {p.site}
          </div>
          <DialogTitle className="pt-2 text-xl font-extrabold">{prompt?.summary.title ?? p.title}</DialogTitle>
          <DialogDescription>{p.title}</DialogDescription>
        </DialogHeader>

        {signer ? (
          <div className="flex items-center gap-3 rounded-2xl border bg-muted/50 p-3">
            <WalletAvatar address={signer.address} size={32} />
            <div className="min-w-0 leading-tight">
              <p className="text-xs text-muted-foreground">{p.signer}</p>
              <p className="truncate text-sm font-bold">{signer.name}</p>
              <WalletAddress address={signer.address} className="text-xs text-muted-foreground" />
            </div>
          </div>
        ) : null}

        <dl className="divide-y rounded-2xl border text-sm">
          {prompt?.summary.rows?.map((row) => (
            <div key={row.label} className="flex items-start justify-between gap-4 px-4 py-2.5">
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="text-right font-semibold">{row.value}</dd>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 px-4 py-2.5">
            <dt className="text-muted-foreground">{p.network}</dt>
            <dd>
              <NetworkBadge name={NETWORK_NAME} variant="outline" icon={<span className="block size-full rounded-full bg-success" />} />
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 px-4 py-2.5">
            <dt className="text-muted-foreground">{p.fee}</dt>
            <dd className={prompt?.summary.noFee ? "text-xs font-semibold" : "font-mono text-xs"}>{prompt?.summary.noFee ? p.noFee : feeText}</dd>
          </div>
        </dl>

        {/* The testnet notice lives here, and only here: once per transaction (brand guidelines §11). */}
        <Disclaimer text={disclaimer} />

        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:space-x-0">
          <Button variant="outline" size="lg" onClick={() => prompt?.resolve(false)}>
            {p.reject}
          </Button>
          <Button size="lg" onClick={() => prompt?.resolve(true)} autoFocus>
            {p.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
