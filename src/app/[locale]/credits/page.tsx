import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"

import { isLocale } from "@/i18n/config"
import { getDictionary, t } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"
import { PHOTOS, type PhotoKey } from "@/lib/photos"

export async function generateMetadata({ params }: PageProps<"/[locale]/credits">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).credits
  return pageMetadata(locale, "/credits", d.metaTitle, d.metaDescription)
}

export default async function Credits({ params }: PageProps<"/[locale]/credits">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const d = getDictionary(locale).credits
  const keys = Object.keys(PHOTOS) as PhotoKey[]

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <h1 className="text-4xl font-extrabold tracking-display">{d.title}</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">{d.lead}</p>
      <ul className="mt-10 grid gap-6 md:grid-cols-3">
        {keys.map((k) => {
          const p = PHOTOS[k]
          return (
            <li key={k} className="overflow-hidden rounded-3xl border bg-card">
              <Image src={p.src} alt="" width={p.width} height={p.height} sizes="(min-width: 768px) 33vw, 100vw" className="aspect-[4/3] w-full object-cover" />
              <div className="p-5">
                <h2 className="font-bold">{d.photos[k].title}</h2>
                <p className="mt-1 text-sm">
                  <a href={p.profile} className="text-primary-ink underline underline-offset-4">
                    {t(d.photoBy, { name: p.photographer })}
                  </a>
                </p>
                <p className="mt-1 text-sm">
                  <a href={p.page} className="text-primary-ink underline underline-offset-4">
                    {d.onUnsplash}
                  </a>
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {d.usedOn}: {d.photos[k].used}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
      <h2 className="mt-14 text-2xl font-bold">{d.brandTitle}</h2>
      <p className="mt-3 max-w-2xl text-muted-foreground">{d.brand}</p>
    </section>
  )
}
