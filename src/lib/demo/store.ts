"use client"

import { useSyncExternalStore } from "react"

import { createSeed, type SeedCopy } from "./seed"
import type { DemoSettings, DemoState, TxSummary, WalletState } from "./types"

/**
 * The demo's single source of truth: a tiny external store persisted to
 * localStorage (every access in try/catch). Swapping to a real chain means
 * replacing this module, chain.ts and ops.ts; the UI only uses hooks and actions.
 */

const STORAGE_KEY = "reffinity-demo-v2"

let state: DemoState | null = null
let storageOk = true
const listeners = new Set<() => void>()

function emit() {
  for (const l of listeners) l()
}

function persist() {
  if (!state) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    storageOk = true
  } catch {
    storageOk = false
  }
}

function load(): DemoState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as DemoState
    if (parsed?.version !== 2 || !Array.isArray(parsed.invites) || !Array.isArray(parsed.links) || !Array.isArray(parsed.missions)) return null
    // A reload never resumes a half-finished connection or replays an animation.
    if (parsed.wallet.status === "connecting") parsed.wallet.status = "disconnected"
    parsed.lastEvent = null
    return parsed
  } catch {
    storageOk = false
    return null
  }
}

/** Load saved state, or seed the example program in the visitor's language. Idempotent. */
export function initDemo(copy: SeedCopy) {
  if (state) return
  state = load() ?? createSeed(copy)
  persist()
  emit()
}

/** Back to the seeded example, or to a fresh, unregistered wallet with `empty`. Keeps the connection. */
export function resetDemo(copy: SeedCopy, empty = false) {
  const connected = state?.wallet.status === "connected"
  state = createSeed(copy, { empty })
  if (connected) state.wallet.status = "connected"
  persist()
  emit()
}

export function update(fn: (s: DemoState) => DemoState) {
  if (!state) return
  state = fn(state)
  persist()
  emit()
}

export function setWallet(patch: Partial<WalletState>) {
  update((s) => ({ ...s, wallet: { ...s.wallet, ...patch } }))
}

export function setSettings(patch: Partial<DemoSettings>) {
  update((s) => ({ ...s, settings: { ...s.settings, ...patch } }))
}

export function getDemo() {
  return state
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Current demo state, or null until it has loaded on the client. */
export function useDemo(): DemoState | null {
  return useSyncExternalStore(subscribe, () => state, () => null)
}

export function useStorageOk(): boolean {
  return useSyncExternalStore(subscribe, () => storageOk, () => true)
}

/* ---------------------------------------------------------------------------
 * Simulated wallet prompt: a promise resolved by the WalletPrompt dialog.
 * ------------------------------------------------------------------------ */

export interface PromptRequest {
  summary: TxSummary
  resolve: (approved: boolean) => void
}

let prompt: PromptRequest | null = null
const promptListeners = new Set<() => void>()

export function requestSignature(summary: TxSummary): Promise<boolean> {
  return new Promise((resolve) => {
    prompt?.resolve(false)
    prompt = {
      summary,
      resolve: (ok) => {
        prompt = null
        for (const l of promptListeners) l()
        resolve(ok)
      },
    }
    for (const l of promptListeners) l()
  })
}

export function usePrompt(): PromptRequest | null {
  return useSyncExternalStore(
    (l) => {
      promptListeners.add(l)
      return () => promptListeners.delete(l)
    },
    () => prompt,
    () => null
  )
}
