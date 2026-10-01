import type { Metadata } from "next"

import { MissionsView } from "@/components/demo/missions-view"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/missions">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale)
  return pageMetadata(locale, "/app/missions", d.app.missions.title, d.app.missions.subtitle)
}

export default function MissionsPage() {
  return <MissionsView />
}
