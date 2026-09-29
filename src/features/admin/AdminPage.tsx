import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { CheckCircle2 } from 'lucide-react'
import type { KPIConfig } from '../../types'
import { useAppStore } from '../../store/appStore'

export function AdminPage() {
  const kpiConfig = useAppStore((state) => state.kpiConfig)
  const setKpiConfig = useAppStore((state) => state.setKpiConfig)
  const alerts = useAppStore((state) => state.alerts)
  const [draft, setDraft] = useState<KPIConfig>(kpiConfig)
  const [saved, setSaved] = useState(false)
  const [changeReason, setChangeReason] = useState('')
  const [reasonError, setReasonError] = useState('')

  const updateThreshold = (key: 'enrolmentLagAmber' | 'enrolmentLagRed', event: ChangeEvent<HTMLInputElement>) => {
    setSaved(false)
    setDraft((current) => ({ ...current, [key]: Number(event.target.value) / 100 }))
  }

  const applyThresholds = async () => {
    if (!changeReason.trim()) {
      setReasonError('Enter a reason for changing KPI thresholds.')
      return
    }
    await setKpiConfig(draft, changeReason.trim())
    setSaved(true)
    setReasonError('')
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">Administration</div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Configuration and dictionary control</h1>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80 backdrop-blur-sm" aria-labelledby="kpi-threshold-heading">
        <h2 id="kpi-threshold-heading" className="mb-4 font-semibold text-slate-900 dark:text-slate-100">KPI thresholds</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Enrolment lag amber threshold (%)
            <input aria-label="Enrolment lag amber threshold (%)" type="number" min="0" max="100" step="1" value={Math.round(draft.enrolmentLagAmber * 100)} onChange={(event) => updateThreshold('enrolmentLagAmber', event)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 normal-case font-normal focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
          </label>
          <label className="grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Enrolment lag red threshold (%)
            <input aria-label="Enrolment lag red threshold (%)" type="number" min="0" max="100" step="1" value={Math.round(draft.enrolmentLagRed * 100)} onChange={(event) => updateThreshold('enrolmentLagRed', event)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 normal-case font-normal focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
          </label>
        </div>
        <label className="mt-4 grid gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          Reason for threshold change
          <input aria-label="Reason for threshold change" value={changeReason} onChange={(event) => setChangeReason(event.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 normal-case font-normal focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
        </label>
        <div className="mt-5 flex items-center gap-3">
          <button onClick={applyThresholds} className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 transition focus:outline-none focus:ring-2 focus:ring-teal-500/50">Apply KPI thresholds</button>
          {saved && <span role="status" className="text-sm font-medium text-teal-600 dark:text-teal-400">Thresholds applied; study RAG and alerts recalculated.</span>}
        </div>
        {reasonError && <p role="alert" className="mt-2 text-sm text-rose-600 dark:text-rose-400">{reasonError}</p>}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80 backdrop-blur-sm" aria-labelledby="current-alerts-heading">
        <h2 id="current-alerts-heading" className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Current enrolment alerts</h2>
        <div className="space-y-3 text-sm">
          {alerts.filter((alert) => alert.rule === 'enrolment_lag').map((alert) => (
            <div key={alert.id} className="rounded-xl border border-amber-300 bg-amber-500/10 p-4 dark:border-amber-500/30 dark:bg-amber-950/20">
              <div className="font-semibold text-amber-800 dark:text-amber-300">{alert.title}</div>
              <p className="mt-1 text-slate-700 dark:text-slate-300">{alert.description}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Evidence: {alert.evidence}</p>
              <p className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-400">Action: {alert.suggestedAction}</p>
            </div>
          ))}
          {!alerts.some((alert) => alert.rule === 'enrolment_lag') && (
            <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
              <CheckCircle2 size={16} className="text-teal-500" />
              <span>No enrolment lag alerts.</span>
            </div>
          )}
        </div>
      </section>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80 backdrop-blur-sm">
        <div className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Alert rules</div>
        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <li>SAE investigator deadline: 24 hours</li>
          <li>Sponsor escalation: 14 days</li>
          <li>IEC review due: 30 days</li>
          <li>NDCT note: verify against NDCT Rules 2019 and GCP-ASU</li>
        </ul>
      </div>
    </div>
  )
}
