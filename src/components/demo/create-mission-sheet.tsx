"use client"

import { ChevronRightIcon } from "lucide-react"
import { useId, useState, type ReactNode } from "react"

import { CodeBlock } from "@/components/diagrams/code-block"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { t } from "@/i18n/t"
import { useTx } from "@/lib/demo/chain"
import { applyPublish, draftBudget, type MissionDraft, type MissionDraftError } from "@/lib/demo/ops"
import { MISSION_LIMITS, REWARD_DECIMALS, REWARD_SYMBOL } from "@/lib/demo/program"
import { getDemo, useDemo } from "@/lib/demo/store"
import type { RewardKind, VerifyMethod } from "@/lib/demo/types"
import { formatReward, formatUnits } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { REWARD_ICONS } from "./mission-reward"
import { TxFeedback } from "./tx-feedback"

interface FormState {
  app: string
  title: string
  verify: VerifyMethod
  kind: RewardKind
  amount: string
  badge: string
  spots: string
  minTrust: number
}

const INITIAL: FormState = { app: "", title: "", verify: "api", kind: "token", amount: "5", badge: "", spots: "20", minTrust: 50 }

type Field = "app" | "title" | "amount" | "badge" | "spots"
const FIELD_OF: Record<MissionDraftError, Field> = {
  appRequired: "app",
  titleRequired: "title",
  titleTooLong: "title",
  amount: "amount",
  badgeRequired: "badge",
  spots: "spots",
  balance: "spots",
}

const wholeNumber = (v: string) => (/^\d+$/.test(v.trim()) ? Number(v.trim()) : NaN)

function toDraft(f: FormState): MissionDraft {
  const amount = wholeNumber(f.amount)
  return {
    app: f.app,
    title: f.title,
    verify: f.verify,
    reward: {
      kind: f.kind,
      amount: f.kind === "token" ? String((Number.isFinite(amount) ? amount : 0) * 10 ** REWARD_DECIMALS) : f.kind === "points" ? String(Number.isFinite(amount) ? amount : 0) : "1",
      badge: f.kind === "badge" ? f.badge.trim() : undefined,
    },
    spots: wholeNumber(f.spots),
    minTrust: f.minTrust,
  }
}

function validate(f: FormState, balance: bigint): MissionDraftError[] {
  const errors: MissionDraftError[] = []
  if (!f.app.trim()) errors.push("appRequired")
  if (!f.title.trim()) errors.push("titleRequired")
  else if (f.title.trim().length > MISSION_LIMITS.titleMax) errors.push("titleTooLong")
  if (f.kind !== "badge") {
    const n = wholeNumber(f.amount)
    const max = f.kind === "token" ? MISSION_LIMITS.tokenMax : MISSION_LIMITS.pointsMax
    if (!(n >= 1 && n <= max)) errors.push("amount")
  } else if (!f.badge.trim()) errors.push("badgeRequired")
  const spots = wholeNumber(f.spots)
  if (!(spots >= 1 && spots <= MISSION_LIMITS.spotsMax)) errors.push("spots")
  else if (draftBudget(toDraft(f)) > balance) errors.push("balance")
  return errors
}

/** The request body an app would send: the same fields as the form (see /developers). */
function apiPreview(f: FormState): string {
  const d = toDraft(f)
  const reward =
    d.reward.kind === "token"
      ? { type: "token", token: REWARD_SYMBOL, amount: formatUnits(d.reward.amount, REWARD_DECIMALS, "en") }
      : d.reward.kind === "points"
        ? { type: "points", amount: Number(d.reward.amount) }
        : { type: "badge", name: d.reward.badge ?? "" }
  const body = {
    app: d.app.trim() || undefined,
    title: d.title.trim() || undefined,
    verify: { type: d.verify },
    reward,
    spots: Number.isFinite(d.spots) ? d.spots : undefined,
    minTrust: d.minTrust,
  }
  return `POST /v1/missions\n\n${JSON.stringify(body, null, 2)}`
}

/**
 * "Create a mission": the reward layer from a builder's side, with the escrow
 * and the trust gate. The parent remounts it (key) on each open, for a clean form.
 */
export function CreateMissionSheet({ open, onOpenChange, onPublished }: { open: boolean; onOpenChange: (open: boolean) => void; onPublished: (id: string, title: string) => void }) {
  const demo = useDemo()
  const { app, locale } = useAppCopy()
  const c = app.missions.form
  const tx = useTx()
  const id = useId()
  const [form, setForm] = useState<FormState>(INITIAL)
  const [errors, setErrors] = useState<MissionDraftError[]>([])

  if (!demo) return null
  const balance = BigInt(demo.balance)
  const budget = draftBudget(toDraft(form))
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors.length) setErrors([])
  }

  const errorFor = (field: Field): string | null => {
    const e = errors.find((x) => FIELD_OF[x] === field)
    if (!e) return null
    return e === "balance" ? t(c.errors.balance, { budget: formatReward(budget, locale), balance: formatReward(balance, locale) }) : c.errors[e]
  }

  const submit = () => {
    const found = validate(form, BigInt(getDemo()?.balance ?? "0"))
    setErrors(found)
    if (found.length) {
      document.getElementById(`${id}-${FIELD_OF[found[0]!]}`)?.focus()
      return
    }
    const draft = toDraft(form)
    const rows = [
      { label: app.summaries.publish, value: draft.title.trim() },
      { label: app.summaries.publishSpots, value: String(draft.spots) },
      { label: app.summaries.publishTrust, value: draft.minTrust > 0 ? String(draft.minTrust) : c.trustNone },
    ]
    if (budget > 0n) rows.push({ label: app.summaries.publishEscrow, value: formatReward(budget, locale) })
    void tx.run({ title: app.summaries.publish, rows }, (hash) => {
      const mission = applyPublish(draft, hash)
      onPublished(mission.id, mission.title)
    })
  }

  const field = (name: Field, label: string, input: ReactNode, hint?: ReactNode) => {
    const err = errorFor(name)
    return (
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${id}-${name}`} className="text-sm font-bold">
          {label}
        </Label>
        {input}
        {err ? (
          <p id={`${id}-${name}-err`} role="alert" className="text-sm text-destructive">
            {err}
          </p>
        ) : hint ? (
          <p className="text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>
    )
  }
  const inputProps = (name: Field) => ({
    id: `${id}-${name}`,
    "aria-invalid": errorFor(name) ? true : undefined,
    "aria-describedby": errorFor(name) ? `${id}-${name}-err` : undefined,
  })

  return (
    <Sheet open={open} onOpenChange={(o) => !tx.busy && onOpenChange(o)}>
      <SheetContent side="right" closeLabel={app.close} className="w-full gap-0 overflow-y-auto p-0 sm:max-w-lg">
        <SheetHeader className="gap-1 border-b px-5 pt-5 pb-4 text-left sm:px-6">
          <SheetTitle className="pr-10 text-xl font-extrabold">{c.title}</SheetTitle>
          <SheetDescription>{c.description}</SheetDescription>
        </SheetHeader>

        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
          className="flex flex-col gap-5 px-5 py-5 sm:px-6"
        >
          {field("app", c.app, <Input {...inputProps("app")} value={form.app} maxLength={MISSION_LIMITS.appMax} placeholder={c.appPlaceholder} onChange={(e) => set("app", e.target.value)} />)}
          {field("title", c.mission, <Input {...inputProps("title")} value={form.title} placeholder={c.missionPlaceholder} onChange={(e) => set("title", e.target.value)} />)}

          <Segmented
            legend={c.verify}
            name={`${id}-verify`}
            value={form.verify}
            onChange={(v) => set("verify", v)}
            options={(["onchain", "api", "organizer"] as const).map((v) => ({ value: v, label: app.missions.verify[v] }))}
          />

          <Segmented
            legend={c.reward}
            name={`${id}-kind`}
            value={form.kind}
            onChange={(v) => set("kind", v)}
            options={(["token", "points", "badge"] as const).map((v) => {
              const Icon = REWARD_ICONS[v]
              return { value: v, label: c.kinds[v], icon: <Icon className="size-4" aria-hidden="true" /> }
            })}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            {form.kind === "badge"
              ? field("badge", c.badge, <Input {...inputProps("badge")} value={form.badge} maxLength={MISSION_LIMITS.badgeMax} placeholder={c.badgePlaceholder} onChange={(e) => set("badge", e.target.value)} />)
              : field(
                  "amount",
                  form.kind === "token" ? c.amountToken : c.amountPoints,
                  <Input {...inputProps("amount")} value={form.amount} inputMode="numeric" onChange={(e) => set("amount", e.target.value)} />
                )}
            {field("spots", c.spots, <Input {...inputProps("spots")} value={form.spots} inputMode="numeric" onChange={(e) => set("spots", e.target.value)} />)}
          </div>

          <Segmented
            legend={c.minTrust}
            hint={c.trustHint}
            name={`${id}-trust`}
            value={String(form.minTrust)}
            onChange={(v) => set("minTrust", Number(v))}
            options={MISSION_LIMITS.trustOptions.map((v) => ({ value: String(v), label: v === 0 ? c.trustNone : String(v) }))}
          />

          <div className="rounded-2xl border bg-secondary/50 p-4 text-sm">
            {form.kind === "token" ? (
              <p className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="font-bold">{c.budget}</span>
                <span className="font-mono font-bold tabular-nums">{formatReward(budget, locale)}</span>
              </p>
            ) : (
              <p className="font-semibold">{c.noBudget}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">{t(c.balance, { amount: formatReward(balance, locale) })}</p>
          </div>

          {/* Context on demand: the API call behind the form. */}
          <details className="group">
            <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 text-sm font-bold text-primary-ink underline underline-offset-4 [&::-webkit-details-marker]:hidden">
              <ChevronRightIcon className="size-4 transition-transform duration-150 group-open:rotate-90" aria-hidden="true" />
              {c.request}
            </summary>
            <CodeBlock code={apiPreview(form)} label={c.request} className="mt-2 text-xs" />
          </details>

          <TxFeedback state={tx.state} pendingLabel={c.pending} onRetry={submit} onDismiss={tx.reset} />

          <div className="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={tx.busy}>
              {c.cancel}
            </Button>
            <Button type="submit" disabled={tx.busy}>
              {form.kind === "token" && budget > 0n ? t(c.submitToken, { amount: formatReward(budget, locale) }) : c.submit}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

/** A row of pill radios (native inputs, so arrow keys and screen readers work as expected). */
function Segmented<V extends string>({
  legend,
  hint,
  name,
  value,
  onChange,
  options,
}: {
  legend: string
  hint?: string
  name: string
  value: V
  onChange: (value: V) => void
  options: { value: V; label: string; icon?: ReactNode }[]
}) {
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 text-sm font-bold">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o.value}
            className={cn(
              "inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold transition-colors duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
              value === o.value ? "border-primary bg-primary/12 text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} className="sr-only" />
            {o.icon}
            {o.label}
          </label>
        ))}
      </div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </fieldset>
  )
}
