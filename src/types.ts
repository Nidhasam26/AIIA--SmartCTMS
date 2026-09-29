export type RoleName =
  | 'Principal Investigator'
  | 'Study Coordinator'
  | 'Monitor (CRA)'
  | 'Ethics Committee (IEC)'
  | 'PV Officer'
  | 'DSMB'
  | 'Leadership'
  | 'Regulator'
  | 'System Admin'

export type RAG = 'green' | 'amber' | 'red'
export type StudyStatus = 'Active' | 'Planned' | 'Paused' | 'Closed' | 'At Risk'
export type AlertSeverity = 'info' | 'warning' | 'critical'

export interface User {
  id: string
  name: string
  role: RoleName
  email: string
  studies: string[]
  permissions: string[]
}

export interface Site {
  id: string
  name: string
  location: string
  status: 'Active' | 'Pending' | 'Paused'
  activatedAt?: string
  enrolled: number
}

export interface Participant {
  id: string
  studyId: string
  siteId: string
  status: 'Screening' | 'Enrolled' | 'Completed' | 'Withdrawn' | 'Screen Failure'
  arm: 'Treatment' | 'Control' | 'Observation' | 'Unknown'
  consentDate?: string
}

export interface AdverseEvent {
  id: string
  studyId: string
  subjectId: string
  reporter: string
  event: string
  seriousness: 'Serious' | 'Non-serious'
  onsetDate: string
  outcome: string
  causality: string
  coded?: boolean
  status: 'Open' | 'Follow-up' | 'Resolved'
  requiredRecipients: string[]
  dueAt?: string
  deadlines?: {
    investigator: string
    sponsor: string
    iec: string
  }
  escalated: boolean
}

export interface EthicsApproval {
  studyId: string
  expiresAt: string
  renewalLetter: string | null
  renewedAt: string | null
}

export interface ProtocolDeviation {
  id: string
  studyId: string
  subjectId: string
  description: string
  severity: 'Minor' | 'Major'
  status: 'Open' | 'Closed'
  recordedAt: string
}

export interface Amendment {
  id: string
  studyId: string
  title: string
  status: 'Pending IEC review' | 'Approved' | 'Returned'
  submittedAt: string
}

export interface StudyMilestone {
  id: string
  studyId: string
  title: string
  dueAt: string
  completedAt?: string
}

export interface Study {
  id: string
  title: string
  ctriNumber: string
  phase: string
  type: string
  design: string
  sponsor: string
  pi: string
  department: string
  status: StudyStatus
  rag: RAG
  targetSampleSize: number
  enrolled: number
  sites: Site[]
  startDate: string
  endDate: string
  interventionType: string
  formulation: string
  dosageForm: string
  duration: string
  prakritiAssessment: string
}

export interface AlertRule {
  id: string
  name: string
  metric: string
  threshold: number
  severity: AlertSeverity
  enabled: boolean
}

export interface Alert {
  id: string
  studyId: string
  title: string
  description: string
  severity: AlertSeverity
  acknowledged: boolean
  snoozedUntil?: string
  rule: string
  evidence: string
  suggestedAction: string
  createdAt: string
  role: RoleName
}

export interface AuditEntry {
  id: string
  timestamp: string
  actor: string
  entity: string
  action: string
  oldValue: string
  newValue: string
  reason: string
  prevHash: string
  hash: string
}

export interface KPIConfig {
  enrolmentLagAmber: number
  enrolmentLagRed: number
  screenFailureWarn: number
  dropoutWarn: number
  queryAgeingThreshold: number
  dataTimelinessDays: number
  ethicsExpiryDays: number
  ctriDueDays: number
  saeDeadlineHours: number
}

export interface RuleConfig {
  investigatorSaeHours: number
  sponsorSaeDays: number
  ethicsSaeDays: number
  ndctRuleNote: string
}

export interface DataQuery {
  id: string
  studyId: string
  subjectId: string
  status: 'Open' | 'Answered' | 'Closed'
  ageDays: number
  field: string
}

export interface ConsentRecord {
  id: string
  studyId: string
  subjectId: string
  version: string
  signedOn: string
  method: string
  reConsentDue?: string
  withdrawn: boolean
}

export interface BaselineVisitData {
  age: number
  gender: 'Male' | 'Female' | 'Other'
  heightCm: number
  weightKg: number
  systolicBp: number
  diastolicBp: number
  pulseRate: number
  temperatureF: number
  medicalHistory: string
  inclusionCriteriaMet: boolean
  baselineScore: number
}

export interface PrakritiAssessmentData {
  bodyFrame: 'Thin/Light (Vata)' | 'Medium/Muscular (Pitta)' | 'Broad/Solid (Kapha)'
  skinType: 'Dry/Rough (Vata)' | 'Warm/Oily (Pitta)' | 'Smooth/Cool/Thick (Kapha)'
  agniType: 'Irregular/Vishamagni (Vata)' | 'Sharp/Tikshnagni (Pitta)' | 'Slow/Mandagni (Kapha)'
  sleepPattern: 'Light/Interrupted (Vata)' | 'Moderate (Pitta)' | 'Deep/Heavy (Kapha)'
  dominantDosha: 'Vata' | 'Pitta' | 'Kapha' | 'Vata-Pitta' | 'Pitta-Kapha' | 'Vata-Kapha' | 'Tridoshic'
  vataScore: number
  pittaScore: number
  kaphaScore: number
}

export interface FollowUpVisitData {
  visitNumber: number
  visitDate: string
  systolicBp: number
  diastolicBp: number
  pulseRate: number
  treatmentCompliancePercent: number
  dosageAdministered: string
  clinicalScore: number
  adverseEventsReported: boolean
  aeNotes: string
  investigatorNotes: string
}

export interface ECRFRecord {
  id: string
  studyId: string
  subjectId: string
  visitType: 'Baseline' | 'Prakriti' | 'Follow-up'
  visitTitle: string
  recordedBy: string
  recordedAt: string
  status: 'Draft' | 'Completed' | 'Locked'
  baseline?: BaselineVisitData
  prakriti?: PrakritiAssessmentData
  followUp?: FollowUpVisitData
}

export type TrialArmType = 'Ayurvedic Intervention' | 'Standard of Care' | 'Placebo Control'

export interface RandomisationRecord {
  id: string
  studyId: string
  subjectId: string
  siteId: string
  allocatedArm: TrialArmType
  stratificationPrakriti: string
  stratificationSeverity: 'Mild' | 'Moderate' | 'Severe'
  randomisedAt: string
  randomisedBy: string
  blockNumber: number
  kitCode: string
}

export interface MonitoringFinding {
  id: string
  category: 'Informed Consent' | 'Source Data Verification' | 'Drug Accountability' | 'Safety / AE Reporting' | 'Regulatory Binder'
  description: string
  severity: 'Critical' | 'Major' | 'Minor'
  status: 'Open' | 'Resolved'
  assignedTo: string
}

export interface MonitoringReport {
  id: string
  studyId: string
  siteId: string
  craName: string
  visitType: 'Site Initiation Visit (SIV)' | 'Interim Monitoring Visit (IMV)' | 'Close-Out Visit (COV)'
  visitDate: string
  sdvProgressPercent: number
  consentVerifiedCount: number
  drugAccountabilityVerified: boolean
  findings: MonitoringFinding[]
  craSummary: string
  status: 'Draft' | 'Submitted' | 'Approved'
}

export interface CtriFilingPackage {
  id: string
  studyId: string
  ctriRegNumber: string
  clinicalTrialType: 'Interventional' | 'Observational'
  phase: string
  scientificTitle: string
  publicTitle: string
  ethicsClearanceNumber: string
  sponsorName: string
  principalInvestigator: string
  primaryOutcome: string
  secondaryOutcomes: string[]
  targetSampleSize: number
  ayurvedicInterventionDetails: {
    formulationName: string
    botanicalIngredients: string
    dosageAndAdministration: string
    prakritiInclusion: string
  }
  ndct2019Compliance: {
    rule12Compliant: boolean
    gcpAsuCompliant: boolean
    iecLetterAttached: boolean
    insuranceCoverageValid: boolean
  }
  generatedAt: string
  packageStatus: 'Draft' | 'Verified' | 'Ready for Submission'
}


