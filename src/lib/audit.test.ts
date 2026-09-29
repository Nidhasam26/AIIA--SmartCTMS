import { describe, expect, it } from 'vitest'
import { createAuditHash, generateAuditCsv, verifyAuditChain } from './audit'
import { auditEntries } from '../data/seed'

describe('Audit hash chain', () => {
  it('verifies the actual application seed', async () => {
    expect(await verifyAuditChain(auditEntries)).toEqual({ valid: true, firstTamperedIndex: -1 })
  })

  it('verifies a valid hash chain', async () => {
    const entryA = {
      id: 'a',
      timestamp: '2026-01-01T00:00:00.000Z',
      actor: 'System Admin',
      entity: 'study-1',
      action: 'Create',
      oldValue: 'N/A',
      newValue: 'Study added',
      reason: 'Initial insert',
      prevHash: 'genesis',
    }

    const hashA = await createAuditHash(entryA)
    const entryB = {
      ...entryA,
      id: 'b',
      timestamp: '2026-01-02T00:00:00.000Z',
      prevHash: hashA,
      action: 'Update',
      oldValue: 'Study added',
      newValue: 'Study revised',
      reason: 'Edit',
    }

    const hashB = await createAuditHash({ ...entryB, prevHash: hashA })
    const result = await verifyAuditChain([
      { ...entryA, hash: hashA },
      { ...entryB, hash: hashB },
    ])

    expect(result.valid).toBe(true)
    expect(result.firstTamperedIndex).toBe(-1)
  })

  it('detects tampering', async () => {
    const entryA = {
      id: 'a',
      timestamp: '2026-01-01T00:00:00.000Z',
      actor: 'System Admin',
      entity: 'study-1',
      action: 'Create',
      oldValue: 'N/A',
      newValue: 'Study added',
      reason: 'Initial insert',
      prevHash: 'genesis',
    }
    const hashA = await createAuditHash(entryA)
    const tampered = {
      ...entryA,
      oldValue: 'tampered',
      hash: 'bad-hash',
    }

    const result = await verifyAuditChain([{ ...entryA, hash: hashA }, tampered as any])
    expect(result.valid).toBe(false)
    expect(result.firstTamperedIndex).toBe(1)
  })

  it('generates valid CSV format for audit entries', () => {
    const csv = generateAuditCsv(auditEntries)
    expect(csv).toContain('ID,Timestamp,Actor,Entity,Action,Old Value,New Value,Reason,Previous Hash,Hash')
    expect(csv).toContain('AUD-001')
    expect(csv).toContain('System Admin')
    expect(csv).toContain('Initial seed creation')
  })
})
