import { useState } from 'react'
import { downloadAuditCsv, verifyAuditChain } from '../../lib/audit'
import { useAppStore } from '../../store/appStore'

export function AuditPage() {
  const entries = useAppStore((state) => state.auditEntries)
  const updateAuditEntry = useAppStore((state) => state.updateAuditEntry)
  const activeRole = useAppStore((state) => state.activeRole)
  const [status, setStatus] = useState<{ valid: boolean; firstTamperedIndex: number; firstTamperedId: string | null } | null>(null)
  const [tampered, setTampered] = useState(false)

  const runIntegrityCheck = async () => {
    const result = await verifyAuditChain(entries)
    setStatus({
      ...result,
      firstTamperedId: result.firstTamperedIndex >= 0 ? entries[result.firstTamperedIndex]?.id ?? null : null,
    })
  }

  const toggleTamper = () => {
    if (!tampered) {
      const entry = entries[0]
      if (!entry) return
      updateAuditEntry(entry.id, { oldValue: 'tampered value' })
      setTampered(true)
      setStatus(null)
    } else {
      const entry = entries[0]
      if (entry) updateAuditEntry(entry.id, { oldValue: 'N/A' })
      setTampered(false)
      setStatus(null)
    }
  }

  const exportCsv = () => {
    downloadAuditCsv(entries, 'smartctms-audit-trail.csv')
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">Audit trail</div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Append-only record integrity</h1>
      </div>

      <div className="flex flex-wrap gap-3">
        <button onClick={runIntegrityCheck} className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 transition focus:outline-none focus:ring-2 focus:ring-teal-500/50">Integrity check</button>
        <button onClick={exportCsv} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-[#0d141c]/80 dark:text-slate-200 dark:hover:bg-slate-800/60 transition">Export audit CSV</button>
        {activeRole === 'System Admin' && <button onClick={toggleTamper} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-800 dark:bg-[#0d141c]/80 dark:text-slate-300 dark:hover:bg-slate-800/60 transition">{tampered ? 'Restore original chain' : 'Tamper one entry'}</button>}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80 backdrop-blur-sm">
        <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Integrity review</div>
        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {status === null && 'No integrity check has been run yet.'}
          {status && (status.valid ? <span className="text-teal-600 dark:text-teal-400 font-semibold">Chain status: valid. No tampering detected.</span> : <span className="text-rose-600 dark:text-rose-400 font-semibold">{`Chain status: invalid. First tampered entry: ${status.firstTamperedId ?? 'unknown'} (index ${status.firstTamperedIndex})`}</span>)}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80 backdrop-blur-sm">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 dark:bg-slate-900/60 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Time</th>
              <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Actor</th>
              <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Action</th>
              <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-transparent text-slate-800 dark:text-slate-200">
            {entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{new Date(entry.timestamp).toLocaleString()}</td>
                <td className="px-4 py-3 font-medium">{entry.actor}</td>
                <td className="px-4 py-3">{entry.action}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{entry.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
