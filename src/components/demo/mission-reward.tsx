"use client"

import { AwardIcon, CoinsIcon, SparklesIcon } from "lucide-react"

import type { Dictionary } from "@/i18n"
import type { Locale } from "@/i18n/config"
import { t } from "@/i18n/t"
import type { MissionReward } from "@/lib/demo/types"
import { formatReward } from "@/lib/format"
import { cn } from "@/lib/utils"

export const REWARD_ICONS = { token: CoinsIcon, points: SparklesIcon, badge: AwardIcon } as const

/** "10.00 tUSDC" · "40 points" · "Badge · First vote" */
export function rewardText(reward: MissionReward, locale: Locale, copy: Dictionary["app"]["missions"]): string {
  if (reward.kind === "token") return formatReward(reward.amount, locale)
  if (reward.kind === "points") return t(copy.reward.points, { amount: reward.amount })
  return t(copy.reward.badge, { name: reward.badge ?? "" })
}

/** The reward as a tinted chip: what a mission pays, at a glance. */
export function RewardChip({ reward, locale, copy, className }: { reward: MissionReward; locale: Locale; copy: Dictionary["app"]["missions"]; className?: string }) {
  const Icon = REWARD_ICONS[reward.kind]
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full bg-primary/12 px-2.5 py-1 text-xs font-bold text-primary-ink", className)}>
      <Icon className="size-3.5" aria-hidden="true" />
      {rewardText(reward, locale, copy)}
    </span>
  )
}
