import {
  ArrowRightIcon,
  AwardIcon,
  BanIcon,
  CircleCheckIcon,
  CircleAlertIcon,
  CoinsIcon,
  GiftIcon,
  HandCoinsIcon,
  NetworkIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { CodeBlock } from "@/components/diagrams/code-block"
import { TrustGauge } from "@/components/diagrams/trust-gauge"
import { HeroNetwork } from "@/components/home/hero-network"
import { SectionDivider } from "@/components/site/section-divider"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { href, isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"
import { PHOTOS } from "@/lib/photos"
import { SDK_SHORT } from "@/lib/snippets"

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale)
  return pageMetadata(locale, "/", null, d.meta.description)
}

/** Tokens, points, badges, inviter share (same order as home.missions.types). */
const REWARD_ICONS = [CoinsIcon, SparklesIcon, AwardIcon, HandCoinsIcon]

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const d = dict.home
  const layers = [
    { key: "trust", copy: d.layers.trust, photo: PHOTOS.invite, icon: NetworkIcon, href: "/how-it-works" },
    { key: "rewards", copy: d.layers.rewards, photo: PHOTOS.workshop, icon: GiftIcon, href: "/developers" },
  ]

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden" aria-labelledby="hero-title">
        <Image
          src="/brand/monark-mesh.svg"
          alt=""
          width={569}
          height={571}
          unoptimized
          priority
          className="pointer-events-none absolute -top-40 -left-48 w-[34rem] max-w-none opacity-[0.12] dark:opacity-[0.16] sm:-top-32 sm:-left-40 sm:w-[40rem]"
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pt-12 pb-14 sm:px-6 lg:grid-cols-[5fr_7fr] lg:items-center lg:gap-12 lg:pt-20 lg:pb-20">
          <div>
            <h1 id="hero-title" className="text-[2.25rem] leading-[1.05] font-extrabold tracking-display sm:text-5xl lg:text-[3.5rem]">
              {d.title}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground sm:text-xl">{d.lead}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={href(locale, "/app")}>
                  {d.primary}
                  <ArrowRightIcon aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={href(locale, "/developers")}>{d.secondary}</Link>
              </Button>
            </div>
          </div>
          <HeroNetwork
            locale={locale}
            copy={{
              label: d.hero.label,
              caption: d.heroCaption,
              points: d.hero.points,
              verified: d.hero.verified,
              feedTitle: d.hero.feedTitle,
              you: dict.app.network.you,
              events: d.hero.events,
              milestones: { workshop: dict.app.milestones.workshop.label, bounty: dict.app.milestones.bounty.label },
              rewardTag: dict.app.network.reward,
            }}
          />
        </div>
      </section>

      <SectionDivider />

      {/* Two layers, equal weight: Network Trust and Rewards */}
      <section aria-labelledby="layers-title" className="border-y bg-secondary/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <h2 id="layers-title" className="max-w-xl text-3xl font-bold tracking-display sm:text-[2rem]">
            {d.layers.title}
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {layers.map((layer) => {
              const Icon = layer.icon
              return (
                <article key={layer.key} aria-labelledby={`layer-${layer.key}`} className="flex flex-col overflow-hidden rounded-3xl border bg-card">
                  <Image
                    src={layer.photo.src}
                    alt={layer.copy.alt}
                    width={layer.photo.width}
                    height={layer.photo.height}
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="aspect-[16/9] w-full object-cover"
                  />
                  <div className="flex flex-1 flex-col p-6 sm:p-8">
                    <p className="eyebrow flex items-center gap-2 text-primary-ink">
                      <Icon className="size-4" strokeWidth={2} aria-hidden="true" />
                      {layer.copy.eyebrow}
                    </p>
                    <h3 id={`layer-${layer.key}`} className="mt-3 text-2xl font-extrabold tracking-display">
                      {layer.copy.title}
                    </h3>
                    <p className="mt-2 text-muted-foreground">{layer.copy.body}</p>
                    <ul className="mt-5 flex flex-col gap-2.5">
                      {layer.copy.points.map((point) => (
                        <li key={point} className="flex items-start gap-3 font-semibold">
                          <CircleCheckIcon className="mt-0.5 size-5 shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
                          {point}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={href(locale, layer.href)}
                      className="mt-auto inline-flex min-h-11 items-center gap-1.5 self-start pt-6 font-bold text-primary-ink underline underline-offset-4"
                    >
                      {layer.copy.link}
                      <ArrowRightIcon className="size-4" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* Hard to game */}
      <section aria-labelledby="guard-title" className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-20">
        <div>
          <h2 id="guard-title" className="text-3xl font-bold tracking-display sm:text-[2rem]">
            {d.guard.title}
          </h2>
          <ul className="mt-8 flex flex-col gap-3">
            {d.guard.rules.map((rule) => (
              <li key={rule} className="flex items-start gap-3 font-semibold">
                <ShieldCheckIcon className="mt-0.5 size-5 shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
                {rule}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border bg-card p-5 sm:p-6">
          <p className="eyebrow text-muted-foreground">{d.guard.cases.title}</p>
          <ul className="mt-4 flex flex-col divide-y">
            <li className="flex items-center gap-4 py-4 first:pt-0">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-destructive/50 text-destructive">
                <BanIcon className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground">{d.guard.cases.self.who}</p>
                <p className="font-bold text-destructive">{d.guard.cases.self.result}</p>
                <p className="text-sm text-muted-foreground">{d.guard.cases.self.detail}</p>
              </div>
            </li>
            <li className="flex items-center gap-4 py-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-warning text-warning">
                <CircleAlertIcon className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground">{d.guard.cases.burst.who}</p>
                <p className="font-bold text-warning">{d.guard.cases.burst.result}</p>
                <p className="text-sm text-muted-foreground">{d.guard.cases.burst.detail}</p>
              </div>
              <TrustGauge score={18} held label={dict.app.trust.title} status={dict.app.trust.held} className="hidden w-24 sm:flex [&_figcaption]:hidden" />
            </li>
            <li className="flex items-center gap-4 py-4 last:pb-0">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <CircleCheckIcon className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-muted-foreground">{d.guard.cases.friend.who}</p>
                <p className="font-bold text-success">{d.guard.cases.friend.result}</p>
                <p className="text-sm text-muted-foreground">{d.guard.cases.friend.detail}</p>
              </div>
              <TrustGauge score={91} held={false} label={dict.app.trust.title} status={dict.app.trust.eligible} className="hidden w-24 sm:flex [&_figcaption]:hidden" />
            </li>
          </ul>
        </div>
      </section>

      {/* Missions: the reward layer, for app builders */}
      <section aria-labelledby="missions-title" className="border-y bg-secondary/40">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[5fr_7fr] lg:items-center lg:py-20">
          <div>
            <h2 id="missions-title" className="text-3xl font-bold tracking-display sm:text-[2rem]">
              {d.missions.title}
            </h2>
            <p className="mt-3 text-muted-foreground">{d.missions.body}</p>
            <ul className="mt-8 grid grid-cols-2 gap-3">
              {d.missions.types.map((type, i) => {
                const Icon = REWARD_ICONS[i] ?? AwardIcon
                return (
                  <li key={type.title} className="rounded-2xl border bg-card p-4">
                    <Icon className="size-5 text-primary" strokeWidth={1.75} aria-hidden="true" />
                    <p className="mt-2 font-bold">{type.title}</p>
                    <p className="text-sm text-muted-foreground">{type.body}</p>
                  </li>
                )
              })}
            </ul>
            <Link
              href={href(locale, "/developers")}
              className="mt-6 inline-flex min-h-11 items-center gap-1.5 font-bold text-primary-ink underline underline-offset-4"
            >
              {d.missions.cta}
              <ArrowRightIcon className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <figure className="min-w-0">
            <CodeBlock code={SDK_SHORT} label={d.missions.codeLabel} />
            <figcaption className="mt-2 text-xs text-muted-foreground">{d.missions.codeLabel}</figcaption>
          </figure>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-title" className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 lg:py-20">
        <h2 id="faq-title" className="text-3xl font-bold tracking-display sm:text-[2rem]">
          {d.faq.title}
        </h2>
        <Accordion type="single" collapsible className="mt-8 border-t">
          {d.faq.items.map((item, i) => (
            <AccordionItem key={item.q} value={`q${i}`}>
              <AccordionTrigger className="min-h-14 text-base font-bold hover:no-underline">{item.q}</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Closing */}
      <section aria-labelledby="closing-title" className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:pb-24">
        <div className="flex flex-col items-start gap-6 rounded-3xl border bg-secondary p-8 sm:p-10 md:flex-row md:items-center md:justify-between">
          <h2 id="closing-title" className="max-w-xl text-3xl font-bold tracking-display">
            {d.closing.title}
          </h2>
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href={href(locale, "/app")}>
              {d.closing.cta}
              <ArrowRightIcon aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
