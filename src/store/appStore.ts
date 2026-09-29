import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { addDays } from 'date-fns'
import { amendments, defaultKpiConfig, defaultRuleConfig, protocolDeviations, studies, studyMilestones, users, alerts, auditEntries, participants, adverseEvents, queries, consentRecords, ecrfRecords, randomisationRecords, monitoringReports, ctriFilingPackages } from '../data/seed'
import type { AdverseEvent, Alert, Amendment, AuditEntry, ProtocolDeviation, Study, StudyMilestone, User, KPIConfig, RuleConfig, EthicsApproval, ECRFRecord, RandomisationRecord, MonitoringReport, CtriFilingPackage } from '../types'
import { evaluateEnrolmentAlert, getEnrolmentRag } from '../lib/alertRules'
import { createAuditHash } from '../lib/audit'

interface AppState {
  users: User[]
  studies: Study[]
  alerts: Alert[]
  auditEntries: AuditEntry[]
  participants: typeof participants
  adverseEvents: AdverseEvent[]
  queries: typeof queries
  consentRecords: typeof consentRecords
  ecrfRecords: ECRFRecord[]
  randomisationRecords: RandomisationRecord[]
  monitoringReports: MonitoringReport[]
  ctriFilingPackages: CtriFilingPackage[]
  ethicsApprovals: EthicsApproval[]
  protocolDeviations: ProtocolDeviation[]
  amendments: Amendment[]
  studyMilestones: StudyMilestone[]
  activeRole: string
  activeUserId: string
  kpiConfig: KPIConfig
  ruleConfig: RuleConfig
  studyChangeReasons: Record<string, string>
  setActiveRole: (role: string) => void
  setActiveUser: (userId: string) => void
  expireSession: () => void
  addAlert: (alert: Alert) => void
  acknowledgeAlert: (id: string) => void
  clearAlertByRule: (rule: string, studyId?: string) => void
  renewEthicsApproval: (studyId: string, renewalLetter: string, reason: string) => Promise<void>
  updateConsentRecord: (id: string, changes: Partial<(typeof consentRecords)[number]>, reason: string) => Promise<void>
  addAdverseEvent: (event: AdverseEvent, reason: string) => Promise<void>
  updateAdverseEvent: (id: string, changes: Partial<AdverseEvent>, reason: string) => Promise<void>
  saveEcrfRecord: (record: ECRFRecord, reason: string) => Promise<void>
  enrollAndRandomiseSubject: (record: RandomisationRecord, reason: string) => Promise<void>
  saveMonitoringReport: (report: MonitoringReport, reason: string) => Promise<void>
  saveCtriPackage: (pkg: CtriFilingPackage, reason: string) => Promise<void>
  updateAuditEntry: (id: string, changes: Partial<AuditEntry>) => void
  setKpiConfig: (config: KPIConfig, reason: string) => Promise<void>
  updateStudy: (studyId: string, changes: Partial<Study>, reason: string) => Promise<void>
  setRuleConfig: (config: RuleConfig) => void
  resetDemoData: () => void
}

const initialEthicsApprovals: EthicsApproval[] = [
  { studyId: 'study-1', expiresAt: addDays(new Date(), 29).toISOString(), renewalLetter: null, renewedAt: null },
]

const personaSessionKey = 'aiia-persona-session'

function readPersonaSession() {
  try {
    const saved = sessionStorage.getItem(personaSessionKey)
    if (!saved) return { activeRole: 'Principal Investigator', activeUserId: 'u1' }
    const persona = JSON.parse(saved) as { activeRole?: string; activeUserId?: string; loggedOut?: boolean }
    if (persona.loggedOut) return { activeRole: 'Principal Investigator', activeUserId: '' }
    if (persona.activeRole && persona.activeUserId) return { activeRole: persona.activeRole, activeUserId: persona.activeUserId }
  } catch {
    return { activeRole: 'Principal Investigator', activeUserId: 'u1' }
  }
  return { activeRole: 'Principal Investigator', activeUserId: 'u1' }
}

function writePersonaSession(activeRole: string, activeUserId: string) {
  try {
    sessionStorage.setItem(personaSessionKey, JSON.stringify({ activeRole, activeUserId }))
  } catch {
    return
  }
}

const initialPersona = readPersonaSession()

export const useAppStore = create<AppState>()(persist((set, get) => {
  let auditQueue = Promise.resolve()

  const commitAuditedWrite = (
    change: { entity: string; action: string; oldValue: (state: AppState) => string; newValue: (state: AppState) => string; reason: string },
    mutate: (state: AppState) => Partial<AppState>,
  ) => {
    const operation = auditQueue.then(async () => {
      const snapshot = get()
      const entries = snapshot.auditEntries ?? []
      if (!change.reason.trim()) throw new Error('An audit reason is required for this change.')
      const entryWithoutHash = {
        id: `AUD-${String(entries.length + 1).padStart(4, '0')}`,
        timestamp: new Date().toISOString(),
        actor: snapshot.activeRole,
        entity: change.entity,
        action: change.action,
        oldValue: change.oldValue(snapshot),
        newValue: change.newValue(snapshot),
        reason: change.reason.trim(),
        prevHash: entries.at(-1)?.hash ?? 'genesis',
      }
      const entry: AuditEntry = { ...entryWithoutHash, hash: await createAuditHash(entryWithoutHash) }
      set((state) => ({ ...mutate(snapshot), auditEntries: [...(state.auditEntries ?? []), entry] }))
    })
    auditQueue = operation.then(() => undefined, () => undefined)
    return operation
  }

  return ({
  users,
  studies,
  alerts,
  auditEntries,
  participants,
  adverseEvents,
  queries,
  consentRecords,
  ecrfRecords,
  randomisationRecords,
  monitoringReports,
  ctriFilingPackages,
  ethicsApprovals: initialEthicsApprovals,
  protocolDeviations,
  amendments,
  studyMilestones,
  ...initialPersona,
  kpiConfig: defaultKpiConfig,
  ruleConfig: defaultRuleConfig,
  studyChangeReasons: {},
  setActiveRole: (role) => {
    const user = users.find((entry) => entry.role === role)
    if (!user) return
    writePersonaSession(role, user.id)
    set({ activeRole: role, activeUserId: user.id })
  },
  setActiveUser: (userId) => {
    const user = users.find((entry) => entry.id === userId)
    if (user) {
      writePersonaSession(user.role, userId)
      set({ activeUserId: userId, activeRole: user.role })
    }
  },
  expireSession: () => {
    try {
      sessionStorage.setItem(personaSessionKey, JSON.stringify({ loggedOut: true }))
    } catch {
      // Keep the in-memory expiry even when browser storage is unavailable.
    }
    set({ activeUserId: '' })
  },
  addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts] })),
  acknowledgeAlert: (id) => set((state) => ({
    alerts: state.alerts.map((alert) => alert.id === id ? { ...alert, acknowledged: true } : alert),
  })),
  clearAlertByRule: (rule, studyId) => set((state) => ({
    alerts: state.alerts.filter((alert) => alert.rule !== rule || (studyId && alert.studyId !== studyId)),
  })),
  renewEthicsApproval: (studyId, renewalLetter, reason) => commitAuditedWrite({
    entity: studyId,
    action: 'Renew IEC approval',
    oldValue: (state) => JSON.stringify(state.ethicsApprovals.find((approval) => approval.studyId === studyId) ?? null),
    newValue: (state) => JSON.stringify({ ...state.ethicsApprovals.find((approval) => approval.studyId === studyId), renewalLetter }),
    reason,
  }, (state) => ({
    ethicsApprovals: state.ethicsApprovals.map((approval) => approval.studyId === studyId
      ? { ...approval, expiresAt: addDays(new Date(), 365).toISOString(), renewalLetter, renewedAt: new Date().toISOString() }
      : approval),
    alerts: state.alerts.filter((alert) => !(alert.rule === 'ethics_expiry' && alert.studyId === studyId)),
  })),
  updateConsentRecord: (id, changes, reason) => commitAuditedWrite({
    entity: id,
    action: 'Update consent record',
    oldValue: (state) => JSON.stringify(state.consentRecords.find((record) => record.id === id) ?? null),
    newValue: (state) => JSON.stringify({ ...state.consentRecords.find((record) => record.id === id), ...changes }),
    reason,
  }, (state) => ({ consentRecords: state.consentRecords.map((record) => record.id === id ? { ...record, ...changes } : record) })),
  addAdverseEvent: (event, reason) => commitAuditedWrite({
    entity: event.studyId,
    action: 'File adverse event',
    oldValue: () => 'N/A',
    newValue: () => JSON.stringify(event),
    reason,
  }, (state) => ({ adverseEvents: [event, ...state.adverseEvents] })),
  updateAdverseEvent: (id, changes, reason) => commitAuditedWrite({
    entity: id,
    action: 'Update adverse event',
    oldValue: (state) => JSON.stringify(state.adverseEvents.find((event) => event.id === id) ?? null),
    newValue: (state) => JSON.stringify({ ...state.adverseEvents.find((event) => event.id === id), ...changes }),
    reason,
  }, (state) => ({ adverseEvents: state.adverseEvents.map((event) => event.id === id ? { ...event, ...changes } : event) })),
  saveEcrfRecord: (record, reason) => commitAuditedWrite({
    entity: `${record.studyId}:${record.subjectId}:${record.visitType}`,
    action: `Save eCRF ${record.visitType} record`,
    oldValue: (state) => JSON.stringify(state.ecrfRecords.find((r) => r.id === record.id) ?? null),
    newValue: () => JSON.stringify(record),
    reason,
  }, (state) => {
    const existingIndex = state.ecrfRecords.findIndex((r) => r.id === record.id)
    if (existingIndex >= 0) {
      const updated = [...state.ecrfRecords]
      updated[existingIndex] = record
      return { ecrfRecords: updated }
    }
    return { ecrfRecords: [record, ...state.ecrfRecords] }
  }),
  enrollAndRandomiseSubject: (record, reason) => commitAuditedWrite({
    entity: `${record.studyId}:${record.subjectId}`,
    action: `Enroll and allocate to ${record.allocatedArm}`,
    oldValue: () => 'N/A',
    newValue: () => JSON.stringify(record),
    reason,
  }, (state) => {
    const nextStudies = state.studies.map((study) => {
      if (study.id !== record.studyId) return study
      const nextEnrolled = study.enrolled + 1
      return {
        ...study,
        enrolled: nextEnrolled,
        rag: getEnrolmentRag(nextEnrolled, study.targetSampleSize, state.kpiConfig),
      }
    })
    return {
      randomisationRecords: [record, ...state.randomisationRecords],
      studies: nextStudies,
    }
  }),
  saveMonitoringReport: (report, reason) => commitAuditedWrite({
    entity: `${report.studyId}:${report.siteId}:${report.visitType}`,
    action: `Save CRA monitoring report (${report.status})`,
    oldValue: (state) => JSON.stringify(state.monitoringReports.find((r) => r.id === report.id) ?? null),
    newValue: () => JSON.stringify(report),
    reason,
  }, (state) => {
    const existingIndex = state.monitoringReports.findIndex((r) => r.id === report.id)
    if (existingIndex >= 0) {
      const updated = [...state.monitoringReports]
      updated[existingIndex] = report
      return { monitoringReports: updated }
    }
    return { monitoringReports: [report, ...state.monitoringReports] }
  }),
  saveCtriPackage: (pkg, reason) => commitAuditedWrite({
    entity: `${pkg.studyId}:${pkg.ctriRegNumber}`,
    action: `Save CTRI filing package (${pkg.packageStatus})`,
    oldValue: (state) => JSON.stringify(state.ctriFilingPackages.find((p) => p.id === pkg.id) ?? null),
    newValue: () => JSON.stringify(pkg),
    reason,
  }, (state) => {
    const existingIndex = state.ctriFilingPackages.findIndex((p) => p.id === pkg.id)
    if (existingIndex >= 0) {
      const updated = [...state.ctriFilingPackages]
      updated[existingIndex] = pkg
      return { ctriFilingPackages: updated }
    }
    return { ctriFilingPackages: [pkg, ...state.ctriFilingPackages] }
  }),
  updateAuditEntry: (id, changes) => set((state) => ({
    auditEntries: state.auditEntries.map((entry) => entry.id === id ? { ...entry, ...changes } : entry),
  })),
  setKpiConfig: (config, reason) => commitAuditedWrite({
    entity: 'portfolio-kpi-config',
    action: 'Update KPI thresholds',
    oldValue: (state) => JSON.stringify(state.kpiConfig),
    newValue: () => JSON.stringify(config),
    reason,
  }, (state) => {
    const nextStudies = state.studies.map((study) => ({
      ...study,
      rag: getEnrolmentRag(study.enrolled, study.targetSampleSize, config),
    }))
    const enrolmentAlerts = nextStudies.flatMap((study) => {
      const evaluation = evaluateEnrolmentAlert(study, config)
      return evaluation ? [{
        id: `ENROL-${study.id}`,
        studyId: study.id,
        title: evaluation.title,
        description: evaluation.description,
        severity: evaluation.severity,
        acknowledged: false,
        rule: 'enrolment_lag',
        evidence: evaluation.evidence,
        suggestedAction: evaluation.suggestedAction,
        createdAt: new Date().toISOString(),
        role: 'Principal Investigator' as const,
      }] : []
    })
    return {
      kpiConfig: config,
      studies: nextStudies,
      alerts: [...state.alerts.filter((alert) => alert.rule !== 'enrolment_lag'), ...enrolmentAlerts],
    }
  }),
  updateStudy: (studyId, changes, reason) => commitAuditedWrite({
    entity: studyId,
    action: 'Update study record',
    oldValue: (state) => JSON.stringify(state.studies.find((study) => study.id === studyId) ?? null),
    newValue: (state) => JSON.stringify({ ...state.studies.find((study) => study.id === studyId), ...changes }),
    reason,
  }, (state) => ({
    studies: state.studies.map((study) => study.id === studyId ? { ...study, ...changes } : study),
    studyChangeReasons: { ...state.studyChangeReasons, [studyId]: reason.trim() },
  })),
  setRuleConfig: (config) => set({ ruleConfig: config }),
  resetDemoData: () => {
    writePersonaSession('Principal Investigator', 'u1')
    set({
      studies,
      alerts,
      auditEntries,
      participants,
      adverseEvents,
      queries,
      consentRecords,
      ecrfRecords,
      randomisationRecords,
      monitoringReports,
      ctriFilingPackages,
      ethicsApprovals: initialEthicsApprovals,
      protocolDeviations,
      amendments,
      studyMilestones,
      activeRole: 'Principal Investigator',
      activeUserId: 'u1',
      kpiConfig: defaultKpiConfig,
      ruleConfig: defaultRuleConfig,
      studyChangeReasons: {},
    })
  },
  })
}, {
  name: 'aiia-smartctms-state',
  version: 2,
  partialize: (state) => {
    const { activeRole: _activeRole, activeUserId: _activeUserId, ...dataState } = state
    return dataState
  },
  migrate: (persistedState) => {
    const { activeRole: _activeRole, activeUserId: _activeUserId, ...dataState } = persistedState as AppState
    return dataState as AppState
  },
}))
