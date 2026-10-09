"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Suspense } from "react"

import { DemoChip } from "@/components/ui/demo-chip"
import { HeaderAction } from "@/components/ui/header-action"
import { LocaleSwitch } from "@/components/ui/locale-switch"
import { SiteBrand } from "@/components/ui/site-brand"
import { SiteHeader as MonarkSiteHeader } from "@/components/ui/site-header"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { href, locales, switchLocalePath, type Locale } from "@/i18n/config"
import type { Dictionary } from "@/i18n"
import { useDemo } from "@/lib/demo/store"
import { connectWallet, disconnectWallet } from "@/lib/demo/wallet"

export interface HeaderCopy {
  common: Pick<
    Dictionary["common"],
    "product" | "homeLabel" | "demoChip" | "demoBadge" | "nav" | "launchDemo" | "menu" | "closeMenu" | "menuTitle" | "theme" | "language"
  >
  wallet: Pick<Dictionary["app"]["wallet"], "connect" | "connecting" | "disconnect">
  signIn: Pick<Dictionary["app"]["summaries"], "signIn" | "signInRow" | "signInValue">
}

type LanguageCopy = HeaderCopy["common"]["language"]

function LocaleLinks({ locale, language, query }: { locale: Locale; language: LanguageCopy; query: string }) {
  const pathname = usePathname() ?? `/${locale}`
  return (
    <LocaleSwitch
      locales={locales}
      current={locale}
      hrefFor={(l) => switchLocalePath(pathname, l) + (query ? `?${query}` : "")}
      labels={{ label: language.label, short: language.short, names: { en: language.en, fr: language.fr } }}
      LinkComponent={Link}
      linkProps={{ prefetch: false }}
    />
  )
}

/** Keeps the query string, so switching language on /r/[code]?via=… keeps the channel tag. */
function LocaleLinksWithQuery(props: { locale: Locale; language: LanguageCopy }) {
  const query = useSearchParams()?.toString() ?? ""
  return <LocaleLinks {...props} query={query} />
}

/**
 * Standard Monark shell header (brand guidelines §10), from @monark/ui:
 * [mark] {Product}  links…            (• Demo) (EN|FR) (☾) [Primary action]
 * The primary action is "Launch demo" outside the app and the demo wallet inside it.
 */
export function SiteHeader({ locale, copy }: { locale: Locale; copy: HeaderCopy }) {
  const pathname = usePathname() ?? ""
  const demo = useDemo()
  const c = copy.common
  const appHref = href(locale, "/app")
  const signIn = () =>
    void connectWallet({
      title: copy.signIn.signIn,
      rows: [{ label: copy.signIn.signInRow, value: copy.signIn.signInValue }],
      noFee: true,
    })

  return (
    <MonarkSiteHeader
      brand={<SiteBrand name={c.product} href={href(locale)} aria-label={c.homeLabel} LinkComponent={Link} />}
      links={[
        { href: href(locale), label: c.nav.overview, exact: true },
        { href: href(locale, "/how-it-works"), label: c.nav.how },
        { href: appHref, label: c.nav.demo },
      ]}
      pathname={pathname}
      LinkComponent={Link}
      labels={{ nav: c.nav.label, openMenu: c.menu, closeMenu: c.closeMenu, menu: c.menuTitle }}
      actions={
        <>
          <DemoChip label={c.demoChip} description={c.demoBadge} />
          <Suspense fallback={<LocaleLinks locale={locale} language={c.language} query="" />}>
            <LocaleLinksWithQuery locale={locale} language={c.language} />
          </Suspense>
          <ThemeToggle label={c.theme.toggle} />
        </>
      }
      primaryAction={
        <HeaderAction
          appHref={appHref}
          pathname={pathname}
          launchLabel={c.launchDemo}
          LinkComponent={Link}
          loading={!demo}
          wallet={{
            status: demo?.wallet.status ?? "disconnected",
            address: demo?.wallet.address,
            name: demo?.wallet.name,
            connectLabel: copy.wallet.connect,
            connectingLabel: copy.wallet.connecting,
            disconnectLabel: copy.wallet.disconnect,
            onConnect: signIn,
            onDisconnect: disconnectWallet,
          }}
        />
      }
    />
  )
}
