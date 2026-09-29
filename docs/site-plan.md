# Reffinity by Monark: site plan

Status: shipped on `develop`. This plan describes what the site does, and it is kept in sync with the code.

- Product: **Reffinity**, Monark's referral module, built for ambassador programs.
- Authoritative description: https://www.monark.io/en/project/referral-system (including its milestones A to G).
- Branding: **Monark-branded** (`true`). `lovable-migration/monark-brand-guidelines.md` is binding.
- Stack: Next.js 16 (App Router, `src/`, TypeScript strict), pnpm, Tailwind CSS v4, shadcn/ui on the Monark UI registry, `lucide-react`, plus `uqr` for QR codes (see §9).

Decisions made while working unattended are marked **Decision:**.

---

## 1. Product brief

**Target user.** The people who grow a Monark community one person at a time:

- a **Monark ambassador** (one of Monark's four participation tracks) who brings classmates, meetup regulars and developers into the community;
- the **lead of a student blockchain club** who runs a recruitment drive at the start of term;
- the **program organizer** at Monark or a partner who funds the rewards and needs to know they went to real growth, not to farmed sign-ups.

Secondary users are the **invitees** (they want a clear, trustworthy invitation and to know what joining means) and **students and developers** learning how an on-chain referral contract prevents abuse (the project is a student build, and the docs emphasise wallet tracking, loop and self-referral prevention, incentive design and analytics).

**Core job to be done.** *"When I bring someone into the community, get credit for it when they actually take part, without screenshots, spreadsheets or arguing with the organizer, and without someone else gaming the count."*

**Domain concepts** (each is explained in plain words the first time the site uses it):

| Concept | Meaning in Reffinity |
|-|-|
| Program | A referral campaign with its own rules and reward pool, e.g. "Monark Ambassadors · Fall 2026". |
| Referral link | A link tied to your wallet (`/r/amara-7k2q`). It works as a link or a QR code, and can carry a channel tag ("Workshop poster") to see which channel works. |
| Referral record | The on-chain entry "wallet B was invited by wallet A", written once when B accepts. It can't be edited or reassigned later. |
| Milestone | A real outcome an invitee reaches: joined, attended a first workshop, completed a first bounty, still active after 30 days. Each one triggers its reward automatically. |
| Points | The program's score, credited to the inviter when a milestone is confirmed. Points rank the leaderboard. |
| Reward | Testnet tUSDC unlocked by some milestones. It waits as *claimable* until the ambassador claims it. |
| Trust score | 0 to 100, computed from network signals (wallet age, shared funding source, bursts of linked sign-ups, organizer check-ins). Below 50, the referral is still recorded but its rewards are **held** for review. |
| Hard rules | Enforced by the contract itself: a wallet can't refer itself, a wallet can only ever have one referrer, and referral loops (A invites B, B invites A) are rejected. |
| Invite status | Opened (link clicked, off-chain), Joined (recorded on-chain), Active (at least one milestone after joining), Completed (all milestones), Held (low trust). |

**What the Lovable version got wrong or left out.**

- A generic landing page on a purple-to-blue gradient with frosted cards, "🚀 Smart Contract Powered", and nothing that looked like Monark.
- Neither button did anything: "Start Referring" and "View Dashboard" had no target. There was no dashboard, no link, no QR code, nothing to try.
- The leaderboard was five hard-coded rows ranked by raw referral counts and ETH earnings, which rewards exactly the farming the product is supposed to prevent.
- The heart of the documented product was absent: milestone-triggered rewards, the on-chain record of who invited whom, self-referral and loop prevention, the trust score, points and pending rewards, invite statuses.
- A fake email and password sign-in next to wallet buttons, English only, no disclaimers, no persistence, no empty, pending or error states.

## 2. Value proposition

**Reffinity gives Monark ambassadors a wallet-bound invite link that pays out only when the people they bring actually take part, with every referral recorded on-chain, so rewards are fair, visible to everyone and hard to game.**

Supporting benefits, as outcomes:

1. **You get credit for the people who show up**, automatically, when they attend their first workshop or finish their first bounty, not when someone remembers to update a spreadsheet.
2. **Nobody can argue about who brought whom.** The referral record is written once, publicly, and can't be reassigned.
3. **Farmed sign-ups don't win.** Self-referrals and loops are rejected by the contract, and suspicious clusters are held for review, so the leaderboard reflects real growth.

## 3. Hero

- **Headline** (7 words): *Reward the invites that actually show up.*
- **Subheadline:** *Reffinity records who invited whom on-chain and rewards ambassadors when their invitees reach real milestones, like a first workshop or a first bounty. No spreadsheets, and no gaming the count.*
- **Primary CTA:** "Launch the demo" → `/{locale}/app`.
- **Secondary CTA:** "See how rewards are earned" → `/{locale}/how-it-works`.
- **Hero visual:** product UI built in code, the **live referral network**: your wallet at the centre, invitees around it as nodes on flat orange lines, in a card framed like the dashboard. On a loop it plays one referral's life: a new edge draws in ("Léa joined"), a milestone lights the node, and a small reward dot travels back along the edge to your points counter. A side ticker lists the matching contract events. **Why:** the product's whole point is that rewards follow real outcomes; showing that motion is clearer than any photo, and the line-and-node drawing echoes the Monark mesh butterfly.

## 4. Page map

All routes live under `/{locale}` (`en`, `fr`); `/` redirects to the visitor's preferred language.

| Route | Purpose | Sections, in order |
|-|-|-|
| `/` | Explain the product in one scroll and send people to the demo | Hero (network visual) · "Clicks aren't community" (three outcome benefits) · "From link to reward" (four steps, line art) · "Built to be hard to game" (hard rules and trust score, with a small live replica of the checks) · "Who uses it" (ambassadors, student clubs, program organizers, with photos) · FAQ · closing CTA band |
| `/how-it-works` | For students, developers and organizers who want the mechanics | Intro · the referral record (diagram) · milestones and rewards (table of the Fall 2026 program) · the trust score (signals with their weights) · what lives on-chain vs off-chain · contract events for developers (code block) · CTA |
| `/app` | The working product: the ambassador dashboard | Wallet gate → stats (points, rank, verified invites, claimable tUSDC) · network graph · invites list with status filters and an invite detail sheet · rewards panel with claim · activity log |
| `/app/invite` | Share your link | Your link + copy · QR code (download SVG) · tracked channel links (create, opens, joins) · ready-to-send messages · "Preview as a friend" entry into `/r/...` |
| `/app/leaderboard` | Program ranking | "Count verified outcomes / Count raw clicks" toggle · ranked table with your row highlighted · explanation of why clicks don't count |
| `/r/[code]` | What an invitee sees when they open a link | Invitation card (who invited you, which program, what joining means) · demo persona picker ("Who is opening this link?") · accept → wallet prompt → pending → joined, held or rejected |
| `/credits` | Photo credits (linked from the footer legal line) | Photographers with links · brand asset sources |
| `/pricing` | **Internal strategy review only.** Never linked, excluded from the sitemap, `noindex, nofollow` | See §10 |
| 404 | Localized not-found page | Vertical Monark logo · message · home and demo buttons |

**Why the extra pages:** `/how-it-works` exists because the project is explicitly a teaching build (abuse cases, incentive design), and organizers need to see the rules before trusting the leaderboard; it would overload the home page. `/r/[code]` is the other half of the product: a referral system has two sides, and letting visitors open their own link and play the invitee is the only honest way to demo the on-chain record and the abuse rules. `/credits` holds photo credits.

**Header** (standard Monark navbar, guidelines §10 as updated on 2026-09-29): butterfly + "Reffinity" on one line (no "by Monark"; aria-label "Reffinity, by Monark: home") · Overview · How it works · Demo, left-aligned after the brand · on the right: Demo chip · EN/FR · theme toggle · "Launch demo" (becomes `connect-wallet` inside the app). Below `lg`: brand + menu button; the sheet holds links, Demo chip, EN/FR, theme and the action.
**Footer:** standard three bands (product line + Overview, How it works, Demo, Credits · "Reffinity is built by Monark", Monark logo, tagline, project page, GitHub, socials · © line, "Demo · simulated data", testnet notice, photo credits link).

## 5. Feature highlights

| Feature | User benefit | Where it appears | Demo flow that proves it |
|-|-|-|---|
| Wallet-bound link and QR code, with channel tags | Share anywhere, online or on a poster, and see which channel brings people | Home step 1, `/app/invite` | Flow 2 |
| On-chain referral record | Nobody can dispute or reassign who brought whom | Home steps, `/how-it-works`, `/r/[code]` | Flow 3 |
| Milestone-triggered rewards | Credit arrives when invitees take part, automatically | Hero animation, home steps, dashboard | Flow 4 |
| Hard rules and trust score | Farmed sign-ups can't win; organizers can trust the ranking | Home "hard to game", `/how-it-works`, invite sheet, `/r/[code]` personas | Flow 3 (rejected and held outcomes) |
| Points, claimable rewards and history | See what you've earned and what's pending, claim it yourself | Dashboard stats and rewards panel | Flow 5 |
| Verified leaderboard | Rankings reflect real growth, not clicks | `/app/leaderboard` | Leaderboard toggle |

## 6. Key flows

All transactions go through the simulated wallet prompt (confirm or reject), then **pending** (a hash and a 1.2–2.4 s block time, 3–6 s with "Slow network"), then **confirmed**, or **failed** ("You rejected the request" or "The transaction failed on the network", with a retry). "Fail the next transaction" in the demo controls forces one failure.

1. **Connect your wallet.** Visitor opens `/app` → gate explains what they'll do → "Connect demo wallet" → wallet prompt shows a sign-in message (no fee) → *pending* ("Connecting…") → *confirmed*: dashboard. *Failed*: rejecting shows "You declined the sign-in request. Nothing was shared." with the button still available.
   - With "Start from scratch" in the demo controls, the dashboard is empty and offers **Join the program** (a registration transaction that mints your link): pending → confirmed (your link appears) or failed (retry).
2. **Share your link.** `/app/invite` → copy the link (button shows "Copied") → QR code of the same link, downloadable → create a tracked link: label "Library poster" → it appears with 0 opens · 0 joins (validation: label required, 40 characters max, unique) → copy a ready-made message in EN or FR. No transaction: links are derived from your wallet and only the tag is stored.
3. **A friend opens your link.** "Preview as a friend" → `/r/amara-7k2q?via=...` → invitation card → choose who is opening it:
   - *A new friend* (fresh wallet): "Accept invitation" → prompt → pending → **joined**: "You're in. Amara gets credit when you reach your first milestone." Back on the dashboard, the new edge draws in the network.
   - *Your own wallet*: → prompt → pending → **failed (reverted)**: "A wallet can't refer itself. The contract rejected this referral, so nothing was recorded."
   - *Someone already in the program* (Noah): → **failed (reverted)**: "This wallet already joined through another invitation. A referral can only be recorded once."
   - *A wallet from a sign-up burst*: → **joined but held**: trust score gauge settles at 18, "Recorded, but rewards are held: 5 wallets funded from the same address joined within 2 minutes."
4. **An invitee reaches a milestone.** Dashboard → open an invite (e.g. Sofia) → "Simulate: confirm workshop check-in" (standing in for the organizer's check-in) → prompt → pending → **confirmed**: the node lights up, a reward dot travels to you, +25 points ticks, the activity log gets the event. For a held invite the milestone is recorded but the reward shows "held". *Failed*: the milestone stays unconfirmed, with a retry.
5. **Claim your rewards.** Rewards panel shows claimable tUSDC (e.g. 15.00 tUSDC) → "Claim 15.00 tUSDC" → prompt with the testnet disclaimer and fee → pending → **confirmed**: claimable drops to 0, the claim appears in history with its hash. *Failed*: amount stays claimable, retry. *Empty*: "Nothing to claim yet. Rewards unlock when your invitees complete a bounty or stay active for 30 days."

## 7. Content (EN / FR)

The shipped copy lives in `src/i18n/dictionaries/{en,fr}.ts`; this is the source it was written from. Tone: the guidelines' voice (open, practical, community-first, no hype). French is written natively (Québec-friendly, "portefeuille", "on-chain" kept).

### Shared

| Key | EN | FR |
|-|-|-|
| Header brand | Reffinity (aria-label "Reffinity, by Monark: home") | Reffinity (« Reffinity, par Monark : accueil ») |
| Footer credit | Reffinity is built by Monark | Reffinity est conçu par Monark |
| Demo chip | Demo | Démo |
| Nav | Overview · How it works · Demo | Aperçu · Fonctionnement · Démo |
| Header action | Launch demo | Lancer la démo |
| Demo badge | Demo · simulated data | Démo · données simulées |
| Value disclaimer | Testnet demo · not financial advice · no real funds | Démo sur testnet · pas un conseil financier · aucun fonds réel |
| Footer line | Wallet-bound referral links that reward the people you bring when they actually take part. | Des liens de parrainage liés à votre portefeuille, qui récompensent vos invitations quand les gens participent vraiment. |
| Tagline | Fostering Collaboration within the Web3 Community | Favoriser la collaboration au sein de la communauté Web3 |

### Home

- **Hero** EN: eyebrow "Monark · Referral module"; H1 "Reward the invites that actually show up."; sub (see §3); CTAs "Launch the demo" / "See how rewards are earned"; visual caption "Live example · simulated".
  FR: « Monark · Module de parrainage »; H1 « Récompensez les invitations qui se concrétisent. »; sous-titre « Reffinity inscrit on-chain qui a invité qui, et récompense les ambassadeurs quand leurs invités franchissent de vraies étapes, comme un premier atelier ou une première prime. Pas de tableur, et pas moyen de gonfler les chiffres. »; « Lancer la démo » / « Voir comment on gagne des récompenses ».
- **Clicks aren't community** EN: H2 "Clicks aren't community." Body "Most referral programs count links clicked and forms filled. That rewards whoever posts the most, and invites farming. Reffinity counts what a community actually needs: people who show up and contribute." Benefits: (1) "Credit when it counts" / "Your points arrive on their own when someone you invited attends their first workshop or ships their first bounty." (2) "One record, no disputes" / "Who invited whom is written once, on-chain, where everyone can check it and no one can reassign it." (3) "Fair for everyone" / "Self-referrals and loops are rejected outright, and suspicious bursts are held for review. The leaderboard reflects real growth."
  FR: H2 « Un clic n'est pas une communauté. » Texte « La plupart des programmes de parrainage comptent les clics et les formulaires remplis. On récompense alors celui qui publie le plus, et on invite à tricher. Reffinity compte ce dont une communauté a vraiment besoin : des gens qui viennent et qui contribuent. » (1) « Reconnu quand ça compte » / « Vos points arrivent tout seuls quand une personne invitée assiste à son premier atelier ou livre sa première prime. » (2) « Un seul registre, aucune dispute » / « Qui a invité qui est inscrit une fois, on-chain, où chacun peut le vérifier et personne ne peut le réattribuer. » (3) « Équitable pour tout le monde » / « Les auto-parrainages et les boucles sont refusés d'office, et les rafales suspectes sont mises en attente. Le classement reflète une vraie croissance. »
- **From link to reward** EN: H2 "From a link to a reward, in four steps." Steps: "Share your link" (A link and QR code tied to your wallet. Tag it by channel to see what works.) · "They accept on-chain" (When your friend accepts, the contract records that you invited them. Once, for good.) · "They take part" (Milestones are real outcomes: a first workshop, a first bounty, 30 days of activity.) · "Your reward lands" (Each confirmed milestone credits your points, and some unlock tUSDC you can claim.) Link "Read the full rules".
  FR: H2 « Du lien à la récompense, en quatre étapes. » « Partagez votre lien » (Un lien et un code QR liés à votre portefeuille. Ajoutez une étiquette par canal pour voir ce qui fonctionne.) · « Ils acceptent on-chain » (Quand votre ami accepte, le contrat inscrit que c'est vous qui l'avez invité. Une fois pour toutes.) · « Ils participent » (Les étapes sont de vrais résultats : un premier atelier, une première prime, 30 jours d'activité.) · « Votre récompense arrive » (Chaque étape confirmée crédite vos points, et certaines débloquent des tUSDC à réclamer.) « Lire les règles complètes ».
- **Hard to game** EN: H2 "Built to be hard to game." Body "Some rules are enforced by the contract itself. Others come from a trust score that watches the network for patterns no honest ambassador produces." Rules: "A wallet can't refer itself" · "A wallet has exactly one referrer, forever" · "Loops are rejected (A invites B, B invites A)" · "Bursts of linked wallets are held for review". Replica labels: "Rejected by the contract", "Held: trust score 18", "Recorded: trust score 91".
  FR: H2 « Conçu pour ne pas être contourné. » « Certaines règles sont appliquées par le contrat lui-même. D'autres viennent d'un score de confiance qui repère dans le réseau des comportements qu'aucun ambassadeur honnête ne produit. » « Un portefeuille ne peut pas se parrainer lui-même » · « Un portefeuille a un seul parrain, pour toujours » · « Les boucles sont refusées (A invite B, B invite A) » · « Les rafales de portefeuilles liés sont mises en attente ». « Refusé par le contrat », « En attente : score de confiance 18 », « Inscrit : score de confiance 91 ».
- **Who uses it** EN: H2 "Made for the people who grow a community." Ambassadors: "Bring classmates and meetup regulars, and see exactly where each invitation stands." Student clubs: "Run your recruitment drive with a QR code on the poster and a leaderboard nobody can pad." Program organizers: "Fund rewards that only pay out for real participation, with a public record of every referral."
  FR: H2 « Pensé pour celles et ceux qui font grandir une communauté. » Ambassadeurs : « Invitez collègues de classe et habitués des meetups, et voyez où en est chaque invitation. » Clubs étudiants : « Menez votre campagne de recrutement avec un code QR sur l'affiche et un classement que personne ne peut gonfler. » Organisateurs : « Financez des récompenses versées seulement pour une vraie participation, avec un registre public de chaque parrainage. »
- **FAQ** (EN / FR):
  1. "Do the people I invite need a crypto wallet?" / « Les personnes que j'invite ont-elles besoin d'un portefeuille crypto ? » — "Yes, a wallet is how the referral is recorded. In the full module, a new member can create an embedded wallet in a few seconds while signing up. In this demo, wallets are simulated." / « Oui, c'est le portefeuille qui permet d'inscrire le parrainage. Dans le module complet, un nouveau membre peut créer un portefeuille intégré en quelques secondes à l'inscription. Dans cette démo, les portefeuilles sont simulés. »
  2. "What counts as a milestone?" / « Qu'est-ce qui compte comme étape ? » — "Each program sets its own. The Fall 2026 ambassador program uses four: joining, attending a first workshop, completing a first bounty and staying active for 30 days. Check-ins are confirmed by an organizer or by another Monark module." / « Chaque programme définit les siennes. Le programme d'ambassadeurs de l'automne 2026 en compte quatre : rejoindre, assister à un premier atelier, terminer une première prime et rester actif 30 jours. Les présences sont confirmées par un organisateur ou par un autre module Monark. »
  3. "Can I change who referred me?" / « Puis-je changer de parrain ? » — "No. A referral is written once when you accept an invitation. That's what makes the record trustworthy for everyone." / « Non. Un parrainage est inscrit une seule fois, quand vous acceptez une invitation. C'est ce qui rend le registre fiable pour tout le monde. »
  4. "What happens when a referral is held?" / « Que se passe-t-il quand un parrainage est mis en attente ? » — "It's still recorded, but its rewards wait until an organizer reviews it. Most holds come from many wallets funded by the same address joining within minutes." / « Il reste inscrit, mais ses récompenses attendent qu'un organisateur l'examine. La plupart des mises en attente viennent de plusieurs portefeuilles financés par la même adresse qui rejoignent en quelques minutes. »
  5. "Is any of this real money?" / « Est-ce de l'argent réel ? » — "No. This is a demo on simulated testnet data. Rewards are paid in tUSDC, a test token with no value." / « Non. C'est une démo sur des données de testnet simulées. Les récompenses sont en tUSDC, un jeton de test sans valeur. »
- **Closing band** EN: "Try it with your own link." / "Connect a demo wallet, share your link, and watch a referral turn into a reward." · "Launch the demo". FR: « Essayez avec votre propre lien. » / « Connectez un portefeuille de démo, partagez votre lien et regardez un parrainage devenir une récompense. » · « Lancer la démo ».

### How it works (headings; body copy in the dictionaries)

EN: "How Reffinity turns a referral into a reward" · "1. The referral record" · "2. Milestones and rewards" · "3. The trust score" · "4. What's on-chain, what isn't" · "5. For developers: contract events" · CTA "Try the rules in the demo".
FR: « Comment Reffinity transforme un parrainage en récompense » · « 1. Le registre des parrainages » · « 2. Étapes et récompenses » · « 3. Le score de confiance » · « 4. Ce qui est on-chain, et ce qui ne l'est pas » · « 5. Pour les développeurs : les événements du contrat » · « Tester les règles dans la démo ».

### App: empty and error states

| State | EN | FR |
|-|-|-|
| No invites (fresh start) | "No one has joined through your link yet. Share it from the Invite page, or preview it as a friend." | « Personne n'a encore rejoint grâce à votre lien. Partagez-le depuis la page Inviter, ou prévisualisez-le comme un ami. » |
| Filter with no match | "No invites with this status." | « Aucune invitation avec ce statut. » |
| Nothing to claim | "Nothing to claim yet. Rewards unlock when your invitees complete a bounty or stay active for 30 days." | « Rien à réclamer pour l'instant. Les récompenses se débloquent quand vos invités terminent une prime ou restent actifs 30 jours. » |
| No activity | "Your activity will appear here as invites are recorded and milestones confirmed." | « Votre activité s'affichera ici à mesure que les invitations sont inscrites et les étapes confirmées. » |
| No tracked links | "No tracked links yet. Add one per channel to see where people come from." | « Aucun lien suivi pour l'instant. Ajoutez-en un par canal pour voir d'où viennent les gens. » |
| Unknown invite code | "This invitation link doesn't match any ambassador in this demo." | « Ce lien d'invitation ne correspond à aucun ambassadeur dans cette démo. » |
| Rejected signature | "You rejected the request in your wallet. Nothing was sent." | « Vous avez refusé la demande dans votre portefeuille. Rien n'a été envoyé. » |
| Reverted | "The transaction failed on the network. Nothing changed; you can try again." | « La transaction a échoué sur le réseau. Rien n'a changé ; vous pouvez réessayer. » |
| Storage blocked | "Your browser is blocking local storage, so the demo won't remember changes after you leave." | « Votre navigateur bloque le stockage local : la démo ne gardera pas vos changements après votre départ. » |

## 8. Aesthetics (Monark-branded: only what the guidelines leave open)

Colour, type, logo, header and footer follow the guidelines exactly: §3 token block pasted over the `@monark/ui` base theme, `--surface-tint: 1`, flat orange, cream and espresso, Nunito Sans, pills for actions, 1rem cards, borders instead of shadows.

- **Layouts and rhythm.** Home alternates a wide product band (hero network) with narrow text sections, capped at `max-w-6xl`, `py-20` desktop / `py-14` mobile. The hero is split 5/7 (copy left, product card right) on desktop and stacks on mobile with the card under the CTAs. Section dividers (monark.io's orange line with end circles) appear twice: after the hero and before the FAQ. The app uses a denser rhythm: a stat row, then a 7/5 grid (network + invites / rewards + activity), stacking on mobile.
- **Hero visual.** The live referral network (see §3), drawn in SVG with flat orange 2px lines and outlined nodes.
- **Illustrations.** No stock illustrations. New line-art diagrams in code: the four-step "link to reward" strip, the referral-record diagram (two wallets, one arrow, one contract entry) and the trust-score gauge (a half-circle arc, orange fill up to the score). Monark's decorative `network.svg` idea is echoed by the network graph rather than copied.
- **Mesh butterfly.** Used **once**, on the home hero: large, partly cropped off the top-left, at low opacity behind the copy column, flat strokes only. No gradients anywhere (the logo keeps its own).
- **Photography direction.** Warm, candid, human-scale moments of people bringing people in: two friends looking at a phone on campus (the invitation), a lively student workshop (the first milestone), a meetup talk (the organizer's side). Used only in "Who uses it" and credited on `/credits`.
- **Signature moments.**
  1. **A referral travels the network.** When an invite is recorded, its edge draws from your node in 250 ms; when a milestone confirms, a small orange dot travels back along the edge and the points counter ticks up.
  2. **The abuse catch.** On `/r/[code]`, choosing a suspicious persona ends in a plain-language revert or in the trust-score gauge settling in the "held" zone, never in a generic error.
  3. **Clicks vs verified.** On the leaderboard, flipping "Count raw clicks" reorders the rows (a farmed account jumps to first place); flipping back settles them into the verified order.
- Motion is 150–250 ms ease-out (the reward dot travels in 500 ms because the motion is the explanation), and `prefers-reduced-motion` turns the graph animations into instant state changes; the hero then shows the loop's final state.
- **Decision: confirmations are inline, not toasts, where a toast would cover the result.** Milestone confirmations appear inside the invite sheet (a toast top-right covered the sheet's details), and the claim confirmation appears in the rewards card. The reward animation plays when the sheet closes, so it is never hidden behind it. Remaining toasts (tracked link added, demo reset, join registered, copy failure) sit top-right under the header on desktop and full-width under the header on phones, away from the content they report on.
- **Decision: the demo visitor is Amara Okafor**, an ambassador already three months into the program (8 invites in every status), so the dashboard is alive on first load; "Start from scratch" in the demo controls shows the empty states and the registration flow.

## 9. Assets

**Photos** (Unsplash, free licence, downloaded to `public/images/`, served with `next/image`, credited in `docs/assets.md` and on `/credits`):

| File | Purpose | Placement |
|-|-|-|
| `invite.jpg` | Two friends looking at a phone on campus: the invitation moment | Home, "Who uses it", ambassadors |
| `workshop.jpg` | Students together at a workshop: the first milestone | Home, "Who uses it", student clubs |
| `meetup.jpg` | A talk at a community meetup: the organizer's side | Home, "Who uses it", organizers |

**Brand:** Monark standalone mark (header pairing, favicon, wallet prompt, gate), horizontal logo light/dark (footer), vertical logo (404), mesh butterfly (home hero only), social icons (footer).

**Built in code:** referral network graph, four-step strip, referral-record diagram, trust-score gauge, QR code (SVG), Open Graph image (`next/og`, per locale).

**Icons:** Lucide.

**Extra dependency:** `uqr` (tiny, zero-dependency QR encoder that returns a module matrix, rendered as SVG). QR codes are an explicit milestone of the project (milestone B); hand-rolling Reed–Solomon encoding would be worse. **Decision:** no chart library; the few bars are plain elements.

## 10. Pricing strategy

**Decision: free, included in the Monark bundle.** Reffinity is community infrastructure: it only works if every ambassador and every partner program can use it without friction, and a fee on rewards would come straight out of the people it is meant to reward. Partner organizations running their own programs pay nothing for the software; they fund their own reward pools, which go 100% to participants. If Monark ever needs revenue here, the plan argues for optional paid services for partners (program setup and trust-review support), never a cut of rewards.

A designed `/pricing` page exists for internal review only: two columns ("Community programs · Free, part of Monark" and "Partner programs · Free software, you fund the rewards"), the reasoning, and "What we'd never charge for". It is never linked, not in the sitemap, and marked `robots: { index: false, follow: false }`. No price is mentioned anywhere else.

## 11. Out of scope

- No real chain, wallet, signatures, backend or email. Everything is simulated in `src/lib/demo/` and persisted in `localStorage`.
- No organizer console: programs, milestones and rewards are fixed to the Fall 2026 example and shown read-only. Reviewing held referrals is described, not simulated.
- No multi-level (pyramid) rewards: only the direct inviter is rewarded, deliberately.
- No embedded-wallet onboarding for invitees (the FAQ describes it); personas stand in for new wallets.
- No real analytics or tracking: open counts on tracked links are simulated.
