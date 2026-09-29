"use client"

import { CheckIcon } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useTx } from "@/lib/demo/chain"
import { applyRegister } from "@/lib/demo/ops"

import { useAppCopy } from "./app-provider"
import { TxFeedback } from "./tx-feedback"

/** Fresh start: the wallet joins the program in one transaction, which creates its referral link. */
export function RegisterCard() {
  const { app } = useAppCopy()
  const tx = useTx()
  const r = app.register

  const register = () =>
    void tx.run({ title: app.summaries.register, rows: [{ label: app.summaries.registerRow, value: app.program }] }, (hash) => {
      applyRegister(hash)
      toast.success(r.done)
    })

  return (
    <section aria-labelledby="register-title" className="mx-auto w-full max-w-xl rounded-3xl border bg-card p-6 sm:p-8">
      <Image src="/brand/monark-mark.svg" alt="" width={44} height={44} unoptimized className="size-11" />
      <p className="eyebrow mt-5 text-primary-ink">{app.program}</p>
      <h1 id="register-title" className="mt-2 text-3xl font-extrabold tracking-display">
        {r.title}
      </h1>
      <p className="mt-3 text-muted-foreground">{r.body}</p>
      <ul className="mt-5 flex flex-col gap-2 text-sm">
        {r.points.map((p) => (
          <li key={p} className="flex items-center gap-2">
            <CheckIcon className="size-4 text-success" aria-hidden="true" />
            {p}
          </li>
        ))}
      </ul>
      <Button size="lg" className="mt-7 w-full sm:w-auto" onClick={register} disabled={tx.busy}>
        {r.button}
      </Button>
      <TxFeedback state={tx.state} pendingLabel={r.pending} className="mt-4" onRetry={register} onDismiss={tx.reset} />
    </section>
  )
}
