"use client"

import { GiftIcon, LayoutDashboardIcon, Loader2Icon, Share2Icon, TrophyIcon, WalletIcon, XCircleIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { href } from "@/i18n/config"
import { useDemo, useStorageOk } from "@/lib/demo/store"
import { connectWallet } from "@/lib/demo/wallet"
import { cn } from "@/lib/utils"

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
      <div className="border-b bg-secondary/40">
        <div className="mx-auto flex min-h-13 max-w-6xl items-center gap-2 px-4 sm:px-6">
          {connected ? <AppSections /> : <span className="flex-1" />}
          <DemoControls />
        </div>
      </div>
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

function AppSections() {
  const { app, locale } = useAppCopy()
  const pathname = usePathname() ?? ""
  const items = [
    { href: href(locale, "/app"), label: app.sections.dashboard, icon: LayoutDashboardIcon, exact: true },
    { href: href(locale, "/app/missions"), label: app.sections.missions, icon: GiftIcon, exact: false },
    { href: href(locale, "/app/invite"), label: app.sections.invite, icon: Share2Icon, exact: false },
    { href: href(locale, "/app/leaderboard"), label: app.sections.leaderboard, icon: TrophyIcon, exact: false },
  ]
  return (
    <nav aria-label={app.sections.label} className="min-w-0 flex-1">
      <ul className="-mx-1 flex min-w-0 items-center gap-0.5 overflow-x-auto px-1 py-2 [scrollbar-width:none] sm:gap-1">
        {items.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <li key={item.href} className="shrink-0">
              {/* On phones, four sections don't fit with labels: inactive ones show their icon only. */}
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                title={item.label}
                className={cn(
                  "inline-flex h-9 min-w-9 items-center justify-center gap-2 rounded-full px-2.5 text-sm font-semibold whitespace-nowrap transition-colors duration-150 sm:px-3.5",
                  active ? "bg-card text-foreground ring-1 ring-border" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span className={cn(!active && "sr-only sm:not-sr-only")}>{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export function AppLoading({ label }: { label: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-4">
      <span className="sr-only">{label}</span>
      <div className="h-9 w-56 animate-pulse rounded-full bg-muted" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[7fr_5fr]">
        <div className="h-80 animate-pulse rounded-3xl bg-muted" />
        <div className="h-80 animate-pulse rounded-3xl bg-muted" />
      </div>
    </div>
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
