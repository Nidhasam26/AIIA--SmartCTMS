import { beforeEach, describe, expect, it } from 'vitest'
import { defaultKpiConfig } from '../data/seed'
import { useAppStore } from './appStore'
import { verifyAuditChain } from '../lib/audit'

describe('application threshold state', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    useAppStore.getState().resetDemoData()
  })

  it('recomputes study RAG and explainable enrolment alerts after thresholds change', async () => {
    const current = useAppStore.getState()
    expect(current.studies.find((study) => study.id === 'study-1')?.rag).toBe('amber')

    await current.setKpiConfig({ ...defaultKpiConfig, enrolmentLagRed: 0.75 }, 'Raise red threshold for demonstration')

    const next = useAppStore.getState()
    expect(next.studies.find((study) => study.id === 'study-1')?.rag).toBe('red')
    expect(next.alerts.find((alert) => alert.id === 'ENROL-study-1')).toMatchObject({
      severity: 'critical',
      evidence: '175/240 recruited (73%). Threshold: 75%.',
    })
  })

  it('persists edits and resets demo records back to seed values', async () => {
    await useAppStore.getState().updateStudy('study-1', { title: 'Reload persistence probe' }, 'Testing local persistence')
    const stored = JSON.parse(localStorage.getItem('aiia-smartctms-state') ?? '{}')
    expect(stored.state.studies.find((study: { id: string }) => study.id === 'study-1').title).toBe('Reload persistence probe')

    useAppStore.getState().resetDemoData()
    expect(useAppStore.getState().studies.find((study) => study.id === 'study-1')?.title).toContain('AYUSH-01')
  })

  it('stores the active persona in sessionStorage rather than localStorage', () => {
    useAppStore.getState().setActiveRole('PV Officer')
    expect(JSON.parse(sessionStorage.getItem('aiia-persona-session') ?? '{}')).toEqual({
      activeRole: 'PV Officer',
      activeUserId: 'u5',
    })
    const localState = JSON.parse(localStorage.getItem('aiia-smartctms-state') ?? '{}').state
    expect(localState).not.toHaveProperty('activeRole')
    expect(localState).not.toHaveProperty('activeUserId')
  })

  it('renews IEC approval and clears only that study expiry alert', async () => {
    await useAppStore.getState().renewEthicsApproval('study-1', 'demo-renewal-letter.pdf', 'IEC approval renewed')
    const state = useAppStore.getState()
    expect(state.ethicsApprovals.find((approval) => approval.studyId === 'study-1')).toMatchObject({ renewalLetter: 'demo-renewal-letter.pdf' })
    expect(state.alerts.some((alert) => alert.rule === 'ethics_expiry' && alert.studyId === 'study-1')).toBe(false)
  })

  it('appends a valid hash-chained audit record for every clinical write type', async () => {
    const store = useAppStore.getState()
    const sae = {
      ...store.adverseEvents[0],
      id: 'AE-AUDIT',
      event: 'Audit coverage event',
    }
    await store.updateStudy('study-1', { title: 'Audited study title' }, 'Approved title correction')
    await store.addAdverseEvent(sae, 'Investigator received report')
    await store.renewEthicsApproval('study-1', 'renewal.pdf', 'IEC continuation approved')
    await store.updateConsentRecord('C-1001', { withdrawn: true }, 'Participant requested withdrawal')
    await store.setKpiConfig({ ...defaultKpiConfig, enrolmentLagAmber: 0.82 }, 'Updated threshold policy')

    const entries = useAppStore.getState().auditEntries
    expect(await verifyAuditChain(entries)).toEqual({ valid: true, firstTamperedIndex: -1 })
    expect(entries.slice(1).map((entry) => entry.action)).toEqual([
      'Update study record',
      'File adverse event',
      'Renew IEC approval',
      'Update consent record',
      'Update KPI thresholds',
    ])
    expect(entries.slice(1).every((entry) => entry.actor && entry.timestamp && entry.oldValue && entry.newValue && entry.reason)).toBe(true)
    expect(entries[1]?.oldValue).toContain('AYUSH-01')
    expect(entries[1]?.newValue).toContain('Audited study title')
    expect(entries[2]?.newValue).toContain('AE-AUDIT')
    expect(entries[4]?.reason).toBe('Participant requested withdrawal')
  })
})