import { ArrowLeftIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { AppLoading } from "@/components/demo/app-frame"
import { AppProvider } from "@/components/demo/app-provider"
import { DemoControls } from "@/components/demo/demo-controls"
import { JoinView } from "@/components/demo/join-view"
import { href, isLocale, locales } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { YOU } from "@/lib/demo/program"
import { pageMetadata } from "@/lib/metadata"

/** The seeded ambassador's link is prerendered; any other code renders on demand (and shows "unknown"). */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale, code: YOU.code }))
}

export async function generateMetadata({ params }: PageProps<"/[locale]/r/[code]">): Promise<Metadata> {
  const { locale, code } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale)
  return pageMetadata(locale, `/r/${code}`, d.join.metaTitle, d.join.metaDescription)
}

export default async function JoinPage({ params }: PageProps<"/[locale]/r/[code]">) {
  const { locale, code } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  return (
    <AppProvider value={{ locale, app: dict.app, join: dict.join, seed: dict.seed, disclaimer: dict.common.disclaimer, demoBadge: dict.common.demoBadge }}>
      {/* One compact bar, like the app's: back to the dashboard, and the network + demo controls pill. */}
      <div className="border-b bg-secondary/40">
        <div className="mx-auto flex min-h-13 max-w-6xl items-center gap-2 px-4 sm:px-6">
          <Link href={href(locale, "/app")} className="inline-flex min-h-11 min-w-0 flex-1 items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
            <ArrowLeftIcon className="size-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{dict.join.back}</span>
          </Link>
          <DemoControls />
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6 lg:py-10">
        <Suspense fallback={<AppLoading label={dict.join.loading} />}>
          <JoinView code={code} />
        </Suspense>
      </div>
    </AppProvider>
  )
}
