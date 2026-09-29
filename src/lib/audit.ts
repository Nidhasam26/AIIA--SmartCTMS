export interface AuditChainEntry {
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

export async function sha256(value: string) {
  const buffer = new TextEncoder().encode(value)
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const bytes = Array.from(new Uint8Array(hashBuffer))
  return bytes.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function createAuditHash(entry: Omit<AuditChainEntry, 'hash'>) {
  return sha256(`${entry.prevHash}|${entry.timestamp}|${entry.actor}|${entry.entity}|${entry.action}|${entry.oldValue}|${entry.newValue}|${entry.reason}`)
}

export async function verifyAuditChain(entries: AuditChainEntry[]) {
  let previousHash = 'genesis'
  for (const entry of entries) {
    const expected = await createAuditHash({
      id: entry.id,
      timestamp: entry.timestamp,
      actor: entry.actor,
      entity: entry.entity,
      action: entry.action,
      oldValue: entry.oldValue,
      newValue: entry.newValue,
      reason: entry.reason,
      prevHash: previousHash,
    })

    if (entry.prevHash !== previousHash || entry.hash !== expected) {
      return { valid: false, firstTamperedIndex: entries.indexOf(entry) }
    }

    previousHash = entry.hash
  }

  return { valid: true, firstTamperedIndex: -1 }
}

export function generateAuditCsv(entries: AuditChainEntry[]): string {
  const headers = ['ID', 'Timestamp', 'Actor', 'Entity', 'Action', 'Old Value', 'New Value', 'Reason', 'Previous Hash', 'Hash']
  const escapeCsv = (val: string) => {
    const s = String(val ?? '')
    if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
      return `"${s.replace(/"/g, '""')}"`
    }
    return s
  }
  const rows = entries.map((entry) => [
    entry.id,
    entry.timestamp,
    entry.actor,
    entry.entity,
    entry.action,
    entry.oldValue,
    entry.newValue,
    entry.reason,
    entry.prevHash,
    entry.hash,
  ].map(escapeCsv).join(','))

  return [headers.join(','), ...rows].join('\n')
}

export function downloadAuditCsv(entries: AuditChainEntry[], filename = 'audit-trail.csv') {
  const csv = generateAuditCsv(entries)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

