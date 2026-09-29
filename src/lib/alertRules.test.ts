import { describe, expect, it } from 'vitest'
import { defaultKpiConfig } from '../data/seed'
import { evaluateEnrolmentAlert, getEnrolmentRag } from './alertRules'

const study = { title: 'AYUSH-01', enrolled: 175, targetSampleSize: 240 }

describe('enrolment alert rules', () => {
  it('classifies the default 73% recruitment rate as amber with explainable evidence', () => {
    const alert = evaluateEnrolmentAlert(study, defaultKpiConfig)
    expect(alert?.rag).toBe('amber')
    expect(alert?.evidence).toContain('175/240 recruited (73%)')
    expect(alert?.description).toContain('below the 80% amber threshold')
  })

  it('escalates to red when the configured red threshold crosses the current rate', () => {
    const config = { ...defaultKpiConfig, enrolmentLagRed: 0.75 }
    const alert = evaluateEnrolmentAlert(study, config)
    expect(alert?.rag).toBe('red')
    expect(alert?.severity).toBe('critical')
    expect(alert?.description).toContain('below the 75% red threshold')
  })

  it('returns no alert when recruitment meets threshold and handles zero target', () => {
    expect(evaluateEnrolmentAlert({ ...study, enrolled: 200 }, defaultKpiConfig)).toBeNull()
    expect(getEnrolmentRag(0, 0, defaultKpiConfig)).toBe('green')
  })
})