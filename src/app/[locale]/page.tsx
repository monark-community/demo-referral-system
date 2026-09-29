import {
  ArrowRightIcon,
  AwardIcon,
  BanIcon,
  CalendarCheckIcon,
  CircleCheckIcon,
  CircleAlertIcon,
  FileSignatureIcon,
  HandshakeIcon,
  QrCodeIcon,
  ScaleIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { TrustGauge } from "@/components/diagrams/trust-gauge"
import { HeroNetwork } from "@/components/home/hero-network"
import { SectionDivider } from "@/components/site/section-divider"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { href, isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"
import { PHOTOS } from "@/lib/photos"

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale)
  return pageMetadata(locale, "/", null, d.meta.description)
}

const WHY_ICONS = [SparklesIcon, HandshakeIcon, ScaleIcon]
const STEP_ICONS = [QrCodeIcon, FileSignatureIcon, CalendarCheckIcon, AwardIcon]

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const dict = getDictionary(locale)
  const d = dict.home
  const photos = [PHOTOS.invite, PHOTOS.workshop, PHOTOS.meetup]

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
            <p className="eyebrow text-primary-ink">{d.eyebrow}</p>
            <h1 id="hero-title" className="mt-4 text-[2.25rem] leading-[1.05] font-extrabold tracking-display sm:text-5xl lg:text-[3.5rem]">
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
                <Link href={href(locale, "/how-it-works")}>{d.secondary}</Link>
              </Button>
            </div>
            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-dashed px-3 py-1 text-xs font-semibold text-muted-foreground">
              {dict.common.demoBadge}
            </p>
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

      {/* Why */}
      <section aria-labelledby="why-title" className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="max-w-2xl">
          <h2 id="why-title" className="text-3xl font-bold tracking-display sm:text-[2rem]">
            {d.why.title}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{d.why.body}</p>
        </div>
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {d.why.items.map((item, i) => {
            const Icon = WHY_ICONS[i] ?? SparklesIcon
            return (
              <li key={item.title} className="rounded-2xl border bg-card p-6">
                <Icon className="size-6 text-primary" strokeWidth={1.75} aria-hidden="true" />
                <h3 className="mt-4 text-xl font-bold">{item.title}</h3>
                <p className="mt-2 text-muted-foreground">{item.body}</p>
              </li>
            )
          })}
        </ul>
      </section>

      {/* Steps */}
      <section aria-labelledby="steps-title" className="border-y bg-secondary/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 id="steps-title" className="max-w-xl text-3xl font-bold tracking-display sm:text-[2rem]">
              {d.steps.title}
            </h2>
            <Link href={href(locale, "/how-it-works")} className="inline-flex min-h-11 items-center gap-1.5 font-bold text-primary-ink underline underline-offset-4">
              {d.steps.more}
              <ArrowRightIcon className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <ol className="relative mt-10 grid gap-8 md:grid-cols-4 md:gap-6">
            {/* The line the steps sit on (line art, flat orange) */}
            <span aria-hidden="true" className="absolute top-6 right-[12%] left-[12%] hidden h-0.5 rounded-full bg-primary md:block" />
            <span aria-hidden="true" className="absolute top-6 bottom-6 left-6 w-0.5 rounded-full bg-primary md:hidden" />
            {d.steps.items.map((step, i) => {
              const Icon = STEP_ICONS[i] ?? AwardIcon
              return (
                <li key={step.title} className="relative flex gap-4 md:flex-col md:items-center md:text-center">
                  <span className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background">
                    <Icon className="size-5 text-foreground" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-primary-ink">{String(i + 1).padStart(2, "0")}</p>
                    <h3 className="mt-1 text-lg font-bold">{step.title}</h3>
                    <p className="mt-1.5 text-muted-foreground">{step.body}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      {/* Hard to game */}
      <section aria-labelledby="guard-title" className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-20">
        <div>
          <h2 id="guard-title" className="text-3xl font-bold tracking-display sm:text-[2rem]">
            {d.guard.title}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{d.guard.body}</p>
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

      {/* Audiences */}
      <section aria-labelledby="who-title" className="mx-auto w-full max-w-6xl px-4 pb-14 sm:px-6 lg:pb-20">
        <h2 id="who-title" className="max-w-2xl text-3xl font-bold tracking-display sm:text-[2rem]">
          {d.audiences.title}
        </h2>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {d.audiences.items.map((item, i) => {
            const photo = photos[i]!
            return (
              <li key={item.title} className="overflow-hidden rounded-3xl border bg-card">
                <Image
                  src={photo.src}
                  alt={item.alt}
                  width={photo.width}
                  height={photo.height}
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="mt-2 text-muted-foreground">{item.body}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      <SectionDivider />

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
          <div className="max-w-xl">
            <h2 id="closing-title" className="text-3xl font-bold tracking-display">
              {d.closing.title}
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">{d.closing.body}</p>
          </div>
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
