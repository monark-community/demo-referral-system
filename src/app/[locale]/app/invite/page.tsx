import type { Metadata } from "next"

import { InviteView } from "@/components/demo/invite-view"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/invite">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale)
  return pageMetadata(locale, "/app/invite", d.app.invite.title, d.app.invite.lead)
}

export default function InvitePage() {
  return <InviteView />
}
