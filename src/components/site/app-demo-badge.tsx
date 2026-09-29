"use client"

import { FlaskConicalIcon } from "lucide-react"
import { usePathname } from "next/navigation"

/** Subtle "Demo · simulated data" badge shown in the header inside the app and on invitation pages. */
export function AppDemoBadge({ prefixes, label }: { prefixes: string[]; label: string }) {
  const pathname = usePathname() ?? ""
  if (!prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null
  return (
    <span className="hidden items-center gap-1.5 rounded-full border border-dashed px-2.5 py-1 text-xs font-semibold text-muted-foreground lg:inline-flex">
      <FlaskConicalIcon className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  )
}
