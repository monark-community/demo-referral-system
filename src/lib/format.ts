import { intlLocale, type Locale } from "@/i18n/config"
import { REWARD_DECIMALS, REWARD_SYMBOL } from "@/lib/demo/program"

/** Locale-aware decimal formatting of base units, exact (no float rounding of the whole part). */
export function formatUnits(value: bigint | string, decimals: number, locale: Locale, fractionDigits = 2): string {
  const raw = typeof value === "bigint" ? value : BigInt(value)
  const negative = raw < 0n
  const abs = negative ? -raw : raw
  const base = 10n ** BigInt(decimals)
  const whole = abs / base
  const frac = abs % base
  const nf = new Intl.NumberFormat(intlLocale[locale])
  const fracStr = frac.toString().padStart(decimals, "0").slice(0, fractionDigits).padEnd(fractionDigits, "0")
  const sep = nf.formatToParts(1.5).find((p) => p.type === "decimal")?.value ?? "."
  return `${negative ? "-" : ""}${nf.format(whole)}${fractionDigits > 0 ? sep + fracStr : ""}`
}

/** "25.00 tUSDC" / "25,00 tUSDC" */
export function formatReward(value: bigint | string, locale: Locale): string {
  return `${formatUnits(value, REWARD_DECIMALS, locale)} ${REWARD_SYMBOL}`
}

export function formatNumber(n: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale], { maximumFractionDigits: 0 }).format(n)
}

export function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], { dateStyle: "medium" }).format(new Date(iso))
}

export function formatDateTime(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso))
}

/** "3 days ago" / "il y a 3 jours", falling back to the date after a month. */
export function formatRelative(iso: string, locale: Locale, now = Date.now()): string {
  const diff = new Date(iso).getTime() - now
  const rtf = new Intl.RelativeTimeFormat(intlLocale[locale], { numeric: "auto" })
  const abs = Math.abs(diff)
  const min = 60_000
  const hour = 60 * min
  const day = 24 * hour
  if (abs < min) return rtf.format(0, "second")
  if (abs < hour) return rtf.format(Math.round(diff / min), "minute")
  if (abs < day) return rtf.format(Math.round(diff / hour), "hour")
  if (abs < 30 * day) return rtf.format(Math.round(diff / day), "day")
  return formatDate(iso, locale)
}

export function shortHash(hash: string, start = 8, end = 6): string {
  return hash.length > start + end + 1 ? `${hash.slice(0, start)}…${hash.slice(-end)}` : hash
}

export function shortAddress(address: string): string {
  return address.length > 12 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "")).toUpperCase()
}
