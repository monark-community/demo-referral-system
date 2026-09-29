import { notFound } from "next/navigation"

import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const d = getDictionary(locale).home
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
      <h1 className="text-5xl font-extrabold tracking-display">{d.title}</h1>
    </section>
  )
}
