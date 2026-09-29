import type { Metadata } from "next"

import { LeaderboardView } from "@/components/demo/leaderboard-view"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/leaderboard">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale)
  return pageMetadata(locale, "/app/leaderboard", d.app.leaderboard.title, d.app.leaderboard.pointsNote)
}

export default function LeaderboardPage() {
  return <LeaderboardView />
}
