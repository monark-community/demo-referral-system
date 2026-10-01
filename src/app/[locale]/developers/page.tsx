import { ArrowRightIcon, AwardIcon, CoinsIcon, HandCoinsIcon, LinkIcon, ServerIcon, SparklesIcon, UserRoundCheckIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { CodeBlock } from "@/components/diagrams/code-block"
import { SectionDivider } from "@/components/site/section-divider"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { href, isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"
import { EVENTS, REST, SDK, TRUST_API, WEBHOOK } from "@/lib/snippets"

export async function generateMetadata({ params }: PageProps<"/[locale]/developers">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).developers
  return pageMetadata(locale, "/developers", d.metaTitle, d.metaDescription)
}

/** Tokens, points, badges, inviter share (same order as developers.rewards.items). */
const REWARD_ICONS = [CoinsIcon, SparklesIcon, AwardIcon, HandCoinsIcon]
/** On-chain event, your API, organizer check-in (same order as developers.verify.items). */
const VERIFY_ICONS = [LinkIcon, ServerIcon, UserRoundCheckIcon]

/** For app builders: how to plug the reward layer (and the trust score) into an app. */
export default async function Developers({ params }: PageProps<"/[locale]/developers">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const d = getDictionary(locale).developers

  return (
    <>
      <section className="mx-auto w-full max-w-6xl px-4 pt-12 pb-10 sm:px-6 lg:pt-16">
        <h1 className="max-w-3xl text-4xl font-extrabold tracking-display sm:text-5xl">{d.title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{d.lead}</p>
        <p className="mt-5 inline-flex rounded-full border border-dashed px-3 py-1 text-xs font-semibold text-muted-foreground">{d.preview}</p>
      </section>

      {/* Three steps, with the code for each in tabs */}
      <section aria-labelledby="steps-title" className="mx-auto grid w-full max-w-6xl gap-10 px-4 pb-14 sm:px-6 lg:grid-cols-[5fr_7fr] lg:pb-20">
        <div>
          <h2 id="steps-title" className="text-3xl font-bold tracking-display">
            {d.steps.title}
          </h2>
          <ol className="relative mt-8 flex flex-col gap-7">
            <span aria-hidden="true" className="absolute top-6 bottom-6 left-6 w-0.5 rounded-full bg-primary" />
            {d.steps.items.map((step, i) => (
              <li key={step.title} className="relative flex gap-4">
                <span className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background font-extrabold">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-lg font-bold">{step.title}</h3>
                  <p className="mt-1 text-muted-foreground">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <Tabs defaultValue="sdk" className="min-w-0">
          <TabsList aria-label={d.code.label} className="max-w-full justify-start overflow-x-auto [scrollbar-width:none]">
            <TabsTrigger value="sdk">{d.code.sdk}</TabsTrigger>
            <TabsTrigger value="rest">{d.code.rest}</TabsTrigger>
            <TabsTrigger value="contract">{d.code.contract}</TabsTrigger>
          </TabsList>
          <TabsContent value="sdk" className="mt-4">
            <CodeBlock code={SDK} label={d.code.sdk} />
          </TabsContent>
          <TabsContent value="rest" className="mt-4">
            <CodeBlock code={REST} label={d.code.rest} />
          </TabsContent>
          <TabsContent value="contract" className="mt-4">
            <CodeBlock code={EVENTS} label={d.code.contract} />
          </TabsContent>
        </Tabs>
      </section>

      <SectionDivider />

      {/* Reward types */}
      <section aria-labelledby="rewards-title" className="border-y bg-secondary/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <h2 id="rewards-title" className="text-3xl font-bold tracking-display">
            {d.rewards.title}
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {d.rewards.items.map((item, i) => {
              const Icon = REWARD_ICONS[i] ?? CoinsIcon
              return (
                <li key={item.title} className="rounded-2xl border bg-card p-5">
                  <Icon className="size-6 text-primary" strokeWidth={1.75} aria-hidden="true" />
                  <h3 className="mt-3 text-lg font-bold">{item.title}</h3>
                  <p className="mt-1 text-muted-foreground">{item.body}</p>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      {/* Verification */}
      <section aria-labelledby="verify-title" className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
        <h2 id="verify-title" className="text-3xl font-bold tracking-display">
          {d.verify.title}
        </h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {d.verify.items.map((item, i) => {
            const Icon = VERIFY_ICONS[i] ?? LinkIcon
            return (
              <li key={item.title} className="flex gap-4 rounded-2xl border bg-card p-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-primary">
                  <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-bold">{item.title}</h3>
                  <p className="mt-1 text-muted-foreground">{item.body}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      {/* Trust API and webhooks */}
      <section aria-label={`${d.trust.title} ${d.webhooks.title}`} className="mx-auto grid w-full max-w-6xl gap-10 px-4 pb-14 sm:px-6 lg:grid-cols-2 lg:pb-20">
        <div className="min-w-0">
          <h2 className="text-3xl font-bold tracking-display">{d.trust.title}</h2>
          <p className="mt-3 text-muted-foreground">{d.trust.body}</p>
          <CodeBlock code={TRUST_API} label={d.trust.title} className="mt-6" />
        </div>
        <div className="min-w-0">
          <h2 className="text-3xl font-bold tracking-display">{d.webhooks.title}</h2>
          <p className="mt-3 text-muted-foreground">{d.webhooks.body}</p>
          <CodeBlock code={WEBHOOK} label={d.webhooks.title} className="mt-6" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 lg:pb-24">
        <div className="flex flex-col items-start gap-6 rounded-3xl border bg-secondary p-8 sm:p-10 md:flex-row md:items-center md:justify-between">
          <h2 className="max-w-xl text-3xl font-bold tracking-display">{d.cta.title}</h2>
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href={href(locale, "/app/missions")}>
              {d.cta.button}
              <ArrowRightIcon aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
