import { describe, expect, it } from 'vitest'
import { getPersonaNavigation } from './personaNavigation'

describe('persona sidebar navigation', () => {
  it.each([
    ['Principal Investigator', ['Dashboard', 'Study registry', 'Safety board', 'Data exports']],
    ['Study Coordinator', ['Dashboard', 'Study registry', 'Data exports']],
    ['Monitor (CRA)', ['Dashboard', 'Study registry']],
    ['Ethics Committee (IEC)', ['Dashboard', 'Study registry', 'Safety board']],
    ['PV Officer', ['Dashboard', 'Safety board']],
    ['DSMB', ['Dashboard', 'Safety board']],
    ['Leadership', ['Dashboard', 'Study registry', 'Safety board', 'Audit trail']],
    ['Regulator', ['Dashboard', 'Study registry', 'Data exports', 'Audit trail']],
    ['System Admin', ['Dashboard', 'Study registry', 'Data exports', 'Audit trail', 'Administration']],
  ])('%s sees only its assigned sidebar items', (role, expected) => {
    expect(getPersonaNavigation(role as string).map((item) => item.label)).toEqual(expected)
  })

  it('falls back to the dashboard for an unknown role', () => {
    expect(getPersonaNavigation('Unknown').map((item) => item.label)).toEqual(['Dashboard'])
  })
})