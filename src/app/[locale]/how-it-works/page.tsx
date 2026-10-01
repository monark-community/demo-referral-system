import { ArrowRightIcon, BanIcon, CloudIcon, LinkIcon, RepeatIcon, UserRoundCheckIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { RecordDiagram } from "@/components/diagrams/record-diagram"
import { TrustGauge } from "@/components/diagrams/trust-gauge"
import { SectionDivider } from "@/components/site/section-divider"
import { Button } from "@/components/ui/button"
import { href, isLocale } from "@/i18n/config"
import { getDictionary, t } from "@/i18n"
import { MILESTONES, NETWORK_WEIGHTS } from "@/lib/demo/program"
import type { TrustSignalKey } from "@/lib/demo/types"
import { formatReward } from "@/lib/format"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/how-it-works">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).how
  return pageMetadata(locale, "/how-it-works", d.metaTitle, d.metaDescription)
}

const RULE_ICONS = [BanIcon, UserRoundCheckIcon, RepeatIcon]

type SignalRow = { key: TrustSignalKey; impact: string; vars: Record<string, string | number> }

const OWN_SIGNALS: SignalRow[] = [
  { key: "walletAge", impact: "+20", vars: { months: "6+" } },
  { key: "history", impact: "+10", vars: { networks: "2+" } },
  { key: "checkIn", impact: "+15", vars: {} },
  { key: "newWallet", impact: "−12", vars: { minutes: "< 10" } },
  { key: "sharedFunding", impact: "−12", vars: { count: "3+" } },
  { key: "burst", impact: "−8", vars: { count: "5+", minutes: 2 } },
]

const w = NETWORK_WEIGHTS
const networkSignals = (someone: string): SignalRow[] => [
  { key: "vouched", impact: `+${w.vouched}`, vars: { name: someone, score: "50+" } },
  { key: "verifiedInvites", impact: `+${w.perVerifiedInvite} × n (≤ ${w.verifiedInvitesCap})`, vars: { count: "n" } },
  { key: "heldInvites", impact: `−${Math.abs(w.perHeldInvite)} × n`, vars: { count: "n" } },
]

export default async function HowItWorks({ params }: PageProps<"/[locale]/how-it-works">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const d = dict.how

  return (
    <>
      <section className="mx-auto w-full max-w-6xl px-4 pt-12 pb-10 sm:px-6 lg:pt-16">
        <h1 className="max-w-3xl text-4xl font-extrabold tracking-display sm:text-5xl">{d.title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{d.lead}</p>
      </section>

      {/* 1. Record */}
      <section aria-labelledby="record-title" className="mx-auto grid w-full max-w-6xl gap-8 px-4 pb-14 sm:px-6 lg:grid-cols-[5fr_7fr] lg:items-center">
        <div>
          <h2 id="record-title" className="text-3xl font-bold tracking-display">
            {d.record.title}
          </h2>
          <p className="mt-3 text-muted-foreground">{d.record.body}</p>
        </div>
        <RecordDiagram labels={d.record.diagram} />
        <ul className="grid gap-4 sm:grid-cols-3 lg:col-span-2">
          {d.record.rules.map((r, i) => {
            const Icon = RULE_ICONS[i] ?? BanIcon
            return (
              <li key={r.title} className="rounded-2xl border bg-card p-5">
                <Icon className="size-6 text-primary" strokeWidth={1.75} aria-hidden="true" />
                <h3 className="mt-3 text-lg font-bold">{r.title}</h3>
                <p className="mt-1 text-muted-foreground">{r.body}</p>
              </li>
            )
          })}
        </ul>
      </section>

      <SectionDivider />

      {/* 2. Trust */}
      <section aria-labelledby="trust-title" className="border-y bg-secondary/40">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[5fr_7fr]">
          <div>
            <h2 id="trust-title" className="text-3xl font-bold tracking-display">
              {d.trust.title}
            </h2>
            <p className="mt-3 text-muted-foreground">{d.trust.body}</p>
            <div className="mt-6 flex items-center gap-6 rounded-2xl border bg-card p-5">
              <TrustGauge score={18} held label={dict.app.trust.title} status={d.trust.threshold} className="w-32 shrink-0" />
              <p className="text-sm">{d.trust.example}</p>
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl border bg-card self-start">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/50 text-xs font-bold text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 sm:px-6">
                    {d.trust.headers.signal}
                  </th>
                  <th scope="col" className="px-4 py-3 text-right sm:px-6">
                    {d.trust.headers.effect}
                  </th>
                </tr>
              </thead>
              {[
                { title: d.trust.own, rows: OWN_SIGNALS },
                { title: d.trust.network, rows: networkSignals(d.trust.someone) },
              ].map((group) => (
                <tbody key={group.title} className="divide-y border-b last:border-b-0">
                  <tr>
                    <th scope="rowgroup" colSpan={2} className="bg-muted/30 px-4 py-2 text-xs font-bold text-primary-ink sm:px-6">
                      {group.title}
                    </th>
                  </tr>
                  {group.rows.map((s) => (
                    <tr key={s.key}>
                      <th scope="row" className="px-4 py-3.5 font-semibold sm:px-6">
                        {t(dict.app.trust.signals[s.key], s.vars)}
                      </th>
                      <td className={`px-4 py-3.5 text-right font-mono font-bold whitespace-nowrap sm:px-6 ${s.impact.startsWith("+") ? "text-success" : "text-warning"}`}>{s.impact}</td>
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        </div>
      </section>

      {/* 3. Milestones and missions */}
      <section aria-labelledby="ms-title" className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <h2 id="ms-title" className="text-3xl font-bold tracking-display">
          {d.milestones.title}
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">{d.milestones.body}</p>
        <div className="mt-6 overflow-hidden rounded-3xl border bg-card">
          <table className="w-full text-left text-sm sm:text-base">
            <thead className="border-b bg-muted/50 text-xs font-bold text-muted-foreground sm:text-sm">
              <tr>
                <th scope="col" className="px-4 py-3 sm:px-6">
                  {d.milestones.headers.milestone}
                </th>
                <th scope="col" className="px-4 py-3 text-right sm:px-6">
                  {d.milestones.headers.points}
                </th>
                <th scope="col" className="px-4 py-3 text-right sm:px-6">
                  {d.milestones.headers.reward}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {MILESTONES.map((m, i) => (
                <tr key={m.id}>
                  <th scope="row" className="px-4 py-4 font-normal sm:px-6">
                    <span className="flex items-center gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-primary text-xs font-bold">{i + 1}</span>
                      <span className="font-bold">{dict.app.milestones[m.id].label}</span>
                    </span>
                  </th>
                  <td className="px-4 py-4 text-right font-bold tabular-nums sm:px-6">+{m.points}</td>
                  <td className="px-4 py-4 text-right tabular-nums sm:px-6">{m.reward === "0" ? <span className="text-muted-foreground">{d.milestones.none}</span> : formatReward(m.reward, locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 max-w-3xl text-sm text-muted-foreground">{d.milestones.note}</p>
        <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 font-semibold">
          {d.milestones.missions}
          <Link href={href(locale, "/developers")} className="inline-flex min-h-11 items-center gap-1.5 font-bold text-primary-ink underline underline-offset-4">
            {d.milestones.missionsLink}
            <ArrowRightIcon className="size-4" aria-hidden="true" />
          </Link>
        </p>
      </section>

      {/* 4. On/off chain */}
      <section aria-labelledby="chain-title" className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <h2 id="chain-title" className="text-3xl font-bold tracking-display">
          {d.chain.title}
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border-2 border-primary bg-card p-6">
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <LinkIcon className="size-5 text-primary" aria-hidden="true" />
              {d.chain.onTitle}
            </h3>
            <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 marker:text-primary">
              {d.chain.on.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-dashed bg-card p-6">
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <CloudIcon className="size-5 text-muted-foreground" aria-hidden="true" />
              {d.chain.offTitle}
            </h3>
            <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 marker:text-muted-foreground">
              {d.chain.off.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:pb-24">
        <div className="flex flex-col items-start gap-6 rounded-3xl border bg-secondary p-8 sm:p-10 md:flex-row md:items-center md:justify-between">
          <h2 className="max-w-xl text-3xl font-bold tracking-display">{d.cta.title}</h2>
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href={href(locale, "/app")}>
              {d.cta.button}
              <ArrowRightIcon aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
