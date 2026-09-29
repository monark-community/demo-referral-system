import { seededAddress } from "./ids"
import type { MilestoneDef, MilestoneId, TrustSignal } from "./types"

/** The one program this demo runs: Monark Ambassadors, Fall 2026. */

export const NETWORK_NAME = "Sepolia testnet"
export const REWARD_SYMBOL = "tUSDC"
export const REWARD_DECIMALS = 6

const usdc = (n: number) => String(Math.round(n * 1_000_000))

export const MILESTONES: MilestoneDef[] = [
  { id: "joined", points: 10, reward: "0" },
  { id: "workshop", points: 25, reward: "0" },
  { id: "bounty", points: 50, reward: usdc(10) },
  { id: "active30", points: 15, reward: usdc(5) },
]

export const MILESTONE_ORDER: MilestoneId[] = MILESTONES.map((m) => m.id)

export function milestoneDef(id: MilestoneId): MilestoneDef {
  return MILESTONES.find((m) => m.id === id) ?? MILESTONES[0]!
}

/** Referrals with a trust score below this are recorded but their rewards are held. */
export const TRUST_THRESHOLD = 50
/** Every score starts here before signals apply. */
export const TRUST_BASE = 50

export const PROGRAM = {
  poolTotal: usdc(2500),
  poolUsed: usdc(1185),
  endsAt: "2026-12-15T23:59:00Z",
  ambassadors: 64,
}

/** The visitor's own identity in the demo. */
export const YOU = {
  name: "Amara Okafor",
  address: seededAddress("amara-okafor"),
  code: "amara-7k2q",
}

/** The ambassador who invited Amara: inviting her back would be a loop. */
export const YOUR_REFERRER = { name: "Priya Natarajan", address: seededAddress("priya-natarajan") }

/** A member who already joined through someone else's invitation. */
export const ALREADY_MEMBER = { name: "Noah Fischer", address: seededAddress("noah-fischer"), joinedAt: "2026-08-14T15:20:00Z" }

/** Other ambassadors on the leaderboard (the visitor is computed live). */
export interface Peer {
  id: string
  name: string
  address: string
  points: number
  verified: number
  clicks: number
  /** Farmed account: lots of clicks, almost nothing verified. */
  flagged?: boolean
}

export const PEERS: Peer[] = [
  { id: "priya", name: YOUR_REFERRER.name, address: YOUR_REFERRER.address, points: 640, verified: 14, clicks: 212 },
  { id: "mateo", name: "Mateo Rossi", address: seededAddress("mateo-rossi"), points: 515, verified: 11, clicks: 164 },
  { id: "chloe", name: "Chloé Bergeron", address: seededAddress("chloe-bergeron"), points: 355, verified: 8, clicks: 97 },
  { id: "daniel", name: "Daniel Kim", address: seededAddress("daniel-kim"), points: 290, verified: 7, clicks: 188 },
  { id: "aicha", name: "Aïcha Diop", address: seededAddress("aicha-diop"), points: 210, verified: 5, clicks: 61 },
  { id: "farm", name: "", address: seededAddress("farm-cluster"), points: 20, verified: 1, clicks: 1480, flagged: true },
  { id: "tomas", name: "Tomás Silva", address: seededAddress("tomas-silva"), points: 150, verified: 4, clicks: 44 },
  { id: "hana", name: "Hana Yoshida", address: seededAddress("hana-yoshida"), points: 95, verified: 3, clicks: 38 },
]

/** Who opens the link on /r/[code] in the demo. */
export type PersonaId = "friend" | "self" | "loop" | "duplicate" | "burst"
export const PERSONAS: PersonaId[] = ["friend", "self", "loop", "duplicate", "burst"]

export const FRIEND_NAMES = [
  "Léo Martin",
  "Maya Singh",
  "Élodie Roy",
  "Samuel Osei",
  "Inès Belkacem",
  "Hugo Lefebvre",
  "Grace Mensah",
  "Rafael Costa",
]

export function friendSignals(): TrustSignal[] {
  const months = 4 + Math.floor(Math.random() * 20)
  const networks = 2 + Math.floor(Math.random() * 3)
  return [
    { key: "walletAge", impact: 20, vars: { months } },
    { key: "history", impact: 10, vars: { networks } },
  ]
}

export function burstSignals(): TrustSignal[] {
  return [
    { key: "newWallet", impact: -12, vars: { minutes: 3 } },
    { key: "sharedFunding", impact: -12, vars: { count: 4 } },
    { key: "burst", impact: -8, vars: { count: 5, minutes: 2 } },
  ]
}
