"use client"

import { CheckIcon, CopyIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

/** Copies text to the clipboard and says "Copied" for a moment; falls back to a clear message if blocked. */
export function CopyButton({
  text,
  label,
  copiedLabel,
  failedLabel,
  iconOnly = false,
  variant = "outline",
  size = "default",
  className,
}: {
  text: string
  label: string
  copiedLabel: string
  failedLabel: string
  iconOnly?: boolean
  variant?: "outline" | "default" | "ghost"
  size?: "default" | "sm" | "icon" | "icon-sm"
  className?: string
}) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      toast.error(failedLabel)
    }
  }
  return (
    <Button type="button" variant={variant} size={size} onClick={() => void copy()} aria-label={iconOnly ? (copied ? copiedLabel : label) : undefined} title={iconOnly ? label : undefined} className={className}>
      {copied ? <CheckIcon aria-hidden="true" /> : <CopyIcon aria-hidden="true" />}
      {iconOnly ? null : <span aria-live="polite">{copied ? copiedLabel : label}</span>}
    </Button>
  )
}
