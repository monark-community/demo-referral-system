import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { AppLoading } from "@/components/demo/app-frame"
import { AppProvider } from "@/components/demo/app-provider"
import { Disclaimer } from "@/components/demo/disclaimer"
import { JoinView } from "@/components/demo/join-view"
import { NetworkBadge } from "@/components/ui/network-badge"
import { isLocale, locales } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { NETWORK_NAME, YOU } from "@/lib/demo/program"
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
      <div className="border-b bg-secondary/40">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6">
          <NetworkBadge name={NETWORK_NAME} variant="outline" icon={<span className="block size-full rounded-full bg-success" />} />
          <Disclaimer text={`${dict.common.demoBadge} · ${dict.common.disclaimer}`} className="min-w-0 flex-1" />
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
