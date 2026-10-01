import { seededAddress, seededHash } from "./ids"
import { MILESTONES, MISSION_SEEDS, START_BALANCE, YOU } from "./program"
import type { Activity, DemoState, Invite, MilestoneId, Mission, MissionProgress, TrackedLink, TrustSignal } from "./types"

/** Seed copy that depends on the visitor's language (tracked link labels, mission titles and badges). */
export interface SeedCopy {
  links: { discord: string; poster: string; slides: string }
  missions: Record<string, { title: string; badge?: string }>
}

const DAY = 86_400_000

function ago(now: number, days: number, hours = 0): string {
  return new Date(now - days * DAY - hours * 3_600_000).toISOString()
}

/** The Monark family's missions, open to every wallet (also on a fresh start). */
function seedMissions(copy: SeedCopy, now: number): Mission[] {
  return MISSION_SEEDS.map((m) => ({
    id: m.id,
    app: m.app,
    title: copy.missions[m.id]?.title ?? m.id,
    verify: m.verify,
    reward: { ...m.reward, badge: m.reward.kind === "badge" ? copy.missions[m.id]?.badge : undefined },
    minTrust: m.minTrust,
    spots: m.spots,
    filled: m.filled,
    endsAt: ago(now, -m.endsIn),
    hash: seededHash(`mission:${m.id}`),
  }))
}

interface InviteSeed {
  id: string
  name: string
  via: string | null
  openedDays: number
  /** Days ago each milestone was reached (joined first). */
  reached: Partial<Record<MilestoneId, number>>
  signals: TrustSignal[]
  wallet?: boolean
}

const good = (months: number, networks: number, checkIn = false): TrustSignal[] => [
  { key: "walletAge", impact: 20, vars: { months } },
  { key: "history", impact: 10, vars: { networks } },
  ...(checkIn ? [{ key: "checkIn" as const, impact: 15 }] : []),
]

const INVITES: InviteSeed[] = [
  { id: "emma", name: "Emma Wilson", via: "discord", openedDays: 52, reached: { joined: 52, workshop: 45, bounty: 38, active30: 22 }, signals: good(26, 4, true) },
  { id: "lea", name: "Léa Tremblay", via: "poster", openedDays: 41, reached: { joined: 41, workshop: 34, bounty: 19, active30: 3 }, signals: good(14, 3, true) },
  { id: "jun", name: "Jun Park", via: "discord", openedDays: 30, reached: { joined: 30, workshop: 23, bounty: 6 }, signals: good(9, 2, true) },
  { id: "karim", name: "Karim Haddad", via: "slides", openedDays: 21, reached: { joined: 21, workshop: 9 }, signals: good(31, 5, true) },
  { id: "sofia", name: "Sofia Marín", via: "poster", openedDays: 12, reached: { joined: 12 }, signals: good(7, 2) },
  {
    id: "burst",
    name: "",
    via: null,
    openedDays: 8,
    reached: { joined: 8 },
    signals: [
      { key: "newWallet", impact: -12, vars: { minutes: 3 } },
      { key: "sharedFunding", impact: -12, vars: { count: 4 } },
      { key: "burst", impact: -8, vars: { count: 5, minutes: 2 } },
    ],
  },
  { id: "noor", name: "Noor Rahman", via: "discord", openedDays: 2, reached: { joined: 2 }, signals: good(5, 2) },
  { id: "olivier", name: "Olivier Gagnon", via: "slides", openedDays: 1, reached: {}, signals: [], wallet: false },
]

export function createSeed(copy: SeedCopy, options: { empty?: boolean } = {}): DemoState {
  const now = Date.now()
  const base: DemoState = {
    version: 2,
    wallet: { status: "disconnected", address: YOU.address, name: YOU.name, lastError: null },
    registered: !options.empty,
    code: YOU.code,
    directOpens: options.empty ? 0 : 23,
    invites: [],
    links: [],
    activity: [],
    claimed: "0",
    missions: seedMissions(copy, now),
    progress: {},
    balance: START_BALANCE,
    settings: { slow: false, failNext: false },
    lastEvent: null,
  }
  if (options.empty) return base

  const links: TrackedLink[] = [
    { id: "discord", label: copy.links.discord, tag: "discord", createdAt: ago(now, 60), opens: 64, joins: 3 },
    { id: "poster", label: copy.links.poster, tag: "poster", createdAt: ago(now, 50), opens: 41, joins: 2 },
    { id: "slides", label: copy.links.slides, tag: "slides", createdAt: ago(now, 35), opens: 18, joins: 1 },
  ]

  const invites: Invite[] = INVITES.map((s) => {
    const milestones: Invite["milestones"] = {}
    for (const [m, d] of Object.entries(s.reached)) milestones[m as MilestoneId] = ago(now, d, 5)
    return {
      id: s.id,
      name: s.name,
      address: s.wallet === false ? null : seededAddress(`invitee:${s.id}`),
      via: s.via,
      openedAt: ago(now, s.openedDays, 6),
      milestones,
      signals: s.signals,
      hash: s.reached.joined !== undefined ? seededHash(`record:${s.id}`) : undefined,
    }
  })

  const activity: Activity[] = [{ id: "a-reg", kind: "registered", at: ago(now, 60, 8), hash: seededHash("register") }]
  for (const inv of invites) {
    const seed = INVITES.find((s) => s.id === inv.id)!
    if (!inv.milestones.joined) continue
    const burst = inv.id === "burst"
    activity.push({
      id: `a-rec-${inv.id}`,
      kind: burst ? "held" : "recorded",
      at: inv.milestones.joined,
      inviteId: inv.id,
      name: inv.name,
      trust: burst ? 18 : undefined,
      hash: inv.hash,
    })
    for (const m of MILESTONES) {
      if (m.id === "joined" || seed.reached[m.id] === undefined) continue
      activity.push({
        id: `a-${m.id}-${inv.id}`,
        kind: "milestone",
        at: inv.milestones[m.id]!,
        inviteId: inv.id,
        name: inv.name,
        milestone: m.id,
        points: m.points,
        amount: m.reward,
        hash: seededHash(`${m.id}:${inv.id}`),
      })
    }
  }
  // Emma's 15 tUSDC were claimed after her 30-day milestone.
  activity.push({ id: "a-claim-1", kind: "claimed", at: ago(now, 20), amount: "15000000", hash: seededHash("claim-1") })
  // Amara's own missions: one completed (its 10 tUSDC is claimable), one started.
  const progress: Record<string, MissionProgress> = {}
  for (const m of MISSION_SEEDS) {
    if (m.startedDays === undefined) continue
    const p: MissionProgress = { startedAt: ago(now, m.startedDays, 3) }
    if (m.completedDays !== undefined) {
      p.completedAt = ago(now, m.completedDays, 4)
      p.hash = seededHash(`mission-done:${m.id}`)
      activity.push({
        id: `a-mission-${m.id}`,
        kind: "missionDone",
        at: p.completedAt,
        missionId: m.id,
        mission: copy.missions[m.id]?.title ?? m.id,
        app: m.app,
        rewardKind: m.reward.kind,
        amount: m.reward.amount,
        hash: p.hash,
      })
    }
    progress[m.id] = p
  }

  // A blocked self-referral attempt from a few days ago.
  activity.push({ id: "a-block-1", kind: "blocked", at: ago(now, 5, 2), reason: "self", name: YOU.name })

  activity.sort((a, b) => b.at.localeCompare(a.at))
  return { ...base, invites, links, activity, progress, claimed: "15000000" }
}
