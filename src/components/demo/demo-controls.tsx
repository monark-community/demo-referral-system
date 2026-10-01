"use client"

import { RotateCcwIcon, SlidersHorizontalIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { NETWORK_NAME } from "@/lib/demo/program"
import { resetDemo, setSettings, useDemo } from "@/lib/demo/store"

import { useAppCopy } from "./app-provider"

/**
 * The app bar's one demo element: a pill showing the (simulated) network that
 * opens the demo controls: network speed, forced failure, and "Reset demo"
 * (example or from scratch).
 */
export function DemoControls() {
  const demo = useDemo()
  const { app, seed } = useAppCopy()
  const c = app.controls
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState<null | "example" | "empty">(null)
  if (!demo) return null

  const doReset = (empty: boolean) => {
    resetDemo(seed, empty)
    setConfirming(null)
    setOpen(false)
    toast.success(empty ? c.emptyDone : c.resetDone)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) setConfirming(null)
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" title={c.open} className="shrink-0 px-2.5 sm:px-3">
          <span className="size-2 rounded-full bg-success" aria-hidden="true" />
          <span className="hidden sm:inline">{NETWORK_NAME}</span>
          <span aria-hidden="true" className="hidden h-4 w-px bg-border sm:block" />
          <SlidersHorizontalIcon aria-hidden="true" />
          <span className="sr-only lg:not-sr-only">{c.open}</span>
          {demo.settings.failNext || demo.settings.slow ? <span className="size-2 rounded-full bg-warning" aria-hidden="true" /> : null}
        </Button>
      </DialogTrigger>
      <DialogContent closeLabel={app.close} className="sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl font-extrabold">{c.title}</DialogTitle>
          <DialogDescription className="sr-only">{c.resetHint}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col divide-y rounded-2xl border">
          <div className="flex items-start justify-between gap-4 p-4">
            <div>
              <Label htmlFor="ctl-slow" className="text-sm font-bold">
                {c.slow}
              </Label>
              <p className="mt-1 text-xs text-muted-foreground">{c.slowHint}</p>
            </div>
            <Switch id="ctl-slow" checked={demo.settings.slow} onCheckedChange={(v) => setSettings({ slow: v })} />
          </div>
          <div className="flex items-start justify-between gap-4 p-4">
            <div>
              <Label htmlFor="ctl-fail" className="text-sm font-bold">
                {c.failNext}
              </Label>
              <p className="mt-1 text-xs text-muted-foreground">{c.failNextHint}</p>
            </div>
            <Switch id="ctl-fail" checked={demo.settings.failNext} onCheckedChange={(v) => setSettings({ failNext: v })} />
          </div>
        </div>
        <div className="rounded-2xl border p-4">
          {!confirming ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-bold">{c.reset}</p>
              <p className="text-xs text-muted-foreground">{c.resetHint}</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="destructive" size="sm" onClick={() => setConfirming("example")}>
                  <RotateCcwIcon aria-hidden="true" />
                  {c.resetExample}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setConfirming("empty")}>
                  {c.resetEmpty}
                </Button>
              </div>
            </div>
          ) : (
            <div role="alertdialog" aria-labelledby="reset-q" aria-describedby="reset-d" className="flex flex-col gap-3">
              <p id="reset-q" className="font-bold">
                {c.resetConfirm}
              </p>
              <p id="reset-d" className="text-xs text-muted-foreground">
                {c.resetConfirmBody}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="destructive" size="sm" autoFocus onClick={() => doReset(confirming === "empty")}>
                  {c.resetDo}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirming(null)}>
                  {c.cancel}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
