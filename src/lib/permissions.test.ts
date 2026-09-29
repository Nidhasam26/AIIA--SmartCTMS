import { describe, expect, it } from 'vitest'
import { hasPermission } from './permissions'

const matrix: Record<string, Record<string, boolean>> = {
  'Principal Investigator': { 'study:view': true, 'study:edit': true, 'participant:view': true, 'sae:submit': true, 'audit:view': false, 'admin:view': false },
  'Study Coordinator': { 'study:view': true, 'study:edit': false, 'participant:view': true, 'query:manage': true, 'sae:submit': false, 'admin:view': false },
  'Monitor (CRA)': { 'monitor:view': true, 'visit:view': true, 'site:view': true, 'study:edit': false, 'sae:submit': false, 'admin:view': false },
  'Ethics Committee (IEC)': { 'ethics:view': true, 'sae:review': true, 'approval:view': true, 'study:edit': false, 'audit:view': false, 'admin:view': false },
  'PV Officer': { 'sae:view': true, 'sae:review': true, 'signal:view': true, 'study:edit': false, 'audit:view': false, 'admin:view': false },
  DSMB: { 'safety:view': true, 'aggregate:view': true, 'sae:submit': false, 'study:edit': false, 'audit:view': false, 'admin:view': false },
  Leadership: { 'portfolio:view': true, 'risk:view': true, 'compliance:view': true, 'study:edit': false, 'audit:view': false, 'admin:view': false },
  Regulator: { 'study:view': true, 'audit:view': true, 'study:edit': false, 'sae:submit': false, 'admin:view': false, 'config:edit': false },
  'System Admin': { 'admin:view': true, 'config:edit': true, 'notification:manage': true, 'study:edit': false, 'sae:submit': false, 'audit:view': false },
}

describe('permission matrix', () => {
  it('checks all 9 roles against their key allowed and denied actions', () => {
    for (const [role, actions] of Object.entries(matrix)) {
      for (const [action, expected] of Object.entries(actions)) {
        expect(hasPermission(role, action), `${role} => ${action}`).toBe(expected)
      }
    }
    expect(Object.keys(matrix)).toHaveLength(9)
  })

  it('denies unknown roles and actions', () => {
    expect(hasPermission('Unknown role', 'study:view')).toBe(false)
    expect(hasPermission('Principal Investigator', 'root:access')).toBe(false)
  })
})