import { AlertCircle, AlertTriangle, CheckCircle2, Clock, ShieldCheck, TrendingUp } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { users } from '../../data/seed'
import { getSaeCountdownText, getSaeDeadlines } from '../../lib/sae'
import type { Study } from '../../types'

function Sparkline({ variant = 'up' }: { variant?: 'up' | 'stable' | 'down' }) {
  const path =
    variant === 'up'
      ? 'M0 16 Q 12 12, 24 14 T 48 8 T 72 4'
      : variant === 'down'
      ? 'M0 4 Q 16 8, 32 10 T 56 14 T 72 18'
      : 'M0 12 Q 18 6, 36 12 T 54 10 T 72 11'

  return (
    <svg width="64" height="20" viewBox="0 0 72 20" fill="none" className="shrink-0 text-teal-500">
      <path d={path} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Metric({
  label,
  value,
  detail,
  sparklineVariant,
}: {
  label: string
  value: string | number
  detail?: string
  sparklineVariant?: 'up' | 'stable' | 'down'
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="mt-1.5 flex items-baseline justify-between gap-2">
        <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {value}
        </div>
        {sparklineVariant && <Sparkline variant={sparklineVariant} />}
      </div>
      {detail && (
        <div className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
          {detail}
        </div>
      )}
    </div>
  )
}

function StudyRows({ studies }: { studies: Study[] }) {
  return (
    <div className="divide-y divide-slate-200 dark:divide-slate-800/80">
      {studies.map((study) => (
        <div key={study.id} className="flex items-center justify-between gap-4 py-3">
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{study.title}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {study.ctriNumber} - {study.enrolled}/{study.targetSampleSize} enrolled
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
              study.rag === 'red'
                ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50'
                : study.rag === 'amber'
                ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50'
                : 'bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-900/50'
            }`}
          >
            {study.rag === 'red' ? (
              <AlertCircle size={12} />
            ) : study.rag === 'amber' ? (
              <AlertTriangle size={12} />
            ) : (
              <CheckCircle2 size={12} />
            )}
            <span>{study.rag}</span>
          </span>
        </div>
      ))}
    </div>
  )
}

function HeaderIllustrationBand() {
  return (
    <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-80 overflow-hidden opacity-20 dark:opacity-25" aria-hidden="true">
      <svg
        viewBox="0 0 320 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full object-cover text-teal-400"
      >
        <line x1="0" y1="20" x2="320" y2="20" stroke="#14b8a6" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />
        <line x1="0" y1="60" x2="320" y2="60" stroke="#14b8a6" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />
        
        {/* Botanical leaf motif */}
        <g transform="translate(30, 8)">
          <path d="M28 58 C10 46 8 22 28 4 C48 22 46 46 28 58 Z" stroke="#14b8a6" strokeWidth="1.2" fill="#0f766e" fillOpacity="0.15" />
          <path d="M28 58 L28 4" stroke="#22d3ee" strokeWidth="1" strokeLinecap="round" />
          <path d="M28 42 Q18 36 16 28" stroke="#14b8a6" strokeWidth="0.8" />
          <path d="M28 42 Q38 36 40 28" stroke="#14b8a6" strokeWidth="0.8" />
          <circle cx="28" cy="4" r="2" fill="#22d3ee" />
        </g>

        {/* Pulse / Heartbeat rhythm line */}
        <path
          d="M80 40 L110 40 L116 28 L124 54 L132 20 L140 50 L148 40 L170 40"
          stroke="#22d3ee"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* DNA Helix strand snippet */}
        <g transform="translate(175, 8)">
          <path d="M10 25 Q35 5 60 25 T110 25" stroke="#14b8a6" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M10 45 Q35 65 60 45 T110 45" stroke="#22d3ee" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.8" />
          <line x1="20" y1="28" x2="20" y2="42" stroke="#14b8a6" strokeWidth="1" opacity="0.6" />
          <line x1="35" y1="15" x2="35" y2="55" stroke="#22d3ee" strokeWidth="1" opacity="0.6" />
          <line x1="60" y1="25" x2="60" y2="45" stroke="#14b8a6" strokeWidth="1" opacity="0.6" />
          <line x1="85" y1="15" x2="85" y2="55" stroke="#22d3ee" strokeWidth="1" opacity="0.6" />
          <circle cx="35" cy="15" r="2" fill="#22d3ee" />
          <circle cx="35" cy="55" r="2" fill="#14b8a6" />
          <circle cx="85" cy="15" r="2" fill="#14b8a6" />
          <circle cx="85" cy="55" r="2" fill="#22d3ee" />
        </g>
      </svg>
    </div>
  )
}

function HeaderBanner({ workspace, title }: { workspace: string; title: string }) {
  return (
    <header className="relative overflow-hidden rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
      {/* Subtle low-opacity dark teal dot-grid pattern behind main dashboard header */}
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage: `radial-gradient(circle at 80% 20%, rgba(20, 184, 166, 0.25), transparent 60%), radial-gradient(rgba(20, 184, 166, 0.3) 1px, transparent 1px)`,
          backgroundSize: '100% 100%, 20px 20px',
        }}
      />
      {/* Illustrated header band */}
      <HeaderIllustrationBand />
      <div className="relative z-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
          {workspace}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {title}
        </h1>
      </div>
    </header>
  )
}

export function Dashboard() {
  const activeRole = useAppStore((state) => state.activeRole)
  const activeUserId = useAppStore((state) => state.activeUserId)
  const studies = useAppStore((state) => state.studies)
  const queries = useAppStore((state) => state.queries)
  const adverseEvents = useAppStore((state) => state.adverseEvents)
  const participants = useAppStore((state) => state.participants)
  const protocolDeviations = useAppStore((state) => state.protocolDeviations)
  const amendments = useAppStore((state) => state.amendments)
  const milestones = useAppStore((state) => state.studyMilestones)
  const approvals = useAppStore((state) => state.ethicsApprovals)
  const auditEntries = useAppStore((state) => state.auditEntries ?? [])
  const ruleConfig = useAppStore((state) => state.ruleConfig)

  const user = users.find((entry) => entry.id === activeUserId) ?? users[0]
  const ownStudies = studies.filter(
    (study) => user.studies.includes(study.id) && (activeRole !== 'Principal Investigator' || study.pi === user.name),
  )
  const openQueries = queries.filter(
    (query) => query.status === 'Open' && ownStudies.some((study) => study.id === query.studyId),
  )
  const openDeviations = protocolDeviations.filter(
    (deviation) => deviation.status === 'Open' && ownStudies.some((study) => study.id === deviation.studyId),
  )
  const seriousEvents = adverseEvents.filter((event) => event.seriousness === 'Serious')
  const pendingAmendments = amendments.filter((amendment) => amendment.status === 'Pending IEC review')
  const expiringApprovals = approvals.filter((approval) => {
    const days = (new Date(approval.expiresAt).getTime() - Date.now()) / 86_400_000
    return days >= 0 && days <= 60
  })
  const overdueMilestones = milestones.filter(
    (milestone) => !milestone.completedAt && new Date(milestone.dueAt).getTime() < Date.now(),
  )
  const openStudies = studies.filter((study) => study.status !== 'Closed')
  const ragCounts = {
    red: studies.filter((study) => study.rag === 'red').length,
    amber: studies.filter((study) => study.rag === 'amber').length,
    green: studies.filter((study) => study.rag === 'green').length,
  }
  const complianceScore = Math.max(0, 100 - ragCounts.red * 15 - ragCounts.amber * 5 - overdueMilestones.length * 10)

  const signalData = [
    { label: 'Serious AE', count: seriousEvents.length },
    { label: 'Non-serious AE', count: adverseEvents.filter((event) => event.seriousness === 'Non-serious').length },
  ]

  const signalTrend = Array.from({ length: 4 }, (_, index) => {
    const month = new Date()
    month.setMonth(month.getMonth() - (3 - index))
    const monthEvents = adverseEvents.filter((event) => {
      const onset = new Date(event.onsetDate)
      return onset.getMonth() === month.getMonth() && onset.getFullYear() === month.getFullYear()
    })
    return {
      month: month.toLocaleDateString('en', { month: 'short' }),
      serious: monthEvents.filter((event) => event.seriousness === 'Serious').length,
      other: monthEvents.filter((event) => event.seriousness === 'Non-serious').length,
    }
  })

  if (activeRole === 'Principal Investigator') {
    return (
      <div className="space-y-6">
        <HeaderBanner workspace="Investigator workspace" title="Investigator dashboard" />
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Assigned studies" value={ownStudies.length} sparklineVariant="stable" />
          <Metric
            label="Enrolment vs target"
            value={`${ownStudies.reduce((sum, study) => sum + study.enrolled, 0)}/${ownStudies.reduce(
              (sum, study) => sum + study.targetSampleSize,
              0,
            )}`}
            sparklineVariant="up"
          />
          <Metric label="Open deviations" value={openDeviations.length} sparklineVariant="down" />
          <Metric label="Open queries" value={openQueries.length} sparklineVariant="down" />
        </section>
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
            <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp size={16} className="text-teal-500" />
              My studies
            </h2>
            <StudyRows studies={ownStudies} />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
            <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" />
              Safety events
            </h2>
            <div className="divide-y divide-slate-200 dark:divide-slate-800/80">
              {adverseEvents
                .filter((event) => ownStudies.some((study) => study.id === event.studyId))
                .map((event) => (
                  <div key={event.id} className="py-3 text-sm">
                    <strong className="text-slate-900 dark:text-slate-100">{event.seriousness}</strong> - {event.event}
                    <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {event.status} - {event.id}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (activeRole === 'Study Coordinator') {
    return (
      <div className="space-y-6">
        <HeaderBanner workspace="Site operations" title="Coordinator workspace" />
        <section className="grid gap-4 sm:grid-cols-3">
          <Metric label="Assigned studies" value={ownStudies.length} sparklineVariant="stable" />
          <Metric label="Open data queries" value={openQueries.length} sparklineVariant="down" />
          <Metric
            label="Participants in assigned studies"
            value={participants.filter((participant) => ownStudies.some((study) => study.id === participant.studyId)).length}
            sparklineVariant="up"
          />
        </section>
        <section className="rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
          <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Recruitment and query queue</h2>
          <StudyRows studies={ownStudies} />
          <div className="mt-3 divide-y divide-slate-200 dark:divide-slate-800/80">
            {openQueries.map((query) => (
              <p key={query.id} className="py-2.5 text-sm text-slate-700 dark:text-slate-300">
                <span className="font-mono font-semibold text-teal-600 dark:text-teal-400">{query.id}</span> - {query.field} - {query.ageDays} days open
              </p>
            ))}
          </div>
        </section>
      </div>
    )
  }

  if (activeRole === 'Monitor (CRA)') {
    return (
      <div className="space-y-6">
        <HeaderBanner workspace="Monitoring operations" title="Monitoring dashboard" />
        <section className="grid gap-4 sm:grid-cols-3">
          <Metric label="Studies in scope" value={ownStudies.length} sparklineVariant="stable" />
          <Metric
            label="Sites in scope"
            value={ownStudies.reduce((sum, study) => sum + study.sites.length, 0)}
            sparklineVariant="up"
          />
          <Metric
            label="Overdue milestones"
            value={overdueMilestones.filter((milestone) => ownStudies.some((study) => study.id === milestone.studyId)).length}
            sparklineVariant="down"
          />
        </section>
        <section className="rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
          <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Monitoring portfolio</h2>
          <StudyRows studies={ownStudies} />
        </section>
      </div>
    )
  }

  if (activeRole === 'Ethics Committee (IEC)') {
    return (
      <div className="space-y-6">
        <HeaderBanner workspace="Ethics review" title="Ethics review dashboard" />
        <section className="grid gap-4 sm:grid-cols-3">
          <Metric label="Approvals expiring within 60 days" value={expiringApprovals.length} sparklineVariant="down" />
          <Metric
            label="Pending SAE reviews"
            value={seriousEvents.filter((event) => event.status !== 'Resolved').length}
            sparklineVariant="stable"
          />
          <Metric label="Pending amendments" value={pendingAmendments.length} sparklineVariant="up" />
        </section>
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
            <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Expiring approvals</h2>
            <div className="divide-y divide-slate-200 dark:divide-slate-800/80">
              {expiringApprovals.map((approval) => (
                <p key={approval.studyId} className="py-3 text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {studies.find((study) => study.id === approval.studyId)?.title}
                  </span>{' '}
                  - {Math.ceil((new Date(approval.expiresAt).getTime() - Date.now()) / 86_400_000)} days
                </p>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
            <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Amendments awaiting review</h2>
            <div className="divide-y divide-slate-200 dark:divide-slate-800/80">
              {pendingAmendments.map((amendment) => (
                <p key={amendment.id} className="py-3 text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{amendment.title}</span> - {amendment.id}
                </p>
              ))}
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (activeRole === 'PV Officer') {
    return (
      <div className="space-y-6">
        <HeaderBanner workspace="Pharmacovigilance" title="Pharmacovigilance dashboard" />
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            label="Serious reports in inbox"
            value={seriousEvents.filter((event) => event.status !== 'Resolved').length}
            sparklineVariant="down"
          />
          <Metric
            label="Coding backlog"
            value={adverseEvents.filter((event) => event.coded !== true).length}
            sparklineVariant="stable"
          />
          <Metric label="Open safety signals" value={seriousEvents.length} sparklineVariant="up" />
          <Metric
            label="Overdue reports"
            value={seriousEvents.filter((event) => event.escalated).length}
            sparklineVariant="down"
          />
        </section>
        <section className="grid gap-6 lg:grid-cols-2">
          {/* SAE Status / Countdown Compact Panel */}
          <div className="rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Clock size={16} className="text-teal-500" />
                Report inbox and countdowns
              </h2>
              <span className="rounded bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold text-teal-400">
                24h Regulatory SLA
              </span>
            </div>
            <div className="space-y-2.5">
              {seriousEvents.map((event) => {
                const countdown = event.dueAt ? getSaeCountdownText(event.dueAt) : 'No deadline'
                return (
                  <div
                    key={event.id}
                    className="rounded-lg border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/60"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                        {event.id} - {event.event}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          event.escalated
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                        }`}
                      >
                        {event.escalated ? 'Escalated' : 'Open'}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>NDCT Compliance Timer</span>
                      <span className="font-semibold text-teal-600 dark:text-teal-400">{countdown}</span>
                    </div>
                    {/* Progress indicator bar */}
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded bg-slate-200 dark:bg-slate-800">
                      <div className="h-full bg-teal-500" style={{ width: '75%' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
            <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Safety signal chart</h2>
            <SignalBars data={signalData} />
          </div>
        </section>
      </div>
    )
  }

  if (activeRole === 'Leadership') {
    const complianceClock = [
      ...adverseEvents.flatMap((event) =>
        Object.entries(getSaeDeadlines(event, ruleConfig)).map(([kind, dueAt]) => ({
          id: `${event.id}-${kind}`,
          title: `${event.id} - ${kind} report`,
          dueAt,
        })),
      ),
      ...approvals.map((approval) => ({
        id: approval.studyId,
        title: `${approval.studyId} - IEC approval`,
        dueAt: approval.expiresAt,
      })),
      ...milestones.map((milestone) => ({
        id: milestone.id,
        title: milestone.title,
        dueAt: milestone.dueAt,
      })),
    ]
      .filter((item) => new Date(item.dueAt).getTime() >= Date.now())
      .sort((a, b) => a.dueAt.localeCompare(b.dueAt))

    return (
      <div className="space-y-6">
        <HeaderBanner workspace="Executive oversight" title="Leadership compliance dashboard" />
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            label="Portfolio RAG"
            value={`${ragCounts.green} green, ${ragCounts.amber} amber, ${ragCounts.red} red`}
            sparklineVariant="stable"
          />
          <Metric label="Overdue milestones" value={overdueMilestones.length} sparklineVariant="down" />
          <Metric
            label="Compliance score"
            value={`${complianceScore}%`}
            detail="Portfolio proxy from RAG and overdue milestones"
            sparklineVariant="up"
          />
          <Metric label="Upcoming deadlines" value={complianceClock.length} sparklineVariant="stable" />
        </section>
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
            <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck size={16} className="text-teal-500" />
              Portfolio RAG
            </h2>
            <StudyRows studies={openStudies} />
          </div>

          {/* Compliance Clock compact side panel with progress meters */}
          <div className="rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Clock size={16} className="text-teal-500" />
                Compliance Clock
              </h2>
              <span className="rounded bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold text-teal-400">
                {complianceScore}% On Schedule
              </span>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-800/80">
              {complianceClock.map((item) => (
                <div key={item.id} className="py-2.5 text-sm">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-800 dark:text-slate-200">{item.title}</span>
                    <span className="font-mono font-semibold text-teal-600 dark:text-teal-400">
                      {getSaeCountdownText(item.dueAt)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded bg-slate-200 dark:bg-slate-800">
                    <div className="h-full bg-teal-500" style={{ width: '65%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (activeRole === 'DSMB') {
    return (
      <div className="space-y-6">
        <HeaderBanner workspace="Blinded independent oversight" title="DSMB aggregate safety dashboard" />
        <section className="grid gap-4 sm:grid-cols-3">
          <Metric label="Aggregate adverse events" value={adverseEvents.length} sparklineVariant="stable" />
          <Metric label="Aggregate serious events" value={seriousEvents.length} sparklineVariant="down" />
          <Metric
            label="Aggregate non-serious events"
            value={adverseEvents.length - seriousEvents.length}
            sparklineVariant="up"
          />
        </section>
        <section className="rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
          <h2 className="mb-2 font-semibold text-slate-900 dark:text-slate-100">AE/SAE trend</h2>
          <div className="mb-2 flex gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold">
              <span className="h-2 w-2 rounded-full bg-rose-600" />
              Serious events
            </span>
            <span className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400 font-semibold">
              <span className="h-2 w-2 rounded-full bg-teal-500" />
              Other events
            </span>
          </div>
          <TrendBars data={signalTrend} />
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Aggregate totals only. No subject-level records or case narratives are displayed.
          </p>
        </section>
      </div>
    )
  }

  if (activeRole === 'Regulator') {
    return (
      <div className="space-y-6">
        <HeaderBanner workspace="Read-only oversight" title="Regulatory status dashboard" />
        <section className="grid gap-4 sm:grid-cols-3">
          <Metric label="Studies in registry" value={studies.length} sparklineVariant="stable" />
          <Metric
            label="Studies at risk"
            value={studies.filter((study) => study.rag !== 'green').length}
            sparklineVariant="down"
          />
          <Metric label="Audit records" value={auditEntries.length} sparklineVariant="up" />
        </section>
        <section className="rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
          <h2 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Study status and registration</h2>
          <StudyRows studies={studies} />
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/80 pt-3">
            Read-only view. Clinical records cannot be edited from this persona.
          </p>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <HeaderBanner workspace="Platform administration" title="System administration dashboard" />
      <section className="grid gap-4 sm:grid-cols-3">
        <Metric label="Configured personas" value={users.length} sparklineVariant="stable" />
        <Metric label="Studies available" value={studies.length} sparklineVariant="stable" />
        <Metric label="Notification rules" value={2} sparklineVariant="up" />
      </section>
      <section className="rounded-xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-[#0d141c]/80">
        <h2 className="mb-2 font-semibold text-slate-900 dark:text-slate-100">System configuration</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          KPI thresholds and alert rule settings are managed in Administration.
        </p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          This persona can manage configuration but cannot edit clinical study records.
        </p>
      </section>
    </div>
  )
}

function SignalBars({ data }: { data: Array<{ label: string; count: number }> }) {
  const maximum = Math.max(1, ...data.map((item) => item.count))
  return (
    <div role="img" aria-label="Safety signal chart by event seriousness" className="space-y-4 py-3">
      {data.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>{item.label}</span>
            <span>{item.count}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full bg-teal-500 rounded"
              style={{ width: `${Math.max(4, (item.count / maximum) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function TrendBars({ data }: { data: Array<{ month: string; serious: number; other: number }> }) {
  const maximum = Math.max(1, ...data.map((item) => item.serious + item.other))
  return (
    <div
      role="img"
      aria-label="Aggregate adverse event trend"
      className="grid h-56 grid-cols-4 items-end gap-4 border-b border-l border-slate-300 px-4 pb-2 pt-4 dark:border-slate-700"
    >
      {data.map((item) => (
        <div key={item.month} className="flex h-full flex-col items-center justify-end gap-2">
          <div
            className="flex w-full max-w-12 flex-col justify-end"
            style={{ height: `${Math.max(5, ((item.serious + item.other) / maximum) * 82)}%` }}
          >
            <div
              className="min-h-1 bg-teal-500 rounded-t"
              style={{ height: `${(item.other / Math.max(1, item.serious + item.other)) * 100}%` }}
            />
            <div
              className="min-h-1 bg-rose-600 rounded-b"
              style={{ height: `${(item.serious / Math.max(1, item.serious + item.other)) * 100}%` }}
            />
          </div>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{item.month}</span>
        </div>
      ))}
    </div>
  )
}