"use client"

import { randomId, slugify } from "./ids"
import { ALREADY_MEMBER, MISSION_TESTERS, milestoneDef, YOUR_REFERRER } from "./program"
import { trustScore, yourTrust } from "./selectors"
import { getDemo, update } from "./store"
import type { Activity, BlockReason, DemoState, Invite, MilestoneId, Mission, MissionReward, TrackedLink, TrustSignal, TxError, VerifyMethod } from "./types"

/**
 * State changes applied when a simulated transaction confirms, plus the
 * contract's own rules. In a real build these are contract calls and the
 * indexer's view of their events; the UI would not change.
 */

const nowIso = () => new Date().toISOString()

function pushActivity(s: DemoState, a: Omit<Activity, "id" | "at">): Activity[] {
  return [{ id: randomId("a"), at: nowIso(), ...a }, ...s.activity].slice(0, 80)
}

/** registerAmbassador(): the wallet joins the program and its referral code exists. */
export function applyRegister(hash: string) {
  update((s) => ({ ...s, registered: true, activity: pushActivity(s, { kind: "registered", hash }) }))
}

/** The contract's hard rules for recordReferral(inviter, invitee). */
export function referralRule(address: string): BlockReason | null {
  const s = getDemo()
  if (!s) return null
  const a = address.toLowerCase()
  if (a === s.wallet.address.toLowerCase()) return "self"
  if (a === YOUR_REFERRER.address.toLowerCase()) return "loop"
  if (a === ALREADY_MEMBER.address.toLowerCase()) return "duplicate"
  if (s.invites.some((i) => i.address?.toLowerCase() === a && i.milestones.joined)) return "duplicate"
  return null
}

export interface NewReferral {
  name: string
  address: string
  via: string | null
  signals: TrustSignal[]
}

/** recordReferral() confirmed: the invite exists on-chain from now on. */
export function applyReferral(r: NewReferral, hash: string): Invite {
  const at = nowIso()
  const invite: Invite = {
    id: randomId("inv"),
    name: r.name,
    address: r.address,
    via: r.via,
    openedAt: at,
    milestones: { joined: at },
    signals: r.signals,
    hash,
  }
  const trust = trustScore(invite)
  const held = trust < 50
  update((s) => ({
    ...s,
    invites: [invite, ...s.invites],
    links: s.links.map((l) => (l.id === r.via ? { ...l, joins: l.joins + 1 } : l)),
    activity: pushActivity(s, { kind: held ? "held" : "recorded", inviteId: invite.id, name: r.name, trust: held ? trust : undefined, hash }),
    lastEvent: { kind: "recorded", inviteId: invite.id, at: Date.now() },
  }))
  return invite
}

/** A reverted attempt the indexer still reports, so ambassadors see abuse being stopped. */
export function logBlocked(reason: BlockReason, name: string) {
  update((s) => ({ ...s, activity: pushActivity(s, { kind: "blocked", reason, name }) }))
}

/** confirmMilestone(invitee, milestone) confirmed: points and rewards follow automatically. */
export function applyMilestone(inviteId: string, milestone: MilestoneId, hash: string) {
  const def = milestoneDef(milestone)
  update((s) => {
    const invite = s.invites.find((i) => i.id === inviteId)
    if (!invite) return s
    const signals: TrustSignal[] =
      milestone === "workshop" && !invite.signals.some((x) => x.key === "checkIn")
        ? [...invite.signals, { key: "checkIn", impact: 15 }]
        : invite.signals
    const updated: Invite = { ...invite, signals, milestones: { ...invite.milestones, [milestone]: nowIso() } }
    const held = trustScore(updated) < 50
    return {
      ...s,
      invites: s.invites.map((i) => (i.id === inviteId ? updated : i)),
      activity: pushActivity(s, {
        kind: "milestone",
        inviteId,
        name: invite.name,
        milestone,
        points: held ? 0 : def.points,
        amount: held ? "0" : def.reward,
        hash,
      }),
      lastEvent: { kind: "reward", inviteId, points: held ? 0 : def.points, at: Date.now() },
    }
  })
}

/** claimRewards() confirmed: the tUSDC lands in your wallet. */
export function applyClaim(amount: bigint, hash: string) {
  update((s) => ({
    ...s,
    claimed: (BigInt(s.claimed) + amount).toString(),
    balance: (BigInt(s.balance) + amount).toString(),
    activity: pushActivity(s, { kind: "claimed", amount: amount.toString(), hash }),
  }))
}

export type LinkError = "required" | "tooLong" | "duplicate"

export function validateLinkLabel(label: string, links: TrackedLink[]): LinkError | null {
  const trimmed = label.trim()
  if (!trimmed || !slugify(trimmed)) return "required"
  if (trimmed.length > 40) return "tooLong"
  const tag = slugify(trimmed)
  if (links.some((l) => l.tag === tag || l.label.toLowerCase() === trimmed.toLowerCase())) return "duplicate"
  return null
}

/** Tracked links are off-chain: only the tag is stored, the link is derived from the wallet. */
export function createLink(label: string): TrackedLink {
  const trimmed = label.trim()
  const link: TrackedLink = { id: randomId("lnk"), label: trimmed, tag: slugify(trimmed), createdAt: nowIso(), opens: 0, joins: 0 }
  update((s) => ({
    ...s,
    links: [...s.links, link],
    activity: pushActivity(s, { kind: "linkCreated", label: trimmed }),
  }))
  return link
}

export function deleteLink(id: string) {
  update((s) => ({ ...s, links: s.links.filter((l) => l.id !== id) }))
}

/** Someone opened the link (counted off-chain, like any analytics). Returns the matching link id. */
export function registerOpen(tag: string | null): string | null {
  const s = getDemo()
  const link = tag ? s?.links.find((l) => l.tag === tag) : undefined
  update((st) =>
    link
      ? { ...st, links: st.links.map((l) => (l.id === link.id ? { ...l, opens: l.opens + 1 } : l)) }
      : { ...st, directOpens: st.directOpens + 1 }
  )
  return link?.id ?? null
}

export function clearLastEvent() {
  update((s) => (s.lastEvent ? { ...s, lastEvent: null } : s))
}

/* ---------------------------------------------------------------------------
 * Missions (reward layer).
 * ------------------------------------------------------------------------ */

/** Opening a mission in its app is off-chain: it only marks it as started for you. */
export function startMission(id: string) {
  update((s) => (s.progress[id]?.startedAt ? s : { ...s, progress: { ...s.progress, [id]: { startedAt: nowIso() } } }))
}

/** The mission contract's trust gate, evaluated when the completion is mined. */
export function missionGate(id: string): TxError | null {
  const s = getDemo()
  const m = s?.missions.find((x) => x.id === id)
  if (!s || !m) return "reverted"
  return yourTrust(s).score < m.minTrust ? "lowTrust" : null
}

/** completeMission(wallet) reported by the app and confirmed: the reward is yours. */
export function applyMissionDone(id: string, hash: string) {
  update((s) => {
    const m = s.missions.find((x) => x.id === id)
    if (!m) return s
    return {
      ...s,
      missions: s.missions.map((x) => (x.id === id ? { ...x, filled: x.filled + 1 } : x)),
      progress: { ...s.progress, [id]: { ...s.progress[id], completedAt: nowIso(), hash } },
      activity: pushActivity(s, { kind: "missionDone", missionId: id, mission: m.title, app: m.app, rewardKind: m.reward.kind, amount: m.reward.amount, hash }),
    }
  })
}

export interface MissionDraft {
  app: string
  title: string
  verify: VerifyMethod
  reward: MissionReward
  spots: number
  minTrust: number
}

export type MissionDraftError = "appRequired" | "titleRequired" | "titleTooLong" | "amount" | "badgeRequired" | "spots" | "balance"

/** tUSDC a draft locks in escrow when published (0 for points and badges). */
export function draftBudget(d: Pick<MissionDraft, "reward" | "spots">): bigint {
  if (d.reward.kind !== "token" || !/^\d+$/.test(d.reward.amount) || !Number.isSafeInteger(d.spots)) return 0n
  return BigInt(d.reward.amount) * BigInt(Math.max(0, d.spots))
}

/** publishMission() confirmed: the mission is live and its token budget sits in escrow. */
export function applyPublish(d: MissionDraft, hash: string): Mission {
  const mission: Mission = {
    id: randomId("ms"),
    app: d.app.trim(),
    title: d.title.trim(),
    verify: d.verify,
    reward: d.reward,
    minTrust: d.minTrust,
    spots: d.spots,
    filled: 0,
    refused: 0,
    endsAt: new Date(Date.now() + 60 * 86_400_000).toISOString(),
    yours: true,
    hash,
  }
  const budget = draftBudget(d)
  update((s) => ({
    ...s,
    missions: [mission, ...s.missions],
    balance: (BigInt(s.balance) - budget).toString(),
    activity: pushActivity(s, { kind: "missionPublished", missionId: mission.id, mission: mission.title, app: mission.app, rewardKind: d.reward.kind, amount: budget.toString(), hash }),
  }))
  return mission
}

export type Tester = keyof typeof MISSION_TESTERS

/**
 * Your app reports that a wallet completed your mission. The trust gate pays a
 * verified wallet from escrow and refuses a farmed one (unless your minimum is 0).
 * Returns whether the wallet was paid.
 */
export function applyReport(id: string, tester: Tester, hash: string): boolean {
  const s = getDemo()
  const m = s?.missions.find((x) => x.id === id)
  if (!m || m.filled >= m.spots) return false
  const paid = MISSION_TESTERS[tester].trust >= m.minTrust
  update((st) => ({
    ...st,
    missions: st.missions.map((x) => (x.id === id ? (paid ? { ...x, filled: x.filled + 1 } : { ...x, refused: (x.refused ?? 0) + 1 }) : x)),
    activity: paid
      ? st.activity
      : pushActivity(st, { kind: "missionRefused", missionId: id, mission: m.title, app: m.app, trust: MISSION_TESTERS[tester].trust, hash }),
  }))
  return paid
}
