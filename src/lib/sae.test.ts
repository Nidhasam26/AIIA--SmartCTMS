import { describe, expect, it } from 'vitest'
import { createSaeDeadlines, getSaeCountdownText, getSaeDeadlineStatus, hasSaeDeadlineExpired, isSaeDeadlineMissed } from './sae'
import { defaultRuleConfig } from '../data/seed'

describe('SAE countdown logic', () => {
  const now = new Date('2026-09-28T12:00:00.000Z')

  it('uses exact countdown threshold boundaries', () => {
    expect(getSaeDeadlineStatus(new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), now)).toBe('amber')
    expect(getSaeDeadlineStatus(new Date(now.getTime() + 24 * 60 * 60 * 1000 + 1).toISOString(), now)).toBe('green')
    expect(getSaeDeadlineStatus(now.toISOString(), now)).toBe('red')
  })

  it('marks due within 24h as amber', () => {
    const dueAt = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
    expect(getSaeDeadlineStatus(dueAt)).toBe('amber')
  })

  it('marks overdue as red', () => {
    const dueAt = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    expect(getSaeDeadlineStatus(dueAt)).toBe('red')
  })

  it('reports deadline miss', () => {
    const dueAt = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    expect(isSaeDeadlineMissed(dueAt)).toBe(true)
    expect(getSaeCountdownText(dueAt)).toBe('Deadline missed')
  })

  it('creates investigator, sponsor, and IEC deadlines from configured intervals', () => {
    const onsetAt = '2026-09-28T12:00:00.000Z'
    expect(createSaeDeadlines(onsetAt, defaultRuleConfig)).toEqual({
      investigator: '2026-09-29T12:00:00.000Z',
      sponsor: '2026-10-12T12:00:00.000Z',
      iec: '2026-10-28T12:00:00.000Z',
    })
  })

  it('signals escalation when any reporting clock expires', () => {
    const now = new Date('2026-09-28T12:00:00.000Z')
    const deadlines = {
      investigator: '2026-09-28T11:59:59.000Z',
      sponsor: '2026-10-12T12:00:00.000Z',
      iec: '2026-10-28T12:00:00.000Z',
    }
    expect(hasSaeDeadlineExpired(deadlines, now)).toBe(true)
    expect(isSaeDeadlineMissed(deadlines.investigator, now)).toBe(true)
  })
})
