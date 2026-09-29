import { describe, expect, it } from 'vitest'
import {
  complianceScore,
  ctriUpdateDue,
  dataEntryTimeliness,
  dropoutRate,
  enrolmentVsTarget,
  ethicsApprovalExpiry,
  openQueryAgeing,
  overdueMonitoringVisits,
  protocolDeviations,
  saeReportingTimeliness,
  screenFailureRate,
  timelineSlippage,
  visitCompliance,
} from './index'

describe('CTMS KPI functions', () => {
  it('computes recruitment ratio', () => {
    expect(enrolmentVsTarget(175, 240)).toBeCloseTo(0.72917, 4)
    expect(enrolmentVsTarget(0, 0)).toBe(0)
  })

  it('computes screen failure rate', () => {
    expect(screenFailureRate(100, 12)).toBe(12)
    expect(screenFailureRate(0, 0)).toBe(0)
  })

  it('computes dropout rate', () => {
    expect(dropoutRate(80, 10)).toBe(12.5)
    expect(dropoutRate(0, 0)).toBe(0)
  })

  it('computes visit compliance', () => {
    expect(visitCompliance(45, 60)).toBe(75)
    expect(visitCompliance(0, 0)).toBe(0)
  })

  it('counts protocol deviations', () => {
    expect(protocolDeviations(5)).toBe(5)
  })

  it('ages open queries', () => {
    expect(openQueryAgeing(3, 14)).toBe(42)
  })

  it('computes data entry timeliness', () => {
    expect(dataEntryTimeliness(3, 20)).toBe(15)
    expect(dataEntryTimeliness(0, 0)).toBe(0)
  })

  it('tracks overdue monitoring visits', () => {
    expect(overdueMonitoringVisits(4)).toBe(4)
  })

  it('tracks ethics expiry', () => {
    expect(ethicsApprovalExpiry(29)).toBe(29)
  })

  it('tracks CTRI update due', () => {
    expect(ctriUpdateDue(12)).toBe(12)
  })

  it('tracks SAE reporting timeliness', () => {
    expect(saeReportingTimeliness(18)).toBe(18)
  })

  it('tracks timeline slippage', () => {
    expect(timelineSlippage(100, 118)).toBe(18)
  })

  it('clamps compliance score', () => {
    expect(complianceScore(120)).toBe(100)
    expect(complianceScore(-10)).toBe(0)
  })
})
