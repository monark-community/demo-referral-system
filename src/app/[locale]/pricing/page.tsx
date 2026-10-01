import { CheckIcon, XIcon } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"

/**
 * Internal strategy review only: never linked from anywhere, absent from the
 * sitemap, and marked noindex/nofollow.
 */
export async function generateMetadata({ params }: PageProps<"/[locale]/pricing">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).pricing
  return {
    title: d.metaTitle,
    description: d.metaDescription,
    robots: { index: false, follow: false },
  }
}

export default async function Pricing({ params }: PageProps<"/[locale]/pricing">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const d = getDictionary(locale).pricing

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:py-16">
      <p className="eyebrow inline-flex rounded-full border border-dashed px-3 py-1 text-muted-foreground">{d.eyebrow}</p>
      <h1 className="mt-4 text-4xl font-extrabold tracking-display sm:text-5xl">{d.title}</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{d.lead}</p>

      <ul className="mt-10 grid gap-6 md:grid-cols-2">
        {d.plans.map((plan, i) => (
          <li key={plan.name} className={`flex flex-col rounded-3xl bg-card p-6 sm:p-8 ${i === 0 ? "border-2 border-primary" : "border"}`}>
            <h2 className="text-lg font-bold">{plan.name}</h2>
            <p className="mt-3 text-4xl font-extrabold tracking-display">{plan.price}</p>
            <p className="mt-1 text-sm text-muted-foreground">{plan.note}</p>
            <ul className="mt-6 flex flex-col gap-2.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <CheckIcon className="mt-1 size-4 shrink-0 text-success" aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <div className="mt-10 rounded-3xl border bg-secondary/50 p-6 sm:p-8">
        <h2 className="text-lg font-bold">{d.neverTitle}</h2>
        <ul className="mt-4 flex flex-col gap-2.5">
          {d.never.map((n) => (
            <li key={n} className="flex items-start gap-2.5">
              <XIcon className="mt-1 size-4 shrink-0 text-destructive" aria-hidden="true" />
              {n}
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-3xl text-sm text-muted-foreground">{d.why}</p>
      </div>
    </section>
  )
}
