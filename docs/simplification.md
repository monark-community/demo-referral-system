# Simplification pass

Owner feedback: *"Simplify, reduce text quantity, revise flows so that context is only given when necessary. Two top bars on homepage is too busy; demo banners only on demo/app pages."*

Binding rules: `monark-brand-guidelines.md` §8 "Restraint", §10 and §11. Method: the TrustRate pilot's checklist (`sites/address-review-system/docs/simplification.md` §4).

How the numbers are measured (both scripts are in `scripts/`, run against `pnpm start -p 3140`):

- `node scripts/wordcount.mjs`: words per page, English, at 1440px. *Visible* is the `innerText` of `<main>`; *total* also counts closed disclosures and FAQ answers; *chrome* is everything outside `<main>` (header, footer). On `/app` and `/r` pages the app bar is inside `<main>`. The dashboard and leaderboard include seeded data (names, channels, dates, the screen-reader copy of the ranking).
- `node scripts/dictcount.mjs`: words of UI copy in `src/i18n/dictionaries/{en,fr}.ts`, per section.

## 1. Before

| Page | Visible in main | Total in main | Chrome |
|-|-:|-:|-:|
| Home | 527 | 533 | 73 |
| How it works | 520 | 504 | 73 |
| Credits | 97 | 97 | 73 |
| 404 | 31 | 31 | 73 |
| App: connect gate | 58 | 58 | 73 |
| App: dashboard | 288 | 288 | 75 |
| App: invite | 252 | 252 | 75 |
| App: leaderboard | 206 | 206 | 75 |
| Invitation (`/r`) | 192 | 200 | 73 |
| **Total** | **2,171** | **2,169** | **663** |

Dictionary copy: **EN 2,888 words** (meta 47 · common 140 · home 648 · how 397 · credits 90 · pricing 167 · app 1,118 · join 274 · seed 7); **FR 3,240 words**.

What was there:

- **Shell:** Demo chip at `primary/8` in both themes (no dark tint); footer legal band carried the testnet line on every page.
- **Home:** eyebrow, 30-word subline, a dashed "Demo · simulated data" pill under the buttons (repeating the chip and footer), then 6 sections: "Clicks aren't community" (35-word intro + 3 outcome cards restating the hero, the steps and the anti-gaming section), four steps (15-word bodies), "Built to be hard to game" (25-word intro + rules + replica), audiences, FAQ (5 questions, 20–40-word answers), closing (heading + body + button). Two dividers.
- **How it works:** eyebrow, 27-word intro, 30–40-word paragraphs per section, milestone table with a restating second line per row, 35-word worked example, open code block, CTA with a body line.
- **App:** two bars under the header (a strip with network badge, the testnet notice and Demo controls, then the section tabs). Gate with a paragraph and three feature bullets. Stat cards each with a hint (one repeated the page subtitle). The same 20-word empty sentence under both the network and the invites list. Invite sheet with a permanent "why" paragraph and a held note repeating the gauge. Rewards card with its own testnet line. Activity rows with visible hashes, 6 at a time; invites list all 8 at once. Invite page: intro paragraph, a hint under each of the 4 cards, three long messages shown at once. Leaderboard: 20-word intro and a permanent note panel. Registration: paragraph, 3 bullets and a toast repeating what the dashboard shows.
- **Invitation (`/r`):** a strip with the network badge and "Demo · simulated data · Testnet demo · …", a 38-word invitation paragraph, long steps, a two-sentence privacy line, the testnet line again under the button, and a persona intro line.

## 2. What changed

No feature or flow was removed.

### Shell (header and footer)

- Header, brand, nav links, mobile menu and theme toggle are now the Splitflow reference files verbatim (`src/components/site/`), so the family matches exactly: links 28px after the brand, `whitespace-nowrap`, 44px theme toggle in the mobile sheet. `locale-switch.tsx` keeps its one local difference (it keeps the `?via=` query when switching language on `/r/...`).
- **Demo chip:** `bg-primary/8 dark:bg-primary/15`, dot in `currentColor` (reference `demo-chip.tsx`).
- **Footer legal band:** testnet line removed; it keeps "Demo · simulated data". Product line 16 → 9 words.
- **Marketing pages:** exactly one top bar, the header.

### Home (hero + 6 sections → hero + 5)

- Hero: removed the eyebrow and the dashed demo pill; subline 30 → 10 words; secondary CTA "How rewards are earned"; card caption "Live example".
- **Removed** "Clicks aren't community": its three outcomes restated the hero (credit on real participation), step 2 (one record) and the anti-gaming section.
- Steps: heading "From link to reward."; bodies 15 → 6–9 words.
- Hard to game: intro removed; rules cut to 3–6 words each.
- Audiences: heading 9 → 4 words; cards 15–17 → 8–10 words.
- FAQ: 5 → 4 questions, answers 9–16 words. "What happens when a referral is held?" is covered by the trust-score section of `/how-it-works`. Still the site's only FAQ.
- Closing: heading + button. One divider (after the hero) instead of two.

### How it works

- Removed the eyebrow; intro 27 → 7 words; each section keeps one line under its heading (8–16 words).
- Milestone table: the second line per row ("Attended a first workshop") removed, it restated the label.
- Worked example is one line; on/off-chain items shortened.
- Contract events sit behind a "Show the contract events" disclosure.
- CTA: heading + button.

### App and invitation

- **One bar instead of two.** The testnet strip is gone. Section nav on the left, one pill on the right ("● Sepolia testnet | Demo controls") that opens the demo controls; on phones the pill is icon-only and the tab icons hide, so the three sections fit at 390px in both languages. `/r/[code]` uses the same single bar with "Back to your dashboard" on the left (moved from the page body).
- **Testnet line once per transaction:** only in the wallet prompt, now on every prompt (the "Simulated wallet" line it replaced said the same). Removed from the footer, the app strip, the `/r` strip, the rewards card and the invitation card.
- Gate: three bullets removed; line 25 → 8 words.
- Registration: bullets removed; line 22 → 6 words; no toast (the dashboard replacing the card confirms it).
- Dashboard: stat hints removed except "8 opened your link"; network and list empty states are different one-liners ("No one has joined yet." / "No invites yet."); invites 5 at a time with "Show all invites"; activity 4 at a time, the transaction hash moved into the time's tooltip.
- Invite sheet: "why" paragraph behind an info icon ("Who confirms milestones?"); held note removed (the gauge says "Held for review"); opened/complete notes cut to one short line.
- Rewards: testnet line removed; empty state "Nothing to claim yet."
- Invite page: intro and the four card hints removed; ready-to-send messages show one at a time, picked by label.
- Leaderboard: intro removed (the program name stays as the subtitle); the ranking rule moved into an info popover next to the title; the warning panel only appears in the raw-clicks view (12 words); short addresses under names removed (the avatar identifies the wallet; the screen-reader list is unchanged).
- Invitation: paragraph 38 → 14 words; steps 5–15 → 4–7 words; privacy line 12 → 6 words; testnet line removed (it is in the prompt); persona intro removed; persona lines 3–4 words; results one line each.
- Transaction messages: one line each ("A wallet can't refer itself. Nothing was recorded.").
- Demo controls: hints 4–8 words; reset confirmation 10 → 8 words; "Fresh start." toast.
- New shared component: `src/components/ui/info-tip.tsx` (Radix Popover behind an info icon, opens on click or tap). Added `@radix-ui/react-popover`.

French was rewritten to the same brevity in `src/i18n/dictionaries/fr.ts`. Unused keys were removed (`why`, eyebrows, hints, `simulated`, `heldNote`, `failedTitle`, `trust.pending`, `trust.scale`, `activity.view`, `wallet.copyAddress`, `wallet.copied`, milestone `long` lines, and others); both files keep the same typed shape.

## 3. After

| Page | Visible before | Visible after | Change | Total before | Total after | Chrome before | Chrome after |
|-|-:|-:|-:|-:|-:|-:|-:|
| Home | 527 | 287 | −46% | 533 | 293 | 73 | 57 |
| How it works | 520 | 269 | −48% | 504 | 313 | 73 | 57 |
| Credits | 97 | 74 | −24% | 97 | 74 | 73 | 57 |
| 404 | 31 | 26 | −16% | 31 | 26 | 73 | 57 |
| App: connect gate | 58 | 18 | −69% | 58 | 18 | 73 | 57 |
| App: dashboard | 288 | 201 | −30% | 288 | 201 | 75 | 59 |
| App: invite | 252 | 105 | −58% | 252 | 105 | 75 | 59 |
| App: leaderboard | 206 | 164 | −20% | 206 | 164 | 75 | 59 |
| Invitation (`/r`) | 192 | 117 | −39% | 200 | 125 | 73 | 57 |
| **Total** | **2,171** | **1,261** | **−42%** | **2,169** | **1,319** | **663** | **519** |

Marketing pages alone (home, how it works, credits, 404): 1,175 → 656 visible words (−44%). What remains on the dashboard and leaderboard is mostly seeded data (names, channels, dates) and the screen-reader copy of the ranking.

Dictionary copy: **EN 2,888 → 1,920 words (−34%)**, FR 3,240 → 2,156 (−33%). Per section (EN): meta 47 · common 140 → 130 · home 648 → 324 · how 397 → 223 · credits 90 → 67 · app 1,118 → 776 · join 274 → 179 · pricing 167 (internal, unlinked page, left as is).

### Screenshots

- Before: `docs/screenshots/before/en-1440-light-page-home.png`, `docs/screenshots/before/en-1440-light-app-02-dashboard.png`.
- After: `docs/screenshots/en-1440-light-page-home.png`, `docs/screenshots/en-1440-light-app-02-dashboard.png`, and every page and flow step in `docs/screenshots/` (EN 390/1440 light/dark, FR 390/1440 light). File names are unchanged.
