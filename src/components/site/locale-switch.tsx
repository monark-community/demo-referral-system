"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Suspense } from "react"

import { locales, switchLocalePath, type Locale } from "@/i18n/config"
import { cn } from "@/lib/utils"

interface Props {
  locale: Locale
  label: string
  names: Record<Locale, string>
  short: Record<Locale, string>
  className?: string
}

function Links({ locale, names, short, query }: Props & { query: string }) {
  const pathname = usePathname() ?? `/${locale}`
  return (
    <>
      {locales.map((l) => {
        const active = l === locale
        return (
          <Link
            key={l}
            href={switchLocalePath(pathname, l) + (query ? `?${query}` : "")}
            hrefLang={l}
            lang={l}
            aria-current={active ? "true" : undefined}
            aria-label={names[l]}
            prefetch={false}
            className={cn(
              "inline-flex h-8 min-w-9 items-center justify-center rounded-full px-2 text-xs font-bold transition-colors duration-150",
              active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {short[l]}
          </Link>
        )
      })}
    </>
  )
}

/** Keeps the query string, so switching language on /r/[code]?via=… keeps the channel tag. */
function LinksWithQuery(props: Props) {
  const query = useSearchParams()?.toString() ?? ""
  return <Links {...props} query={query} />
}

/** Compact EN/FR switch that keeps the current page. */
export function LocaleSwitch(props: Props) {
  return (
    <nav aria-label={props.label} className={cn("flex items-center rounded-full border p-0.5", props.className)}>
      <Suspense fallback={<Links {...props} query="" />}>
        <LinksWithQuery {...props} />
      </Suspense>
    </nav>
  )
}
