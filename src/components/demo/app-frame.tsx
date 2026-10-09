"use client"

import { LayoutDashboardIcon, Loader2Icon, Share2Icon, TrophyIcon, WalletIcon, XCircleIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

import { AppLoading } from "@/components/ui/app-loading"
import { AppTabs } from "@/components/ui/app-tabs"
import { Button } from "@/components/ui/button"
import { href } from "@/i18n/config"
import { useDemo, useStorageOk } from "@/lib/demo/store"
import { connectWallet } from "@/lib/demo/wallet"

import { useAppCopy } from "./app-provider"
import { DemoControls } from "./demo-controls"

/**
 * App chrome under the site header: ONE compact bar with the section nav on
 * the left and the network + demo controls pill on the right. No testnet
 * strip: that line lives in the wallet prompt, once per transaction.
 * Gates on wallet connection.
 */
export function AppFrame({ children }: { children: ReactNode }) {
  const demo = useDemo()
  const storageOk = useStorageOk()
  const { app } = useAppCopy()
  const connected = demo?.wallet.status === "connected"

  return (
    <div className="flex flex-1 flex-col">
      <AppSections connected={connected} />
      {!storageOk ? (
        <p role="alert" className="mx-auto mt-4 w-full max-w-6xl px-4 text-sm text-warning sm:px-6">
          {app.storageError}
        </p>
      ) : null}
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6 lg:py-10">
        {!demo ? <AppLoading label={app.loading} /> : !connected ? <ConnectGate /> : children}
      </div>
    </div>
  )
}

/** The app's sub-bar: section tabs once the wallet is connected, and the network + demo controls pill. */
function AppSections({ connected }: { connected: boolean }) {
  const { app, locale } = useAppCopy()
  const pathname = usePathname() ?? ""
  return (
    <AppTabs
      label={app.sections.label}
      pathname={pathname}
      LinkComponent={Link}
      tabs={
        connected
          ? [
              { href: href(locale, "/app"), label: app.sections.dashboard, icon: <LayoutDashboardIcon />, iconDesktopOnly: true, exact: true },
              { href: href(locale, "/app/invite"), label: app.sections.invite, icon: <Share2Icon />, iconDesktopOnly: true },
              { href: href(locale, "/app/leaderboard"), label: app.sections.leaderboard, icon: <TrophyIcon />, iconDesktopOnly: true },
            ]
          : []
      }
      actions={<DemoControls />}
    />
  )
}

function ConnectGate() {
  const demo = useDemo()
  const { app } = useAppCopy()
  const g = app.gate
  const connecting = demo?.wallet.status === "connecting"
  const rejected = demo?.wallet.lastError === "rejected"

  return (
    <section aria-labelledby="gate-title" className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center py-8 text-center">
      <Image src="/brand/monark-mark.svg" alt="" width={56} height={56} unoptimized className="size-14" />
      <h1 id="gate-title" className="mt-6 text-3xl font-extrabold tracking-display">
        {g.title}
      </h1>
      <p className="mt-3 text-muted-foreground">{g.body}</p>
      <Button
        size="lg"
        className="mt-8 w-full sm:w-auto"
        disabled={connecting}
        onClick={() =>
          void connectWallet({
            title: app.summaries.signIn,
            rows: [{ label: app.summaries.signInRow, value: app.summaries.signInValue }],
            noFee: true,
          })
        }
      >
        {connecting ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : <WalletIcon aria-hidden="true" />}
        {connecting ? app.wallet.connecting : g.connect}
      </Button>
      <div aria-live="polite" className="mt-4 min-h-6">
        {rejected ? (
          <p role="alert" className="flex items-start gap-2 text-left text-sm text-destructive">
            <XCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {g.rejected}
          </p>
        ) : null}
      </div>
    </section>
  )
}
