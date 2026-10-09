"use client"

import { DownloadIcon, ExternalLinkIcon, PlusIcon, Trash2Icon } from "lucide-react"
import Link from "next/link"
import { useId, useState } from "react"
import { toast } from "sonner"

import { qrSvg, QrCode } from "@/components/diagrams/qr-code"
import { Button } from "@/components/ui/button"
import { Empty } from "@/components/ui/empty"
import { FieldError } from "@/components/ui/field-error"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { href, intlLocale, SITE_URL } from "@/i18n/config"
import { t } from "@/i18n/t"
import { createLink, deleteLink, validateLinkLabel, type LinkError } from "@/lib/demo/ops"
import { useDemo } from "@/lib/demo/store"
import { formatNumber } from "@/lib/format"

import { useAppCopy } from "./app-provider"
import { CopyButton } from "./copy-button"

/** Flow 2: share the wallet-bound link, as a link, a QR code, tracked channel links or a ready message. */
export function InviteView() {
  const demo = useDemo()
  const { app, locale } = useAppCopy()
  const inv = app.invite
  const [label, setLabel] = useState("")
  const [error, setError] = useState<LinkError | null>(null)
  const [message, setMessage] = useState(0)
  const inputId = useId()
  const errorId = useId()

  if (!demo) return null
  if (!demo.registered) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-display">{inv.title}</h1>
        <p className="text-muted-foreground">{inv.notRegistered}</p>
        <Button asChild>
          <Link href={href(locale, "/app")}>{inv.goDashboard}</Link>
        </Button>
      </div>
    )
  }

  const path = `/${locale}/r/${demo.code}`
  const url = `${SITE_URL}${path}`
  const tagged = (tag: string) => `${url}?via=${tag}`
  const messageText = t(inv.messages[message]?.text ?? "", { url })
  const pct = new Intl.NumberFormat(intlLocale[locale], { style: "percent", maximumFractionDigits: 0 })

  const add = (e: React.FormEvent) => {
    e.preventDefault()
    const err = validateLinkLabel(label, demo.links)
    setError(err)
    if (err) return
    const link = createLink(label)
    setLabel("")
    toast.success(t(inv.added, { label: link.label }))
  }

  const download = () => {
    const blob = new Blob([qrSvg(url)], { type: "image/svg+xml" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `reffinity-${demo.code}.svg`
    a.click()
    window.setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-extrabold tracking-display sm:text-4xl">{inv.title}</h1>

      <div className="grid gap-6 lg:grid-cols-[7fr_5fr] lg:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          {/* Your link */}
          <section aria-labelledby="link-title" className="rounded-3xl border bg-card p-5 sm:p-6">
            <h2 id="link-title" className="text-lg font-bold">
              {inv.yourLink}
            </h2>
            <p className="mt-3 rounded-2xl border bg-muted/50 px-4 py-3 font-mono text-sm break-all" translate="no">
              {url}
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <CopyButton text={url} label={inv.copy} copiedLabel={inv.copied} failedLabel={inv.copyFailed} variant="default" />
              <Button asChild variant="outline">
                <Link href={path}>
                  <ExternalLinkIcon aria-hidden="true" />
                  {inv.preview}
                </Link>
              </Button>
            </div>
          </section>

          {/* Tracked links */}
          <section aria-labelledby="tracked-title" className="rounded-3xl border bg-card">
            <div className="p-5 sm:p-6">
              <h2 id="tracked-title" className="text-lg font-bold">
                {inv.linksTitle}
              </h2>
              <form onSubmit={add} noValidate className="mt-4 flex flex-col gap-2">
                <Label htmlFor={inputId}>
                  {inv.label}
                </Label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    id={inputId}
                    value={label}
                    maxLength={60}
                    placeholder={inv.labelPlaceholder}
                    aria-invalid={!!error}
                    aria-describedby={error ? errorId : undefined}
                    onChange={(e) => {
                      setLabel(e.target.value)
                      if (error) setError(null)
                    }}
                  />
                  <Button type="submit" variant="outline" className="shrink-0">
                    <PlusIcon aria-hidden="true" />
                    {inv.add}
                  </Button>
                </div>
                <FieldError id={errorId}>{error ? inv.errors[error] : null}</FieldError>
              </form>
            </div>
            {demo.links.length === 0 ? (
              <Empty align="start" size="sm" className="mx-5 mb-5 w-auto sm:mx-6 sm:mb-6">
                {inv.linksEmpty}
              </Empty>
            ) : (
              <ul className="divide-y border-t">
                {demo.links.map((l) => (
                  <li key={l.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-6">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold">{l.label}</p>
                      <p className="truncate font-mono text-xs text-muted-foreground" translate="no">
                        ?via={l.tag}
                      </p>
                    </div>
                    <p className="flex flex-wrap gap-x-4 text-sm tabular-nums">
                      <span>{t(inv.opens, { count: formatNumber(l.opens, locale) })}</span>
                      <span className="font-bold">{t(inv.joins, { count: formatNumber(l.joins, locale) })}</span>
                      <span className="text-muted-foreground">{t(inv.conversion, { rate: pct.format(l.opens ? l.joins / l.opens : 0) })}</span>
                    </p>
                    <div className="flex gap-1">
                      <CopyButton
                        text={tagged(l.tag)}
                        label={t(inv.copyTagged, { label: l.label })}
                        copiedLabel={inv.copied}
                        failedLabel={inv.copyFailed}
                        iconOnly
                        variant="ghost"
                        size="icon"
                      />
                      <Button type="button" variant="ghost" size="icon" aria-label={t(inv.remove, { label: l.label })} title={t(inv.remove, { label: l.label })} onClick={() => deleteLink(l.id)}>
                        <Trash2Icon aria-hidden="true" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          {/* QR */}
          <section aria-labelledby="qr-title" className="rounded-3xl border bg-card p-5 sm:p-6">
            <h2 id="qr-title" className="text-lg font-bold">
              {inv.qrTitle}
            </h2>
            <div className="mx-auto mt-4 w-full max-w-60 overflow-hidden rounded-2xl border bg-white p-2">
              <QrCode text={url} label={t(inv.qrAlt, { url })} className="block size-full" />
            </div>
            <Button variant="outline" className="mt-4 w-full" onClick={download}>
              <DownloadIcon aria-hidden="true" />
              {inv.download}
            </Button>
          </section>

          {/* Messages */}
          <section aria-labelledby="msg-title" className="rounded-3xl border bg-card p-5 sm:p-6">
            <h2 id="msg-title" className="text-lg font-bold">
              {inv.messagesTitle}
            </h2>
            <ToggleGroup
              type="single"
              variant="chip"
              size="sm"
              aria-label={inv.messagesTitle}
              value={String(message)}
              onValueChange={(v) => v && setMessage(Number(v))}
              className="mt-4 gap-1.5"
            >
              {inv.messages.map((m, i) => (
                <ToggleGroupItem key={m.label} value={String(i)}>
                  {m.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <div className="mt-3 rounded-2xl border p-4">
              <p className="text-sm break-words">{messageText}</p>
              <CopyButton text={messageText} label={inv.copyMessage} copiedLabel={inv.copied} failedLabel={inv.copyFailed} size="sm" className="mt-3" />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
