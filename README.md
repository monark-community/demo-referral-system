# Reffinity by Monark

**Rewards only real people can earn.**

Reffinity has two layers of equal weight:

- **Network Trust.** Invites are wallet-bound links. When someone accepts, the referral contract records who invited whom, once and publicly; self-referrals and loops are rejected. Every wallet gets a trust score (0–100) from its own history *and its connections*: who vouched for it, and how the people it invited turned out. Farmed clusters land below 50 and are held, never paid. This is what makes the second layer cheat-resistant (sybil attacks, farmed sign-ups).
- **Rewards.** Any app publishes **missions**: a task, a reward (tokens from an escrowed budget, points, badges, or an inviter share), a verification method (on-chain event, the app's API, or an organizer check-in) and a minimum trust score. Reffinity pays wallets above the minimum and refuses the rest. Referral milestones (first workshop, first bounty, 30 active days) are the first program built on it.

This repository is the **interactive demo site**: a Next.js app with simulated wallet and chain, in English and French.

- Project page: https://www.monark.io/en/project/referral-system
- Site plan (product brief, flows, copy, design decisions): [`docs/site-plan.md`](docs/site-plan.md)
- Assets and credits: [`docs/assets.md`](docs/assets.md)
- Screenshots of every page and flow: [`docs/screenshots/`](docs/screenshots/)

> Demo · simulated data. Testnet demo · not financial advice · no real funds.

## Run it locally

Requirements: Node.js 22 and pnpm 10.

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

Other scripts:

```bash
pnpm lint           # ESLint
pnpm typecheck      # next typegen + tsc --noEmit
pnpm build          # production build (every page prerenders)
pnpm start          # serve the production build
pnpm screenshots    # Playwright screenshots into docs/screenshots (server on :3140, or set BASE_URL)
```

No environment variables are needed. `NEXT_PUBLIC_SITE_URL` optionally overrides the canonical URL used in metadata, the sitemap and the displayed referral links (default `https://reffinity.monark.io`).

## What you can do in the demo

1. **Connect** the demo wallet (sign-in message, or reject it). Demo controls can also start from scratch, where you **join the program** in one transaction.
2. **Share your link** on `/app/invite`: copy it, download the QR code, create tracked links per channel, copy ready-made messages (EN/FR).
3. **Open your link as someone else** on `/r/amara-7k2q`: a new friend (recorded), yourself (rejected: self-referral), the ambassador who invited you (rejected: loop), an existing member (rejected: already referred) or a wallet from a sign-up burst (recorded but held, trust score 18).
4. **Confirm an invitee's milestone** from the dashboard (you sign as the organizer): the node lights up and a reward travels back to you.
5. **Claim** your tUSDC rewards.
6. Flip the **leaderboard** between verified outcomes and raw clicks to see why clicks don't count.
7. On `/app/missions`, see **your own trust score** built from your connections (accept a friend on `/r/...` and it rises; accept a burst wallet and it drops), **complete a mission** (the app reports it, the trust gate pays a badge, points or tUSDC), and see one mission **locked** by your score.
8. **Create a mission** as an app: name, task, verification, reward, spots and minimum trust, with the escrow budget and the API call it makes. Then simulate completions: a verified person is paid from escrow, a farmed wallet (trust 18) is refused.

`/developers` is the integration guide: the three-step path (publish and fund, report completions, Reffinity pays), reward types, verification methods, the trust API, webhooks and contract events. It is an **integration preview**: the demo simulates every call.

## How the simulation works

Everything lives in `src/lib/demo/`, behind a small typed API, so it could be swapped for wagmi/viem and real contract events without touching the UI:

| File | Role |
|-|-|
| `types.ts` | Domain types: invites, milestones, trust signals, tracked links, missions and rewards, activity, wallet, transactions |
| `program.ts` | The Fall 2026 program (milestones, points, trust threshold, peers, personas), Network Trust weights, and the seeded missions from Monark apps |
| `seed.ts` | Believable seeded data (dates relative to now, deterministic addresses and hashes) |
| `store.ts` | External store persisted to `localStorage` (every access in try/catch), plus the wallet-prompt promise |
| `wallet.ts` | Simulated connect / disconnect |
| `chain.ts` | `useTx()`: wallet prompt → pending with a hash (1.2–2.4 s, 3–6 s on "slow network") → confirmed or reverted; contract checks run when the block is mined |
| `ops.ts` | State changes on confirmation and the contracts' hard rules (self-referral, loop, duplicate, mission trust gate, escrow) |
| `selectors.ts` | Derived values: trust scores (invitees and your own network score), status, mission state, points, claimable/held rewards, badges, leaderboard |

"Demo controls" in the app toggle a slow network, force the next transaction to fail, and reset the demo (back to the example, or from scratch).

## Project structure

```
src/
  app/[locale]/            pages (home, how-it-works, developers, app, app/missions, app/invite, app/leaderboard, r/[code], credits, pricing), 404, OG image
  app/sitemap.ts, robots.ts, icon.svg
  proxy.ts                 redirects / to the preferred language
  components/site/         standard Monark header, footer, brand, Demo chip, EN/FR switch, theme toggle
  components/demo/         the demo app (dashboard, missions, trust card, create-mission sheet, invite sheet, rewards, activity, invite page, leaderboard, join page)
  components/diagrams/     network graph, trust gauge, record diagram, QR code, code block
  components/ui/           @monark/ui registry components (restyled as Monark pills)
  i18n/                    typed EN/FR dictionaries
  lib/demo/                simulated chain, wallet and data
  lib/snippets.ts          integration code samples (home, /developers)
docs/                      site plan, assets, screenshots
scripts/screenshots.mjs    Playwright visual check
```

Stack: Next.js 16 (App Router, TypeScript strict), Tailwind CSS 4, shadcn/ui on the [Monark UI registry](https://ui.monark.io), `lucide-react`, `uqr` (QR codes).

`/pricing` is an internal strategy page: it is not linked anywhere, not in the sitemap, and is `noindex, nofollow`.

## Deploy to Vercel

Import the repository in Vercel and deploy with the framework defaults (Next.js, `pnpm install`, `pnpm build`). No `vercel.json` and no environment variables are required; Node 22 is pinned in `package.json` `engines`.

## License and credits

Open source, by the Monark community. Photos from Unsplash (free licence), credited on `/credits` and in `docs/assets.md`.
