import type { KPIConfig, RAG } from '../types'

export interface EnrolmentAlert {
  rag: Exclude<RAG, 'green'>
  severity: 'warning' | 'critical'
  title: string
  description: string
  evidence: string
  suggestedAction: string
}

export function getEnrolmentRag(enrolled: number, target: number, config: KPIConfig): RAG {
  if (target <= 0) return 'green'
  const ratio = enrolled / target
  if (ratio < config.enrolmentLagRed) return 'red'
  if (ratio < config.enrolmentLagAmber) return 'amber'
  return 'green'
}

export function evaluateEnrolmentAlert(
  study: { enrolled: number; targetSampleSize: number; title: string },
  config: KPIConfig,
): EnrolmentAlert | null {
  const rag = getEnrolmentRag(study.enrolled, study.targetSampleSize, config)
  if (rag === 'green') return null

  const percentage = study.targetSampleSize > 0
    ? Math.round((study.enrolled / study.targetSampleSize) * 100)
    : 0
  const threshold = Math.round((rag === 'red' ? config.enrolmentLagRed : config.enrolmentLagAmber) * 100)

  return {
    rag,
    severity: rag === 'red' ? 'critical' : 'warning',
    title: `Enrolment lag ${rag}`,
    description: `${study.title} is at ${percentage}% of target, below the ${threshold}% ${rag} threshold.`,
    evidence: `${study.enrolled}/${study.targetSampleSize} recruited (${percentage}%). Threshold: ${threshold}%.`,
    suggestedAction: 'Review site activation, screening conversion, and the recruitment recovery plan.',
  }
}