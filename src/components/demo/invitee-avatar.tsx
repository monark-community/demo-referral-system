import { WalletAvatar } from "@/components/ui/wallet"
import { initials } from "@/lib/format"
import { cn } from "@/lib/utils"

/** Wallet identicon when the invitee has a wallet, dashed initials while the invite is only "opened". */
export function InviteeAvatar({ name, address, size = 36, className }: { name: string; address: string | null; size?: number; className?: string }) {
  if (address) return <WalletAvatar address={address} size={size} className={className} />
  return (
    <span
      aria-hidden="true"
      className={cn("flex shrink-0 items-center justify-center rounded-full border border-dashed text-xs font-extrabold text-muted-foreground", className)}
      style={{ width: size, height: size }}
    >
      {initials(name)}
    </span>
  )
}
