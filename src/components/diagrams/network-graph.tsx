"use client"

import { useEffect, useState } from "react"

import type { InviteStatus } from "@/lib/demo/types"
import { cn } from "@/lib/utils"

export interface GraphNode {
  id: string
  /** Short label drawn inside the node (initials). */
  initials: string
  /** Name under the node (first name) and in the accessible label. */
  name: string
  status: InviteStatus
  /** Milestones reached, 0–4. */
  progress: number
}

export interface GraphAnimation {
  kind: "recorded" | "reward"
  nodeId: string
  points?: number
  /** Changes for every event, so each one plays once. */
  key: number
}

/** Slot positions on a ring around the centre (viewBox 0–100). Fixed slots, so a new node never moves the others. */
function slotPosition(index: number, slots: number) {
  const angle = -Math.PI / 2 + (index / slots) * Math.PI * 2
  const r = slots > 12 ? (index % 2 === 0 ? 34 : 42) : 37
  return { x: 50 + r * Math.cos(angle), y: 50 + r * Math.sin(angle) }
}

const RING_R = 6.4

/**
 * The referral network: the ambassador in the centre, each invite as a node on
 * a flat orange line. Line style carries the status (dashed = off-chain or
 * held), the ring around a node shows milestones reached. A recorded referral
 * draws its line in; a confirmed milestone sends a reward dot back to the centre.
 */
export function NetworkGraph({
  nodes,
  youLabel,
  animation,
  onSelect,
  openLabel,
  rewardLabel,
  showNames = true,
  className,
}: {
  nodes: GraphNode[]
  youLabel: string
  animation?: GraphAnimation | null
  onSelect?: (id: string) => void
  /** "Open {name}" with {name} replaced by the caller. */
  openLabel?: (node: GraphNode) => string
  rewardLabel?: (points: number) => string
  showNames?: boolean
  className?: string
}) {
  // Nine slots hold the seeded network plus one free place for the next referral; more nodes reflow the ring.
  const slots = Math.max(9, nodes.length)
  const placed = nodes.map((n, i) => ({ node: n, ...slotPosition(i, slots) }))
  const animatedNode = animation ? placed.find((p) => p.node.id === animation.nodeId) : undefined

  return (
    <div className={cn("relative mx-auto aspect-square w-full max-w-[34rem] select-none [container-type:inline-size]", className)}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
        {/* Faint orbit */}
        <circle cx="50" cy="50" r="37" fill="none" className="stroke-border" strokeWidth="0.3" />
        {placed.map(({ node, x, y }) => {
          const drawing = animation?.kind === "recorded" && animation.nodeId === node.id
          const offChain = node.status === "opened"
          const held = node.status === "held"
          return (
            <line
              key={`${node.id}-${drawing ? animation?.key : "static"}`}
              x1="50"
              y1="50"
              x2={x}
              y2={y}
              pathLength={100}
              strokeLinecap="round"
              strokeWidth={offChain || held ? 0.45 : 0.6}
              strokeDasharray={offChain ? "1.2 1.6" : held ? "2.4 1.6" : undefined}
              className={cn(
                offChain ? "stroke-muted-foreground/60" : held ? "stroke-warning" : "stroke-primary",
                drawing && "rf-draw"
              )}
              style={drawing ? ({ "--rf-len": 100 } as React.CSSProperties) : undefined}
            />
          )
        })}
        {/* Milestone progress rings */}
        {placed.map(({ node, x, y }) =>
          node.status === "opened" ? null : (
            <g key={`ring-${node.id}`}>
              <circle cx={x} cy={y} r={RING_R} fill="none" className="stroke-border" strokeWidth="0.7" />
              <circle
                cx={x}
                cy={y}
                r={RING_R}
                fill="none"
                pathLength={100}
                strokeDasharray={`${(node.progress / 4) * 100} 100`}
                strokeLinecap="round"
                transform={`rotate(-90 ${x} ${y})`}
                strokeWidth="0.9"
                className={cn(node.status === "held" ? "stroke-warning" : "stroke-primary", "transition-[stroke-dasharray] duration-200 ease-out")}
              />
            </g>
          )
        )}
      </svg>

      {placed.map(({ node, x, y }) => {
        const popping = animation?.nodeId === node.id
        const content = (
          <>
            <span
              key={popping ? animation?.key : "static"}
              className={cn(
                "flex size-full items-center justify-center rounded-full text-[clamp(0.6rem,2.4cqw,0.8rem)] font-extrabold",
                node.status === "opened" && "border border-dashed border-muted-foreground/70 bg-background text-muted-foreground",
                (node.status === "joined" || node.status === "active") && "border-2 border-primary bg-card text-foreground",
                node.status === "completed" && "bg-primary text-primary-foreground",
                node.status === "held" && "border-2 border-dashed border-warning bg-card text-warning",
                popping && "rf-pop"
              )}
            >
              {node.initials}
            </span>
            {showNames ? (
              <span className="pointer-events-none absolute top-full left-1/2 mt-[2.6cqw] w-[18cqw] -translate-x-1/2 truncate text-center text-[clamp(0.6rem,2.1cqw,0.75rem)] font-semibold text-muted-foreground">
                {node.name}
              </span>
            ) : null}
          </>
        )
        const style = { left: `${x}%`, top: `${y}%` }
        const base = "absolute size-[9.5%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        return onSelect ? (
          <button
            key={node.id}
            type="button"
            onClick={() => onSelect(node.id)}
            aria-label={openLabel?.(node) ?? node.name}
            className={cn(base, "transition-transform duration-150 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring")}
            style={style}
          >
            {content}
          </button>
        ) : (
          <span key={node.id} className={base} style={style} aria-hidden="true">
            {content}
          </span>
        )
      })}

      {/* Centre: the ambassador */}
      <span
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 flex size-[17%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-foreground text-[clamp(0.7rem,3cqw,1rem)] font-extrabold text-background ring-4 ring-background"
      >
        {youLabel}
      </span>

      {animation?.kind === "reward" && animatedNode ? (
        <RewardDot key={animation.key} from={animatedNode} points={animation.points ?? 0} label={rewardLabel} />
      ) : null}
    </div>
  )
}

/** A reward travelling back along the edge to the ambassador, then a "+25 points" tag at the centre. */
function RewardDot({ from, points, label }: { from: { x: number; y: number }; points: number; label?: (points: number) => string }) {
  const [phase, setPhase] = useState<"start" | "travel" | "landed">("start")
  useEffect(() => {
    const a = requestAnimationFrame(() => requestAnimationFrame(() => setPhase("travel")))
    const b = window.setTimeout(() => setPhase("landed"), 560)
    return () => {
      cancelAnimationFrame(a)
      window.clearTimeout(b)
    }
  }, [])
  const at = phase === "start" ? from : { x: 50, y: 50 }
  return (
    <>
      {phase !== "landed" ? (
        <span
          aria-hidden="true"
          className="absolute size-[3.2%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-2 ring-background transition-[left,top] duration-500 ease-in"
          style={{ left: `${at.x}%`, top: `${at.y}%` }}
        />
      ) : null}
      {phase === "landed" && points > 0 && label ? (
        <span
          aria-hidden="true"
          className="rf-pop absolute top-[36%] left-1/2 -translate-x-1/2 rounded-full border bg-card px-2 py-0.5 text-[clamp(0.65rem,2.4cqw,0.8rem)] font-extrabold whitespace-nowrap text-primary-ink"
        >
          {label(points)}
        </span>
      ) : null}
    </>
  )
}
