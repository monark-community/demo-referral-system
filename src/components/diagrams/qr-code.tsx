import { encode } from "uqr"

const MARGIN = 2

/** Module matrix as one SVG path of unit squares, with a quiet zone of MARGIN modules. */
function qrPath(text: string): { d: string; total: number } {
  const { data, size } = encode(text, { ecc: "M", border: 0 })
  let d = ""
  for (let y = 0; y < size; y++) {
    const row = data[y]
    if (!row) continue
    for (let x = 0; x < size; x++) if (row[x]) d += `M${x + MARGIN} ${y + MARGIN}h1v1h-1z`
  }
  return { d, total: size + MARGIN * 2 }
}

/** The QR code as a standalone SVG file, for download. */
export function qrSvg(text: string): string {
  const { d, total } = qrPath(text)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="${total * 12}" height="${total * 12}" shape-rendering="crispEdges"><rect width="${total}" height="${total}" fill="#FFFFFF"/><path d="${d}" fill="#15110E"/></svg>`
}

/** QR code rendered inline. Always dark on white so any phone can scan it, in either theme. */
export function QrCode({ text, label, className }: { text: string; label: string; className?: string }) {
  const { d, total } = qrPath(text)
  return (
    <svg viewBox={`0 0 ${total} ${total}`} shapeRendering="crispEdges" role="img" aria-label={label} className={className}>
      <rect width={total} height={total} fill="#FFFFFF" />
      <path d={d} fill="#15110E" />
    </svg>
  )
}
