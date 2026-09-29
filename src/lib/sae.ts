import { differenceInMinutes } from 'date-fns'
import type { RuleConfig } from '../types'

export type CountdownState = 'green' | 'amber' | 'red'
export type SaeDeadlineKind = 'investigator' | 'sponsor' | 'iec'

export type SaeDeadlines = Record<SaeDeadlineKind, string>

export function createSaeDeadlines(onsetAt: string, config: RuleConfig): SaeDeadlines {
  const onset = new Date(onsetAt).getTime()
  return {
    investigator: new Date(onset + config.investigatorSaeHours * 60 * 60 * 1000).toISOString(),
    sponsor: new Date(onset + config.sponsorSaeDays * 24 * 60 * 60 * 1000).toISOString(),
    iec: new Date(onset + config.ethicsSaeDays * 24 * 60 * 60 * 1000).toISOString(),
  }
}

export function getSaeDeadlines(event: { onsetDate: string; dueAt?: string; deadlines?: SaeDeadlines }, config: RuleConfig) {
  return event.deadlines ?? {
    ...createSaeDeadlines(event.onsetDate, config),
    ...(event.dueAt ? { investigator: event.dueAt } : {}),
  }
}

export function getSaeDeadlineStatus(dueAt: string, now = new Date()): CountdownState {
  const diffMs = new Date(dueAt).getTime() - now.getTime()

  if (diffMs <= 0) return 'red'
  if (diffMs <= 24 * 60 * 60 * 1000) return 'amber'
  return 'green'
}

export function getSaeCountdownText(dueAt: string, now = new Date()) {
  const diffMinutes = differenceInMinutes(new Date(dueAt), now)

  if (diffMinutes <= 0) return 'Deadline missed'

  const hours = Math.floor(diffMinutes / 60)
  const minutes = diffMinutes % 60
  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `${days}d ${hours % 24}h remaining`
  }

  return `${hours}h ${minutes}m remaining`
}

export function isSaeDeadlineMissed(dueAt: string, now = new Date()) {
  return new Date(dueAt).getTime() <= now.getTime()
}

export function hasSaeDeadlineExpired(deadlines: SaeDeadlines, now = new Date()) {
  return Object.values(deadlines).some((dueAt) => isSaeDeadlineMissed(dueAt, now))
}
