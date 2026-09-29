import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertCircle, FileText, HelpCircle, Inbox, ScrollText, ShieldAlert } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { downloadAuditCsv } from '../../lib/audit'
import type { Study } from '../../types'

type StudyTab = 'overview' | 'lifecycle' | 'ethics' | 'safety' | 'deviations' | 'queries' | 'audit'

interface LifecycleStage {
  id: number
  name: string
  description: string
  status: 'Completed' | 'Current' | 'Upcoming'
}

function getLifecycleStages(study: Study): LifecycleStage[] {
  const stageDefs = [
    { id: 1, name: 'Protocol', description: 'Protocol design and scientific review' },
    { id: 2, name: 'IEC approval', description: 'Institutional Ethics Committee review and clearance' },
    { id: 3, name: 'CTRI registration', description: 'CTRI registry verification and trial ID assignment' },
    { id: 4, name: 'Site activation', description: 'Investigator meeting and site readiness activation' },
    { id: 5, name: 'Screening', description: 'Participant screening against inclusion and exclusion criteria' },
    { id: 6, name: 'Enrolment / Randomisation', description: 'Participant consent, baseline visit and arm assignment' },
    { id: 7, name: 'Follow-up', description: 'Treatment schedule, periodic visits and safety monitoring' },
    { id: 8, name: 'Data lock', description: 'eCRF verification, data query resolution and database lock' },
    { id: 9, name: 'Close-out', description: 'Final clinical study report and regulatory archiving' },
  ]

  let currentStageIndex = 5
  if (study.status === 'Planned') {
    currentStageIndex = 1
  } else if (study.status === 'Paused') {
    currentStageIndex = 3
  } else if (study.status === 'Closed') {
    currentStageIndex = 8
  } else if (study.enrolled >= study.targetSampleSize) {
    currentStageIndex = 6
  } else {
    currentStageIndex = 5
  }

  return stageDefs.map((def, idx) => {
    let status: 'Completed' | 'Current' | 'Upcoming' = 'Upcoming'
    if (idx < currentStageIndex) {
      status = 'Completed'
    } else if (idx === currentStageIndex) {
      status = 'Current'
    } else {
      status = 'Upcoming'
    }
    return { ...def, status }
  })
}

export function StudyDetailPage() {
  const { studyId } = useParams()
  const studies = useAppStore((state) => state.studies)
  const activeRole = useAppStore((state) => state.activeRole)
  const alerts = useAppStore((state) => state.alerts)
  const ethicsApprovals = useAppStore((state) => state.ethicsApprovals)
  const adverseEvents = useAppStore((state) => state.adverseEvents)
  const protocolDeviations = useAppStore((state) => state.protocolDeviations)
  const queries = useAppStore((state) => state.queries)
  const amendments = useAppStore((state) => state.amendments)
  const studyMilestones = useAppStore((state) => state.studyMilestones)
  const auditEntries = useAppStore((state) => state.auditEntries)
  const renewEthicsApproval = useAppStore((state) => state.renewEthicsApproval)
  const updateStudy = useAppStore((state) => state.updateStudy)
  const lastChangeReason = useAppStore((state) => state.studyChangeReasons[studyId ?? ''])

  const [activeTab, setActiveTab] = useState<StudyTab>('overview')
  const [editOpen, setEditOpen] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [changeReason, setChangeReason] = useState('')
  const [reasonError, setReasonError] = useState('')
  const [renewalReason, setRenewalReason] = useState('')
  const [renewalError, setRenewalError] = useState('')

  const study = studies.find((item) => item.id === studyId)

  const studyAdverseEvents = useMemo(
    () => adverseEvents.filter((event) => event.studyId === studyId),
    [adverseEvents, studyId],
  )
  const studyDeviations = useMemo(
    () => protocolDeviations.filter((dev) => dev.studyId === studyId),
    [protocolDeviations, studyId],
  )
  const studyQueries = useMemo(
    () => queries.filter((query) => query.studyId === studyId),
    [queries, studyId],
  )
  const studyAmendments = useMemo(
    () => amendments.filter((amendment) => amendment.studyId === studyId),
    [amendments, studyId],
  )
  const studyMilestonesList = useMemo(
    () => studyMilestones.filter((milestone) => milestone.studyId === studyId),
    [studyMilestones, studyId],
  )
  const studyAuditEntries = useMemo(
    () => (auditEntries ?? []).filter((entry) => entry.entity === studyId || entry.entity === 'portfolio-kpi-config'),
    [auditEntries, studyId],
  )
  const ethicsAlert = useMemo(
    () => alerts.find((alert) => alert.rule === 'ethics_expiry' && alert.studyId === studyId),
    [alerts, studyId],
  )

  if (!study) return <div className="p-6 text-sm text-slate-600">Study not found.</div>

  const approval = ethicsApprovals.find((item) => item.studyId === study.id)
  const daysRemaining = approval ? Math.ceil((new Date(approval.expiresAt).getTime() - Date.now()) / 86_400_000) : 0
  const lifecycleStages = getLifecycleStages(study)

  const tabs: Array<{ id: StudyTab; label: string; count?: number }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'lifecycle', label: 'Lifecycle' },
    { id: 'ethics', label: 'Ethics & CTRI', count: studyAmendments.length },
    { id: 'safety', label: 'Safety', count: studyAdverseEvents.length },
    { id: 'deviations', label: 'Deviations', count: studyDeviations.length },
    { id: 'queries', label: 'Queries', count: studyQueries.length },
    { id: 'audit', label: 'Audit', count: studyAuditEntries.length },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] font-semibold text-teal-600 dark:text-teal-400">Study detail</div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{study.title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="rounded-md bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">{study.status}</span>
          <span className={`rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${study.rag === 'red' ? 'bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400' : study.rag === 'amber' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400' : 'bg-teal-500/10 border border-teal-500/30 text-teal-600 dark:text-teal-400'}`}>{study.rag} RAG</span>
          <Link
            to="/ecrf"
            className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 transition"
          >
            eCRF Data Entry
          </Link>
          <Link
            to="/randomisation"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700/80 dark:bg-slate-900 dark:hover:bg-slate-800 transition"
          >
            Randomisation
          </Link>
          <Link
            to="/monitoring"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700/80 dark:bg-slate-900 dark:hover:bg-slate-800 transition"
          >
            CRA Monitoring
          </Link>
          <Link
            to="/regulatory"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700/80 dark:bg-slate-900 dark:hover:bg-slate-800 transition"
          >
            CTRI Package
          </Link>
          {activeRole === 'Principal Investigator' && (
            <button
              onClick={() => {
                setEditedTitle(study.title)
                setChangeReason('')
                setReasonError('')
                setEditOpen(true)
              }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700/80 dark:bg-slate-900 dark:hover:bg-slate-800 transition"
            >
              Edit study
            </button>
          )}
        </div>
      </div>

      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex flex-wrap gap-2" role="tablist" aria-label="Study details tabs">
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id
            return (
              <button
                key={tab.id}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={isSelected}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-t-lg border-b-2 px-4 py-2 text-sm font-semibold transition ${
                  isSelected
                    ? 'border-teal-500 text-teal-700 dark:text-teal-300 bg-teal-50/60 dark:bg-teal-950/30'
                    : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-2 rounded-md bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div id="panel-overview" role="tabpanel" aria-labelledby="tab-overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">CTRI Registration</div>
              <div className="mt-1.5 text-base font-semibold text-slate-900 dark:text-slate-100">{study.ctriNumber}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Principal Investigator</div>
              <div className="mt-1.5 text-base font-semibold text-slate-900 dark:text-slate-100">{study.pi}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{study.department}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Enrolment Progress</div>
              <div className="mt-1.5 text-base font-semibold text-slate-900 dark:text-slate-100">{study.enrolled} / {study.targetSampleSize} subjects</div>
              <div className="text-xs text-teal-600 dark:text-teal-400 font-medium">{Math.round((study.enrolled / study.targetSampleSize) * 100)}% of target</div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white/95 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
              <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Study profile</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-6"><dt className="text-slate-500 dark:text-slate-400">Phase</dt><dd className="font-medium text-slate-900 dark:text-slate-100">{study.phase}</dd></div>
                <div className="flex justify-between gap-6"><dt className="text-slate-500 dark:text-slate-400">Type</dt><dd className="font-medium text-slate-900 dark:text-slate-100">{study.type}</dd></div>
                <div className="flex justify-between gap-6"><dt className="text-slate-500 dark:text-slate-400">Design</dt><dd className="font-medium text-slate-900 dark:text-slate-100">{study.design}</dd></div>
                <div className="flex justify-between gap-6"><dt className="text-slate-500 dark:text-slate-400">Sponsor</dt><dd className="font-medium text-slate-900 dark:text-slate-100">{study.sponsor}</dd></div>
                <div className="flex justify-between gap-6"><dt className="text-slate-500 dark:text-slate-400">Start date</dt><dd className="font-medium text-slate-900 dark:text-slate-100">{new Date(study.startDate).toLocaleDateString()}</dd></div>
                <div className="flex justify-between gap-6"><dt className="text-slate-500 dark:text-slate-400">Target completion</dt><dd className="font-medium text-slate-900 dark:text-slate-100">{new Date(study.endDate).toLocaleDateString()}</dd></div>
              </dl>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white/95 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
              <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Intervention & protocol specifics</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between gap-6"><dt className="text-slate-500 dark:text-slate-400">Intervention type</dt><dd className="font-medium text-slate-900 dark:text-slate-100">{study.interventionType}</dd></div>
                <div className="flex justify-between gap-6"><dt className="text-slate-500 dark:text-slate-400">Formulation</dt><dd className="font-medium text-slate-900 dark:text-slate-100">{study.formulation}</dd></div>
                <div className="flex justify-between gap-6"><dt className="text-slate-500 dark:text-slate-400">Dosage form</dt><dd className="font-medium text-slate-900 dark:text-slate-100">{study.dosageForm}</dd></div>
                <div className="flex justify-between gap-6"><dt className="text-slate-500 dark:text-slate-400">Duration</dt><dd className="font-medium text-slate-900 dark:text-slate-100">{study.duration}</dd></div>
                <div className="flex justify-between gap-6"><dt className="text-slate-500 dark:text-slate-400">Prakriti assessment</dt><dd className="font-medium text-slate-900 dark:text-slate-100">{study.prakritiAssessment}</dd></div>
              </dl>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white/95 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
            <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Participating clinical sites ({study.sites.length})</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
                <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <tr>
                    <th className="px-4 py-2.5 font-medium">Site ID</th>
                    <th className="px-4 py-2.5 font-medium">Site name</th>
                    <th className="px-4 py-2.5 font-medium">Location</th>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                    <th className="px-4 py-2.5 font-medium">Enrolled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {study.sites.map((site) => (
                    <tr key={site.id}>
                      <td className="px-4 py-2.5 font-mono text-xs">{site.id}</td>
                      <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-slate-100">{site.name}</td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">{site.location}</td>
                      <td className="px-4 py-2.5">
                        <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${site.status === 'Active' ? 'bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-900/50' : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50'}`}>
                          {site.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-medium">{site.enrolled}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {lastChangeReason && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300">
              <span className="font-semibold text-slate-900 dark:text-slate-100">Last recorded change reason:</span> {lastChangeReason}
            </div>
          )}
        </div>
      )}

      {activeTab === 'lifecycle' && (
        <div id="panel-lifecycle" role="tabpanel" aria-labelledby="tab-lifecycle" className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white/95 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Study lifecycle stepper</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {lifecycleStages.map((stage) => {
                const isCompleted = stage.status === 'Completed'
                const isCurrent = stage.status === 'Current'
                return (
                  <div
                    key={stage.id}
                    className={`rounded-xl border p-4 transition ${
                      isCurrent
                        ? 'border-teal-500 bg-teal-50/70 shadow-sm dark:border-teal-500/80 dark:bg-teal-950/40'
                        : isCompleted
                        ? 'border-slate-200 bg-slate-50/80 dark:border-slate-800/80 dark:bg-slate-800/40'
                        : 'border-dashed border-slate-200 bg-white opacity-70 dark:border-slate-800 dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold ${
                        isCompleted
                          ? 'bg-teal-600 text-white'
                          : isCurrent
                          ? 'bg-teal-500 text-white'
                          : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {stage.id}
                      </span>
                      <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                        isCompleted
                          ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200'
                          : isCurrent
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {stage.status}
                      </span>
                    </div>
                    <div className="mt-3 font-semibold text-slate-900 dark:text-slate-100">{stage.name}</div>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{stage.description}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white/95 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
            <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">Study milestones</h2>
            {studyMilestonesList.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500 flex flex-col items-center justify-center gap-2">
                <Inbox size={22} className="text-slate-400 dark:text-slate-500" />
                <span>No milestones recorded for this study.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
                  <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-2 font-medium">Milestone ID</th>
                      <th className="px-4 py-2 font-medium">Title</th>
                      <th className="px-4 py-2 font-medium">Due date</th>
                      <th className="px-4 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {studyMilestonesList.map((milestone) => {
                      const isOverdue = !milestone.completedAt && new Date(milestone.dueAt).getTime() < Date.now()
                      return (
                        <tr key={milestone.id}>
                          <td className="px-4 py-2 font-mono text-xs">{milestone.id}</td>
                          <td className="px-4 py-2 font-medium text-slate-900 dark:text-slate-100">{milestone.title}</td>
                          <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{new Date(milestone.dueAt).toLocaleDateString()}</td>
                          <td className="px-4 py-2">
                            <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                              milestone.completedAt
                                ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                                : isOverdue
                                ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                              {milestone.completedAt ? 'Completed' : isOverdue ? 'Overdue' : 'Pending'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'ethics' && (
        <div id="panel-ethics" role="tabpanel" aria-labelledby="tab-ethics" className="space-y-6">
          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-5 text-sm text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-base font-semibold">Institutional Ethics Committee (IEC) status</div>
                <div className="mt-1">
                  {daysRemaining > 0 ? `${daysRemaining} days remaining until approval expiration.` : 'IEC approval has expired.'}
                </div>
                <div className="mt-1 text-xs text-amber-800 dark:text-amber-300">
                  {approval?.renewalLetter
                    ? `Active renewal letter on file: ${approval.renewalLetter}`
                    : `Approval expires on: ${approval ? new Date(approval.expiresAt).toLocaleDateString() : 'Date unavailable'}`}
                </div>
                {approval?.renewedAt && (
                  <div className="mt-1 text-xs text-teal-800 dark:text-teal-300">
                    Renewal recorded on {new Date(approval.renewedAt).toLocaleDateString()}; approval validity extended by 365 days.
                  </div>
                )}
              </div>

              {activeRole === 'Ethics Committee (IEC)' && (
                <label className="cursor-pointer rounded-lg bg-teal-600 px-4 py-2 font-semibold text-white shadow-sm hover:bg-teal-500 transition">
                  Upload renewal letter
                  <input
                    aria-label="Upload IEC renewal letter"
                    type="file"
                    accept=".pdf,image/*"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (!file) return
                      if (!renewalReason.trim()) {
                        setRenewalError('Enter a reason before uploading the renewal letter.')
                        return
                      }
                      void renewEthicsApproval(study.id, file.name, renewalReason.trim()).then(() => {
                        setRenewalError('')
                        setRenewalReason('')
                      })
                    }}
                  />
                </label>
              )}
            </div>

            {activeRole === 'Ethics Committee (IEC)' && (
              <label className="mt-4 grid gap-1 text-sm font-medium">
                Reason for IEC renewal <span className="text-xs font-normal text-amber-800 dark:text-amber-300">(Required for audit trail)</span>
                <input
                  aria-label="Renewal reason"
                  value={renewalReason}
                  onChange={(event) => setRenewalReason(event.target.value)}
                  placeholder="e.g. Annual continuation review approved by IEC panel"
                  className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-slate-800 dark:border-amber-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </label>
            )}
            {renewalError && <p role="alert" className="mt-2 text-sm text-red-700 dark:text-red-400">{renewalError}</p>}
            {ethicsAlert && (
              <div className="mt-4 rounded-lg border border-amber-300 bg-white/60 p-3 text-xs dark:border-amber-700 dark:bg-slate-900/60">
                <span className="font-semibold">Active alert:</span> {ethicsAlert.title} - {ethicsAlert.description}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white/95 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
            <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">Protocol amendments ({studyAmendments.length})</h2>
            {studyAmendments.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500 flex flex-col items-center justify-center gap-2">
                <FileText size={22} className="text-slate-400 dark:text-slate-500" />
                <span>No protocol amendments recorded for this study.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
                  <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-2 font-medium">Amendment ID</th>
                      <th className="px-4 py-2 font-medium">Title</th>
                      <th className="px-4 py-2 font-medium">Submitted date</th>
                      <th className="px-4 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {studyAmendments.map((amendment) => (
                      <tr key={amendment.id}>
                        <td className="px-4 py-2 font-mono text-xs">{amendment.id}</td>
                        <td className="px-4 py-2 font-medium text-slate-900 dark:text-slate-100">{amendment.title}</td>
                        <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{new Date(amendment.submittedAt).toLocaleDateString()}</td>
                        <td className="px-4 py-2">
                          <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                            amendment.status === 'Approved'
                              ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                              : amendment.status === 'Pending IEC review'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {amendment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'safety' && (
        <div id="panel-safety" role="tabpanel" aria-labelledby="tab-safety" className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white/95 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
            <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">Adverse events and safety signals ({studyAdverseEvents.length})</h2>
            {studyAdverseEvents.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500 flex flex-col items-center justify-center gap-2">
                <ShieldAlert size={22} className="text-slate-400 dark:text-slate-500" />
                <span>No adverse events reported for this study.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
                  <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-2 font-medium">AE ID</th>
                      <th className="px-4 py-2 font-medium">Subject</th>
                      <th className="px-4 py-2 font-medium">Event description</th>
                      <th className="px-4 py-2 font-medium">Seriousness</th>
                      <th className="px-4 py-2 font-medium">Onset date</th>
                      <th className="px-4 py-2 font-medium">Outcome</th>
                      <th className="px-4 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {studyAdverseEvents.map((event) => (
                      <tr key={event.id}>
                        <td className="px-4 py-2 font-mono text-xs">{event.id}</td>
                        <td className="px-4 py-2">{activeRole === 'Ethics Committee (IEC)' ? 'Blinded subject' : event.subjectId}</td>
                        <td className="px-4 py-2 font-medium text-slate-900 dark:text-slate-100">{event.event}</td>
                        <td className="px-4 py-2">
                          <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                            event.seriousness === 'Serious' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {event.seriousness}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{new Date(event.onsetDate).toLocaleDateString()}</td>
                        <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{event.outcome}</td>
                        <td className="px-4 py-2">
                          <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                            event.escalated ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                          }`}>
                            {event.escalated ? 'Escalated' : event.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'deviations' && (
        <div id="panel-deviations" role="tabpanel" aria-labelledby="tab-deviations" className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white/95 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
            <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">Protocol deviations ({studyDeviations.length})</h2>
            {studyDeviations.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500 flex flex-col items-center justify-center gap-2">
                <AlertCircle size={22} className="text-slate-400 dark:text-slate-500" />
                <span>No protocol deviations recorded for this study.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
                  <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-2 font-medium">Deviation ID</th>
                      <th className="px-4 py-2 font-medium">Subject</th>
                      <th className="px-4 py-2 font-medium">Description</th>
                      <th className="px-4 py-2 font-medium">Severity</th>
                      <th className="px-4 py-2 font-medium">Recorded date</th>
                      <th className="px-4 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {studyDeviations.map((deviation) => (
                      <tr key={deviation.id}>
                        <td className="px-4 py-2 font-mono text-xs">{deviation.id}</td>
                        <td className="px-4 py-2">{deviation.subjectId}</td>
                        <td className="px-4 py-2 font-medium text-slate-900 dark:text-slate-100">{deviation.description}</td>
                        <td className="px-4 py-2">
                          <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                            deviation.severity === 'Major' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {deviation.severity}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{new Date(deviation.recordedAt).toLocaleDateString()}</td>
                        <td className="px-4 py-2">
                          <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                            deviation.status === 'Open' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {deviation.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'queries' && (
        <div id="panel-queries" role="tabpanel" aria-labelledby="tab-queries" className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white/95 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
            <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">Data queries ({studyQueries.length})</h2>
            {studyQueries.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500 flex flex-col items-center justify-center gap-2">
                <HelpCircle size={22} className="text-slate-400 dark:text-slate-500" />
                <span>No data queries recorded for this study.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
                  <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-2 font-medium">Query ID</th>
                      <th className="px-4 py-2 font-medium">Subject</th>
                      <th className="px-4 py-2 font-medium">Field</th>
                      <th className="px-4 py-2 font-medium">Age (days)</th>
                      <th className="px-4 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {studyQueries.map((query) => (
                      <tr key={query.id}>
                        <td className="px-4 py-2 font-mono text-xs">{query.id}</td>
                        <td className="px-4 py-2">{query.subjectId}</td>
                        <td className="px-4 py-2 font-medium text-slate-900 dark:text-slate-100">{query.field}</td>
                        <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{query.ageDays}</td>
                        <td className="px-4 py-2">
                          <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                            query.status === 'Open'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : query.status === 'Answered'
                              ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300'
                              : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                          }`}>
                            {query.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div id="panel-audit" role="tabpanel" aria-labelledby="tab-audit" className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white/95 p-5 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Study audit trail ({studyAuditEntries.length})</h2>
                <p className="text-xs text-slate-500">Append-only cryptographically linked audit events for this study entity.</p>
              </div>
              {studyAuditEntries.length > 0 && (
                <button
                  onClick={() => downloadAuditCsv(studyAuditEntries, `${study.id}-audit-trail.csv`)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
                >
                  Export study audit CSV
                </button>
              )}
            </div>

            {studyAuditEntries.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500 flex flex-col items-center justify-center gap-2">
                <ScrollText size={22} className="text-slate-400 dark:text-slate-500" />
                <span>No audit records found for this study.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
                  <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-2 font-medium">Time</th>
                      <th className="px-4 py-2 font-medium">Actor</th>
                      <th className="px-4 py-2 font-medium">Action</th>
                      <th className="px-4 py-2 font-medium">Reason</th>
                      <th className="px-4 py-2 font-medium">Hash</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {studyAuditEntries.map((entry) => (
                      <tr key={entry.id}>
                        <td className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400">{new Date(entry.timestamp).toLocaleString()}</td>
                        <td className="px-4 py-2 font-medium text-slate-900 dark:text-slate-100">{entry.actor}</td>
                        <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{entry.action}</td>
                        <td className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400">{entry.reason}</td>
                        <td className="px-4 py-2 font-mono text-xs text-slate-500" title={entry.hash}>
                          {entry.hash.substring(0, 10)}...
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="edit-study-heading" className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0d141c] p-6 text-slate-100 shadow-2xl">
            <h2 id="edit-study-heading" className="text-xl font-bold text-white">Edit study</h2>
            <label className="mt-4 grid gap-1.5 text-xs font-semibold text-slate-300">Study title
              <input value={editedTitle} onChange={(event) => setEditedTitle(event.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500" />
            </label>
            <label className="mt-3.5 grid gap-1.5 text-xs font-semibold text-slate-300">Reason for change <span className="text-rose-400 font-normal">(Required)</span>
              <textarea value={changeReason} onChange={(event) => setChangeReason(event.target.value)} rows={3} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500" />
            </label>
            {reasonError && <p role="alert" className="mt-2 text-xs text-rose-400 font-medium">{reasonError}</p>}
            <div className="mt-5 flex justify-end gap-2.5">
              <button onClick={() => setEditOpen(false)} className="rounded-lg border border-slate-700 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition">Cancel</button>
              <button
                onClick={async () => {
                  if (!changeReason.trim()) {
                    setReasonError('Enter a reason for this change before saving.')
                    return
                  }
                  await updateStudy(study.id, { title: editedTitle.trim() || study.title }, changeReason.trim())
                  setEditOpen(false)
                }}
                className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-500 transition"
              >
                Save change
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
