"use client"

import { useCallback, useRef, useState } from "react"

import { randomHash } from "./ids"
import { getDemo, requestSignature, setSettings } from "./store"
import type { TxError, TxState, TxSummary } from "./types"

/**
 * Simulated chain. A transaction is: wallet prompt (sign or reject) ->
 * pending with a hash for a realistic block time -> confirmed or reverted.
 * A contract rule (self-referral, loop, duplicate) reverts with its reason.
 * "Fail the next transaction" in the demo controls forces one network revert.
 */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function blockTime(): number {
  const slow = getDemo()?.settings.slow
  const [min, max] = slow ? [3000, 6000] : [1200, 2400]
  return Math.round(min + Math.random() * (max - min))
}

async function mine(check?: () => TxError | null): Promise<TxError | null> {
  await sleep(blockTime())
  const demo = getDemo()
  if (demo?.settings.failNext) {
    setSettings({ failNext: false })
    return "reverted"
  }
  return check?.() ?? null
}

/** Estimated network fee shown in the wallet prompt (simulated, in tETH). */
export function estimateFee(): number {
  return 0.00018 + Math.random() * 0.00016
}

export interface RunOptions {
  /** Contract-side validation, evaluated when the block is mined. Returns a revert reason or null. */
  check?: () => TxError | null
}

/**
 * One transaction's lifecycle for a component. `apply` runs only on
 * confirmation and receives the transaction hash.
 */
export function useTx() {
  const [state, setState] = useState<TxState>({ phase: "idle" })
  const busy = useRef(false)

  const run = useCallback(async (summary: TxSummary, apply: (hash: string) => void, options: RunOptions = {}) => {
    if (busy.current) return false
    busy.current = true
    try {
      setState({ phase: "signing" })
      const ok = await requestSignature(summary)
      if (!ok) {
        setState({ phase: "failed", error: "rejected" })
        return false
      }
      const hash = randomHash()
      setState({ phase: "pending", hash })
      const error = await mine(options.check)
      if (error) {
        setState({ phase: "failed", hash, error })
        return false
      }
      apply(hash)
      setState({ phase: "confirmed", hash })
      return true
    } finally {
      busy.current = false
    }
  }, [])

  const reset = useCallback(() => setState({ phase: "idle" }), [])

  return { state, run, reset, busy: state.phase === "signing" || state.phase === "pending" }
}
