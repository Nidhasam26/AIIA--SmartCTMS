export type KPIContext = {
  enrolled: number
  target: number
  screenFailureRate: number
  dropoutRate: number
  visitCompliance: number
  protocolDeviationCount: number
  openQueryAgeingDays: number
  dataEntryTimelinessDays: number
  monitoringOverdueCount: number
  ethicsExpiryDays: number
  ctriUpdateDueDays: number
  saeReportingTimelinessHours: number
  timelineSlippageDays: number
  complianceScore: number
}

export const enrolmentVsTarget = (enrolled: number, target: number) => (target ? enrolled / target : 0)
export const screenFailureRate = (screened: number, failures: number) => (screened ? (failures / screened) * 100 : 0)
export const dropoutRate = (enrolled: number, dropouts: number) => (enrolled ? (dropouts / enrolled) * 100 : 0)
export const visitCompliance = (completed: number, expected: number) => (expected ? (completed / expected) * 100 : 0)
export const protocolDeviations = (count: number) => count
export const openQueryAgeing = (count: number, maxAgeDays: number) => count * maxAgeDays
export const dataEntryTimeliness = (lateForms: number, totalForms: number) => (totalForms ? (lateForms / totalForms) * 100 : 0)
export const overdueMonitoringVisits = (count: number) => count
export const ethicsApprovalExpiry = (daysRemaining: number) => daysRemaining
export const ctriUpdateDue = (daysRemaining: number) => daysRemaining
export const saeReportingTimeliness = (hoursLate: number) => hoursLate
export const timelineSlippage = (plannedDays: number, actualDays: number) => actualDays - plannedDays
export const complianceScore = (score: number) => Math.max(0, Math.min(100, score))

export const kpis = {
  enrolmentVsTarget,
  screenFailureRate,
  dropoutRate,
  visitCompliance,
  protocolDeviations,
  openQueryAgeing,
  dataEntryTimeliness,
  overdueMonitoringVisits,
  ethicsApprovalExpiry,
  ctriUpdateDue,
  saeReportingTimeliness,
  timelineSlippage,
  complianceScore,
}
