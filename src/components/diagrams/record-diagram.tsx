/**
 * Line-art diagram of the referral record: the invitee's wallet accepts with
 * the inviter's code, and the contract writes one entry. Flat orange strokes.
 */
export function RecordDiagram({
  labels,
}: {
  labels: { inviter: string; invitee: string; contract: string; entry: string; accepts: string }
}) {
  return (
    <figure className="rounded-3xl border bg-card p-4 sm:p-6">
      <svg viewBox="0 0 640 260" className="h-auto w-full" role="img" aria-label={`${labels.invitee} → ${labels.contract}: ${labels.entry}`}>
        <defs>
          <marker id="rd-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-primary" />
          </marker>
        </defs>
        {/* Inviter */}
        <circle cx="90" cy="70" r="34" className="fill-card stroke-primary" strokeWidth="2.5" />
        <circle cx="90" cy="70" r="12" className="fill-primary" />
        <text x="90" y="130" textAnchor="middle" className="fill-foreground text-[15px] font-bold">
          {labels.inviter}
        </text>
        {/* Invitee */}
        <circle cx="90" cy="200" r="26" className="fill-card stroke-primary" strokeWidth="2.5" strokeDasharray="0" />
        <circle cx="90" cy="200" r="8" className="fill-foreground" />
        <text x="130" y="232" className="fill-foreground text-[15px] font-bold">
          {labels.invitee}
        </text>
        {/* Code link from inviter to invitee */}
        <path d="M 90 104 L 90 172" className="stroke-muted-foreground" strokeWidth="2" strokeDasharray="4 6" strokeLinecap="round" fill="none" />
        {/* Accept call */}
        <path d="M 118 196 C 220 196, 240 130, 318 130" className="stroke-primary" strokeWidth="2.5" fill="none" strokeLinecap="round" markerEnd="url(#rd-arrow)" />
        <text x="232" y="190" className="fill-muted-foreground text-[13px]">
          {labels.accepts}
        </text>
        {/* Contract */}
        <rect x="326" y="60" width="300" height="140" rx="18" className="fill-secondary stroke-primary" strokeWidth="2.5" />
        <text x="348" y="94" className="fill-foreground text-[15px] font-extrabold">
          {labels.contract}
        </text>
        <line x1="348" y1="110" x2="604" y2="110" className="stroke-border" strokeWidth="2" />
        <rect x="344" y="126" width="264" height="46" rx="10" className="fill-card stroke-border" strokeWidth="1.5" />
        <text x="354" y="154" className="fill-foreground font-mono text-[11px]">
          {labels.entry}
        </text>
      </svg>
    </figure>
  )
}
