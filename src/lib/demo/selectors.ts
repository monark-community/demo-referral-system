import { MILESTONE_ORDER, MILESTONES, NETWORK_WEIGHTS, PEERS, TRUST_BASE, TRUST_THRESHOLD, YOU, YOUR_REFERRER, type Peer } from "./program"
import type { DemoState, Invite, InviteStatus, MilestoneId, Mission, TrustSignal } from "./types"

/** Pure derivations from demo state: the UI never stores what it can compute. */

export function trustScore(invite: Pick<Invite, "signals">): number {
  const raw = invite.signals.reduce((sum, s) => sum + s.impact, TRUST_BASE)
  return Math.max(0, Math.min(100, raw))
}

export function isHeld(invite: Invite): boolean {
  return !!invite.milestones.joined && trustScore(invite) < TRUST_THRESHOLD
}

export function inviteStatus(invite: Invite): InviteStatus {
  if (!invite.milestones.joined) return "opened"
  if (isHeld(invite)) return "held"
  const reached = MILESTONE_ORDER.filter((m) => invite.milestones[m]).length
  if (reached === MILESTONE_ORDER.length) return "completed"
  if (reached > 1) return "active"
  return "joined"
}

/** The next milestone an invite can reach, or null. */
export function nextMilestone(invite: Invite): MilestoneId | null {
  if (!invite.milestones.joined) return null
  return MILESTONE_ORDER.find((m) => !invite.milestones[m]) ?? null
}

export function reachedCount(invite: Invite): number {
  return MILESTONE_ORDER.filter((m) => invite.milestones[m]).length
}

/* ---------------------------------------------------------------------------
 * Network Trust: your own score comes from your wallet and your connections.
 * ------------------------------------------------------------------------ */

export interface YourTrust {
  score: number
  signals: TrustSignal[]
}

export function yourTrust(state: DemoState): YourTrust {
  const w = NETWORK_WEIGHTS
  const joined = state.invites.filter((i) => i.milestones.joined)
  const held = joined.filter(isHeld).length
  const verified = joined.length - held
  const signals: TrustSignal[] = [
    { key: "walletAge", impact: w.walletAge, vars: { months: YOU.walletMonths } },
    { key: "vouched", impact: w.vouched, vars: { name: YOUR_REFERRER.name, score: YOUR_REFERRER.trust } },
  ]
  if (verified > 0) signals.push({ key: "verifiedInvites", impact: Math.min(verified * w.perVerifiedInvite, w.verifiedInvitesCap), vars: { count: verified } })
  if (held > 0) signals.push({ key: "heldInvites", impact: held * w.perHeldInvite, vars: { count: held } })
  return { score: trustScore({ signals }), signals }
}

/* ---------------------------------------------------------------------------
 * Missions.
 * ------------------------------------------------------------------------ */

/**
 * yours: you published it. locked: your trust is below its minimum.
 * full: every spot is taken. available / started / completed: your progress.
 */
export type MissionState = "yours" | "locked" | "full" | "available" | "started" | "completed"

export function missionState(state: DemoState, mission: Mission, trust = yourTrust(state).score): MissionState {
  if (mission.yours) return "yours"
  const p = state.progress[mission.id]
  if (p?.completedAt) return "completed"
  if (mission.filled >= mission.spots) return "full"
  if (trust < mission.minTrust) return "locked"
  return p?.startedAt ? "started" : "available"
}

const MISSION_ORDER: Record<MissionState, number> = { yours: 0, started: 1, available: 2, locked: 3, full: 4, completed: 5 }

export function sortedMissions(state: DemoState): { mission: Mission; status: MissionState }[] {
  const trust = yourTrust(state).score
  return state.missions
    .map((mission) => ({ mission, status: missionState(state, mission, trust) }))
    .sort((a, b) => MISSION_ORDER[a.status] - MISSION_ORDER[b.status])
}

/** Missions you published: escrow left = (spots − filled) × amount, for token rewards. */
export function escrowLeft(mission: Mission): bigint {
  if (mission.reward.kind !== "token") return 0n
  return BigInt(Math.max(0, mission.spots - mission.filled)) * BigInt(mission.reward.amount)
}

/** Badges you earned from completed missions. */
export function yourBadges(state: DemoState): { id: string; name: string; app: string }[] {
  return state.missions
    .filter((m) => m.reward.kind === "badge" && state.progress[m.id]?.completedAt)
    .map((m) => ({ id: m.id, name: m.reward.badge ?? m.title, app: m.app }))
}

export interface Totals {
  points: number
  /** tUSDC unlocked by eligible milestones (base units). */
  earned: bigint
  claimable: bigint
  /** tUSDC unlocked by milestones of held referrals. */
  held: bigint
  verified: number
  opened: number
  clicks: number
}

export function totals(state: DemoState): Totals {
  let points = 0
  let earned = 0n
  let held = 0n
  let verified = 0
  for (const inv of state.invites) {
    const holding = isHeld(inv)
    if (inv.milestones.joined && !holding) verified++
    for (const m of MILESTONES) {
      if (!inv.milestones[m.id]) continue
      if (holding) held += BigInt(m.reward)
      else {
        points += m.points
        earned += BigInt(m.reward)
      }
    }
  }
  // Completed missions pay into the same balance: tokens to claim, points to the score.
  for (const m of state.missions) {
    if (!state.progress[m.id]?.completedAt) continue
    if (m.reward.kind === "token") earned += BigInt(m.reward.amount)
    if (m.reward.kind === "points") points += Number(m.reward.amount)
  }
  const claimable = earned - BigInt(state.claimed)
  const opened = state.invites.length
  const clicks = state.directOpens + state.links.reduce((s, l) => s + l.opens, 0)
  return { points, earned, claimable: claimable < 0n ? 0n : claimable, held, verified, opened, clicks }
}

export interface Ranked extends Peer {
  isYou: boolean
  rank: number
}

/** Leaderboard rows, ranked by verified outcomes (points) or by raw clicks. */
export function leaderboard(state: DemoState, by: "points" | "clicks"): Ranked[] {
  const t = totals(state)
  const you: Peer = { id: "you", name: YOU.name, address: state.wallet.address, points: t.points, verified: t.verified, clicks: t.clicks }
  const rows = [...PEERS, you]
    .map((p) => ({ ...p, isYou: p.id === "you" }))
    .sort((a, b) => (by === "points" ? b.points - a.points || b.verified - a.verified : b.clicks - a.clicks))
  return rows.map((r, i) => ({ ...r, rank: i + 1 }))
}

export function yourRank(state: DemoState): number {
  return leaderboard(state, "points").find((r) => r.isYou)?.rank ?? 0
}

export function sortedInvites(state: DemoState): Invite[] {
  return [...state.invites].sort((a, b) => b.openedAt.localeCompare(a.openedAt))
}
