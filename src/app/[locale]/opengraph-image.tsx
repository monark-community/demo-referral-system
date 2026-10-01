import { readFile } from "node:fs/promises"
import { join } from "node:path"

import { ImageResponse } from "next/og"

import { isLocale, locales } from "@/i18n/config"
import { getDictionary } from "@/i18n"

export const alt = "Reffinity by Monark"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

/** A referral network in flat orange line art next to the product name and headline. */
export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  const locale = isLocale(raw) ? raw : "en"
  const d = getDictionary(locale)
  const mark = await readFile(join(process.cwd(), "public/brand/monark-mark.svg"), "utf8")
  const markSrc = `data:image/svg+xml;base64,${Buffer.from(mark).toString("base64")}`
  const cx = 230
  const cy = 243
  const nodes = [0, 1, 2, 3, 4, 5, 6].map((i) => {
    const a = -Math.PI / 2 + (i / 7) * Math.PI * 2
    return { x: cx + 170 * Math.cos(a), y: cy + 170 * Math.sin(a), filled: i < 3, dashed: i === 5 }
  })

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#FFF9F3", color: "#15110E", padding: 72 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 620 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={markSrc} width={64} height={64} alt="" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 44, fontWeight: 800, lineHeight: 1 }}>Reffinity</span>
              <span style={{ fontSize: 22, color: "#625952", marginTop: 6 }}>{d.common.byMonark}</span>
            </div>
          </div>
          <div style={{ fontSize: 58, fontWeight: 800, lineHeight: 1.08, letterSpacing: -1.5 }}>{d.meta.ogTagline}</div>
          <div style={{ fontSize: 22, color: "#625952" }}>{d.common.demoBadge}</div>
        </div>
        <svg width="460" height="486" viewBox="0 0 460 486" style={{ marginLeft: 0 }}>
          {nodes.map((n, i) => (
            <line key={`l${i}`} x1={cx} y1={cy} x2={n.x} y2={n.y} stroke={n.dashed ? "#8A5A00" : "#F88D10"} strokeWidth={5} strokeDasharray={n.dashed ? "14 10" : undefined} strokeLinecap="round" />
          ))}
          {nodes.map((n, i) => (
            <circle key={`c${i}`} cx={n.x} cy={n.y} r={30} fill={n.filled ? "#F88D10" : "#FFFEFC"} stroke={n.dashed ? "#8A5A00" : "#F88D10"} strokeWidth={5} />
          ))}
          <circle cx={cx} cy={cy} r={52} fill="#15110E" />
        </svg>
      </div>
    ),
    size
  )
}
