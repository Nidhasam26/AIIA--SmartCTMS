import { addDays, subDays } from 'date-fns'
import { adverseEvents, alerts, auditEntries, consentRecords, defaultKpiConfig, defaultRuleConfig, participants, queries, studies, users } from '../data/seed'
import type { AdverseEvent, Alert, AuditEntry, ConsentRecord, DataQuery, KPIConfig, Participant, RuleConfig, Study, User } from '../types'

const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))

const demoState = {
  users,
  studies,
  alerts,
  auditEntries,
  participants,
  adverseEvents,
  queries,
  consentRecords,
  kpiConfig: defaultKpiConfig,
  ruleConfig: defaultRuleConfig,
}

export async function getStudies(): Promise<Study[]> {
  await delay(220)
  return JSON.parse(localStorage.getItem('aiia-demo-studies') ?? 'null') ?? demoState.studies
}

export async function getUsers(): Promise<User[]> {
  await delay(180)
  return JSON.parse(localStorage.getItem('aiia-demo-users') ?? 'null') ?? demoState.users
}

export async function getAlerts(): Promise<Alert[]> {
  await delay(200)
  return JSON.parse(localStorage.getItem('aiia-demo-alerts') ?? 'null') ?? demoState.alerts
}

export async function getParticipants(): Promise<Participant[]> {
  await delay(240)
  return JSON.parse(localStorage.getItem('aiia-demo-participants') ?? 'null') ?? demoState.participants
}

export async function getAdverseEvents(): Promise<AdverseEvent[]> {
  await delay(240)
  return JSON.parse(localStorage.getItem('aiia-demo-aes') ?? 'null') ?? demoState.adverseEvents
}

export async function getQueries(): Promise<DataQuery[]> {
  await delay(200)
  return JSON.parse(localStorage.getItem('aiia-demo-queries') ?? 'null') ?? demoState.queries
}

export async function getConsentRecords(): Promise<ConsentRecord[]> {
  await delay(180)
  return JSON.parse(localStorage.getItem('aiia-demo-consents') ?? 'null') ?? demoState.consentRecords
}

export async function getAuditEntries(): Promise<AuditEntry[]> {
  await delay(180)
  return JSON.parse(localStorage.getItem('aiia-demo-audit') ?? 'null') ?? demoState.auditEntries
}

export async function getKpiConfig(): Promise<KPIConfig> {
  await delay(160)
  return JSON.parse(localStorage.getItem('aiia-demo-kpi') ?? 'null') ?? demoState.kpiConfig
}

export async function getRuleConfig(): Promise<RuleConfig> {
  await delay(160)
  return JSON.parse(localStorage.getItem('aiia-demo-rule') ?? 'null') ?? demoState.ruleConfig
}

export function persistDemoData() {
  localStorage.setItem('aiia-demo-studies', JSON.stringify(studies))
  localStorage.setItem('aiia-demo-users', JSON.stringify(users))
  localStorage.setItem('aiia-demo-alerts', JSON.stringify(alerts))
  localStorage.setItem('aiia-demo-audit', JSON.stringify(auditEntries))
  localStorage.setItem('aiia-demo-participants', JSON.stringify(participants))
  localStorage.setItem('aiia-demo-aes', JSON.stringify(adverseEvents))
  localStorage.setItem('aiia-demo-queries', JSON.stringify(queries))
  localStorage.setItem('aiia-demo-consents', JSON.stringify(consentRecords))
  localStorage.setItem('aiia-demo-kpi', JSON.stringify(defaultKpiConfig))
  localStorage.setItem('aiia-demo-rule', JSON.stringify(defaultRuleConfig))
}

export function resetDemoData() {
  localStorage.removeItem('aiia-demo-studies')
  localStorage.removeItem('aiia-demo-users')
  localStorage.removeItem('aiia-demo-alerts')
  localStorage.removeItem('aiia-demo-audit')
  localStorage.removeItem('aiia-demo-participants')
  localStorage.removeItem('aiia-demo-aes')
  localStorage.removeItem('aiia-demo-queries')
  localStorage.removeItem('aiia-demo-consents')
  localStorage.removeItem('aiia-demo-kpi')
  localStorage.removeItem('aiia-demo-rule')
  persistDemoData()
}

export const studyLookupSeed = {
  id: 'study-1',
  title: 'AYUSH-01: Polyherbal Anti-Inflammatory in Knee Osteoarthritis',
  ctriNumber: 'CTRI/2025/01/001234',
  status: 'At Risk',
  dueInDays: 29,
  lastUpdate: subDays(new Date(), 5).toISOString(),
  nextMilestone: addDays(new Date(), 18).toISOString(),
}
