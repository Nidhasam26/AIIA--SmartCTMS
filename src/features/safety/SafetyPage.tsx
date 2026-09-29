import { useEffect, useRef, useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { createSaeDeadlines, getSaeCountdownText, getSaeDeadlineStatus, getSaeDeadlines, hasSaeDeadlineExpired } from '../../lib/sae'
import { ESignatureModal } from '../../components/ESignatureModal'
import { FileCheck } from 'lucide-react'
import type { AdverseEvent } from '../../types'

export function SafetyPage() {
  const adverseEvents = useAppStore((state) => state.adverseEvents)
  const addAdverseEvent = useAppStore((state) => state.addAdverseEvent)
  const updateAdverseEvent = useAppStore((state) => state.updateAdverseEvent)
  const addAlert = useAppStore((state) => state.addAlert)
  const activeRole = useAppStore((state) => state.activeRole)
  const ruleConfig = useAppStore((state) => state.ruleConfig)
  const alerts = useAppStore((state) => state.alerts)
  const [now, setNow] = useState(() => new Date())
  const pendingEscalations = useRef(new Set<string>())
  const [filingReason, setFilingReason] = useState('')
  const [filingError, setFilingError] = useState('')
  const [form, setForm] = useState<{ subjectId: string; event: string; seriousness: AdverseEvent['seriousness'] }>({
    subjectId: 'PT-000124',
    event: 'Severe abdominal pain',
    seriousness: 'Serious',
  })

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    for (const event of adverseEvents) {
      if (event.seriousness !== 'Serious' || event.escalated || pendingEscalations.current.has(event.id)) continue
      const deadlines = getSaeDeadlines(event, ruleConfig)
      if (!hasSaeDeadlineExpired(deadlines, now)) continue

      pendingEscalations.current.add(event.id)
      void updateAdverseEvent(event.id, { escalated: true }, 'Automatic escalation because an SAE reporting deadline expired').then(() => {
        addAlert({
          id: `ESC-${event.id}`,
          studyId: event.studyId,
          title: 'Missed SAE deadline: leadership escalation',
          description: `Reporting deadline expired for ${event.id}; immediate leadership review is required.`,
          severity: 'critical',
          acknowledged: false,
          rule: 'sae_escalation',
          evidence: `${event.id}; one or more investigator, sponsor, or IEC deadlines expired.`,
          suggestedAction: 'Leadership to review the overdue safety report and document corrective action.',
          createdAt: now.toISOString(),
          role: 'Leadership',
        })
      }).finally(() => pendingEscalations.current.delete(event.id))
    }
  }, [adverseEvents, addAlert, now, ruleConfig, updateAdverseEvent])

  const [isEsignOpen, setIsEsignOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<{
    type: 'create' | 'resolve'
    event?: AdverseEvent
    nextAeId?: string
  } | null>(null)

  const initiateFiling = () => {
    if (!filingReason.trim()) {
      setFilingError('Enter a reason for filing this SAE.')
      return
    }
    setFilingError('')
    const nextId = `AE-${String(adverseEvents.length + 1).padStart(3, '0')}`
    setPendingAction({ type: 'create', nextAeId: nextId })
    setIsEsignOpen(true)
  }

  const initiateResolve = (event: AdverseEvent) => {
    setPendingAction({ type: 'resolve', event })
    setIsEsignOpen(true)
  }

  const handleEsignConfirm = async (data: { password: string; statement: string; timestamp: string; reason: string }) => {
    if (!pendingAction) return

    if (pendingAction.type === 'create') {
      const onsetDate = new Date().toISOString()
      const deadlines = createSaeDeadlines(onsetDate, ruleConfig)
      const ae: AdverseEvent = {
        id: pendingAction.nextAeId || `AE-${String(adverseEvents.length + 1).padStart(3, '0')}`,
        studyId: 'study-1',
        subjectId: form.subjectId,
        reporter: 'Investigator',
        event: form.event,
        seriousness: form.seriousness,
        onsetDate,
        outcome: 'Follow-up required',
        causality: 'Probable',
        status: 'Open',
        requiredRecipients: ['Investigator', 'PV Officer', 'IEC'],
        dueAt: deadlines.investigator,
        deadlines,
        escalated: false,
      }

      await addAdverseEvent(ae, data.reason || filingReason.trim())
      setFilingReason('')
      setFilingError('')
      if (ae.seriousness === 'Serious') {
        addAlert({
          id: `ALT-${Date.now()}`,
          studyId: 'study-1',
          title: 'SAE reporting deadline',
          description: 'Serious event requires reporting to PV and IEC within 24 hours.',
          severity: 'critical',
          acknowledged: false,
          rule: 'sae_reporting',
          evidence: `${ae.subjectId} - ${ae.event}`,
          suggestedAction: 'Submit urgent safety report and escalate if missed.',
          createdAt: new Date().toISOString(),
          role: 'PV Officer',
        })
      }
    } else if (pendingAction.type === 'resolve' && pendingAction.event) {
      await updateAdverseEvent(
        pendingAction.event.id,
        { status: 'Resolved' },
        data.reason || 'Safety report reviewed, reconciled, and finalized with electronic signature'
      )
    }

    setPendingAction(null)
  }

  const forceMissedDeadline = async (event: AdverseEvent) => {
    if (event.escalated) return
    const missedAt = new Date(now.getTime() - 60_000).toISOString()
    const deadlines = { investigator: missedAt, sponsor: missedAt, iec: missedAt }
    await updateAdverseEvent(event.id, { deadlines, dueAt: missedAt, escalated: true }, 'Development simulation: force missed SAE deadline')
    addAlert({
      id: `ESC-${event.id}`,
      studyId: event.studyId,
      title: 'Missed SAE deadline: leadership escalation',
      description: `Reporting deadlines expired for ${event.id}; immediate leadership review is required.`,
      severity: 'critical',
      acknowledged: false,
      rule: 'sae_escalation',
      evidence: `${event.id}; investigator, sponsor, and IEC deadlines expired.`,
      suggestedAction: 'Leadership to review the overdue safety report and document corrective action.',
      createdAt: now.toISOString(),
      role: 'Leadership',
    })
  }

  const roleAlerts = alerts.filter((alert) => alert.role === activeRole)
  const seriousEvents = adverseEvents.filter((event) => event.seriousness === 'Serious')

  if (activeRole === 'DSMB') {
    return (
      <div className="space-y-6">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] font-semibold text-teal-600 dark:text-teal-400">Independent safety review</div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Safety aggregate dashboard</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total adverse events</div>
            <div className="mt-1.5 text-2xl font-bold text-slate-900 dark:text-slate-100">{adverseEvents.length}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Serious events</div>
            <div className="mt-1.5 text-2xl font-bold text-slate-900 dark:text-slate-100">{seriousEvents.length}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Open serious events</div>
            <div className="mt-1.5 text-2xl font-bold text-slate-900 dark:text-slate-100">{seriousEvents.filter((event) => event.status !== 'Resolved').length}</div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white/95 p-4 text-xs text-slate-500 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80 dark:text-slate-400">
          Individual subjects and case narratives are not shown in this blinded aggregate view.
        </div>
      </div>
    )
  }

  const visibleEvents = activeRole === 'Ethics Committee (IEC)' ? seriousEvents : adverseEvents

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] font-semibold text-teal-600 dark:text-teal-400">Pharmacovigilance</div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Safety signal review</h1>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Open SAE</div>
          <div className="mt-1.5 text-2xl font-bold text-slate-900 dark:text-slate-100">{seriousEvents.length}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Follow-up due</div>
          <div className="mt-1.5 text-2xl font-bold text-slate-900 dark:text-slate-100">2</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Coding backlog</div>
          <div className="mt-1.5 text-2xl font-bold text-slate-900 dark:text-slate-100">7</div>
        </div>
      </div>

      {activeRole === 'Principal Investigator' && (
        <div className="rounded-xl border border-slate-200 bg-white/95 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
          <div className="mb-3 font-semibold text-slate-900 dark:text-slate-100">New SAE intake</div>
          <div className="grid gap-3 md:grid-cols-3">
            <input aria-label="Subject code" value={form.subjectId} onChange={(event) => setForm({ ...form, subjectId: event.target.value })} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100" placeholder="Subject code" />
            <input aria-label="Event" value={form.event} onChange={(event) => setForm({ ...form, event: event.target.value })} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm md:col-span-1 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100" placeholder="Event" />
            <select aria-label="Seriousness" value={form.seriousness} onChange={(event) => setForm({ ...form, seriousness: event.target.value as AdverseEvent['seriousness'] })} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100">
              <option value="Serious">Serious</option>
              <option value="Non-serious">Non-serious</option>
            </select>
          </div>
          <label className="mt-3 grid gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">Reason for SAE filing
            <input aria-label="Reason for SAE filing" value={filingReason} onChange={(event) => setFilingReason(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-100" />
          </label>
          {filingError && <p role="alert" className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-400">{filingError}</p>}
          <button
            onClick={initiateFiling}
            className="mt-3.5 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-teal-500 transition flex items-center gap-2 cursor-pointer"
          >
            <FileCheck size={16} />
            <span>File & E-Sign SAE</span>
          </button>
        </div>
      )}

      {roleAlerts.map((alert) => (
        <div key={alert.id} role="status" className="rounded-xl border border-amber-400/80 bg-amber-50/70 p-3.5 text-sm dark:border-amber-700/80 dark:bg-amber-950/30">
          <div className="font-semibold text-amber-900 dark:text-amber-200">{alert.title}</div>
          <p className="mt-0.5 text-xs text-amber-800 dark:text-amber-300">{alert.description}</p>
        </div>
      ))}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white/95 shadow-xs backdrop-blur-xs dark:border-slate-800/80 dark:bg-[#0d141c]/80">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
          <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3 font-medium">AE ID</th>
              <th className="px-4 py-3 font-medium">Subject</th>
              <th className="px-4 py-3 font-medium">Event</th>
              <th className="px-4 py-3 font-medium">Investigator countdown</th>
              <th className="px-4 py-3 font-medium">Sponsor countdown</th>
              <th className="px-4 py-3 font-medium">IEC countdown</th>
              <th className="px-4 py-3 font-medium">Status</th>
              {activeRole === 'Principal Investigator' && <th className="px-4 py-3 font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900/60">
            {visibleEvents.map((event) => {
              const deadlines = getSaeDeadlines(event, ruleConfig)
              const clock = (label: string, dueAt: string) => {
                const state = getSaeDeadlineStatus(dueAt, now)
                return (
                  <td key={label} className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                        state === 'red'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40'
                          : state === 'amber'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40'
                          : 'bg-teal-100 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300 border border-teal-200 dark:border-teal-900/40'
                      }`}
                      aria-label={`${label} ${state}`}
                    >
                      {label}: {getSaeCountdownText(dueAt, now)} ({state})
                    </span>
                  </td>
                )
              }
              return (
                <tr key={event.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-mono text-xs text-teal-600 dark:text-teal-400 font-semibold">{event.id}</td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{activeRole === 'Ethics Committee (IEC)' ? 'Blinded subject' : event.subjectId}</td>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">{event.event}</td>
                  {clock('Investigator', deadlines.investigator)}
                  {clock('Sponsor', deadlines.sponsor)}
                  {clock('IEC', deadlines.iec)}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                      event.escalated
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                    }`}>
                      {event.escalated ? 'Escalated to Leadership' : event.status}
                    </span>
                  </td>
                  {activeRole === 'Principal Investigator' && (
                    <td className="px-4 py-3 flex items-center gap-2">
                      {event.status !== 'Resolved' && (
                        <button
                          onClick={() => initiateResolve(event)}
                          className="rounded-lg border border-teal-300 bg-teal-50/60 px-2.5 py-1 text-xs font-medium text-teal-700 hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300 dark:hover:bg-teal-900/60 transition flex items-center gap-1 cursor-pointer"
                        >
                          <FileCheck size={13} />
                          <span>Finalize & Sign</span>
                        </button>
                      )}
                      <button
                        disabled={event.escalated}
                        onClick={() => forceMissedDeadline(event)}
                        className="rounded-lg border border-rose-300 px-2.5 py-1 text-xs text-rose-700 hover:bg-rose-50 disabled:opacity-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/30 transition cursor-pointer"
                      >
                        Force missed deadline
                      </button>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <ESignatureModal
        isOpen={isEsignOpen}
        onClose={() => {
          setIsEsignOpen(false)
          setPendingAction(null)
        }}
        onConfirm={handleEsignConfirm}
        title={pendingAction?.type === 'resolve' ? 'Finalize & Sign Safety Report' : 'Electronic Signature - SAE Intake'}
        entityName="AdverseEvent"
        recordId={pendingAction?.type === 'resolve' ? pendingAction.event?.id : pendingAction?.nextAeId}
        defaultReason={pendingAction?.type === 'resolve' ? 'Finalizing resolved clinical safety report' : (filingReason || 'Reporting serious adverse event in compliance with ASU standards')}
      />
    </div>
  )
}
