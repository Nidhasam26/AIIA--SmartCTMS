import { useMemo } from 'react'
import type { RoleName } from '../types'

const rolePermissions: Record<RoleName, string[]> = {
  'Principal Investigator': ['study:view', 'study:edit', 'participant:view', 'sae:submit'],
  'Study Coordinator': ['study:view', 'participant:view', 'query:manage'],
  'Monitor (CRA)': ['monitor:view', 'visit:view', 'site:view'],
  'Ethics Committee (IEC)': ['ethics:view', 'sae:review', 'approval:view'],
  'PV Officer': ['sae:view', 'sae:review', 'signal:view'],
  DSMB: ['safety:view', 'aggregate:view'],
  Leadership: ['portfolio:view', 'risk:view', 'compliance:view'],
  Regulator: ['study:view', 'audit:view'],
  'System Admin': ['admin:view', 'config:edit', 'notification:manage'],
}

export function hasPermission(role: string, action: string) {
  return rolePermissions[role as RoleName]?.includes(action) ?? false
}

export function usePermission(role: string, action: string) {
  return useMemo(() => hasPermission(role, action), [role, action])
}
