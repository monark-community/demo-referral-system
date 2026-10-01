/**
 * Domain types for the Reffinity demo. Everything the UI knows about
 * referrals, milestones, rewards and transactions goes through these shapes,
 * so the simulated layer in this folder could be replaced by wagmi/viem calls
 * (and a contract's events) without touching UI code.
 *
 * Token amounts are integer base units stored as decimal strings (JSON-safe
 * bigint): 10 tUSDC with 6 decimals = "10000000".
 */

export type Locale = "en" | "fr"

/** The milestones of the Fall 2026 ambassador program, in order. */
export type MilestoneId = "joined" | "workshop" | "bounty" | "active30"

export interface MilestoneDef {
  id: MilestoneId
  /** Points credited to the inviter when the milestone is confirmed. */
  points: number
  /** tUSDC (base units) unlocked for the inviter, "0" if none. */
  reward: string
}

/**
 * opened: the link was clicked but nothing is on-chain yet.
 * joined: the referral is recorded on-chain.
 * active: at least one milestone after joining.
 * completed: every milestone reached.
 * held: recorded, but the trust score is below the threshold, so rewards wait for review.
 */
export type InviteStatus = "opened" | "joined" | "active" | "completed" | "held"

/**
 * walletAge … burst: a wallet's own history.
 * vouched, verifiedInvites, heldInvites: its connections (Network Trust): who
 * invited it and how the people it invited turned out.
 */
export type TrustSignalKey =
  | "walletAge"
  | "newWallet"
  | "history"
  | "checkIn"
  | "sharedFunding"
  | "burst"
  | "vouched"
  | "verifiedInvites"
  | "heldInvites"

export interface TrustSignal {
  key: TrustSignalKey
  /** Effect on the 0–100 score. */
  impact: number
  /** Values for the signal's sentence, e.g. { months: 14 }. */
  vars?: Record<string, string | number>
}

export interface Invite {
  id: string
  name: string
  /** null while the invite is only "opened" (no wallet yet). */
  address: string | null
  /** Tracked link id the person came through, or null for the plain link. */
  via: string | null
  openedAt: string
  /** ISO date each milestone was confirmed. `joined` is the on-chain record. */
  milestones: Partial<Record<MilestoneId, string>>
  signals: TrustSignal[]
  /** Transaction hash of the referral record. */
  hash?: string
}

export interface TrackedLink {
  id: string
  label: string
  /** URL-safe tag appended as ?via=… */
  tag: string
  createdAt: string
  opens: number
  joins: number
}

export type BlockReason = "self" | "loop" | "duplicate"

/* ---------------------------------------------------------------------------
 * Reward layer: missions that any app publishes, paid only to wallets whose
 * trust score clears the mission's minimum.
 * ------------------------------------------------------------------------ */

/** token: tUSDC paid from the mission's escrowed budget. points: program score. badge: non-transferable NFT. */
export type RewardKind = "token" | "points" | "badge"

/** How the publishing app proves a wallet did the task. */
export type VerifyMethod = "onchain" | "api" | "organizer"

export interface MissionReward {
  kind: RewardKind
  /** token: base units per completion. points: points per completion. badge: 1. */
  amount: string
  /** badge only: the badge's name. */
  badge?: string
}

export interface Mission {
  id: string
  /** The publishing app, e.g. "Fluidswap". */
  app: string
  title: string
  verify: VerifyMethod
  reward: MissionReward
  /** Wallets below this trust score can't be paid by this mission. */
  minTrust: number
  /** Maximum completions (for tokens: budget = spots × amount, locked in escrow at publish). */
  spots: number
  /** Completions by everyone so far. */
  filled: number
  endsAt: string
  /** Published from this wallet with "Create a mission". */
  yours?: boolean
  /** Completions this mission refused because the wallet's trust was too low (yours only). */
  refused?: number
  hash?: string
}

export interface MissionProgress {
  startedAt?: string
  completedAt?: string
  hash?: string
}

export type ActivityKind =
  | "registered"
  | "recorded"
  | "held"
  | "milestone"
  | "claimed"
  | "blocked"
  | "linkCreated"
  | "missionDone"
  | "missionPublished"
  | "missionRefused"

export interface Activity {
  id: string
  kind: ActivityKind
  at: string
  inviteId?: string
  name?: string
  milestone?: MilestoneId
  points?: number
  /** tUSDC base units. */
  amount?: string
  reason?: BlockReason
  trust?: number
  label?: string
  /** Mission activity: the mission's id, title and app at the time. */
  missionId?: string
  mission?: string
  app?: string
  rewardKind?: RewardKind
  hash?: string
}

export interface WalletState {
  status: "disconnected" | "connecting" | "connected"
  address: string
  name: string
  lastError: "rejected" | null
}

export interface DemoSettings {
  slow: boolean
  failNext: boolean
}

/** A recent event the network graph should animate once (new edge or reward pulse). */
export interface GraphEvent {
  kind: "recorded" | "reward"
  inviteId: string
  points?: number
  at: number
}

export interface DemoState {
  version: 2
  wallet: WalletState
  /** Registered as an ambassador for the program (the referral code exists). */
  registered: boolean
  code: string
  /** Opens of the plain (untagged) link. */
  directOpens: number
  invites: Invite[]
  links: TrackedLink[]
  activity: Activity[]
  /** tUSDC already claimed, base units. */
  claimed: string
  missions: Mission[]
  /** Your progress per mission id. */
  progress: Record<string, MissionProgress>
  /** tUSDC you hold to fund missions you publish (base units). */
  balance: string
  settings: DemoSettings
  lastEvent: GraphEvent | null
}

export interface TxSummaryRow {
  label: string
  value: string
}

/** What the simulated wallet prompt shows before signing. */
export interface TxSummary {
  title: string
  rows?: TxSummaryRow[]
  /** Signature only (no network fee). */
  noFee?: boolean
  /** Signing wallet shown in the prompt, when it isn't the connected one (an invitee). */
  signer?: { name: string; address: string }
}

/** lowTrust: the mission's trust gate refused the payout. */
export type TxError = "rejected" | "reverted" | "lowTrust" | BlockReason

export interface TxState {
  phase: "idle" | "signing" | "pending" | "confirmed" | "failed"
  hash?: string
  error?: TxError
}
