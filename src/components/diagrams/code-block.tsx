import { cn } from "@/lib/utils"

/** A dark, scrollable code sample (focusable so keyboard users can scroll it). */
export function CodeBlock({ code, label, className }: { code: string; label?: string; className?: string }) {
  return (
    <pre
      className={cn("overflow-x-auto rounded-2xl border bg-foreground p-5 text-[13px] leading-relaxed text-background", className)}
      tabIndex={0}
      aria-label={label}
    >
      <code translate="no">{code}</code>
    </pre>
  )
}
