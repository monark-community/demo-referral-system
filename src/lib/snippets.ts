/**
 * Integration examples shown on the home page and /developers. They describe
 * the reward layer's API as the demo simulates it (see src/lib/demo/ops.ts):
 * the same fields the "Create a mission" form sends.
 */

export const SDK_SHORT = `const mission = await reffinity.missions.create({
  title: "Make your first testnet swap",
  verify: { onchain: { contract: ROUTER, event: "Swap" } },
  reward: { token: "tUSDC", amount: 5, inviterShare: 0.1 },
  spots: 500,
  minTrust: 50,
})

// Later: report who did it. Reffinity checks trust, then pays.
await reffinity.missions.complete(mission.id, { wallet })`

export const SDK = `import { Reffinity } from "@monark/reffinity"

const reffinity = new Reffinity({ apiKey: process.env.REFFINITY_KEY })

// 1. Publish and fund: 500 spots × 5 tUSDC are locked in escrow.
const mission = await reffinity.missions.create({
  title: "Make your first testnet swap",
  verify: { onchain: { contract: ROUTER, event: "Swap(address,uint256)" } },
  reward: { token: "tUSDC", amount: 5, inviterShare: 0.1 },
  spots: 500,
  minTrust: 50,
})

// 2. Report a completion (skip this with on-chain verification).
const result = await reffinity.missions.complete(mission.id, { wallet })

// 3. Reffinity paid, or refused a wallet below your minimum.
if (result.status === "refused") console.log(result.trust) // 18`

export const REST = `# 1. Publish and fund a mission
POST /v1/missions
Authorization: Bearer rk_test_…

{
  "title": "Make your first testnet swap",
  "verify": { "type": "onchain", "contract": "0x5a3c…f210", "event": "Swap(address,uint256)" },
  "reward": { "type": "token", "token": "tUSDC", "amount": "5.00", "inviterShare": 0.1 },
  "spots": 500,
  "minTrust": 50
}

→ 201 { "id": "ms_8f2k", "status": "live", "escrow": "2500.00 tUSDC" }

# 2. Report a completion
POST /v1/missions/ms_8f2k/completions
{ "wallet": "0x71c2…9e04" }

→ 200 { "status": "paid", "trust": 91, "reward": "5.00 tUSDC" }
→ 200 { "status": "refused", "trust": 18, "reason": "below_min_trust" }`

export const EVENTS = `// Reffinity contracts (Solidity events, simplified)

// Network Trust
event ReferralRecorded(address indexed inviter, address indexed invitee, uint256 programId);
event ReferralRejected(address indexed invitee, bytes32 reason); // SelfReferral | AlreadyReferred | ReferralLoop
event RewardHeld(address indexed wallet, uint8 trustScore);

// Rewards
event MissionPublished(uint256 indexed missionId, address indexed app, address token, uint256 escrow, uint8 minTrust);
event MissionCompleted(uint256 indexed missionId, address indexed wallet, uint256 reward, address inviter, uint256 inviterShare);
event MissionRefused(uint256 indexed missionId, address indexed wallet, uint8 trustScore);
event MilestoneReached(address indexed invitee, bytes32 milestone, uint32 points, uint256 reward);
event RewardsClaimed(address indexed wallet, uint256 amount);
event EscrowReturned(uint256 indexed missionId, uint256 amount);`

export const TRUST_API = `GET /v1/trust/0x71c2…9e04

→ 200
{
  "wallet": "0x71c2…9e04",
  "score": 83,
  "status": "eligible",
  "signals": [
    { "key": "walletAge", "impact": 20 },
    { "key": "vouched", "impact": 8, "by": "0x3be1…77a0" },
    { "key": "verifiedInvites", "impact": 12 },
    { "key": "heldInvites", "impact": -7 }
  ]
}`

export const WEBHOOK = `POST https://your-app.dev/hooks/reffinity
Reffinity-Signature: t=1759327331,v1=5c1e…

{
  "type": "mission.completed",
  "mission": "ms_8f2k",
  "wallet": "0x71c2…9e04",
  "trust": 91,
  "reward": { "token": "tUSDC", "amount": "5.00" }
}

// Also: mission.refused · reward.held
//       referral.recorded · escrow.low`
