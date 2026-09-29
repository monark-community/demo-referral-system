import { MILESTONE_ORDER, MILESTONES, PEERS, TRUST_BASE, TRUST_THRESHOLD, YOU, type Peer } from "./program"
import type { DemoState, Invite, InviteStatus, MilestoneId } from "./types"

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
