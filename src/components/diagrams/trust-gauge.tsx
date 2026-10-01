import { cn } from "@/lib/utils"

/**
 * Half-circle gauge for the 0–100 trust score. The tick at the top marks the
 * threshold (50): below it, rewards are held. Colour is always paired with a label.
 */
export function TrustGauge({
  score,
  label,
  status,
  held,
  className,
}: {
  score: number
  /** Visible caption, e.g. "Trust score". */
  label: string
  /** "Eligible" / "Held for review". */
  status: string
  held: boolean
  className?: string
}) {
  const value = Math.max(0, Math.min(100, score))
  return (
    <figure className={cn("flex flex-col items-center", className)}>
      <svg viewBox="0 0 120 68" className="w-full max-w-44" role="img" aria-label={`${label}: ${value} / 100, ${status}`}>
        <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" className="stroke-border" strokeWidth="8" strokeLinecap="round" />
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          pathLength={100}
          strokeDasharray={`${value} 100`}
          strokeWidth="8"
          strokeLinecap="round"
          className={cn(held ? "stroke-warning" : "stroke-primary", "transition-[stroke-dasharray] duration-250 ease-out")}
        />
        {/* Threshold tick */}
        <line x1="60" y1="4" x2="60" y2="16" className="stroke-foreground" strokeWidth="1.5" strokeLinecap="round" />
        <text x="60" y="55" textAnchor="middle" className="fill-foreground text-[22px] font-extrabold">
          {value}
        </text>
      </svg>
      <figcaption className="mt-1 text-center">
        <span className="block text-xs text-muted-foreground">{label}</span>
        <span className={cn("text-sm font-bold", held ? "text-warning" : "text-success")}>{status}</span>
      </figcaption>
    </figure>
  )
}
