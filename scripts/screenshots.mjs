// Visual check of every page and key flow with Playwright.
// Usage: pnpm build && pnpm start -p 3140   (in another terminal)
//        pnpm screenshots                   (BASE_URL defaults to http://localhost:3140)
// Output: docs/screenshots/<locale>-<width>-<theme>-<name>.png
// ONLY=<substring> limits the run to matching variant names (e.g. ONLY=en-390-light).
import { mkdir } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const BASE = process.env.BASE_URL ?? "http://localhost:3140"
const OUT = fileURLToPath(new URL("../docs/screenshots/", import.meta.url))
const ONLY = process.env.ONLY

const sizes = { 390: { width: 390, height: 844 }, 1440: { width: 1440, height: 900 } }
const variants = []
for (const w of [390, 1440]) for (const theme of ["light", "dark"]) variants.push({ locale: "en", w, theme, full: true })
// French: home page and one key flow (the invitation), both widths, light.
for (const w of [390, 1440]) variants.push({ locale: "fr", w, theme: "light", full: false })

const T = {
  en: { connect: "Connect demo wallet", confirm: "Confirm", reject: "Reject", accept: "Accept invitation", dashboard: "Your referrals", menu: "Open menu" },
  fr: { connect: "Connecter le portefeuille de démo", confirm: "Confirmer", reject: "Refuser", accept: "Accepter l'invitation", dashboard: "Vos parrainages", menu: "Ouvrir le menu" },
}

async function newPage(browser, { locale, w, theme }) {
  const context = await browser.newContext({
    viewport: sizes[w],
    colorScheme: theme,
    locale: locale === "fr" ? "fr-CA" : "en-CA",
    reducedMotion: "no-preference",
  })
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: BASE })
  await context.addInitScript((t) => {
    try {
      window.localStorage.setItem("theme", t)
    } catch {}
  }, theme)
  const page = await context.newPage()
  page.on("pageerror", (e) => console.log("  ! page error:", e.message))
  return { context, page }
}

const tag = (v) => `${v.locale}-${v.w}-${v.theme}`
const shot = async (page, v, name, fullPage = false) => {
  if (fullPage) {
    // Scroll through once so lazy-loaded images are in the full-page capture.
    await page.evaluate(async () => {
      const y = window.scrollY
      for (let p = 0; p < document.body.scrollHeight; p += 600) {
        window.scrollTo(0, p)
        await new Promise((r) => setTimeout(r, 60))
      }
      window.scrollTo(0, y)
    })
    await page.waitForTimeout(400)
  }
  await page.waitForTimeout(250)
  await page.screenshot({ path: `${OUT}${tag(v)}-${name}.png`, fullPage })
  console.log("  ✓", `${tag(v)}-${name}`)
}
const isMobile = (v) => v.w < 768
const prompt = (page, title) => page.getByRole("dialog", { name: title })

async function connect(page, v, capture) {
  const t = T[v.locale]
  await page.goto(`${BASE}/${v.locale}/app`, { waitUntil: "networkidle" })
  const btn = page.getByRole("main").getByRole("button", { name: t.connect })
  await btn.waitFor()
  if (capture) await shot(page, v, "app-01-gate", true)
  await btn.click()
  await page.getByRole("dialog").waitFor()
  if (capture) await shot(page, v, "flow1-connect-prompt")
  await page.getByRole("dialog").getByRole("button", { name: t.confirm }).click()
  await page.getByRole("heading", { level: 1, name: t.dashboard, exact: true }).waitFor({ timeout: 10000 })
}

async function marketing(page, v) {
  const pages = v.full
    ? [
        ["home", ""],
        ["how-it-works", "/how-it-works"],
        ["developers", "/developers"],
        ["credits", "/credits"],
        ["pricing", "/pricing"],
        ["404", "/this-page-does-not-exist"],
      ]
    : [["home", ""]]
  for (const [name, path] of pages) {
    await page.goto(`${BASE}/${v.locale}${path}`, { waitUntil: "networkidle" })
    await page.waitForTimeout(name === "home" ? 3600 : 400)
    await shot(page, v, `page-${name}`, true)
  }
  if (isMobile(v) && v.full) {
    await page.goto(`${BASE}/${v.locale}`, { waitUntil: "networkidle" })
    await page.getByRole("button", { name: T[v.locale].menu }).click()
    await page.getByRole("dialog").waitFor()
    await page.waitForTimeout(700) // let the sheet finish sliding in
    await shot(page, v, "page-mobile-menu")
  }
}

async function invitation(page, v) {
  const t = T[v.locale]
  // Flow 3: a friend opens the link and accepts.
  await page.goto(`${BASE}/${v.locale}/r/amara-7k2q?via=poster`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: t.accept }).waitFor()
  await shot(page, v, "flow3-invitation", true)
  await page.getByRole("button", { name: t.accept }).click()
  await page.getByRole("dialog").waitFor()
  await shot(page, v, "flow3-accept-prompt")
  await page.getByRole("dialog").getByRole("button", { name: t.confirm }).click()
  await page.waitForTimeout(500)
  await shot(page, v, "flow3-pending")
  await page.waitForSelector("text=/You're in|Vous faites partie/", { timeout: 10000 })
  await page.waitForTimeout(300)
  await shot(page, v, "flow3-joined", true)
}

async function appFlows(page, v) {
  // Flow 1: connect (gate + prompt captured inside connect()).
  await connect(page, v, true)
  await page.waitForTimeout(400)
  await shot(page, v, "app-02-dashboard", true)

  // Flow 1 failure: reject the sign-in.
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("reffinity-demo-v2"))
    s.wallet.status = "disconnected"
    localStorage.setItem("reffinity-demo-v2", JSON.stringify(s))
  })
  await page.reload({ waitUntil: "networkidle" })
  await page.getByRole("main").getByRole("button", { name: "Connect demo wallet" }).click()
  await page.getByRole("dialog").getByRole("button", { name: "Reject" }).click()
  await page.getByText("You declined the sign-in request").waitFor()
  await shot(page, v, "flow1-connect-rejected")
  await page.getByRole("main").getByRole("button", { name: "Connect demo wallet" }).click()
  await page.getByRole("dialog").getByRole("button", { name: "Confirm" }).click()
  await page.getByRole("heading", { level: 1, name: "Your referrals", exact: true }).waitFor({ timeout: 10000 })

  // Flow 2: share the link.
  await page.goto(`${BASE}/${v.locale}/app/invite`, { waitUntil: "networkidle" })
  await page.getByRole("heading", { level: 1, name: "Share your link" }).waitFor()
  await page.getByRole("button", { name: "Copy link" }).click()
  await shot(page, v, "flow2-invite", true)
  await page.getByRole("button", { name: "Add link" }).click()
  await page.getByText("Give this link a name.").waitFor()
  await page.getByText("Give this link a name.").scrollIntoViewIfNeeded()
  await shot(page, v, "flow2-link-error")
  await page.getByLabel("Channel name").fill("Café Campus flyer")
  await page.getByRole("button", { name: "Add link" }).click()
  await page.getByText("?via=cafe-campus-flyer").waitFor()
  await page.getByText("?via=cafe-campus-flyer").scrollIntoViewIfNeeded()
  await shot(page, v, "flow2-link-added")

  // Flow 3: the invitation, then the rule outcomes.
  await invitation(page, v)
  await page.getByRole("button", { name: "Try another person" }).click()
  await page.getByRole("radio", { name: /Amara herself/ }).click()
  await page.getByRole("button", { name: "Accept invitation" }).click()
  await page.getByRole("dialog").getByRole("button", { name: "Confirm" }).click()
  await page.getByText("A wallet can't refer itself. Nothing was recorded").waitFor({ timeout: 10000 })
  await page.getByText("A wallet can't refer itself. Nothing was recorded").scrollIntoViewIfNeeded()
  await shot(page, v, "flow3-self-rejected")
  await page.getByRole("radio", { name: /sign-up burst/ }).click()
  await page.getByRole("button", { name: "Accept invitation" }).click()
  await page.getByRole("dialog").getByRole("button", { name: "Confirm" }).click()
  await page.getByText("Recorded, but held.").waitFor({ timeout: 10000 })
  await page.getByText("Recorded, but held.").scrollIntoViewIfNeeded()
  await shot(page, v, "flow3-held")
  await page.getByRole("button", { name: "Try another person" }).click()
  await page.getByRole("button", { name: "Accept invitation" }).click()
  await page.getByRole("dialog").getByRole("button", { name: "Confirm" }).click()
  await page.getByText("You're in.").waitFor({ timeout: 10000 })
  await page.getByRole("link", { name: "See it on Amara's dashboard" }).click()
  await page.getByRole("heading", { level: 1, name: "Your referrals", exact: true }).waitFor()
  await page.getByRole("heading", { name: "Your network" }).scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)
  await shot(page, v, "flow3-new-edge")

  // Flow 4: Sofia reaches her first workshop.
  await page.waitForTimeout(2200)
  await page.getByRole("button", { name: "Open Sofia" }).click()
  await page.getByRole("button", { name: "Confirm workshop check-in" }).waitFor()
  await page.waitForTimeout(700) // let the sheet finish sliding in
  await shot(page, v, "flow4-sheet")
  await page.getByRole("button", { name: "Confirm workshop check-in" }).click()
  await prompt(page, "Confirm milestone").getByRole("button", { name: "Confirm" }).click()
  await page.waitForTimeout(400)
  await shot(page, v, "flow4-pending")
  await page.getByRole("button", { name: "Confirm bounty completion" }).waitFor({ timeout: 10000 })
  await page.waitForTimeout(300)
  await shot(page, v, "flow4-confirmed")
  await page.keyboard.press("Escape")
  await page.getByRole("heading", { name: "Your network" }).scrollIntoViewIfNeeded()
  await page.waitForTimeout(600)
  await shot(page, v, "flow4-reward-travel")
  // Failure: force the next transaction to revert.
  await page.getByRole("button", { name: "Demo controls" }).click()
  await page.getByLabel("Fail the next transaction").click()
  await page.keyboard.press("Escape")
  await page.getByRole("button", { name: "Open Karim" }).click()
  await page.getByRole("button", { name: "Confirm bounty completion" }).click()
  await prompt(page, "Confirm milestone").getByRole("button", { name: "Confirm" }).click()
  await page.getByText("The transaction failed on the network").waitFor({ timeout: 10000 })
  await shot(page, v, "flow4-failed")
  await page.keyboard.press("Escape")

  // Flow 5: claim rewards.
  await page.getByRole("heading", { name: "Rewards" }).scrollIntoViewIfNeeded()
  await page.getByRole("button", { name: /^Claim / }).click()
  await prompt(page, "Claim rewards").waitFor()
  await shot(page, v, "flow5-claim-prompt")
  await prompt(page, "Claim rewards").getByRole("button", { name: "Confirm" }).click()
  await page.waitForTimeout(400)
  await page.getByRole("heading", { name: "Rewards" }).scrollIntoViewIfNeeded()
  await shot(page, v, "flow5-claim-pending")
  await page.getByText("Nothing to claim yet").waitFor({ timeout: 10000 })
  await page.getByRole("heading", { name: "Rewards" }).scrollIntoViewIfNeeded()
  await shot(page, v, "flow5-claimed")

  // Leaderboard: verified vs raw clicks.
  await page.goto(`${BASE}/${v.locale}/app/leaderboard`, { waitUntil: "networkidle" })
  await page.getByRole("heading", { level: 1, name: "Leaderboard" }).waitFor()
  await shot(page, v, "app-03-leaderboard", true)
  await page.getByRole("radio", { name: "Raw clicks" }).click()
  await page.waitForTimeout(400)
  await shot(page, v, "app-04-leaderboard-clicks", true)

  // Flow 6: complete a mission (the reward layer, from a participant's side).
  await page.goto(`${BASE}/${v.locale}/app/missions`, { waitUntil: "networkidle" })
  await page.getByRole("heading", { level: 1, name: "Missions" }).waitFor()
  await page.waitForTimeout(300)
  await shot(page, v, "app-07-missions", true)
  await page.getByRole("button", { name: "Simulate: GovChain reports it done" }).click()
  await prompt(page, "Report mission completion").waitFor()
  await shot(page, v, "flow6-mission-prompt")
  await prompt(page, "Report mission completion").getByRole("button", { name: "Confirm" }).click()
  await page.getByText(/Completed\. Badge · First vote is yours\./).waitFor({ timeout: 10000 })
  await page.getByText(/Completed\. Badge · First vote is yours\./).scrollIntoViewIfNeeded()
  await shot(page, v, "flow6-mission-done")

  // Flow 7: publish a mission as an app, then watch the trust gate pay a real person and refuse a farmed wallet.
  await page.getByRole("button", { name: "Create a mission" }).click()
  await page.getByRole("dialog", { name: "Create a mission" }).waitFor()
  await page.waitForTimeout(700) // let the sheet finish sliding in
  await page.getByRole("button", { name: /and publish$/ }).click()
  await page.getByText("Describe the task.").waitFor()
  await shot(page, v, "flow7-create-error")
  await page.getByLabel("Your app").fill("Campus Hack Club")
  await page.getByLabel("Mission", { exact: true }).fill("Ship your first pull request")
  await shot(page, v, "flow7-create-sheet")
  await page.getByRole("button", { name: "Lock 100.00 tUSDC and publish" }).click()
  await prompt(page, "Publish mission").getByRole("button", { name: "Confirm" }).click()
  await page.getByText("\"Ship your first pull request\" is live.").waitFor({ timeout: 10000 })
  await page.waitForTimeout(400)
  await shot(page, v, "flow7-published")
  await page.getByRole("button", { name: "A farmed wallet (trust 18)" }).click()
  await prompt(page, "Report mission completion").getByRole("button", { name: "Confirm" }).click()
  await page.getByText(/Refused: trust 18 is below 50/).waitFor({ timeout: 10000 })
  await page.getByText(/Refused: trust 18 is below 50/).scrollIntoViewIfNeeded()
  await shot(page, v, "flow7-refused")
  await page.getByRole("button", { name: "Léa (trust 91)" }).click()
  await prompt(page, "Report mission completion").getByRole("button", { name: "Confirm" }).click()
  // The amount and symbol are joined by a non-breaking space (formatReward), hence \s.
  await page.getByText(/was paid 5\.00\stUSDC/).waitFor({ timeout: 10000 })
  await page.getByText(/was paid 5\.00\stUSDC/).scrollIntoViewIfNeeded()
  await shot(page, v, "flow7-paid")

  // Fresh start: an unregistered wallet joins the program.
  await page.goto(`${BASE}/${v.locale}/app`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: "Demo controls" }).click()
  await shot(page, v, "app-05-demo-controls")
  await page.getByRole("button", { name: "Start from scratch" }).click()
  await page.getByRole("button", { name: "Yes, reset" }).click()
  await page.getByRole("button", { name: "Join the program" }).waitFor()
  await shot(page, v, "flow1-register", true)
  await page.getByRole("button", { name: "Join the program" }).click()
  await page.getByRole("dialog").getByRole("button", { name: "Confirm" }).click()
  await page.getByRole("heading", { level: 1, name: "Your referrals", exact: true }).waitFor({ timeout: 10000 })
  await page.waitForTimeout(300)
  await shot(page, v, "app-06-empty", true)
}

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()
for (const v of variants) {
  if (ONLY && !tag(v).includes(ONLY)) continue
  console.log(tag(v))
  const { context, page } = await newPage(browser, v)
  try {
    await marketing(page, v)
    if (v.full) await appFlows(page, v)
    else await invitation(page, v)
  } catch (e) {
    console.log("  ✗", e.message.split("\n")[0])
    await page.screenshot({ path: `${OUT}${tag(v)}-ERROR.png`, fullPage: true })
  }
  await context.close()
}
await browser.close()
