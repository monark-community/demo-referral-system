"use client"

import { CheckIcon, CircleAlertIcon, PlusIcon, SparklesIcon } from "lucide-react"
import { useEffect, useState, useSyncExternalStore } from "react"

import { NetworkGraph, type GraphAnimation, type GraphNode } from "@/components/diagrams/network-graph"
import { NetworkBadge } from "@/components/ui/network-badge"
import { t } from "@/i18n/t"
import { NETWORK_NAME } from "@/lib/demo/program"
import { cn } from "@/lib/utils"

export interface HeroCopy {
  label: string
  caption: string
  points: string
  verified: string
  feedTitle: string
  you: string
  events: { recorded: string; milestone: string; reward: string; held: string }
  milestones: { workshop: string; bounty: string }
  rewardTag: string
}

type FeedItem = { id: number; icon: "join" | "milestone" | "held"; text: string; sub?: string }

const START: GraphNode[] = [
  { id: "emma", initials: "EW", name: "Emma", status: "completed", progress: 4 },
  { id: "lea", initials: "LT", name: "Léa", status: "completed", progress: 4 },
  { id: "jun", initials: "JP", name: "Jun", status: "active", progress: 3 },
  { id: "karim", initials: "KH", name: "Karim", status: "active", progress: 2 },
  { id: "sofia", initials: "SM", name: "Sofia", status: "joined", progress: 1 },
]

interface Step {
  apply: (nodes: GraphNode[]) => GraphNode[]
  anim: Omit<GraphAnimation, "key">
  points: number
  verified: number
  feed: (c: HeroCopy) => Omit<FeedItem, "id">
}

const STEPS: Step[] = [
  {
    apply: (n) => [...n, { id: "noor", initials: "NR", name: "Noor", status: "joined", progress: 1 }],
    anim: { kind: "recorded", nodeId: "noor" },
    points: 10,
    verified: 1,
    feed: (c) => ({ icon: "join", text: t(c.events.recorded, { name: "Noor Rahman" }), sub: t(c.events.reward, { points: 10 }) }),
  },
  {
    apply: (n) => n.map((x) => (x.id === "sofia" ? { ...x, status: "active", progress: 2 } : x)),
    anim: { kind: "reward", nodeId: "sofia", points: 25 },
    points: 25,
    verified: 0,
    feed: (c) => ({ icon: "milestone", text: t(c.events.milestone, { name: "Sofia Marín", milestone: c.milestones.workshop }), sub: t(c.events.reward, { points: 25 }) }),
  },
  {
    apply: (n) => [...n, { id: "burst", initials: "0x", name: "0x9d…41c7", status: "held", progress: 1 }],
    anim: { kind: "recorded", nodeId: "burst" },
    points: 0,
    verified: 0,
    feed: (c) => ({ icon: "held", text: t(c.events.held, { score: 18 }) }),
  },
  {
    apply: (n) => n.map((x) => (x.id === "karim" ? { ...x, progress: 3 } : x)),
    anim: { kind: "reward", nodeId: "karim", points: 50 },
    points: 50,
    verified: 0,
    feed: (c) => ({ icon: "milestone", text: t(c.events.milestone, { name: "Karim Haddad", milestone: c.milestones.bounty }), sub: t(c.events.reward, { points: 50 }) }),
  },
]

const REDUCED = "(prefers-reduced-motion: reduce)"
function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia(REDUCED)
  mq.addEventListener("change", cb)
  return () => mq.removeEventListener("change", cb)
}

const START_POINTS = 330
const START_VERIFIED = 5

/**
 * The home hero's product visual: Amara's referral network playing one loop
 * of real events (a join, a milestone reward, a held wallet, a bounty). With
 * reduced motion it shows the final state without animating.
 */
export function HeroNetwork({ copy, locale }: { copy: HeroCopy; locale: string }) {
  const [playedStep, setStep] = useState(0)
  const [playedFeed, setFeed] = useState<FeedItem[]>([])
  const reduced = useSyncExternalStore(subscribeReducedMotion, () => window.matchMedia(REDUCED).matches, () => false)
  const step = reduced ? STEPS.length : playedStep
  const feed = reduced ? STEPS.map((s, i) => ({ id: i, ...s.feed(copy) })).reverse() : playedFeed

  useEffect(() => {
    if (reduced) return
    let i = 0
    let id = 0
    const tick = () => {
      if (i >= STEPS.length) {
        i = 0
        setStep(0)
        setFeed([])
        return
      }
      const s = STEPS[i]!
      i++
      setStep(i)
      setFeed((f) => [{ id: id++, ...s.feed(copy) }, ...f].slice(0, 4))
    }
    const first = window.setTimeout(tick, 900)
    const timer = window.setInterval(tick, 2400)
    return () => {
      window.clearTimeout(first)
      window.clearInterval(timer)
    }
  }, [reduced, copy])

  let nodes = START
  let points = START_POINTS
  let verified = START_VERIFIED
  for (let i = 0; i < step; i++) {
    const s = STEPS[i]!
    nodes = s.apply(nodes)
    points += s.points
    verified += s.verified
  }
  const current = step > 0 && !reduced ? STEPS[step - 1] : undefined
  const animation: GraphAnimation | null = current ? { ...current.anim, key: step } : null
  const nf = new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA")

  return (
    <figure className="overflow-hidden rounded-3xl border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 sm:px-5">
        <p className="text-sm font-bold">{copy.label}</p>
        <NetworkBadge name={NETWORK_NAME} variant="outline" icon={<span className="block size-full rounded-full bg-success" />} />
      </div>
      <div className="grid gap-0 sm:grid-cols-[1fr_15rem]">
        <div className="relative px-3 pt-4 pb-6 sm:px-6">
          <dl className="absolute top-3 left-4 z-10 flex gap-5 sm:left-5">
            <div>
              <dt className="text-xs text-muted-foreground">{copy.points}</dt>
              <dd key={points} className="rf-tick text-xl font-extrabold tabular-nums">
                {nf.format(points)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">{copy.verified}</dt>
              <dd className="text-xl font-extrabold tabular-nums">{verified}</dd>
            </div>
          </dl>
          <NetworkGraph
            nodes={nodes}
            youLabel={copy.you}
            animation={animation}
            rewardLabel={(p) => t(copy.rewardTag, { points: p })}
            className="mt-10 max-w-[26rem] sm:mt-6"
          />
        </div>
        <div className="border-t bg-muted/40 px-4 py-4 sm:border-t-0 sm:border-l sm:px-5">
          <p className="eyebrow text-muted-foreground">{copy.feedTitle}</p>
          <ol aria-live="off" className="mt-3 flex min-h-[11rem] flex-col gap-2.5">
            {feed.map((item) => (
              <li key={item.id} className="rf-pop flex gap-2.5 text-sm leading-snug">
                <span
                  className={cn(
                    "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
                    item.icon === "held" ? "bg-warning/15 text-warning" : "bg-primary/15 text-primary-ink"
                  )}
                  aria-hidden="true"
                >
                  {item.icon === "join" ? <PlusIcon className="size-3.5" /> : item.icon === "milestone" ? <CheckIcon className="size-3.5" /> : <CircleAlertIcon className="size-3.5" />}
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold">{item.text}</span>
                  {item.sub ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-primary-ink">
                      <SparklesIcon className="size-3" aria-hidden="true" />
                      {item.sub}
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <figcaption className="border-t px-4 py-2.5 text-xs text-muted-foreground sm:px-5">{copy.caption}</figcaption>
    </figure>
  )
}
